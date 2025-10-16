import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Astro Match',
  description: 'Doğum tarihine göre insanları keşfet',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  )
}
