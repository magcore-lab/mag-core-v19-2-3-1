"use client";
import { useState } from "react";

export default function Page() {
  const [isRec, setIsRec] = useState(false);

  return (
    <>
      <main
        onClick={() => setIsRec(!isRec)}
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100dvh",
          background: "#000000",
          display: "grid",
          placeItems: "center",
          placeContent: "center",
          overflow: "hidden",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {/* NOYAU */}
        <div
          style={{
            width: "min(78vw, 420px)",
            height: "min(78vw, 420px)",
            aspectRatio: "1 / 1",
            borderRadius: "9999px",
            background: isRec ? "#FF0022" : "#FF0033",
            boxShadow: isRec
              ? "0 0 40px 10px rgba(255,0,34,0.9), 0 0 120px 40px rgba(255,0,34,0.6), 0 0 260px 80px rgba(255,0,34,0.35)"
              : "0 0 80px 20px rgba(255,0,51,0.55), 0 0 180px 60px rgba(255,0,51,0.22), 0 0 320px 100px rgba(255,0,51,0.12)",
            position: "relative",
            animation: isRec
              ? "pulseRec 0.9s ease-in-out infinite"
              : "pulseOff 3s ease-in-out infinite",
            transform: "translateZ(0)",
            willChange: "transform",
            transition: "background 0.3s, box-shadow 0.3s",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "19%",
              borderRadius: "9999px",
              background: isRec
                ? "radial-gradient(circle at 50% 45%, #ff3d5a 0%, #FF0022 55%, #a8001a 100%)"
                : "radial-gradient(circle at 50% 45%, #ff2a4d 0%, #FF0033 62%, #d40027 100%)",
              transition: "background 0.3s",
            }}
          />
          {/* Point REC interne */}
          {isRec && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "18%",
                height: "18%",
                transform: "translate(-50%, -50%)",
                borderRadius: "9999px",
                background: "#fff",
                boxShadow: "0 0 20px rgba(255,255,255,0.8)",
                animation: "blinkRec 0.9s step-end infinite",
              }}
            />
          )}
        </div>

        {/* Label REC */}
        <div
          style={{
            position: "absolute",
            bottom: "calc(50% - min(78vw, 420px)/2 - 48px)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            opacity: isRec ? 1 : 0,
            transform: isRec ? "translateY(0)" : "translateY(10px)",
            transition: "all 0.4s ease",
            fontFamily: "monospace",
            fontSize: "12px",
            letterSpacing: "0.2em",
            color: "#FF0022",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#FF0022",
              display: "inline-block",
              animation: "blinkRec 0.9s step-end infinite",
            }}
          />
          REC
        </div>
      </main>

      <style>{`
        html, body { margin:0!important; padding:0!important; height:100dvh; background:#000!important; overflow:hidden!important; overscroll-behavior:none }
        * { box-sizing:border-box }
        @keyframes pulseOff {
          0%,100% { transform: scale(0.985) }
          50% { transform: scale(1.03) }
        }
        @keyframes pulseRec {
          0%,100% { transform: scale(0.96) }
          50% { transform: scale(1.08) }
        }
        @keyframes blinkRec {
          0%, 50% { opacity: 1 }
          51%, 100% { opacity: 0.15 }
        }
      `}</style>
    </>
  );
}
