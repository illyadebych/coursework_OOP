import { useEffect, useRef, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate, useParams } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const { id: categoryId } = useParams();

  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image] = useState("");
  const [fileImage, setFileImage] = useState(null);

  const fileInputRef = useRef();

  const fetchItemsFromJava = useCallback(async (uid) => {
    try {
      const response = await fetch(`http://localhost:8080/api/items/user/${uid}`);
      if (response.ok) {
        const data = await response.json();
        
        if (categoryId) {
          const filtered = data.filter(item => String(item.collectionId) === String(categoryId));
          setItems(filtered);
        } else {
          setItems(data);
        }
      }
    } catch {
      console.error("Сервер Java не відповідає");
    }
  }, [categoryId]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchItemsFromJava(currentUser.uid);
      } else {
        setItems([]);
      }
    });
    return () => unsub();
  }, [fetchItemsFromJava]);

  const handleAdd = async () => {
    if (!title) return alert("Введи назву");

    const newItem = {
      title: title,
      descr: desc,
      image: fileImage || image || "https://picsum.photos/300/200?random=" + Date.now(),
      userId: user.uid,
      collectionId: categoryId ? Number(categoryId) : null
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
        setTitle(""); 
        setDesc(""); 
        setFileImage(null); 
        setShowForm(false);
      }
    } catch {
      alert("Помилка сервера!");
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFileImage(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="content-area">
      <h1>{categoryId ? "Категорія колекції" : "Моя колекція (Fullstack Java)"}</h1>

      <div className="grid">
        {user && !categoryId && (
          <div className="card add-card" onClick={() => setShowForm(true)}>
            <div className="add-icon">+</div>
            <p>Додати елемент</p>
          </div>
        )}

        {items.length === 0 ? (
          <p style={{color: "white", gridColumn: "1/-1", textAlign: "center", marginTop: "20px"}}>
            Тут поки порожньо...
          </p>
        ) : (
          items.map((item) => (
            <div className="card" key={item.id} onClick={() => navigate(`/item/${item.id}`)}>
              <img src={item.image} alt="" />
              <h3>{item.title}</h3>
              <p>{item.descr}</p>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>Новий елемент</h2>
            <input type="file" ref={fileInputRef} onChange={handleFile} />
            {fileImage && <img src={fileImage} alt="" style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '10px' }} />}
            <input placeholder="Назва" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea placeholder="Опис" value={desc} onChange={(e) => setDesc(e.target.value)} rows="4" />
            <div className="modal-buttons">
              <button onClick={handleAdd}>Зберегти в Java БД</button>
              <button onClick={() => setShowForm(false)}>Закрити</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;