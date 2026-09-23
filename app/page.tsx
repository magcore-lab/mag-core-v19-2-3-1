export default function Page() {
  return (
    <>
      <main
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100dvh",
          minHeight: "100dvh",
          background: "#000000",
          display: "grid",
          placeItems: "center",
          placeContent: "center",
          margin: 0,
          padding: 0,
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <div
          style={{
            width: "min(78vw, 420px)",
            height: "min(78vw, 420px)",
            aspectRatio: "1 / 1",
            borderRadius: "9999px",
            background: "#FF0033",
            boxShadow:
              "0 0 80px 20px rgba(255,0,51,0.55), 0 0 180px 60px rgba(255,0,51,0.22), 0 0 320px 100px rgba(255,0,51,0.12)",
            position: "relative",
            transform: "translateZ(0)",
            animation: "pulsePresenceOFF 3s ease-in-out infinite",
            willChange: "transform",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "19%",
              borderRadius: "9999px",
              background: "radial-gradient(circle at 50% 45%, #ff2a4d 0%, #FF0033 62%, #d40027 100%)",
            }}
          />
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400&display=swap');
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100%;
          height: 100dvh;
          min-height: 100dvh;
          background: #000 !important;
          overflow: hidden !important;
          overscroll-behavior: none;
        }
        * { box-sizing: border-box; }
        @keyframes pulsePresenceOFF {
          0%, 100% { transform: scale(0.985); }
          50% { transform: scale(1.03); }
        }
      `}</style>
    </>
  );
}
