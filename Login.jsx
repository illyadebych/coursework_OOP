import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Введіть email і пароль");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Ви успішно увійшли");
      navigate("/");
    } catch (error) {
      alert("Помилка входу: " + error.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Login</h1>

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

        <button onClick={handleLogin}>Login</button>

        <p className="switch-text">
          Немає акаунту?{" "}
          <Link to="/register" className="switch-link">
            Зареєструйтесь
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;