import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import "./Sidebar.css";

function Sidebar({ isOpen, onClose }) {
  const [collections, setCollections] = useState([]);
  const [view, setView] = useState("main");
  const [currentUser, setCurrentUser] = useState(null); 

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
      setCurrentUser(u);
      if (u) {
        fetchCollections(u.uid);
      } else {
        setCollections([]);
      }
    });
    return () => unsub();
  }, [fetchCollections]);

  useEffect(() => {
    const handleNewFolder = () => {
      if (currentUser) {
        fetchCollections(currentUser.uid);
      }
    };

    window.addEventListener("folderCreated", handleNewFolder);

    return () => {
      window.removeEventListener("folderCreated", handleNewFolder);
    };
  }, [currentUser, fetchCollections]);

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
          <div className="sidebar-inner">
            <div className="sidebar-header">
              <h3>Меню</h3>
              <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div className="sidebar-content">
              <Link to="/" onClick={onClose} className="sidebar-item">
                Всі предмети
              </Link>
              <div className="sidebar-item clickable" onClick={() => setView("collections")}>
                Категорії
              </div>
            </div>
          </div>
        ) : (
          <div className="sidebar-inner">
            <div className="sidebar-header">
              <button className="back-btn" onClick={() => setView("main")}>←</button>
              <h3>Мої категорії</h3>
              <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div className="sidebar-content">
              {collections.length === 0 ? (
                <p style={{padding: "20px", color: "#666"}}>Папок поки немає</p>
              ) : (
                collections.map(c => (
                  <Link key={c.id} to={`/category/${c.id}`} onClick={onClose} className="sidebar-item">
                    📂 {c.name}
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Sidebar;