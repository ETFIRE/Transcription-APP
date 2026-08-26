import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  AccessToken,
  WebhookReceiver,
  EgressClient,
  EncodedFileOutput,
  EncodedFileType,
  S3Upload,
} from 'livekit-server-sdk';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.raw({ type: 'application/webhook+json' }));
app.use(express.json());

// --- CORRECTION ROBUSTE SUPABASE ---
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERREUR CRITIQUE : Les variables d'environnement Supabase (URL ou Clé) sont manquantes !");
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');
// ------------------------------------

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
// 2. ROUTE DE CLÔTURE DE RÉUNION AVEC EGRESS S3 SUPABASE
// ----------------------------------------------------
app.post('/api/reunions/terminer', async (req, res) => {
  try {
    const { reunion_id } = req.body;

    if (!reunion_id) {
      return res.status(400).json({ error: 'Paramètre reunion_id manquant.' });
    }

    const { data: reunion, error: fetchErr } = await supabase
      .from('reunions')
      .select('*')
      .eq('id', reunion_id)
      .single();

    if (fetchErr || !reunion) {
      return res.status(404).json({ error: 'Réunion introuvable.' });
    }

    const roomName = reunion.chime_meeting_id;
    let egressId = null;

    try {
      // Configuration de la destination S3 Supabase
      const s3Upload = new S3Upload({
        endpoint: process.env.S3_ENDPOINT,
        accessKey: process.env.S3_ACCESS_KEY,
        secret: process.env.S3_SECRET_KEY,
        region: process.env.S3_REGION || 'eu-west-3',
        bucket: process.env.S3_BUCKET || 'recordings',
        forcePathStyle: true,
      });

      const output = new EncodedFileOutput({
        fileType: EncodedFileType.MP4,
        filepath: `${roomName}.mp4`,
        output: {
          case: 's3',
          value: s3Upload,
        },
      });

      const info = await egressClient.startRoomCompositeEgress(roomName, {
        file: output,
      });
      egressId = info.egressId;
      console.log(`Egress S3 démarré pour ${roomName} (ID: ${egressId})`);

      await supabase
        .from('reunions')
        .update({ statut: 'en_cours_finalisation' })
        .eq('id', reunion_id);
    } catch (egressErr) {
      console.warn('Erreur ou fallback Egress :', egressErr.message);

      await supabase
        .from('reunions')
        .update({ statut: 'en_traitement' })
        .eq('id', reunion_id);

      const n8nWebhookUrl =
        process.env.N8N_WEBHOOK_URL ||
        'https://n8n-production-88b79.up.railway.app/webhook/v1/meeting/process';

      try {
        await globalThis.fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant_id: reunion.tenant_id,
            reunion_id: reunion.id,
            audio_url: null,
          }),
        });
        console.log('n8n notifié en direct (mode fallback)');
      } catch (n8nErr) {
        console.error('Erreur appel n8n :', n8nErr.message);
      }
    }

    return res.status(200).json({ success: true, egress_id: egressId });
  } catch (err) {
    console.error('Erreur générale fin de réunion :', err);
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

    if (authHeader) {
      const rawBody = req.body.toString();
      event = await webhookReceiver.receive(rawBody, authHeader);
    } else {
      console.log('⚠️ Requête sans en-tête Authorization : mode simulation');
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }

    console.log('--- ÉVÉNEMENT LIVEKIT REÇU ---', event.event);

    if (event.event === 'egress_ended') {
      const egressInfo = event.egressInfo;
      const roomName = egressInfo?.roomName;
      const fileResult = egressInfo?.fileResults?.[0] || egressInfo?.file;

      console.log(`Enregistrement S3 finalisé pour la room : ${roomName}`);

      const { data: reunion, error } = await supabase
        .from('reunions')
        .select('id, tenant_id')
        .eq('chime_meeting_id', roomName)
        .single();

      if (error || !reunion) {
        console.warn(`Réunion introuvable pour la room : ${roomName}`);
        return res.status(404).send('Réunion non trouvée');
      }

      // Construction de l'URL publique Supabase Storage
      const currentSupabaseUrl = supabaseUrl ? supabaseUrl.replace(/\/$/, '') : '';
      const publicAudioUrl = `${currentSupabaseUrl}/storage/v1/object/public/recordings/${roomName}.mp4`;

      await supabase
        .from('reunions')
        .update({ statut: 'en_traitement' })
        .eq('id', reunion.id);

      const n8nWebhookUrl =
        process.env.N8N_WEBHOOK_URL ||
        'https://n8n-production-88b79.up.railway.app/webhook/v1/meeting/process';

      try {
        await globalThis.fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant_id: reunion.tenant_id,
            reunion_id: reunion.id,
            audio_url: publicAudioUrl,
          }),
        });
        console.log(`Pipeline n8n notifié avec l'URL audio S3 : ${publicAudioUrl}`);
      } catch (n8nErr) {
        console.warn('Erreur appel n8n :', n8nErr.message);
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