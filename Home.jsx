import { useEffect, useRef, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate, useParams } from "react-router-dom";
import CollectionModal from "../../components/CollectionModal/CollectionModal"; 
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const { id: categoryId } = useParams();

  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); 

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [fileImage, setFileImage] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [folderName, setFolderName] = useState(""); 
  const [currentFolderTitle, setCurrentFolderTitle] = useState(""); 
  const [isPublic, setIsPublic] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const [showWelcome, setShowWelcome] = useState(false);

  const fileInputRef = useRef();

  useEffect(() => {
    if (!categoryId) return;
    (async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/items/collections/${categoryId}`);
        if (res.ok) {
          const data = await res.json();
          setFolderName(data.name || "");
          setCurrentFolderTitle(data.name || "");
          setIsPublic(data.isPublic || false);
        }
      } catch (err) { console.error(err); }
    })();
  }, [categoryId]);

  const fetchItemsFromJava = useCallback(async (uid) => {
    try {
      const url = `http://localhost:8080/api/items/user/${uid}${searchTerm ? `?search=${searchTerm}` : ""}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        
        // ОНОВЛЕННЯ: Якщо ми на головній, зберігаємо загальну кількість
        if (!categoryId && !searchTerm) {
          localStorage.setItem("totalItemsCount", data.length);
          // Створюємо подію, щоб сайдбар дізнався про зміни
          window.dispatchEvent(new Event("storageUpdate"));
        }

        if (categoryId) {
          const filtered = data.filter(item => String(item.collectionId) === String(categoryId));
          setItems(filtered);
        } else { 
          setItems(data); 
        }
      }
    } catch { console.error("Помилка сервера"); }
  }, [categoryId, searchTerm]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchItemsFromJava(currentUser.uid);
        const hasSeenWelcome = localStorage.getItem(`hasSeenWelcome_${currentUser.uid}`);
        if (!hasSeenWelcome && !categoryId) {
          setShowWelcome(true);
        }
      } else setItems([]);
    });
    return () => unsub();
  }, [fetchItemsFromJava, categoryId]);

  const handleCloseWelcome = () => {
    if (user) {
      localStorage.setItem(`hasSeenWelcome_${user.uid}`, "true");
    }
    setShowWelcome(false);
  };

  const handleFinalAdd = async (selectedCollId) => {
    const newItem = {
      title,
      descr: desc,
      image: fileImage || "https://picsum.photos/300/200?random=" + Date.now(),
      userId: user.uid,
      collectionId: selectedCollId
    };

    try {
      const response = await fetch("http://localhost:8080/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem)
      });

      if (response.ok) {
        const savedItem = await response.json();
        setItems([...items, savedItem]);
        
        // Оновлюємо лічильник після додавання
        const currentCount = parseInt(localStorage.getItem("totalItemsCount") || 0);
        localStorage.setItem("totalItemsCount", currentCount + 1);
        window.dispatchEvent(new Event("storageUpdate"));

        setTitle(""); setDesc(""); setFileImage(null); 
        setShowCollectionModal(false);
        setShowForm(false);
      }
    } catch { alert("Помилка!"); }
  };

  const handleUpdateFolder = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/items/collections/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: folderName, 
          isPublic: isPublic, 
          userId: user?.uid,
          authorName: user?.displayName || user?.email?.split('@')[0] || "Користувач"
        })
      });
      if (res.ok) {
        setCurrentFolderTitle(folderName); 
        setShowSettings(false);
        setIsEditingName(false);
      }
    } catch { alert("Помилка!"); }
  };

  return (
    <div className="content-area">
      <div className="category-header">
        <h1>{categoryId ? currentFolderTitle : "Моя колекція"}</h1>
        {categoryId && (
          <button className="settings-btn" onClick={() => setShowSettings(true)}>⚙️ Налаштування</button>
        )}
      </div>

      <div className="search-wrapper">
        <input 
          type="text" className="modern-search-input" placeholder="Пошук..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>

      <div className="grid">
        {user && !categoryId && (
          <div className="card add-card" onClick={() => setShowForm(true)}>
            <div className="add-icon">+</div>
            <p>Додати елемент</p>
          </div>
        )}
        {items.map((item) => (
          <div className="card" key={item.id} onClick={() => navigate(`/item/${item.id}`)}>
            <img src={item.image} alt="" />
            <h3>{item.title}</h3>
            <p>{item.descr}</p>
          </div>
        ))}
      </div>

      {showWelcome && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content settings-card welcome-modal-content">
            <h2 className="welcome-title">Вітаємо!</h2>
            <p className="welcome-text">
              Ви знаходитеся на сторінці, де ви можете додати свій колекційний предмет.
            </p>
            <p className="welcome-text">
              Щоб додати свій перший колекційний предмет, натисніть на блок <br/> <b>+ Додати елемент</b>.
            </p>
            <button className="welcome-btn" onClick={handleCloseWelcome}>
              Зрозуміло
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal">
          <div className="modal-content settings-card modern-modal">
            <h2>Новий елемент</h2>
            
            <div className="file-upload-section">
              <label className="custom-file-upload">
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => setFileImage(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
                <div className="upload-content">
                  {fileImage ? (
                    <img src={fileImage} alt="Preview" className="upload-preview" />
                  ) : (
                    <>
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">Зробити фото або вибрати файл</span>
                    </>
                  )}
                </div>
              </label>
            </div>

            <div className="input-group">
              <input 
                placeholder="Назва" 
                className="modern-input"
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
              />
              <textarea 
                placeholder="Опис" 
                className="modern-textarea"
                value={desc} 
                onChange={(e) => setDesc(e.target.value)} 
                rows="4"
              />
            </div>

            <div className="modal-buttons centered">
              <button className="save-btn action-save" onClick={() => {
                if (categoryId) handleFinalAdd(Number(categoryId)); 
                else setShowCollectionModal(true); 
              }}>Зберегти</button>
              <button className="close-btn action-close" onClick={() => {
                setShowForm(false);
                setFileImage(null);
              }}>Закрити</button>
            </div>
          </div>
        </div>
      )}

      {showCollectionModal && (
        <CollectionModal 
          userId={user?.uid} 
          onSelect={handleFinalAdd} 
          onClose={() => setShowCollectionModal(false)} 
        />
      )}

      {showSettings && (
        <div className="modal">
          <div className="modal-content settings-card">
            <h2>Налаштування папки</h2>
            <div className="setting-item">
              <label>НАЗВА ПАПКИ</label>
              <div className="name-edit-wrapper">
                {isEditingName ? (
                  <input className="folder-name-input" value={folderName} onChange={(e) => setFolderName(e.target.value)} autoFocus />
                ) : ( <span className="folder-name-text">{folderName || "Без назви"}</span> )}
                <button className="edit-name-toggle" onClick={() => setIsEditingName(!isEditingName)}>
                  {isEditingName ? "Готово" : "Редагувати"}
                </button>
              </div>
            </div>
            <div className="setting-item">
              <label>СТАТУС ДОСТУПУ</label>
              <div className="liquid-toggle">
                <div className={`toggle-tab ${!isPublic ? "active-tab active-red" : ""}`} onClick={() => setIsPublic(false)}> Приватна </div>
                <div className={`toggle-tab ${isPublic ? "active-tab active-green" : ""}`} onClick={() => setIsPublic(true)}> Публічна </div>
                <div className={`liquid-slider ${isPublic ? "pos-right" : "pos-left"}`}></div>
              </div>
            </div>
            <div className="modal-buttons centered">
              <button className="save-btn" onClick={handleUpdateFolder}>Зберегти</button>
              <button className="close-btn" onClick={() => {setShowSettings(false); setIsEditingName(false);}}>Закрити</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;