import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SplashScreen = () => {
  const navigate = useNavigate();
  //const [play] = useSound("/Audio/beepson.mp3");

  useEffect(() => {
    //play(); // joue le son au montage du composant
    const timer = setTimeout(() => {
      navigate("/home");
    }, 4000); // 4 secondes d'attente
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{
        backgroundColor: "#8B5CF6",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
      }}
    >
      <motion.img
        src="/Assets/Images/Game.png" // ✅ chemin depuis public
        alt="Bac2Street Logo"
        style={{ width: "250px", height: "auto" }}
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <p style={{ fontSize: "20px", marginTop: "30px" }}>Bac2Street</p>
      <div className="loader"></div>
    </div>
  );
};

export default SplashScreen;
