import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './../static/styles.css';

const TablePost = () => {
  const [newPageName, setNewPageName] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [newGenreName, setNewGenreName] = useState('');
  const [showAddGenre, setShowAddGenre] = useState(false);
  const [createdPages, setCreatedPages] = useState([]);

  useEffect(() => {
    fetchGenres();
    fetchCreatedPages();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/genres', {
        withCredentials: true
      });
      setGenres(response.data.genres || []);
    } catch (error) {
      console.error('ジャンルの取得に失敗:', error);
    }
  };

  const fetchCreatedPages = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/pages', {
        withCredentials: true
      });
      setCreatedPages(response.data.pages || []);
    } catch (error) {
      console.error('ページ一覧の取得に失敗:', error);
    }
  };

  const handleAddGenre = async () => {
    try {
      if (!newGenreName.trim()) {
        alert('ジャンル名を入力してください');
        return;
      }

      const response = await axios.post('http://127.0.0.1:5000/api/genres', {
        name: newGenreName
      }, {
        withCredentials: true
      });

      if (response.status === 201) {
        setGenres([...genres, { id: response.data.id, name: newGenreName }]);
        setNewGenreName('');
        setShowAddGenre(false);
      } else {
        console.error('Unexpected response:', response);
        alert('ジャンルの追加に失敗しました');
      }
    } catch (error) {
      console.error('ジャンルの追加に失敗:', error);
      alert(`ジャンルの追加に失敗しました: ${error.message}`);
    }
  };

  const handleCreateNewPage = async () => {
    try {
      if (!selectedGenre) {
        alert('ジャンルを選択してください');
        return;
      }

      await axios.post('http://127.0.0.1:5000/api/create-page', {
        pageName: newPageName,
        genreId: selectedGenre
      }, {
        withCredentials: true
      });
      
      setNewPageName('');
      setSelectedGenre('');
      fetchCreatedPages();
    } catch (error) {
      console.error('ページの作成に失敗:', error);
    }
  };

  return (
    <div className="post-page">
      <div className="post-container">
        <div className="sidebar-left">
          <Link to="/Post" className="nav-item">
            <span className="nav-icon">🏠</span>
            ホーム
          </Link>
          <Link to="/explore" className="nav-item">
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
          <div className="created-pages-section">
            <h3>作成したページ</h3>
            <div className="created-pages-list">
              {createdPages.map(page => (
                <Link 
                  key={page.id} 
                  to={`/post/${page.name}`} 
                  className="nav-item created-page-item"
                >
                  <div className="page-card">
                    <span className="nav-icon">📄</span>
                    <div className="page-info">
                      <span className="page-name">{page.name}</span>
                      <span className="page-genre">{page.genre_name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <Link to="/profile/1" className="nav-item">
            <span className="nav-icon">👤</span>
            プロフィール
          </Link>
        </div>

        <div className="main-content">
          <div className="create-page-form">
            <h2>新しい投稿ページを作成</h2>
            <div className="genre-section">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="genre-select"
              >
                <option value="">ジャンルを選択</option>
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
              <button 
                type="button" 
                onClick={() => setShowAddGenre(!showAddGenre)}
                className="add-genre-button"
              >
                新しいジャンルを追加
              </button>
            </div>

            {showAddGenre && (
              <div className="add-genre-form">
                <input
                  type="text"
                  placeholder="新しいジャンル名を入力"
                  value={newGenreName}
                  onChange={(e) => setNewGenreName(e.target.value)}
                />
                <button onClick={handleAddGenre}>
                  追加
                </button>
              </div>
            )}

            <input
              type="text"
              placeholder="新しいページ名を入力"
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
            />
            <button onClick={handleCreateNewPage} className="aqua-button">
              ページを作成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablePost; 