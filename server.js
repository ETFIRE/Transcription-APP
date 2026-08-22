import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  AccessToken,
  WebhookReceiver,
  EgressClient,
  EncodedFileOutput,
  EncodedFileType,
} from 'livekit-server-sdk';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

dotenv.config();

const app = express();

// Configuration CORS
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middleware raw pour la validation de signature LiveKit
app.use(express.raw({ type: 'application/webhook+json' }));
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const apiKey = process.env.LIVEKIT_API_KEY || 'devkey';
const apiSecret = process.env.LIVEKIT_API_SECRET || 'secret';
const livekitHost = process.env.LIVEKIT_URL || 'https://transcription-482gjg4c.livekit.cloud';

const webhookReceiver = new WebhookReceiver(apiKey, apiSecret);
const egressClient = new EgressClient(livekitHost, apiKey, apiSecret);

// ----------------------------------------------------
// 1. ROUTE DE CRÉATION DE RÉUNION
// ----------------------------------------------------
app.post('/api/reunions/creer', async (req, res) => {
  try {
    const { tenant_id, titre } = req.body;

    const { data: tenant, error: tenantErr } = await supabase
      .from('tenants')
      .select('statut_abonnement')
      .eq('id', tenant_id)
      .maybeSingle();

    if (tenantErr || !tenant || tenant.statut_abonnement !== 'active') {
      return res.status(403).json({
        error: 'Abonnement Stripe inactif ou tenant introuvable.',
      });
    }

    const roomName = `room_${crypto.randomUUID()}`;

    const at = new AccessToken(apiKey, apiSecret, {
      identity: `user_${crypto.randomUUID().slice(0, 8)}`,
      name: 'Hôte Réunion',
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    const { data: reunion, error: reunionErr } = await supabase
      .from('reunions')
      .insert({
        tenant_id,
        titre: titre || 'Réunion visio OpenVidu',
        type_mode: 'visio',
        statut: 'en_attente',
        chime_meeting_id: roomName,
      })
      .select()
      .single();

    if (reunionErr) throw reunionErr;

    console.log(`Réunion créée : ${reunion.id} (Room: ${roomName})`);

    return res.json({
      reunion_id: reunion.id,
      sessionId: roomName,
      token: token,
    });
  } catch (error) {
    console.error('Erreur création réunion :', error);
    return res.status(500).json({ error: error.message || String(error) });
  }
});

// ----------------------------------------------------
// 2. ROUTE DE CLÔTURE DE RÉUNION ET LANCEMENT EGRESS
// ----------------------------------------------------
app.post('/api/reunions/terminer', async (req, res) => {
  try {
    const { reunion_id } = req.body;

    if (!reunion_id) {
      return res.status(400).json({ error: 'Paramètre reunion_id manquant.' });
    }

    // 1. Récupération de la réunion
    const { data: reunion, error: fetchErr } = await supabase
      .from('reunions')
      .select('*')
      .eq('id', reunion_id)
      .single();

    if (fetchErr || !reunion) {
      return res.status(404).json({ error: 'Réunion introuvable.' });
    }

    const roomName = reunion.chime_meeting_id;

    // 2. Configuration et démarrage de l'Egress
    const output = new EncodedFileOutput({
      fileType: EncodedFileType.MP4,
      filepath: `recordings/${roomName}.mp4`,
    });

    const info = await egressClient.startRoomCompositeEgress(roomName, {
      file: output,
    });

    console.log(`Egress démarré pour ${roomName} (ID: ${info.egressId})`);

    // 3. Mise à jour du statut dans Supabase
    await supabase
      .from('reunions')
      .update({ statut: 'en_cours_finalisation' })
      .eq('id', reunion_id);

    return res.json({ success: true, egress_id: info.egressId });
  } catch (err) {
    console.error('Erreur fin réunion / Egress :', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

// ----------------------------------------------------
// 3. ROUTE WEBHOOK LIVEKIT / EGRESS
// ----------------------------------------------------
app.post('/api/webhooks/livekit', async (req, res) => {
  try {
    const authHeader = req.get('Authorization');
    let event;

    // Validation de signature si le header existe, sinon mode simulation locale
    if (authHeader) {
      const rawBody = req.body.toString();
      event = await webhookReceiver.receive(rawBody, authHeader);
    } else {
      console.log('⚠️ Requête sans en-tête Authorization : mode simulation locale');
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }

    console.log('--- ÉVÉNEMENT LIVEKIT REÇU ---', event.event);

    if (event.event === 'egress_ended') {
      const egressInfo = event.egressInfo;
      const roomName = egressInfo?.roomName;
      const fileResult = egressInfo?.fileResults?.[0] || egressInfo?.file;

      console.log(`Enregistrement finalisé pour la room : ${roomName}`);

      // 1. Récupération de la réunion dans Supabase
      const { data: reunion, error } = await supabase
        .from('reunions')
        .select('id, tenant_id')
        .eq('chime_meeting_id', roomName)
        .single();

      if (error || !reunion) {
        console.warn(`Réunion introuvable pour la room : ${roomName}`);
        return res.status(404).send('Réunion non trouvée');
      }

      const fileUrl = fileResult?.location || fileResult?.filename;

      // 2. Mise à jour du statut dans Supabase
      await supabase
        .from('reunions')
        .update({ statut: 'en_traitement' })
        .eq('id', reunion.id);

      console.log(`Réunion ${reunion.id} passée au statut "en_traitement"`);

      // 3. Appel du workflow n8n
      const n8nWebhookUrl =
        process.env.N8N_WEBHOOK_URL ||
        'http://localhost:5678/webhook/v1/meeting/process';
      console.log('Déclenchement du pipeline n8n...');

      try {
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant_id: reunion.tenant_id,
            reunion_id: reunion.id,
            audio_url: fileUrl,
          }),
        });
        console.log('Pipeline n8n notifié avec succès !');
      } catch (n8nErr) {
        console.warn(
          'n8n non joignable (serveur éteint ou mauvaise URL) :',
          n8nErr.message
        );
      }
    }

    return res.status(200).send('OK');
  } catch (err) {
    console.error('Erreur traitement webhook LiveKit :', err);
    return res.status(500).send(err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur Backend actif sur http://localhost:${PORT}`);
});