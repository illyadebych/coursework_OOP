import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { useSearchParams } from "react-router-dom"; 
import "./Feed.css";

// --- КАРТКА КОЛЕКЦІЇ У СТРІЧЦІ ---
function CollectionCard({ collection, onClick, refreshTrigger }) {
  const [items, setItems] = useState([]);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const loadCardData = async () => {
      try {
        const [resItems, resLikes, resComm] = await Promise.all([
          fetch(`http://localhost:8080/api/items/collection/${collection.id}/items`),
          fetch(`http://localhost:8080/api/items/like-count/${collection.id}`),
          fetch(`http://localhost:8080/api/items/comments/item/${collection.id}`)
        ]);
        setItems(await resItems.json());
        setLikes(await resLikes.json());
        setComments(await resComm.json());
      } catch (e) { console.error(e); }
    };
    
    // Завантажуємо одразу при відкритті
    loadCardData();

    // НОВА МАГІЯ: Тихе фонове оновлення кожні 5 секунд (Реальний час!)
    const interval = setInterval(loadCardData, 5000);
    return () => clearInterval(interval);

  }, [collection.id, refreshTrigger]);

  const renderPreview = () => {
    const count = items.length;
    if (count === 0) return <div className="empty-preview">Порожня колекція</div>;
    const displayItems = items.slice(0, 3);
    const hasMore = count > 3 || count === 1;

    return (
      <div className={`preview-grid ${count === 2 ? 'grid-2' : ''}`}>
        {displayItems.map((item) => (
          <div key={item.id} className="preview-slot">
            <img src={item.image} alt="preview" />
          </div>
        ))}
        {hasMore && <div className="preview-slot more-slot"><span>+{count > 3 ? count - 3 : ''} ще</span></div>}
      </div>
    );
  };

  const getAuthorName = () => collection.authorName || collection.userId.split('@')[0];

  return (
    <div className="feed-card-v2" onClick={() => onClick(collection)}>
      <div className="card-author-header">
        <span className="author-icon">👤</span>
        <span className="author-name-top">{getAuthorName()}</span>
      </div>
      <div className="card-preview-container">{renderPreview()}</div>
      <div className="card-bottom-info">
        <div className="title-row">
          <h3>{collection.name}</h3>
          <div className="card-likes">❤️ {likes}</div>
        </div>
        <div className="card-mini-comments">
          <p className="comm-label">Коментарі ({comments.length})</p>
          {comments.slice(0, 2).map(c => (
            <div key={c.id} className="one-mini-comm">
              <b>{(c.authorName || "Анонім").split('@')[0]}:</b> {c.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- МОДАЛЬНЕ ВІКНО ---
function FeedModal({ collection, onClose }) {
  const [items, setItems] = useState([]);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false); 
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [activeImg, setActiveImg] = useState(null); 
  const [openMenuId, setOpenMenuId] = useState(null); 
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});

  const user = auth.currentUser;
  
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("commentId");

  useEffect(() => {
    const loadModalData = async () => {
      try {
        const [resItems, resLikes, resComm] = await Promise.all([
          fetch(`http://localhost:8080/api/items/collection/${collection.id}/items`),
          fetch(`http://localhost:8080/api/items/like-count/${collection.id}`),
          fetch(`http://localhost:8080/api/items/comments/item/${collection.id}`)
        ]);
        setItems(await resItems.json());
        setLikes(await resLikes.json());
        setComments(await resComm.json());

        if (user?.uid) {
            const resStatus = await fetch(`http://localhost:8080/api/items/like/status?userId=${user.uid}&itemId=${collection.id}`);
            setIsLiked(await resStatus.json());
        }
      } catch (e) { console.error(e); }
    };
    
    loadModalData();

    // НОВА МАГІЯ: Тихе фонове оновлення відкритої модалки кожні 5 секунд
    const interval = setInterval(loadModalData, 5000);
    return () => clearInterval(interval);

  }, [collection.id, user?.uid]);

  // ЕФЕКТ ПІДСВІТКИ КОМЕНТАРЯ ЗІ СПОВІЩЕННЯ
  useEffect(() => {
    if (highlightId && comments.length > 0) {
      const targetComment = comments.find(c => c.id.toString() === highlightId);
      
      if (targetComment && targetComment.parentId) {
        setTimeout(() => {
          setExpandedReplies(prev => ({ ...prev, [targetComment.parentId]: true }));
        }, 0);
      }

      setTimeout(() => {
        const el = document.getElementById(`comment-${highlightId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("highlighted-comment");
          setTimeout(() => el.classList.remove("highlighted-comment"), 2500); 
        }
      }, 300);
    }
  }, [comments, highlightId]);

  const handleLikeToggle = async () => { 
    if (!user) return alert("Потрібно увійти в акаунт!");
    const res = await fetch("http://localhost:8080/api/items/like/toggle", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        userId: user.uid, 
        itemId: collection.id,
        userName: user.displayName || user.email.split('@')[0]
      })
    });
    setIsLiked(await res.json());
    const resCount = await fetch(`http://localhost:8080/api/items/like-count/${collection.id}`);
    setLikes(await resCount.json());
    window.dispatchEvent(new Event("updateNotifs")); 
  };

  const submitComment = async () => { 
    if (!newComment.trim()) return;
    let finalPrompt = newComment;
    if (replyingTo) finalPrompt = `@${replyingTo.authorName.split('@')[0]}, ` + newComment;
    
    await fetch("http://localhost:8080/api/items/comments", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        text: finalPrompt, 
        authorName: user?.displayName || user?.email || "Анонім", 
        userId: user?.uid, 
        itemId: collection.id, 
        parentId: replyingTo ? replyingTo.id : null 
      })
    });
    setNewComment(""); setReplyingTo(null);
    const resComm = await fetch(`http://localhost:8080/api/items/comments/item/${collection.id}`);
    setComments(await resComm.json());
    window.dispatchEvent(new Event("updateNotifs"));
  };

  const deleteComment = async (commentId) => { 
    await fetch(`http://localhost:8080/api/items/comments/${commentId}`, { method: "DELETE" });
    setOpenMenuId(null);
    const resComm = await fetch(`http://localhost:8080/api/items/comments/item/${collection.id}`);
    setComments(await resComm.json());
  };

  const rateComment = async (commentId, type) => { 
    if (!user) return alert("Потрібно увійти в акаунт!");
    await fetch(`http://localhost:8080/api/items/comments/${commentId}/vote?userId=${user.uid}&type=${type}`, { method: "POST" });
    const resComm = await fetch(`http://localhost:8080/api/items/comments/item/${collection.id}`);
    setComments(await resComm.json());
  };

  const toggleReplies = (parentId) => setExpandedReplies(prev => ({ ...prev, [parentId]: !prev[parentId] }));
  const getAuthorName = () => collection.authorName || collection.userId.split('@')[0];

  const topLevelComments = comments.filter(c => !c.parentId);
  const replies = comments.filter(c => c.parentId);

  const renderComment = (c, isReply = false) => {
    const canDelete = user?.uid === c.userId || user?.uid === collection.userId;
    const safeAuthor = (c.authorName || "Анонім").split('@')[0];
    const hasLiked = c.likedUsers && c.likedUsers.includes(user?.uid);
    const hasDisliked = c.dislikedUsers && c.dislikedUsers.includes(user?.uid);

    return (
      <div key={c.id} id={`comment-${c.id}`} className={`modal-comm-wrapper ${isReply ? 'is-reply' : ''}`}>
        <div className="modal-comm-row"><b>{safeAuthor}:</b> {c.text}</div>
        <div className="comm-action-bar">
          {!isReply && <span className="comm-action-btn" onClick={() => setReplyingTo({ id: c.id, authorName: safeAuthor })}>Відповісти</span>}
          <span className={`comm-action-btn ${hasLiked ? 'active-vote' : ''}`} onClick={() => rateComment(c.id, 'like')}>👍 {c.likedUsers?.length || ''}</span>
          <span className={`comm-action-btn ${hasDisliked ? 'active-vote' : ''}`} onClick={() => rateComment(c.id, 'dislike')}>👎 {c.dislikedUsers?.length || ''}</span>
          {canDelete && (
            <div className="comm-menu-container">
              <span className="comm-action-btn dots" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === c.id ? null : c.id); }}>...</span>
              {openMenuId === c.id && <div className="comm-dropdown-menu" onClick={() => deleteComment(c.id)}>🗑 Видалити</div>}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="feed-modal-window" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}>
        <div className="modal-close-icon" onClick={onClose}>×</div>
        <div className="modal-top-bar">👤 Автор: <b>{getAuthorName()}</b></div>
        
        <div className="modal-gallery-scroll">
          {items.map((item, idx) => (
            <div key={item.id} className="modal-gallery-item" onClick={() => setActiveImg(idx)}>
              <div className="modal-img-wrap"><img src={item.image} alt="item" /></div>
              <p className="item-modal-title">{item.title}</p>
              <p className="item-modal-descr">{item.descr}</p>
            </div>
          ))}
        </div>

        <div className="modal-footer-info">
           <div className={`insta-like-btn ${isLiked ? 'liked' : ''}`} onClick={handleLikeToggle}>
              <span className="heart-icon">{isLiked ? "❤️" : "🤍"}</span>
              <span className="like-count">{likes}</span>
           </div>

           <div className="modal-comments-block">
              <div className="modal-comm-title">Коментарі ({comments.length})</div>
              <div className="modal-comm-list">
                {topLevelComments.map(parent => {
                  const parentReplies = replies.filter(r => r.parentId === parent.id);
                  const isExpanded = expandedReplies[parent.id];
                  return (
                    <div key={parent.id}>
                      {renderComment(parent)}
                      {parentReplies.length > 0 && <div className="view-replies-btn" onClick={() => toggleReplies(parent.id)}>---- {isExpanded ? 'Приховати' : `Переглянути відповіді (${parentReplies.length})`}</div>}
                      {isExpanded && <div className="replies-container">{parentReplies.map(reply => renderComment(reply, true))}</div>}
                    </div>
                  );
                })}
              </div>
              <div className="comment-input-wrapper">
                {replyingTo && <div className="replying-badge">Відповідь для <b>@{replyingTo.authorName}</b><span className="cancel-reply" onClick={() => setReplyingTo(null)}>×</span></div>}
                <input type="text" placeholder={replyingTo ? "Напишіть відповідь..." : "Написати коментар..."} value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitComment()} className="modal-input-field" />
                <button className="send-comment-btn" onClick={submitComment}>✈️</button>
              </div>
           </div>
        </div>

        {activeImg !== null && (
          <div className="lightbox" onClick={() => setActiveImg(null)}>
            <div className="lightbox-close">×</div>
            <button className="l-btn prev" onClick={(e) => { e.stopPropagation(); setActiveImg((activeImg - 1 + items.length) % items.length); }}>‹</button>
            <img src={items[activeImg].image} alt="full" onClick={(e) => e.stopPropagation()} />
            <button className="l-btn next" onClick={(e) => { e.stopPropagation(); setActiveImg((activeImg + 1) % items.length); }}>›</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ГОЛОВНА СТРІЧКА
function Feed() {
  const [collections, setCollections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams(); 

  useEffect(() => {
    fetch("http://localhost:8080/api/items/collections/public")
      .then(res => res.json()).then(data => setCollections(data));
  }, []);

  useEffect(() => {
    const colId = searchParams.get("collectionId");
    if (colId && collections.length > 0) {
      const target = collections.find(c => c.id.toString() === colId);
      if (target) {
        setTimeout(() => {
          setSelected(target);
        }, 0);
      }
    }
  }, [searchParams, collections]);

  const closeModal = () => {
    setSelected(null);
    setRefreshTrigger(prev => prev + 1); 
    setSearchParams({}); 
  }

  return (
    <div className="content-area">
      <h1 className="feed-title">Глобальна стрічка</h1>
      <div className="feed-grid-v3">
        {collections.map(coll => (
          <CollectionCard key={coll.id} collection={coll} onClick={setSelected} refreshTrigger={refreshTrigger} />
        ))}
      </div>
      {selected && <FeedModal collection={selected} onClose={closeModal} />}
    </div>
  );
}

export default Feed;