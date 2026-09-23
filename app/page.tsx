export default function Page() {
  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100dvh",
        background: "#000000",
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
      }}
    >
      {/* NOYAU V19 - THE CORE */}
      <div
        style={{
          width: "420px",
          height: "420px",
          borderRadius: "50%",
          background: "#FF0033",
          boxShadow: "0 0 120px 40px rgba(255,0,51,0.6), 0 0 240px 80px rgba(255,0,51,0.25)",
          animation: "pulseWave 3s ease-in-out infinite",
          position: "relative",
        }}
      >
        {/* Coeur interne */}
        <div
          style={{
            position: "absolute",
            inset: "18%",
            borderRadius: "50%",
            background: "#FF0033",
            filter: "brightness(1.3)",
          }}
        />
      </div>

      <style>{`
        @keyframes pulseWave {
          0%, 100% { transform: scale(0.96); opacity: 0.92; }
          50% { transform: scale(1.04); opacity: 1; }
        }
        html, body {
          margin: 0;
          padding: 0;
          background: #000;
          overflow: hidden;
        }
      `}</style>
    </main>
  );
}
