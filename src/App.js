import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SplashScreen from "./Screens/SplashScreen";
import HomeScreen from "./Screens/HomeScreen";
import GameScreen from "./Screens/GameScreen";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/home" element={<HomeScreen />}/>
        <Route path="/game" element={<GameScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
