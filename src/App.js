import React from "react";
import { Routes, Route } from "react-router-dom";
import SplashScreen from "./Screens/SplashScreen";
import HomeScreen from "./Screens/HomeScreen";
import GameScreen from "./Screens/GameScreen";
import ScoreScreen from "./Screens/ScoreScreen";
import QRCodeScreen from "./Screens/QRCodeScreen";
import CreateGame from "./Screens/CreateGame";
import JoinGame from "./Screens/JoinGame";

function App() {
  return (
     <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/home" element={<HomeScreen />} />
      <Route path="/game/:gameId" element={<GameScreen />} />
      <Route path="/score" element={<ScoreScreen />} />
      <Route path="/qrcode" element={<QRCodeScreen />} /> 
      <Route path="/create" element={<CreateGame />} />
      <Route path="/join-game/:gameCode" element={<JoinGame />} />
    </Routes>
  );
}

export default App;
