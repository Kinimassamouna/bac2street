import React from "react";
import { useNavigate } from "react-router-dom";

const HomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #fd5afdff, #52cbcbff)",
        minHeight: "100vh",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px",
        textAlign: "center"
      }}
    >
      <h1>🎉 Bac2Street 🎉</h1>

      <button
        onClick={() => navigate("/create")}
        style={{
          padding: "15px 40px",
          borderRadius: "20px",
          border: "none",
          fontSize: "18px",
          fontWeight: "bold",
          margin: "20px",
          cursor: "pointer",
        }}
      >
        🚀 Créer une partie
      </button>

      <button
        onClick={() => navigate("/join-game")}
        style={{
          padding: "15px 40px",
          borderRadius: "20px",
          border: "none",
          fontSize: "18px",
          fontWeight: "bold",
          margin: "20px",
          cursor: "pointer",
        }}
      >
        🔑 Rejoindre une partie
      </button>
    </div>
  );
};

export default HomeScreen;
