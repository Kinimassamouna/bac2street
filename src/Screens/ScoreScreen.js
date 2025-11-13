import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ScoreScreen = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { players, pointsByPlayer, currentLetter, buzzedPlayers } = state || {};

  if (!state) {
    return <h2>Aucune donnée disponible. Retourne au jeu.</h2>;
  }

  // Fonction pour rejouer (réinitialise la partie)
  const handleReplay = () => {
    navigate("/", { replace: true }); // retourne à la page principale (GameScreen)
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ff007f, #00d4ff)",
        minHeight: "100vh",
        padding: "20px",
        color: "#fff",
        textAlign: "center",
      }}
    >
      <motion.h1 animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
        Score final
      </motion.h1>

      <h2>Lettre du round : {currentLetter}</h2>

      <div style={{ marginTop: "30px" }}>
        {players.map((player) => (
          <div
            key={player.name}
            style={{
              marginBottom: "20px",
              border: "2px solid #fff",
              borderRadius: "15px",
              padding: "15px",
              background: "rgba(255,255,255,0.1)",
            }}
          >
            <h3>{player.name}</h3>
            <p>Points : {pointsByPlayer[player.name]}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "20px", fontWeight: "bold" }}>
        Joueurs ayant buzzé : {buzzedPlayers?.join(", ") || "Aucun"}
      </div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleReplay}
        style={{
          marginTop: "30px",
          padding: "10px 20px",
          borderRadius: "15px",
          backgroundColor: "#00FF00",
          color: "#000",
          fontWeight: "bold",
          border: "none",
          cursor: "pointer",
        }}
      >
        🔄 Rejouer
      </motion.button>
    </div>
  );
};

export default ScoreScreen;
