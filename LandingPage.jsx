import { Link } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  return (
    <div className="landing-wrapper">
      <div className="glow-circle top-left"></div>
      <div className="glow-circle bottom-right"></div>

      <div className="landing-content">
        <header className="landing-header">
          <div className="landing-logo">🌍 Collectors Platform</div>
          <div className="landing-auth-nav">
            <Link to="/login" className="nav-login-btn">Увійти</Link>
          </div>
        </header>

        <main className="landing-main">
          <h1 className="hero-title">
            Твій простір для <br />
            <span className="text-gradient">колекцій</span>
          </h1>
          
          <p className="hero-subtitle">
            Зберігай, організовуй та ділися тим, що ти любиш. 
            Створи свою першу віртуальну полицю вже сьогодні.
            <br /><br />
            <span style={{ color: "#ffffff" }}>Для початку користування вам потрібно створити акаунт.</span>
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn-primary-large">Створити</Link>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📂</div>
              <h3>Організовуй</h3>
              <p>Створюй зручні папки для будь-яких предметів: від книг до рідкісних монет.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">👀</div>
              <h3>Ділися</h3>
              <p>Роби свої колекції публічними та показуй їх усім користувачам платформи.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">❤️</div>
              <h3>Надихайся</h3>
              <p>Гортай глобальну стрічку, став лайки та коментуй знахідки інших.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default LandingPage;