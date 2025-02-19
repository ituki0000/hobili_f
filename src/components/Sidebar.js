import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Sidebar = () => {
  const [createdPages, setCreatedPages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserId();
    fetchCreatedPages();
  }, []);

  const fetchUserId = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/check_auth', {
        withCredentials: true
      });
      setUserId(response.data.user_id);
      fetchProfileData(response.data.user_id);
    } catch (error) {
      console.error('ユーザー情報の取得に失敗:', error);
      setError('ユーザー情報の取得に失敗しました。');
    }
  };

  const fetchProfileData = async (id) => {
    if (!id) {
        console.error('User ID is undefined');
        return; // userIdがundefinedの場合は処理を中断
    }

    try {
        console.log('Fetching profile data for ID:', id);
        const response = await axios.get(`http://127.0.0.1:5000/api/profile/${id}`, {
            withCredentials: true
        });
        console.log('Profile data response:', response.data);
        setProfileData(response.data);
    } catch (error) {
        console.error('プロフィールデータの取得に失敗:', error);
    }
  };

  const fetchCreatedPages = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/pages', {
        withCredentials: true
      });
      console.log('Fetched pages:', response.data.pages);
      setCreatedPages(response.data.pages || []);
    } catch (error) {
      console.error('ページ一覧の取得に失敗:', error);
    }
  };

  const handlePageClick = (pageId) => {
    console.log('Clicking page:', pageId);
    navigate(`/pages/${pageId}`);
  };

  return (
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
      <Link to="/table-post" className="nav-item">
        <span className="nav-icon">📝</span>
        新規ページ作成
      </Link>

      <div className="created-pages-section">
            <h3>作成したページ</h3>
            {createdPages.map(page => (
              <Link 
                key={page.id} 
                to={`/post/${page.name}`} 
                className="nav-item created-page-item"
              >
                <span className="nav-icon">📄</span>
                {page.name}
                <span className="page-genre">{page.genre_name}</span>
              </Link>
            ))}
          </div>

      <Link to={`/profile/${userId}`} className="nav-item">
        <span className="nav-icon">👤</span>
        プロフィール
      </Link>
    </div>
  );
};

export default Sidebar; 