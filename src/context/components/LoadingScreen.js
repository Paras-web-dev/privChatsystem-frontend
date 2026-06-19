import React from "react";

const LoadingScreen = () => (
  <div style={{
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    gap: "24px",
    position: "relative",
    overflow: "hidden",
  }}>
    {/* Animated background blobs */}
    <style>{`
      @keyframes floatBlob {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(10deg); }
      }
      @keyframes spinLoader {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.3); }
        50% { box-shadow: 0 0 40px rgba(255,255,255,0.6); }
      }
    `}</style>

    <div style={{
      position: "absolute",
      top: "20%",
      left: "10%",
      width: "120px",
      height: "120px",
      background: "rgba(255,255,255,0.1)",
      borderRadius: "50%",
      filter: "blur(40px)",
      animation: "floatBlob 6s ease-in-out infinite",
    }} />
    <div style={{
      position: "absolute",
      bottom: "15%",
      right: "10%",
      width: "150px",
      height: "150px",
      background: "rgba(255,255,255,0.08)",
      borderRadius: "50%",
      filter: "blur(50px)",
      animation: "floatBlob 8s ease-in-out infinite",
      animationDelay: "1s",
    }} />

    {/* Main loader icon */}
    <div style={{
      position: "relative",
      width: "80px",
      height: "80px",
      zIndex: 1,
    }}>
      <div style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,255,0.95) 100%)",
        borderRadius: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "40px",
        animation: "pulseGlow 2s ease-in-out infinite",
        boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
      }}>
        💬
      </div>
    </div>

    {/* Spinner ring */}
    <div style={{
      position: "relative",
      width: "50px",
      height: "50px",
      zIndex: 1,
    }}>
      <div style={{
        width: "100%",
        height: "100%",
        border: "3px solid rgba(255,255,255,0.2)",
        borderTop: "3px solid rgba(255,255,255,0.9)",
        borderRadius: "50%",
        animation: "spinLoader 1.2s linear infinite",
      }} />
    </div>

    {/* Loading text */}
    <p style={{
      color: "rgba(255,255,255,0.95)",
      fontFamily: "'Nunito', sans-serif",
      fontSize: "16px",
      fontWeight: "700",
      letterSpacing: "0.05em",
      margin: 0,
      zIndex: 1,
      animation: "pulseGlow 2s ease-in-out infinite",
      animationDelay: "0.3s",
    }}>
      Loading PrivChat...
    </p>

    {/* Subtle emoji animation */}
    <div style={{
      position: "absolute",
      bottom: "20%",
      fontSize: "20px",
      opacity: 0.6,
      animation: "floatBlob 4s ease-in-out infinite",
      animationDelay: "0.5s",
    }}>
      🔐
    </div>
  </div>
);

export default LoadingScreen;
