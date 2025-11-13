import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../FirebaseConfig";

const GameLobby = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { playerName, isHost, gameCode } = location.state;

  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!gameCode) return;

    const gameRef = doc(db, "games", gameCode);

    // Écoute en temps réel des changements
    const unsubscribe = onSnapshot(
      gameRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setGameData(docSnap.data());
          setLoading(false);
        } else {
          setError("Partie introuvable.");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Erreur snapshot:", err);
        setError("Impossible de récupérer les données.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [gameCode]);

  const handleStartGame = async () => {
    if (!gameData) return;

    // Vérifie si tous les joueurs sont là
    if (gameData.players.length < gameData.numPlayers) {
      alert(`Il manque ${gameData.numPlayers - gameData.players.length} joueur(s) pour démarrer !`);
      return;
    }

    try {
      const gameRef = doc(db, "games", gameCode);
      await updateDoc(gameRef, { started: true, status: "started" });
      navigate(`/game/${gameCode}`, { state: { playerName, isHost } });
    } catch (err) {
      console.error("Erreur démarrage partie:", err);
      alert("Impossible de démarrer la partie.");
    }
  };

  if (loading) return <p>⏳ Chargement du lobby...</p>;
  if (error) return <p>❌ {error}</p>;

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>🎮 Lobby de la partie</h1>
      <p>Code de la partie : <strong>{gameCode}</strong></p>
      <p>Lettre de la partie : <strong>{gameData.currentLetter}</strong></p>
      <p>Mode : {gameData.mode}</p>
      <p>Nombre de joueurs requis : {gameData.numPlayers}</p>

      <h3>👥 Joueurs présents ({gameData.players.length}/{gameData.numPlayers}) :</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {gameData.players.map((p, idx) => (
          <li key={idx} style={{ margin: "5px 0" }}>
            {p.name} {p.isHost ? "🎩" : ""}
          </li>
        ))}
      </ul>

      {isHost && (
        <button
          onClick={handleStartGame}
          disabled={gameData.players.length < gameData.numPlayers}
          style={{
            marginTop: "20px",
            padding: "12px 25px",
            borderRadius: "10px",
            border: "none",
            fontWeight: "bold",
            cursor: gameData.players.length < gameData.numPlayers ? "not-allowed" : "pointer",
            backgroundColor: gameData.players.length < gameData.numPlayers ? "#ccc" : "#00ff88",
            color: "#fff"
          }}
        >
          🎮 Démarrer la partie
        </button>
      )}
    </div>
  );
};

export default GameLobby;
