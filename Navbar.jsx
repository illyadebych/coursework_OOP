import { Link, useNavigate, NavLink } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useEffect, useState } from "react";
import Sidebar from "../Sidebar/Sidebar"; 
import NotificationBell from "../NotificationBell/NotificationBell"; 
import "./Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false); 
  const [openDropdown, setOpenDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setOpenDropdown(false);
    navigate("/");
  };

  return (
    <>
      <nav className="nav">
        <div className="nav-left">
          {/* ТУТ ПРАВКА: тепер !isSidebarOpen дозволяє закривати меню тією ж кнопкою */}
          <div className="burger-menu" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <Link to="/" className="logo">Головна</Link>
          {user && (
            <NavLink to="/feed" className="nav-link-main">
              <span>Стрічка</span>
            </NavLink>
          )}
        </div>

        <div className="nav-right">
          {!user ? (
            <div className="auth-links">
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </div>
          ) : (
            <div className="user-area">
              <NotificationBell />
              
              <div className="nav-user-pill" onClick={() => setOpenDropdown(!openDropdown)}>
                <span className="nav-username">{user.displayName || "Користувач"}</span>
                <div className="nav-avatar">
                  {user.displayName ? user.displayName[0].toUpperCase() : "U"}
                </div>
              </div>

              {openDropdown && (
                <div className="dropdown">
                  <div className="dropdown-info">{user.email}</div>
                  <hr />
                  <button onClick={logout} className="logout-btn-red">Вийти</button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Передаємо стан для синхронізації */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

export default Navbar;