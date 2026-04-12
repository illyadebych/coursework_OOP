import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useEffect, useState } from "react";
import Sidebar from "../Sidebar/Sidebar"; 
import "./Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setOpen(false);
    navigate("/");
  };

  return (
    <>
      <nav className="nav">
        <div className="nav-left">
          {/* КНОПКА БУРГЕР */}
          <div className="burger-menu" onClick={() => setSidebarOpen(true)}>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <Link to="/" className="logo">
            Collectors Platform
          </Link>
        </div>

        <div className="nav-right">
          {!user ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          ) : (
            <div className="user-area">
              <div className="avatar" onClick={() => setOpen(!open)}>👤</div>
              {open && (
                <div className="dropdown">
                  <button onClick={logout}>Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ПЕРЕДАЄМО ФУНКЦІЮ ЗАКРИТТЯ */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

export default Navbar;