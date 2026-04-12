import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import ItemPage from "./pages/ItemPage/ItemPage";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import SpaceBackground from "./components/SpaceBackground/SpaceBackground";
import "./App.css";

function App() {
  return (
    <Router>
      <SpaceBackground />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/item/:id" element={<ItemPage />} />
        
        {/* Новий роут для категорій */}
        <Route path="/category/:id" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;