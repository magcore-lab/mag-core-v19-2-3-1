export const metadata = {
  metadataBase: new URL('https://mag-core-v19-2-3-1.vercel.app'),
  title: 'MAG CORE V19.2.3.1 UNIFIED OPTIMIZED — IGNITION 100% Z10.71',
  description: 'CORE LOCK 0.62/0.78/0.92 R0.48 Z10.71 DEZOOM 5% — 99.5% coherence',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{margin:0,background:'#000',overflow:'hidden'}}>{children}</body>
    </html>
  )
}
