
{/* Label REC — variante lumineuse centrée */}
<div
  style={{
    position: "absolute",
    bottom: "calc(50% - min(78vw, 420px)/2 - 62px)",
    left: "50%",
    transform: `translateX(-50%) translateY(${isRec ? "0" : "12px"})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    opacity: isRec ? 1 : 0,
    transition: "all 0.45s cubic-bezier(0.16,1,0.3,1)",
    fontFamily: "Geist, ui-monospace, monospace",
    fontSize: "13px",
    fontWeight: 600,
    letterSpacing: "0.28em",
    color: "#FF1A2F",
    textShadow: "0 0 12px rgba(255,26,47,0.9), 0 0 28px rgba(255,26,47,0.55)",
    pointerEvents: "none",
    whiteSpace: "nowrap",
  }}
>
  <span
    style={{
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      background: "#FF1A2F",
      boxShadow: "0 0 10px rgba(255,26,47,1), 0 0 22px rgba(255,26,47,0.8)",
      display: "inline-block",
      animation: "blinkRec 0.9s step-end infinite",
    }}
  />
  REC
</div>
