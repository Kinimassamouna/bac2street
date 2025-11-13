import { db } from "./FirebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

// Génère un code unique (8 caractères)
export const generateGameCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

// 🔹 Créer une partie
export const createGame = async (hostName, maxPlayers, categories, mode) => {
  const code = generateGameCode();
  const gameRef = doc(db, "games", code);

  const newGame = {
    code,
    host: hostName,
    createdAt: new Date(),
    status: "waiting",
    maxPlayers,
    mode,
    categories,
    players: {
      [hostName]: { score: 0, buzzed: false },
    },
    round: 1,
    timer: 60,
    started: false,
  };

  await setDoc(gameRef, newGame);
  return code;
};

// 🔹 Rejoindre une partie existante
export const joinGame = async (code, playerName) => {
  const gameRef = doc(db, "games", code);
  const gameSnap = await getDoc(gameRef);

  if (!gameSnap.exists()) throw new Error("Partie introuvable.");
  const game = gameSnap.data();

  if (Object.keys(game.players).length >= game.maxPlayers)
    throw new Error("La partie est déjà complète.");

  await updateDoc(gameRef, {
    [`players.${playerName}`]: { score: 0, buzzed: false },
  });
};

// 🔹 Écoute en temps réel les changements du jeu
export const listenToGame = (code, callback) => {
  const gameRef = doc(db, "games", code);
  return onSnapshot(gameRef, (snapshot) => {
    if (snapshot.exists()) callback(snapshot.data());
  });
};

// 🔹 Lancer le jeu
export const startGame = async (code) => {
  const gameRef = doc(db, "games", code);
  await updateDoc(gameRef, { started: true, status: "running" });
};
