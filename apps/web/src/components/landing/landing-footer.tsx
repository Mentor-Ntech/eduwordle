import Link from 'next/link'
import { EduWordleLogo } from '@/components/brand/eduwordle-logo'

export function LandingFooter() {
  return (
    <footer className="bg-foreground text-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <EduWordleLogo />
            <p className="text-sm opacity-75 mt-2">Learn words, build skills, earn rewards on Celo.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="opacity-75 hover:opacity-100 transition">Play</a></li>
              <li><a href="#" className="opacity-75 hover:opacity-100 transition">Leaderboard</a></li>
              <li><a href="#" className="opacity-75 hover:opacity-100 transition">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="opacity-75 hover:opacity-100 transition">About</a></li>
              <li><a href="#" className="opacity-75 hover:opacity-100 transition">Blog</a></li>
              <li><a href="#" className="opacity-75 hover:opacity-100 transition">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="opacity-75 hover:opacity-100 transition">Privacy</a></li>
              <li><a href="#" className="opacity-75 hover:opacity-100 transition">Terms</a></li>
              <li><a href="#" className="opacity-75 hover:opacity-100 transition">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 text-center text-sm opacity-75">
          <p>© 2025 EduWordle. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
