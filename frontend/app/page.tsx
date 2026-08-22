import { MarketingHeader } from '@/components/landing/marketing-header'
import { Hero } from '@/components/landing/hero'
import { ModesSection } from '@/components/landing/modes-section'
import { HowItWorks } from '@/components/landing/how-it-works'
import { PrivacyCta, MarketingFooter } from '@/components/landing/privacy-cta'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main>
        <Hero />
        <ModesSection />
        <HowItWorks />
        <PrivacyCta />
      </main>
      <MarketingFooter />
    </div>
  )
}
