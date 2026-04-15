import { useState, useEffect, useCallback } from "react";
import "./CollectionModal.css";

function CollectionModal({ userId, onSelect, onClose }) {
  const [collections, setCollections] = useState([]);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchCollections = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:8080/api/items/collections/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
      }
    } catch (err) {
      console.error("Помилка завантаження колекцій", err);
    }
  }, [userId]);

  useEffect(() => {
    const initLoad = async () => {
      await fetchCollections();
    };
    initLoad();
  }, [fetchCollections]);

  const handleCreate = async () => {
    if (!newName) return alert("Введіть назву!");
    try {
      const res = await fetch("http://localhost:8080/api/items/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, userId: userId, isPublic: false })
      });
      
      if (res.ok) {
        setNewName("");
        setIsCreating(false);
        await fetchCollections(); 
        
        // СИГНАЛ ДЛЯ САЙДБАРУ, ЩОБ ВІН ОНОВИВСЯ
        window.dispatchEvent(new Event('folderCreated'));
      } else {
        alert("Помилка: сервер не зберіг папку");
      }
    } catch (err) {
      console.error("Помилка створення", err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content settings-card">
        <h3>Виберіть категорію</h3>
        
        <div className="coll-list">
          {collections.length === 0 && <p className="empty-text">Папок поки немає</p>}
          {collections.map(c => (
            <button 
              key={c.id} 
              onClick={() => onSelect(c.id)} 
              className="coll-item-btn"
            >
              📁 {c.name}
            </button>
          ))}
        </div>

        {isCreating ? (
          <div className="create-area">
            <input 
              value={newName} 
              onChange={e => setNewName(e.target.value)} 
              placeholder="Назва папки..." 
              className="folder-name-input"
              autoFocus
            />
            <div className="modal-buttons centered">
              <button className="save-btn" onClick={handleCreate}>Ок</button>
              <button className="close-btn" onClick={() => setIsCreating(false)}>Скасувати</button>
            </div>
          </div>
        ) : (
          <button className="add-category-btn" onClick={() => setIsCreating(true)}>
            + Створити нову категорію
          </button>
        )}
        
        <button className="modal-close-main" onClick={onClose}>Закрити</button>
      </div>
    </div>
  );
}

export default CollectionModal;