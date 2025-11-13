import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import useSound from "use-sound";
import { doc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../FirebaseConfig";

const vowels = ["A", "E", "I", "O", "U", "Y"];
const consonants = "BCDFGHJKLMNPQRSTVWXZ".split("");
const TOTAL_ROUNDS = 5;
const dictionary = ["Paris","Lion","Voiture","Sarah","Netflix","Chien","Banane"];

const GameScreen = () => {
  const { gameId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { playerName, isHost } = state || {};

  const [gameData, setGameData] = useState(null);
  const [responses, setResponses] = useState({});
  const [playBip] = useSound("/Sons/beep-329314.mp3");

  // 🔄 Mise à jour en temps réel du jeu
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "games", gameId), snapshot => {
      if(snapshot.exists()){
        setGameData(snapshot.data());
        setResponses(snapshot.data().responses || {});
      }
    });
    return () => unsub();
  }, [gameId]);

  // 🔥 Firestore live
  useEffect(() => {
    const unsub = onSnapshot(doc(db,"games",gameId), snapshot => {
      if(snapshot.exists()){
        const data = snapshot.data();
        setGameData(data);
        setResponses(data.responses || {});
      }
    });
    return () => unsub();
  }, [gameId]);

  // 🔹 Démarrer un round
  const startRound = useCallback(async () => {
    if(!isHost || !gameData) return;

    // Vérifier que tous les joueurs sont là
    if(gameData.players.length < gameData.numPlayers){
      alert("⏳ En attente des joueurs...");
      return;
    }

    const pool = gameData.mode==="voyelles" ? vowels
               : gameData.mode==="consonnes" ? consonants
               : [...vowels, ...consonants];

    const randomLetter = pool[Math.floor(Math.random() * pool.length)];

    const newResponses = {};
    gameData.players.forEach(p => {
      newResponses[p.name] = {};
      gameData.selectedCategories.forEach(cat => newResponses[p.name][cat] = "");
    });

    await updateDoc(doc(db,"games",gameId),{
      currentLetter: randomLetter,
      timer: 60,
      roundEnded: false,
      buzzedPlayers: [],
      responses: newResponses,
      currentRound: (gameData.currentRound || 0) + 1,
      started: true
    });
  }, [gameData, gameId, isHost]);

  // 🔹 Changement de réponse
  const handleResponseChange = async (category, value) => {
    const newResponses = {
      ...responses,
      [playerName]: {
        ...(responses[playerName] || {}),
        [category]: value
      }
    };
    setResponses(newResponses);
    await updateDoc(doc(db,"games",gameId), { responses: newResponses });
  };

  // 🔹 Buzz
  const handleBuzz = async () => {
    if(gameData.roundEnded || gameData.buzzedPlayers.includes(playerName)) return;

    const newBuzzed = [...gameData.buzzedPlayers, playerName];
    playBip();
    const shouldEnd = newBuzzed.length >= Math.ceil(gameData.players.length * 0.75);

    await updateDoc(doc(db,"games",gameId), {
      buzzedPlayers: newBuzzed,
      roundEnded: shouldEnd
    });
  };

  // 🔹 Timer côté hôte
  useEffect(() => {
    if(!isHost || !gameData || gameData.roundEnded || !gameData.started) return;

    const interval = setInterval(async () => {
      const newTime = (gameData.timer || 60) - 1;
      if(newTime <= 0){
        clearInterval(interval);
        await updateDoc(doc(db,"games",gameId), { timer: 0, roundEnded: true });
      } else {
        await updateDoc(doc(db,"games",gameId), { timer: newTime });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isHost, gameData, gameId]);

  // 🔹 Vérification orthographique simple
  const checkSpelling = word => {
    if(!word) return false;
    if(/\d/.test(word)) return false;
    if(word.includes("  ")) return false;
    if(!dictionary.includes(word)) return false;
    return true;
  };

  // 🔹 Calcul des points
  const calculatePoints = useCallback(player => {
    let total = 0;
    const letter = gameData?.currentLetter || "";
    gameData?.selectedCategories?.forEach(cat => {
      const answer = responses[player]?.[cat];
      if(answer && answer[0]?.toUpperCase() === letter){
        total += checkSpelling(answer) ? 1 : 0;
      } else if(answer){
        total -= 1;
      }
    });
    return total;
  }, [responses, gameData]);

  // 🔹 Fin de round / passage automatique
  useEffect(() => {
    if(gameData?.roundEnded){
      setTimeout(async () => {
        const pointsByPlayer = {};
        gameData.players.forEach(p => pointsByPlayer[p.name] = calculatePoints(p.name));

        if((gameData.currentRound || 1) >= TOTAL_ROUNDS){
          navigate("/score", { state: { players: gameData.players, responses, pointsByPlayer, buzzedPlayers: gameData.buzzedPlayers, currentLetter: gameData.currentLetter } });
        } else if(isHost){
          await startRound();
        }
      }, 1000);
    }
  }, [gameData, calculatePoints, navigate, responses, isHost, startRound]);

  return (
    <div style={{ background:"linear-gradient(135deg,#ff007f,#00d4ff)", minHeight:"100vh", padding:"20px", color:"#fff", textAlign:"center" }}>
      {gameData ? (
        <>
          <h1>Lettre : {gameData.currentLetter || "?"} (Round {gameData.currentRound || 1}/{TOTAL_ROUNDS})</h1>
          <h2>Temps restant : {gameData.timer}s</h2>
          <h2>Joueur : {playerName}</h2>

          {gameData.selectedCategories.map(cat => (
            <div key={cat} style={{ marginBottom:"10px" }}>
              <label>{cat}</label>
              <input
                type="text"
                value={responses[playerName]?.[cat] || ""}
                onChange={e => handleResponseChange(cat, e.target.value)}
                style={{ marginLeft:"10px", padding:"8px", borderRadius:"10px", border:"none", outline:"none" }}
                disabled={gameData.roundEnded}
              />
            </div>
          ))}

          <button onClick={handleBuzz}
            disabled={gameData.roundEnded || gameData.buzzedPlayers.includes(playerName)}
            style={{
              marginTop:"20px",
              padding:"10px 20px",
              borderRadius:"10px",
              backgroundColor: gameData.buzzedPlayers.includes(playerName) ? "#888" : "#FF0000",
              color:"#fff",
              border:"none",
              cursor:"pointer"
            }}>🔔 Buzz</button>

          {isHost && !gameData.started && gameData.players.length === gameData.numPlayers && (
            <button onClick={startRound} style={{ marginTop:"20px", padding:"10px 20px", borderRadius:"10px", border:"none", backgroundColor:"#fff", color:"#ff007f", cursor:"pointer" }}>
              🎮 Démarrer le round
            </button>
          )}
          {isHost && !gameData.started && gameData.players.length < gameData.numPlayers && (
            <p>⏳ En attente des joueurs...</p>
          )}

          {isHost && gameData.started && gameData.roundEnded && (
            <button onClick={startRound} style={{ marginTop:"20px", padding:"10px 20px", borderRadius:"10px", border:"none", backgroundColor:"#00FF00", color:"#000", cursor:"pointer", fontWeight:"bold" }}>
              🚀 Prochain round
            </button>
          )}

          <div style={{marginTop:"20px", fontWeight:"bold"}}>Points : {calculatePoints(playerName)}</div>
        </>
      ) : <p>Chargement de la partie...</p>}
    </div>
  );
};

export default GameScreen;
