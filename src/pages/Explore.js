import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import './../static/styles.css';

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/explore?q=${encodeURIComponent(query)}`, {
        withCredentials: true
      });
      if (response.data.results) {
        setSearchResults(response.data.results);
        if (response.data.results.length === 0) {
          setMessage('検索結果が見つかりませんでした');
        }
      }
    } catch (error) {
      console.error('検索エラー:', error);
      setMessage('検索中にエラーが発生しました');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    performSearch(searchQuery);
  };

  return (
    <div className="post-page">
      <div className="post-container">
        <div className="sidebar-left">
          <Link to="/Post" className="nav-item">
            <span className="nav-icon">🏠</span>
            ホーム
          </Link>
          <Link to="/explore" className="nav-item active">
            <span className="nav-icon">🔍</span>
            話題を検索
          </Link>
          <Link to="/notifications" className="nav-item">
            <span className="nav-icon">🔔</span>
            通知
          </Link>
          <Link to="/messages" className="nav-item">
            <span className="nav-icon">✉️</span>
            メッセージ
          </Link>
          <Link to="/profile/1" className="nav-item">
            <span className="nav-icon">👤</span>
            プロフィール
          </Link>
        </div>

        <div className="main-content">
          <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="投稿を検索..."
                className="search-input"
                autoFocus
              />
              <button type="submit" className="search-button">🔍</button>
            </form>
          </div>

          {message && <div className="message">{message}</div>}

          {searchResults && (
            <div className="search-results">
              <div className="posts-container">
                {searchResults.map(post => (
                  <div key={post.id} className="post">
                    <div className="post-header">
                      <span className="username">{post.username}</span>
                      <span className="post-date">
                        {new Date(post.created_at).toLocaleString('ja-JP')}
                      </span>
                    </div>
                    <div className="post-content">{post.content}</div>
                    {post.image_url && (
                      <div className="post-media-container">
                        {post.image_url.toLowerCase().match(/\.(mp4|mov|avi|wmv)$/) ? (
                          <video 
                            src={`http://localhost:5000${post.image_url}`}
                            controls
                            className="post-video"
                          />
                        ) : (
                          <img 
                            src={`http://localhost:5000${post.image_url}`}
                            alt="Post" 
                            className="post-image"
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore; 