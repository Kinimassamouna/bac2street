
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const allCategories = [
  "Ville/Pays",
  "Animal",
  "Objet",
  "Métier",
  "Fruit/Légume",
  "Célébrité",
  "Film/Série",
  "Anatomie",
  "Son + Artiste",
  "Pathologie"
];

const HomeScreen = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState(["", "", "", ""]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [mode, setMode] = useState("voyelles+consonnes");

  const handlePlayerChange = (index, value) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else if (selectedCategories.length < 7) {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const canStart = players.every((p) => p.trim() !== "") && selectedCategories.length === 7;

  const startGame = () => {
    navigate("/game", {
      state: { players, selectedCategories, mode }
    });
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #FF00FF, #00FFFF)",
        minHeight: "100vh",
        color: "white",
        padding: "30px",
        textAlign: "center"
      }}
    >
      <motion.h1
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🎉 Bac2Street 🎉
      </motion.h1>

      <h2>Entre les pseudos des 4 joueurs</h2>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px" }}>
        {players.map((p, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Joueur ${i + 1}`}
            value={p}
            onChange={(e) => handlePlayerChange(i, e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              outline: "none",
              width: "150px"
            }}
          />
        ))}
      </div>

      <h2 style={{ marginTop: "30px" }}>Choisis 7 catégories</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "10px",
          marginTop: "10px"
        }}
      >
        {allCategories.map((cat) => (
          <motion.button
            whileTap={{ scale: 0.9 }}
            key={cat}
            onClick={() => toggleCategory(cat)}
            style={{
              backgroundColor: selectedCategories.includes(cat) ? "#FFD700" : "#222",
              color: selectedCategories.includes(cat) ? "#000" : "#fff",
              padding: "10px",
              borderRadius: "15px",
              cursor: "pointer",
              border: "none",
              fontWeight: "bold"
            }}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      <h2 style={{ marginTop: "30px" }}>Choisis ton mode de lettres</h2>
      <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
        {["voyelles+consonnes", "voyelles", "consonnes"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              backgroundColor: mode === m ? "#FFD700" : "#222",
              color: mode === m ? "#000" : "#fff",
              padding: "10px 20px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer"
            }}
          >
            {m}
          </button>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        onClick={startGame}
        disabled={!canStart}
        style={{
          marginTop: "40px",
          backgroundColor: canStart ? "#00FF00" : "gray",
          color: "#000",
          padding: "15px 40px",
          borderRadius: "20px",
          fontSize: "18px",
          fontWeight: "bold",
          border: "none",
          cursor: canStart ? "pointer" : "not-allowed"
        }}
      >
        🚀 Lancer la partie
      </motion.button>
    </div>
  );
};

export default HomeScreen;















