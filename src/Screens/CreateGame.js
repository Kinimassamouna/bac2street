import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import QRCodeScreen from "./QRCodeScreen";

const categoriesList = [
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

const CreateGame = () => {
  const [hostName, setHostName] = useState("");
  const [numPlayers, setNumPlayers] = useState(2);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [mode, setMode] = useState("toutes");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gameCode, setGameCode] = useState("");
  const [letter, setLetter] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [timer, setTimer] = useState(60);
  const [hasBuzzed, setHasBuzzed] = useState(false);
  const navigate = useNavigate();

  const generateGameCode = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += letters[Math.floor(Math.random() * letters.length)];
    }
    return code;
  };

  const generateRandomLetter = () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return alphabet[Math.floor(Math.random() * alphabet.length)];
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : prev.length < 7
        ? [...prev, category]
        : prev
    );
  };

  const handleCreateGame = async () => {
    const trimmedHost = hostName.trim();
    if (!trimmedHost) {
      setError("Veuillez entrer votre pseudo.");
      return;
    }
    if (selectedCategories.length === 0) {
      setError("Choisissez au moins une catégorie !");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const newGameCode = generateGameCode();
      const randomLetter = generateRandomLetter();
      setLetter(randomLetter);

      const initialResponses = { [trimmedHost]: {} };
      selectedCategories.forEach(cat => initialResponses[trimmedHost][cat] = "");

      const newGameData = {
        gameCode: newGameCode,
        host: trimmedHost,
        mode,
        numPlayers: Math.min(Math.max(numPlayers, 2), 4),
        selectedCategories,
        players: [{ name: trimmedHost, isHost: true }],
        responses: initialResponses,
        buzzedPlayers: [],
        currentLetter: randomLetter,
        timer: 60,
        roundEnded: false,
        currentRound: 1,
        totalRounds: 5,
        started: true,
        createdAt: new Date(),
        status: "playing"
      };

      await setDoc(doc(db, "games", newGameCode), newGameData);
      setGameCode(newGameCode);
      setGameData(newGameData);
      setTimer(60);
      setHasBuzzed(false);

      // Écoute Firestore pour mise à jour temps réel
      const unsub = onSnapshot(doc(db, "games", newGameCode), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setGameData(data);
          setTimer(data.timer);
        }
      });

      return () => unsub();
    } catch (err) {
      console.error("Erreur création partie:", err);
      setError("Impossible de créer la partie : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Timer qui décrémente chaque seconde
  useEffect(() => {
    if (!gameData?.started) return;
    if (timer <= 0) {
      endRound();
      return;
    }
    const interval = setInterval(() => {
      setTimer(prev => {
        const newTime = prev - 1;
        if (gameCode) updateDoc(doc(db, "games", gameCode), { timer: newTime }).catch(console.error);
        if (newTime <= 0) endRound();
        return newTime;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, gameData, gameCode]);

  const handleBuzz = async () => {
    if (!gameData || hasBuzzed) return;
    setHasBuzzed(true);

    const updatedResponses = { ...gameData.responses };
    if (!updatedResponses[hostName]) updatedResponses[hostName] = {};
    updatedResponses[hostName].points = (updatedResponses[hostName].points || 0) + 10;

    await updateDoc(doc(db, "games", gameCode), {
      responses: updatedResponses,
      buzzedPlayers: [...gameData.buzzedPlayers, hostName],
      roundEnded: true
    });

    endRound();
  };

  const endRound = async () => {
    if (!gameData) return;
    const nextRound = gameData.currentRound + 1;
    const roundEnded = nextRound > gameData.totalRounds;

    await updateDoc(doc(db, "games", gameCode), {
      currentRound: nextRound,
      roundEnded: false,
      timer: 60,
      buzzedPlayers: [],
      started: !roundEnded
    });

    setHasBuzzed(false);
    setTimer(60);
  };

  const handleStartGame = () => {
    if (!gameCode) {
      setError("Aucun code de jeu disponible");
      return;
    }
    navigate(`/bac2street/game/${gameCode}`, {
      state: { playerName: hostName.trim(), isHost: true },
    });
  };

  const copyGameCode = () => {
    if (gameCode) {
      navigator.clipboard.writeText(gameCode);
      alert(`Code "${gameCode}" copié !`);
    }
  };

  return (
    <div style={{ background: "linear-gradient(135deg, #ff007f, #00d4ff)", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#fff", padding: "20px" }}>
      <h1>🎲 Créer une partie</h1>

      <div style={{ width: "80%", maxWidth: "450px", marginTop: "30px" }}>
        <div style={{ backgroundColor: "rgba(255,255,255,0.1)", padding: "20px", borderRadius: "10px", marginBottom: "20px" }}>
          <label>Votre pseudo :</label>
          <input
            type="text"
            value={hostName}
            onChange={e => setHostName(e.target.value)}
            placeholder="Ex: Sarah"
            style={{ width: "100%", padding: "10px", marginTop: "10px", borderRadius: "10px", border: "none" }}
          />

          <label style={{ display: "block", marginTop: "20px" }}>Nombre de joueurs (max 4) :</label>
          <input
            type="number"
            min="2"
            max="4"
            value={numPlayers}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 2;
              setNumPlayers(Math.min(Math.max(value, 2), 4));
            }}
            style={{ width: "100%", padding: "10px", marginTop: "10px", borderRadius: "10px", border: "none" }}
          />

          <label style={{ display: "block", marginTop: "20px" }}>Mode :</label>
          <select 
            value={mode} 
            onChange={e => setMode(e.target.value)} 
            style={{ width: "100%", padding: "10px", marginTop: "10px", borderRadius: "10px", border: "none" }}
          >
            <option value="toutes">Toutes les lettres</option>
            <option value="voyelles">Voyelles uniquement</option>
            <option value="consonnes">Consonnes uniquement</option>
          </select>

          <label style={{ display: "block", marginTop: "20px" }}>Catégories (max 7) :</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
            {categoriesList.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                style={{
                  backgroundColor: selectedCategories.includes(cat) ? "#fff" : "rgba(255,255,255,0.3)",
                  color: selectedCategories.includes(cat) ? "#00d4ff" : "#fff",
                  border: "none",
                  padding: "8px 15px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "12px"
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <p style={{ fontSize: "12px", marginTop: "10px", opacity: "0.8" }}>
            {selectedCategories.length}/7 catégories sélectionnées
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: "rgba(255,0,0,0.2)", padding: "15px", borderRadius: "10px", marginBottom: "15px", border: "1px solid red" }}>
            <p style={{ color: "yellow", margin: 0, textAlign: "center" }}>{error}</p>
          </div>
        )}

        <button
          onClick={handleCreateGame}
          disabled={loading}
          style={{ backgroundColor: loading ? "#ccc" : "#fff", color: loading ? "#999" : "#ff007f", padding: "12px 25px", borderRadius: "10px", border: "none", marginTop: "10px", fontWeight: "bold", width: "100%", cursor: loading ? "not-allowed" : "pointer", fontSize: "16px" }}
        >
          {loading ? "⏳ Création en cours..." : "🚀 Créer la partie"}
        </button>

        {gameCode && (
          <div style={{ marginTop: "20px", textAlign: "center", padding: "20px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "10px" }}>
            <h3>🎉 Partie créée !</h3>
            <QRCodeScreen gameCode={gameCode} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", margin: "15px 0" }}>
              <strong style={{ fontSize: "28px", backgroundColor: "white", color: "#ff007f", padding: "12px 24px", borderRadius: "10px", letterSpacing: "3px", fontFamily: "monospace" }}>
                {gameCode}
              </strong>
              <button onClick={copyGameCode} style={{ backgroundColor: "#00d4ff", color: "white", border: "none", padding: "12px", borderRadius: "5px", cursor: "pointer", fontSize: "18px" }}>📋</button>
            </div>
            <p style={{ fontSize: "14px", marginBottom: "10px", opacity: "0.9" }}>Timer : {timer}s</p>
            <button onClick={handleBuzz} disabled={hasBuzzed} style={{ backgroundColor: hasBuzzed ? "#ccc" : "#00ff88", color: "white", border: "none", padding: "12px 25px", borderRadius: "10px", fontWeight: "bold", cursor: hasBuzzed ? "not-allowed" : "pointer", width: "100%", fontSize: "16px" }}>
              {hasBuzzed ? "✅ Buzzé" : "🚨 Buzz !"}
            </button>
            <button onClick={handleStartGame} style={{ marginTop: "10px", backgroundColor: "#00d4ff", color: "white", border: "none", padding: "12px 25px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", width: "100%", fontSize: "16px" }}>
              🎮 Démarrer la partie
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CreateGame;
