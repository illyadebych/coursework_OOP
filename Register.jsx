import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"; // Додано updateProfile
import { auth } from "../../firebase";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css"; // Твій порожній або спільний CSS, він підтягне стилі логіну

function Register() {
  const [username, setUsername] = useState(""); // ДОДАНО: Стан для імені
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    // Перевірки перед відправкою
    if (!username.trim()) {
      setError("Будь ласка, введіть ім'я користувача");
      return;
    }
    if (password !== repeatPassword) {
      setError("Паролі не співпадають");
      return;
    }

    try {
      // 1. Створюємо користувача в Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Одразу записуємо його Нікнейм у профіль Firebase
      await updateProfile(userCredential.user, {
        displayName: username
      });

      // Якщо все успішно — кидаємо на головну
      navigate("/"); 
    } catch (err) {
      setError("Помилка реєстрації: " + err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Register</h1>

        {/* НОВЕ ПОЛЕ ДЛЯ ІМЕНІ */}
        <input
          type="text"
          placeholder="Username (Нікнейм)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Repeat password"
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
        />

        {error && <p style={{ color: "#ff3b30", fontSize: "14px", margin: "5px 0" }}>{error}</p>}

        <button onClick={handleRegister}>Register</button>

        <p className="switch-text">
          Вже маєте акаунт?{" "}
          <Link to="/login" className="switch-link">
            Увійти
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;