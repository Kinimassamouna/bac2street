import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useSound from "use-sound";

const vowels = ["A", "E", "I", "O", "U", "Y"];
const consonants = "BCDFGHJKLMNPQRSTVWXZ".split("");

const GameScreen = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { players, selectedCategories, mode } = state;

  const [currentLetter, setCurrentLetter] = useState("");
  const [responses, setResponses] = useState({});
  const [buzzedPlayers, setBuzzedPlayers] = useState([]);
  const [timer, setTimer] = useState(20);
  const [playBip] = useSound("/Sons/beep-329314.mp3");

  // Génération d’une lettre aléatoire
  useEffect(() => {
    const getRandomLetter = () => {
      let pool = [];
      if (mode === "voyelles") pool = vowels;
      else if (mode === "consonnes") pool = consonants;
      else pool = [...vowels, ...consonants];
      const randomIndex = Math.floor(Math.random() * pool.length);
      return pool[randomIndex];
    };
    setCurrentLetter(getRandomLetter());
  }, [mode]);

  // Fonction stable pour gérer le buzz (pour ESLint)
  const handleBuzz = useCallback((player) => {
    if (!buzzedPlayers.includes(player)) {
      setBuzzedPlayers([...buzzedPlayers, player]);
      playBip();
    }

    if (buzzedPlayers.length + 1 >= 3) {
      playBip();
      setTimeout(() => navigate("/score", { state: { players } }), 1500);
    }
  }, [buzzedPlayers, navigate, players, playBip]);

  // Chronomètre
  useEffect(() => {
    if (timer === 0) {
      handleBuzz(players[0]); // Auto buzz du joueur 1 si le temps finit
      return;
    }

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, handleBuzz, players]);

  const handleResponseChange = (category, value) => {
    setResponses({ ...responses, [category]: value });
  };

  const checkSpelling = (word) => {
    if (!word) return false;
    if (/\d/.test(word)) return false;
    if (word.includes("  ")) return false;
    return true;
  };

  const validateRound = () => {
    let totalPoints = 0;
    selectedCategories.forEach((cat) => {
      const answer = responses[cat];
      if (answer && answer[0]?.toUpperCase() === currentLetter) {
        totalPoints += checkSpelling(answer) ? 1 : 0;
      } else if (answer) {
        totalPoints -= 1;
      }
    });

    alert(`Tu as marqué ${totalPoints} points !`);
    handleBuzz(players[0]);
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
      <motion.h1
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Lettre : {currentLetter}
      </motion.h1>

      <h2>Temps restant : {timer}s</h2>

      <div style={{ marginTop: "30px" }}>
        {selectedCategories.map((cat) => (
          <div key={cat} style={{ marginBottom: "10px" }}>
            <label>{cat}</label>
            <input
              type="text"
              value={responses[cat] || ""}
              onChange={(e) => handleResponseChange(cat, e.target.value)}
              style={{
                marginLeft: "10px",
                padding: "8px",
                borderRadius: "10px",
                border: "none",
                outline: "none",
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: "30px", display: "flex", gap: "20px", justifyContent: "center" }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={validateRound}
          style={{
            backgroundColor: "#00FF00",
            color: "#000",
            padding: "10px 20px",
            borderRadius: "15px",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
          }}
        >
          ✅ Valider
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleBuzz(players[0])}
          style={{
            backgroundColor: "#FF0000",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "15px",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
          }}
        >
          🔔 Buzz
        </motion.button>
      </div>

      <h3 style={{ marginTop: "40px" }}>
        Joueurs ayant buzzé : {buzzedPlayers.join(", ") || "Aucun"}
      </h3>
    </div>
  );
};

export default GameScreen;
