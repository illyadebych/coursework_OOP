import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase"; 

import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import ItemPage from "./pages/ItemPage/ItemPage";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Feed from "./pages/Feed/Feed";
import LandingPage from "./pages/LandingPage/LandingPage";
import About from "./pages/About/About"; // <--- ТУТ ІМПОРТ (перевір шлях до файлу)
import SpaceBackground from "./components/SpaceBackground/SpaceBackground";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return <div style={{ color: "white", textAlign: "center", marginTop: "50px" }}>Завантаження...</div>;
  }

  return (
    <Router>
      <SpaceBackground />
      
      {user && <Navbar />} 
      
      <Routes>
        <Route path="/" element={user ? <Home /> : <LandingPage />} />
        
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        
        <Route path="/item/:id" element={user ? <ItemPage /> : <Navigate to="/login" />} />
        <Route path="/category/:id" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/feed" element={user ? <Feed /> : <Navigate to="/login" />} />
        
        {/* НОВИЙ РОУТ */}
        <Route path="/about" element={user ? <About /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;