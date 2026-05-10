import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import "./Sidebar.css";

function Sidebar({ isOpen, onClose }) {
  const [collections, setCollections] = useState([]);
  const [view, setView] = useState("main");
  const [totalItems, setTotalItems] = useState(0);

  const fetchCollections = useCallback(async (uid) => {
    if (!uid) return;
    try {
      const res = await fetch(`http://localhost:8080/api/items/collections/user/${uid}`);
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
      }
    } catch (err) {
      console.error("Помилка завантаження колекцій", err);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        fetchCollections(u.uid);
        setTotalItems(parseInt(localStorage.getItem("totalItemsCount") || 0));
      } else {
        setCollections([]);
      }
    });
    return () => unsub();
  }, [fetchCollections]);

  useEffect(() => {
    const handleUpdate = () => {
      setTotalItems(parseInt(localStorage.getItem("totalItemsCount") || 0));
    };
    window.addEventListener("storageUpdate", handleUpdate);
    return () => window.removeEventListener("storageUpdate", handleUpdate);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setView("main"), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        {view === "main" ? (
          <div className="sidebar-inner-flex">
            <div className="sidebar-top-section">
              <div className="sidebar-header">
                <h3>Меню</h3>
                <button className="close-btn" onClick={onClose}>×</button>
              </div>
              
              <div className="sidebar-content">
                <div className="sidebar-group-label">ОСНОВНЕ</div>
                <div className="sidebar-item clickable" onClick={() => setView("collections")}>
                  📁 Категорії
                </div>
                
                <div className="sidebar-group-label">ВАША СТАТИСТИКА</div>
                <div className="sidebar-stats-card">
                  <div className="stats-row">
                    <span>Елементів:</span>
                    <span className="stats-value">{totalItems}</span>
                  </div>
                  <div className="stats-row">
                    <span>Папок:</span>
                    <span className="stats-value">{collections.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Футер з пасхалкою */}
            <div className="sidebar-footer">
              <Link to="/about" onClick={onClose} className="sidebar-about-link">
                Про проєкт
              </Link>
            </div>
          </div>
        ) : (
          <div className="sidebar-inner-flex">
            <div className="sidebar-header">
              <button className="back-btn" onClick={() => setView("main")}>←</button>
              <h3>Категорії</h3>
              <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div className="sidebar-content nested-scroll">
              {collections.map(c => (
                <Link key={c.id} to={`/category/${c.id}`} onClick={onClose} className="sidebar-item">
                  📂 {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Sidebar;