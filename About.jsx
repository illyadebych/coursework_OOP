import { useNavigate } from "react-router-dom";
import "./About.css";
// 1. Імпортуй своє фото (переконайся, що шлях правильний)
import myPhoto from "../../assets/images/my-photo.jpeg"; 

function About() {
  const navigate = useNavigate();

  return (
    <div className="about-wrapper">
      <div className="about-container settings-card">
        <button className="back-btn-about" onClick={() => navigate(-1)}>← Назад</button>
        
        <h1 className="about-title">Про проєкт</h1>
        
        {/* 2. Додаємо flex-контейнер для розділення тексту та фото */}
        <div className="about-main-layout">
          
          <div className="about-content">
            <p className="about-text">
              Ця платформа була створена як курсова робота студентом 2-го курсу УжНУ, 
              спеціальності "Інженерія програмного забезпечення" — <b>Іллею Дебичем</b>.
            </p>
            
            <div className="tech-stack">
               <h3>Технологічний стек:</h3>
               <ul>
                 <li><b>Frontend:</b> React.js, CSS3 (Glassmorphism)</li>
                 <li><b>Backend:</b> Spring Boot (Java), Hibernate</li>
                 <li><b>База даних:</b> H2 Database</li>
                 <li><b>Авторизація:</b> Firebase Auth</li>
               </ul>
            </div>

            <blockquote className="about-quote">
              "Цей проєкт — це більше, ніж просто код. Це результат безсонних ночей, 
              пошуку ідеальних рішень та щирої любові до своєї справи... Це мій перший настільки масштабний проєкт, який я ніколи не забуду і буду згадувати лише з теплом."
            </blockquote>
          </div>

          {/* 3. Блок із фото */}
          <div className="about-photo-container">
            <img src={myPhoto} alt="Ілля Дебич" className="about-profile-img" />
          </div>
          
        </div>

        <div className="about-footer">
          © 2026 Всі права захищені. Створено з ❤️ 
        </div>
      </div>
    </div>
  );
}

export default About;