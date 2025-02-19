import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './../static/styles.css';

const Board = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/table-posts', {
        withCredentials: true
      });
      setPosts(response.data.posts);
    } catch (error) {
      console.error('投稿の取得に失敗:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/table-posts', {
        title: newPost.title,
        content: newPost.content
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        setNewPost({ title: '', content: '' });
        fetchPosts();
        alert('投稿が完了しました');
      }
    } catch (error) {
      console.error('投稿の作成に失敗:', error);
      alert('投稿の作成に失敗しました');
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
          <Link to="/profile/1" className="nav-item">
            <span className="nav-icon">👤</span>
            プロフィール
          </Link>
        </div>

        <div className="main-content">
          <form onSubmit={handleSubmit} className="new-post-form">
            <input
              type="text"
              placeholder="タイトル"
              value={newPost.title}
              onChange={(e) => setNewPost({...newPost, title: e.target.value})}
              required
            />
            <textarea
              placeholder="内容"
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              required
            />
            <button type="submit">投稿</button>
          </form>

          <div className="table-posts-list">
            <table>
              <thead>
                <tr>
                  <th>タイトル</th>
                  <th>内容</th>
                  <th>投稿者</th>
                  <th>投稿日時</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id}>
                    <td>{post.title}</td>
                    <td>{post.content}</td>
                    <td>{post.username}</td>
                    <td>{post.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Board; 