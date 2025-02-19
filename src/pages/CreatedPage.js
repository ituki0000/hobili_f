import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const CreatedPage = () => {
  const { pageId } = useParams();
  const [pageData, setPageData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (pageId) {
      fetchPageData();
      fetchPagePosts();
    }
  }, [pageId]);

  const fetchPageData = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/pages/${pageId}`, {
        withCredentials: true
      });
      setPageData(response.data.page);
    } catch (error) {
      console.error('ページ情報の取得に失敗:', error);
      alert(`ページ情報の取得に失敗しました: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  const fetchPagePosts = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/pages/${pageId}/posts`, {
        withCredentials: true
      });
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('投稿の取得に失敗:', error);
      alert(`投稿の取得に失敗しました: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://127.0.0.1:5000/api/pages/${pageId}/posts`, {
        content: content
      }, {
        withCredentials: true
      });
      setContent('');
      setIsModalOpen(false);
      fetchPagePosts();
    } catch (error) {
      console.error('投稿の作成に失敗:', error);
    }
  };

  return (
    <div className="post-page">
      <div className="post-container">
        <Sidebar />
        <div className="main-content">
          <div className="posts-container">
            {posts.map(post => (
              <div key={post.id} className="post">
                <div className="post-header">
                  <span className="username">{post.username}</span>
                  <span className="post-date">{post.created_at}</span>
                </div>
                <div className="post-content">{post.content}</div>
              </div>
            ))}
          </div>
          <button className="new-post-button" onClick={() => setIsModalOpen(true)}>
            ＋
          </button>
        </div>

        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <form onSubmit={handleSubmit} className="post-form">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="投稿を作成..."
                  required
                />
                <div className="post-form-footer">
                  <button type="submit">投稿</button>
                  <button type="button" className="cancel-button" onClick={() => setIsModalOpen(false)}>
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatedPage; 