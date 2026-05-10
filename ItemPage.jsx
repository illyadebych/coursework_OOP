import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import CollectionModal from "../../components/CollectionModal/CollectionModal";
import "./ItemPage.css";

function ItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [item, setItem] = useState(null);
  const [edit, setEdit] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [showModal, setShowModal] = useState(false);
  
  // НОВИЙ СТАН ДЛЯ МОДАЛКИ ВИДАЛЕННЯ
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/items/get-one/${id}`);
        if (response.ok) {
          const data = await response.json();
          setItem(data);
          setTitle(data.title);
          setDesc(data.descr);
        }
      } catch (err) {
        console.error("Помилка завантаження предмета:", err);
      }
    };
    loadData();
  }, [id]);

  // ВИКЛИКАЄТЬСЯ ПІСЛЯ ПІДТВЕРДЖЕННЯ У ВЛАСНІЙ МОДАЛЦІ
  const confirmDelete = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/items/${id}`, { method: "DELETE" });
      if (res.ok) { 
        navigate("/"); 
      }
    } catch { 
      alert("Помилка при видаленні"); 
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleSave = async () => {
    const updatedItem = { ...item, title, descr: desc };
    try {
      const res = await fetch("http://localhost:8080/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem)
      });
      if (res.ok) {
        setEdit(false);
        setItem(updatedItem);
      }
    } catch { alert("Помилка збереження"); }
  };

  const addToCollection = async (collId) => {
    const updatedItem = { ...item, collectionId: collId };
    try {
      const res = await fetch("http://localhost:8080/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem)
      });
      if (res.ok) {
        alert("Додано в колекцію!");
        setShowModal(false);
        setItem(updatedItem);
      }
    } catch (err) { console.error(err); }
  };

  if (!item) return <h2 style={{color: "white", textAlign: "center", marginTop: "50px"}}>Завантаження...</h2>;

  return (
    <div className="item-details-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Назад
      </button>

      <div className="item-page">
        <div className="item-container">
          <img src={item.image} alt={item.title} />
          {edit ? (
            <div className="edit-box">
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows="6" />
              <button className="save-btn" onClick={handleSave}>Зберегти</button>
            </div>
          ) : (
            <div className="view-box">
              <h1>{item.title}</h1>
              <p>{item.descr}</p>
            </div>
          )}
          <div className="actions">
            <button className="edit-btn" onClick={() => setEdit(!edit)}>
              {edit ? "Скасувати" : "Редагувати"}
            </button>
            
            {/* ВІДКРИВАЄМО НАШУ МОДАЛКУ ЗАМІСТЬ WINDOW.CONFIRM */}
            <button className="delete-btn" onClick={() => setShowDeleteConfirm(true)}>Видалити</button>
            
            <button className="coll-btn" onClick={() => setShowModal(true)}>
              Додати в категорію
            </button>
          </div>
        </div>
      </div>

      {/* КУСТОМНА МОДАЛКА ВИДАЛЕННЯ (ВШИТА В КОД) */}
      {showDeleteConfirm && (
        <div className="custom-modal-overlay">
          <div className="custom-confirm-box">
            <h3>Підтвердження</h3>
            <p>Ти точно хочеш видалити цей елемент?</p>
            <div className="custom-modal-actions">
              <button className="c-cancel-btn" onClick={() => setShowDeleteConfirm(false)}>Скасувати</button>
              <button className="c-confirm-btn" onClick={confirmDelete}>Видалити</button>
            </div>
          </div>
        </div>
      )}

      {showModal && user && (
        <CollectionModal 
          userId={user.uid} 
          onSelect={addToCollection} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
}

export default ItemPage;