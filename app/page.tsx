
export default function Page() {
  return (
    <main style={{
      position:"fixed", inset:0, width:"100vw", height:"100dvh",
      background:"#000", display:"grid", placeItems:"center", margin:0
    }}>
      <div style={{
        width:"min(78vw,420px)", height:"min(78vw,420px)",
        borderRadius:"9999px", background:"#FF0033",
        boxShadow:"0 0 80px 20px rgba(255,0,51,0.6), 0 0 180px 60px rgba(255,0,51,0.25)"
      }}/>
    </main>
  );
}
