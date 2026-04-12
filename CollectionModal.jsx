import { useState, useEffect } from "react";
import "./CollectionModal.css";

function CollectionModal({ userId, onSelect, onClose }) {
  const [collections, setCollections] = useState([]);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // 1. Спочатку оголошуємо функцію
  const fetchCollections = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/items/collections/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
      }
    } catch (err) {
      console.error("Помилка завантаження колекцій", err);
    }
  };

  // 2. Потім викликаємо її в useEffect
  useEffect(() => {
    fetchCollections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleCreate = async () => {
    if (!newName) return;
    try {
      const res = await fetch("http://localhost:8080/api/items/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, userId: userId })
      });
      if (res.ok) {
        setNewName("");
        setIsCreating(false);
        fetchCollections();
      }
    } catch (err) {
      console.error("Помилка створення", err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Виберіть категорію</h3>
        
        <div className="coll-list">
          {collections.length === 0 && <p style={{color: "#888"}}>Папок поки немає</p>}
          {collections.map(c => (
            <button key={c.id} onClick={() => onSelect(c.id)} className="coll-item">
              📁 {c.name}
            </button>
          ))}
        </div>

        <div className="create-section">
          {isCreating ? (
            <div className="create-area">
              <input 
                value={newName} 
                onChange={e => setNewName(e.target.value)} 
                placeholder="Назва папки..." 
              />
              <div className="modal-buttons">
                <button onClick={handleCreate}>Ок</button>
                <button onClick={() => setIsCreating(false)}>Скасувати</button>
              </div>
            </div>
          ) : (
            <button className="add-coll-btn" onClick={() => setIsCreating(true)}>
              + Створити нову категорію
            </button>
          )}
        </div>
        
        <button className="close-btn-main" onClick={onClose}>Закрити</button>
      </div>
    </div>
  );
}

export default CollectionModal;