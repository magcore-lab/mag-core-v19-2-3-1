import { ImageResponse } from 'next/og'
export const runtime = 'edge'
export const alt = 'MAG CORE — THE CORE™'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export default function Image() {
  return new ImageResponse((
    <div style={{ width:'100%', height:'100%', background:'#000000', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle, #FF0033 0%, #1A0A0A 40%, #000 70%)', boxShadow:'0 0 100px rgba(255,0,51,0.6)' }} />
      <div style={{ marginTop:40, color:'#FFFFFF', fontSize:48, letterSpacing:4, fontWeight:700 }}>MAG CORE — THE CORE™</div>
      <div style={{ marginTop:10, color:'#FF0033', fontSize:20, letterSpacing:6 }}>V19 BLACK EDITION | Built on Core Lock V08</div>
    </div>
  ), { ...size })
}
