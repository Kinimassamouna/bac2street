import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { motion } from "framer-motion";

const QRCodeScreen = ({ gameCode }) => {
  // URL GitHub Pages pour rejoindre la partie
  const url = gameCode
    ? `https://Kinimassamouna.github.io/bac2street/join-game/${gameCode}`
    : "";

  const logoSrc = "/Assets/Images/Game.png"; // Assure-toi que ce chemin est correct sur GH Pages

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at center, #ff00ff, #00ffff, #ffdd00, #ff007f)",
        backgroundSize: "400% 400%",
        animation: "gradientBG 15s ease infinite",
        color: "#fff",
        padding: "20px",
      }}
    >
      <motion.h1
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ marginBottom: "30px", textShadow: "0 0 10px #fff" }}
      >
        🎮 Scanne et joue à Bac2Street ! 🎮
      </motion.h1>

      <div style={{ position: "relative", width: "250px", height: "250px" }}>
        <QRCodeCanvas
          value={url}
          size={250}
          fgColor="#FF00FF"
          bgColor="#FFFF00"
          level="H"
        />

        <motion.img
          src={logoSrc}
          alt="Logo Bac2Street"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60px",
            height: "60px",
            borderRadius: "15px",
            backgroundColor: "#fff",
            padding: "5px",
          }}
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {gameCode && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            marginTop: "20px",
            fontSize: "18px",
            textAlign: "center",
            textShadow: "0 0 5px #fff",
          }}
        >
          URL :{" "}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#fff", textDecoration: "underline" }}
          >
            {url}
          </a>
        </motion.p>
      )}

      <style>{`
        @keyframes gradientBG {
          0% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
          100% {background-position: 0% 50%;}
        }
      `}</style>
    </div>
  );
};

export default QRCodeScreen;
