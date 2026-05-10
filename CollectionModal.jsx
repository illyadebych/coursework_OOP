import { useState, useEffect, useCallback } from "react";
import { auth } from "../../firebase"; 
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
    
    const currentUser = auth.currentUser;

    try {
      const res = await fetch("http://localhost:8080/api/items/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newName, 
          userId: userId, 
          isPublic: false,
          authorName: currentUser?.displayName || currentUser?.email?.split('@')[0] || "Користувач"
        })
      });
      
      if (res.ok) {
        setNewName("");
        setIsCreating(false);
        await fetchCollections(); 
        
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
        
        {/* --- НОВИЙ БЛОК З КНОПКАМИ --- */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
          
          {/* Ця кнопка зберігає елемент БЕЗ категорії */}
          <button className="modal-close-main" onClick={() => onSelect(null)}>
            Не додавати
          </button>

          {/* Ця кнопка повністю скасовує дію (закриває модалку без збереження) */}
          <button 
            className="modal-close-main" 
            style={{ background: 'transparent', border: '1px solid #666', color: '#ccc' }} 
            onClick={onClose}
          >
            Скасувати
          </button>

        </div>

      </div>
    </div>
  );
}

export default CollectionModal;