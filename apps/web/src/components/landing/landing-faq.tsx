'use client'

import { useState } from 'react'

export function LandingFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  const faqs = [
    {
      q: 'How do I earn rewards?',
      a: 'You earn cUSD for successfully completing daily Wordle challenges. Rewards are instantly sent to your connected Celo wallet.'
    },
    {
      q: 'Is this game free to play?',
      a: 'Yes! EduWordle is completely free. You can play unlimited practice games and one daily challenge per day.'
    },
    {
      q: 'What is Celo?',
      a: 'Celo is a mobile-first blockchain platform that makes cryptocurrency accessible to everyone. Learn more at celo.org'
    },
    {
      q: 'How do I connect my wallet?',
      a: 'Click the "Connect Wallet" button and follow the prompts. We support MetaMask, Valora, and other Web3 wallets.'
    },
    {
      q: 'Can I withdraw my rewards?',
      a: 'Yes! All rewards go directly to your wallet and can be withdrawn or traded at any time on supported exchanges.'
    },
    {
      q: 'Is my data safe?',
      a: 'All transactions are on the public Celo blockchain, ensuring transparency and security. Your wallet is always in your control.'
    }
  ]

  return (
    <section id="faq" className="py-16 md:py-24 px-4 bg-surface">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="card-elevation rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 hover:bg-background transition-colors"
              >
                <span className="font-semibold text-foreground text-left">{faq.q}</span>
                <svg
                  className={`w-5 h-5 text-primary transition-transform ${openIdx === idx ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              {openIdx === idx && (
                <div className="px-4 pb-4 text-muted-foreground border-t border-primary/10">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
