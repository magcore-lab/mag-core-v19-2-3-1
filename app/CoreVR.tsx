'use client'
export default function CoreVR() {
  return (
    <div style={{ width:'100vw', height:'100vh', background:'#000000', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
      <div style={{
        width:420, height:420, borderRadius:'50%',
        background:'radial-gradient(circle at 50% 50%, #FF0033 0%, #1A0A0A 35%, #000000 70%)',
        boxShadow:'0 0 80px rgba(255,0,51,0.6), 0 0 160px rgba(255,0,51,0.2)',
        animation:'pulseWave 3s ease-in-out infinite'
      }}>
        <div style={{
          position:'absolute', top:'50%', left:'50%', width:8, height:8, borderRadius:'50%',
          background:'#FF0033', boxShadow:'0 0 12px #FF0033, 0 0 24px #FF0033',
          transform:'translate(-50%,-50%)', animation:'corePulse 3s ease-in-out infinite'
        }}/>
      </div>
      <style jsx>{`
        @keyframes pulseWave { 0%{transform:scale(0.98)} 50%{transform:scale(1.02)} 100%{transform:scale(0.98)} }
        @keyframes corePulse { 0%{transform:translate(-50%,-50%) scale(0.75)} 50%{transform:translate(-50%,-50%) scale(2.2)} 100%{transform:translate(-50%,-50%) scale(0.75)} }
      `}</style>
    </div>
  )
}
