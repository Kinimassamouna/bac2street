import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore";
import { db } from "../FirebaseConfig";

const JoinGame = () => {
  const [gameCode, setGameCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gameData, setGameData] = useState(null);
  const navigate = useNavigate();

  const handleJoin = async () => {
    const trimmedCode = gameCode.trim().toUpperCase();
    const trimmedName = playerName.trim();
    if (!trimmedCode || !trimmedName) { setError("Code et pseudo requis."); return; }

    setError(""); setLoading(true);
    try {
      const gameRef = doc(db, "games", trimmedCode);
      const gameSnap = await getDoc(gameRef);
      if (!gameSnap.exists()) { setError("Partie introuvable."); setLoading(false); return; }

      const data = gameSnap.data();
      if (data.players.some(p=>p.name.toLowerCase()===trimmedName.toLowerCase())) { setError("Pseudo déjà pris."); setLoading(false); return; }
      if (data.players.length >= data.numPlayers) { setError("Partie complète."); setLoading(false); return; }

      // Ajouter le joueur
      await updateDoc(gameRef, { players: arrayUnion({ name: trimmedName }) });
      const newResponses = { ...data.responses, [trimmedName]: data.selectedCategories.reduce((acc,cat)=>{ acc[cat] = ""; return acc; }, {}) };
      await updateDoc(gameRef, { responses: newResponses });

      setGameData({ ...data, players: [...data.players, { name: trimmedName }] });
    } catch(err) {
      console.error(err);
      setError("Erreur Firestore : " + err.message);
    } finally { setLoading(false); }
  };

  // Écoute en temps réel de la partie
  useEffect(()=>{
    if(!gameCode) return;
    const gameRef = doc(db,"games",gameCode);
    const unsubscribe = onSnapshot(gameRef, docSnap=>{
      if(docSnap.exists()) setGameData(docSnap.data());
    });
    return ()=>unsubscribe();
  },[gameCode]);

  const handleStartGame = () => {
    if(!gameData) return;
    if(gameData.players.length < gameData.numPlayers) { setError("Tous les joueurs ne sont pas encore là !"); return; }
    navigate(`/game/${gameCode}`, { state: { playerName, isHost: false } });
  };

  return (
    <div style={{ background:"linear-gradient(135deg, #00c6ff, #0072ff)", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", padding:"20px", color:"#fff" }}>
      <h1>🎮 Rejoindre une partie</h1>

      <input placeholder="Code de la partie" value={gameCode} onChange={e=>setGameCode(e.target.value.toUpperCase())} style={{ width:"300px", padding:"10px", borderRadius:"10px", border:"none", marginBottom:"10px", textAlign:"center", fontSize:"18px" }} />
      <input placeholder="Pseudo" value={playerName} onChange={e=>setPlayerName(e.target.value)} style={{ width:"300px", padding:"10px", borderRadius:"10px", border:"none", marginBottom:"10px", textAlign:"center", fontSize:"18px" }} />

      {error && <p style={{ color:"yellow", fontWeight:"bold" }}>⚠️ {error}</p>}

      <button onClick={handleJoin} disabled={loading} style={{ padding:"12px 25px", borderRadius:"10px", border:"none", fontWeight:"bold", backgroundColor:loading?"#ccc":"#fff", color:loading?"#666":"#0072ff", cursor:loading?"not-allowed":"pointer", fontSize:"16px" }}>
        {loading?"⏳ Connexion...":"🚀 Rejoindre"}
      </button>

      {gameData && (
        <div style={{ marginTop:"20px", textAlign:"center", padding:"20px", backgroundColor:"rgba(255,255,255,0.1)", borderRadius:"10px" }}>
          <p>Lettre actuelle : <strong>{gameData.currentLetter || "?"}</strong></p>
          <p>Joueurs ({gameData.players.length}/{gameData.numPlayers}) :</p>
          <ul style={{ listStyle:"none", padding:0 }}>{gameData.players.map((p,i)=><li key={i}>{p.name} {p.isHost?"🎩":""}</li>)}</ul>

          {gameData.players.length === gameData.numPlayers && <button onClick={handleStartGame} style={{ padding:"12px 25px", borderRadius:"10px", border:"none", fontWeight:"bold", backgroundColor:"#00ff88", color:"#fff", cursor:"pointer" }}>🎮 Commencer la partie</button>}
        </div>
      )}
    </div>
  );
};

export default JoinGame;
