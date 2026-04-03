import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VULTR',
  description: 'Intelligent System',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}