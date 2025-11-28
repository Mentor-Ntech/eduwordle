import { Inter } from 'next/font/google'
import "./globals.css"
import { WalletProvider } from '@/components/wallet-provider'
import { UserProvider } from '@/lib/user-context'
import { SettingsProvider } from '@/lib/settings-context'
import { LangAttribute } from '@/components/lang-attribute'

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "EduWordle | Learn & Earn with Celo",
  description: "A mobile-first Wordle clone rewarding correct answers with cUSD on Celo blockchain",
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} bg-background text-foreground`}>
        <WalletProvider>
          <UserProvider>
            <SettingsProvider>
              <LangAttribute />
              {children}
            </SettingsProvider>
          </UserProvider>
        </WalletProvider>
      </body>
    </html>
  )
}
