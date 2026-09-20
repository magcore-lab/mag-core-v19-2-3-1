export const metadata = {
  metadataBase: new URL('https://mag-core-v19-2-3-1.vercel.app'),
  title: 'MAG CORE V19.2.3.1 UNIFIED OPTIMIZED — IGNITION 100% Z10.71 — FULL ARCHI DMX WEBGPU AUDIO MIDI OSC',
  description: 'CORE LOCK 0.62/0.78/0.92 R0.48 T0.995 IOR2.65 thickness0.52 Z10.71 FOV34 DEZOOM 5% — V16.7 PostPro + V16.8 WebGPU WGSL golden 2.399963 + V17.0 Audio FFT128 beat + V17.1 MIDI + V17.2 OSC + V17.3 DMX Art-Net 6454 sACN 5568 + V19.2.3 Security+ATLAS — 99.5% cohérence',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, background: '#000', overflow: 'hidden' }}>{children}</body>
    </html>
  )
}
