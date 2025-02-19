import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './../static/styles.css';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    bio: ''
  });
  const [newPost, setNewPost] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState([]);
  const [isAvatarExpanded, setIsAvatarExpanded] = useState(false);
  const [user, setUser] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  useEffect(() => {
    console.log('Fetching profile for userId:', userId); // デバッグ用
    const fetchProfileData = async () => {
      if (!userId) {
        console.error('User ID is undefined');
        return; // userIdがundefinedの場合は処理を中断
      }
      try {
        const idToFetch = loggedInUserId || userId; // loggedInUserIdを優先して使用
        if (!idToFetch) return; // IDがない場合は何もしない

        const response = await axios.get(`http://127.0.0.1:5000/api/profile/${idToFetch}`, {
          withCredentials: true
        });
        console.log('Profile data:', response.data);
        setProfileData(response.data);
        setUser(response.data.user_info);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.response?.data?.message || 'Failed to fetch profile data');
      }
    };

    fetchProfileData();
  }, [userId, loggedInUserId]); // どちらかが変わったときに再取得

  useEffect(() => {
    console.log('User object:', user); // デバッグ用
  }, [user]);

  useEffect(() => {
    const fetchLoggedInUserId = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/check_auth', {
          withCredentials: true
        });
        if (response.data && response.data.authenticated) {
          setLoggedInUserId(response.data.user_id);
          console.log('Logged in user ID:', response.data.user_id); // デバッグ用
        }
      } catch (error) {
        console.error('Failed to fetch logged in user ID:', error);
      }
    };

    fetchLoggedInUserId();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/profile/${loggedInUserId}`, {
          withCredentials: true
        });
        // プロフィールデータの処理
        const profileData = response.data;
        setProfileData(profileData); // 状態に保存
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    if (loggedInUserId) {
      fetchUserProfile();
    }
  }, [loggedInUserId]);

  const handleProfileEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios({
        method: 'post',
        url: 'http://127.0.0.1:5000/api/profile/edit',
        data: {
          ...editData,
          user_id: userId
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        setProfileData(prev => ({
          ...prev,
          user_info: {
            ...prev.user_info,
            username: editData.username,
            bio: editData.bio
          }
        }));
        setIsEditModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('user_id', userId);

    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/api/profile/upload_image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // プロフィールデータを更新
      setProfileData(prev => ({
        ...prev,
        user_info: {
          ...prev.user_info,
          profile_image: response.data.image_url
        }
      }));
    } catch (err) {
      console.error('Failed to upload image:', err);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/api/posts',
        { content: newPost },
        { withCredentials: true }
      );

      if (response.data) {
        // 投稿リストを更新
        setProfileData(prev => ({
          ...prev,
          posts: [{
            id: response.data.post_id,
            content: newPost,
            created_at: new Date().toISOString(),
            username: profileData.user_info.username
          }, ...prev.posts]
        }));
        setNewPost('');
        setCharacterCount(0);
        setIsPostModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    if (text.length <= 280) {
      setNewPost(text);
      setCharacterCount(text.length);
    }
  };

  const fetchLikedPosts = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/api/profile/${userId}/likes`,
        { withCredentials: true }
      );
      setLikedPosts(response.data);
    } catch (err) {
      console.error('Failed to fetch liked posts:', err);
    }
  };

  const handleLikeToggle = async (postId) => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:5000/api/posts/${postId}/like`,
        {},
        { withCredentials: true }
      );

      // 投稿リストを更新
      setProfileData(prev => ({
        ...prev,
        posts: prev.posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              is_liked: response.data.is_liked,
              like_count: response.data.like_count
            };
          }
          return post;
        })
      }));
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleAvatarClick = (e) => {
    if (e.target.closest('.profile-avatar-upload')) return;
    setIsAvatarExpanded(true);
  };

  const closeExpandedAvatar = () => {
    setIsAvatarExpanded(false);
  };

  console.log('Logged in user ID:', loggedInUserId);

  if (error) return <div className="error-message">{error}</div>;
  if (!profileData) return <div className="loading">Loading...</div>;

  return (
    <div className="post-page">
      {profileData.is_own_profile && (
        <button 
          className="new-post-button"
          onClick={() => setIsPostModalOpen(true)}
        >
          +
        </button>
      )}

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
          <Link to={`/profile/${loggedInUserId}`} className="nav-item active">
            <span className="nav-icon">👤</span>
            プロフィール
          </Link>
          <button 
            className="new-post-button-sidebar"
            onClick={() => setIsPostModalOpen(true)}
          >
            投稿する
          </button>
        </div>

        <div className="main-content">
          <div className="profile-container">
            <div className="profile-header">
              <div className="profile-banner"></div>
              <div className="profile-info">
                <div className="profile-avatar" onClick={handleAvatarClick}>
                  <img 
                    src={profileData.user_info.profile_image 
                      ? `http://127.0.0.1:5000/static/profile_images/${profileData.user_info.profile_image}`
                      : '/default-avatar.png'
                    } 
                    alt="Profile"
                  />
                  {profileData.is_own_profile && (
                    <div className="profile-avatar-upload" onClick={e => e.stopPropagation()}>
                      <label htmlFor="profile-image-input" className="upload-button">
                        <span>画像を変更</span>
                      </label>
                      <input
                        id="profile-image-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                    </div>
                  )}
                </div>
                <div className="profile-actions">
                  <button 
                    className="edit-profile-button"
                    onClick={() => navigate(`/profile/${userId}/edit`)}
                  >
                    プロフィールを編集
                  </button>
                </div>
              </div>
              <div className="profile-details">
                <h1 className="profile-name">{profileData.user_info.username}</h1>
                <div className="profile-stats">
                  <div className="stat">
                    <span className="stat-value">{profileData.posts.length}</span>
                    <span className="stat-label">投稿</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{profileData.following.length}</span>
                    <span className="stat-label">フォロー中</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{profileData.followers?.length || 0}</span>
                    <span className="stat-label">フォロワー</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-tabs">
              <button 
                className={`tab ${selectedTab === 'posts' ? 'active' : ''}`}
                onClick={() => setSelectedTab('posts')}
              >
                投稿
              </button>
              <button 
                className={`tab ${selectedTab === 'replies' ? 'active' : ''}`}
                onClick={() => setSelectedTab('replies')}
              >
                返信
              </button>
              <button 
                className={`tab ${selectedTab === 'likes' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTab('likes');
                  fetchLikedPosts();
                }}
              >
                いいね
              </button>
            </div>

            <div className="profile-content">
              {selectedTab === 'posts' && profileData.is_own_profile && (
                <div className="post-form-container">
                  <div className="post-form-wrapper">
                    <div className="post-form-input">
                      <textarea
                        placeholder="いまどうしてる？"
                        value={newPost}
                        onChange={handleTextChange}
                        maxLength={280}
                      />
                    </div>
                  </div>
                  <div className="post-form-footer">
                    <span className="character-count">{characterCount}/280</span>
                    <button
                      className="post-button"
                      onClick={handlePostSubmit}
                      disabled={!newPost.trim() || characterCount > 280}
                    >
                      投稿する
                    </button>
                  </div>
                </div>
              )}
              
              {selectedTab === 'posts' ? (
                <div className="posts-list">
                  {profileData.posts.map(post => (
                    <div key={post.id} className="post">
                      <div className="post-header">
                        <span className="username">{profileData.user_info.username}</span>
                        <span className="post-date">
                          {new Date(post.created_at).toLocaleString('ja-JP')}
                        </span>
                      </div>
                      <div className="post-content">{post.content}</div>
                      <div className="post-actions">
                        <button 
                          className={`like-button ${post.is_liked ? 'liked' : ''}`}
                          onClick={() => handleLikeToggle(post.id)}
                        >
                          {post.is_liked ? '❤️' : ''} {post.like_count || 0}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="replies-list">
                  {profileData.replies?.map(reply => (
                    <div key={reply.id} className="post">
                      <div className="reply-to-info">
                        返信先: @{reply.original_username}
                      </div>
                      <div className="post-content">{reply.content}</div>
                      <div className="post-date">
                        {new Date(reply.created_at).toLocaleString('ja-JP')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sidebar-right">
          {/* サイドバー */}
        </div>
      </div>

      {isPostModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPostModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setIsPostModalOpen(false)}
            >
              ×
            </button>
            <form onSubmit={handlePostSubmit} className="modal-form" data-title="新規投稿">
              <textarea
                className="modal-textarea"
                value={newPost}
                onChange={handleTextChange}
                placeholder="いまどうしてる？"
                maxLength={280}
                autoFocus
              />
              <div className="modal-footer">
                <span className="character-count">
                  {characterCount}/280
                </span>
                <button 
                  type="submit" 
                  className="post-button"
                  disabled={!newPost.trim() || characterCount > 280}
                >
                  投稿する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setIsEditModalOpen(false)}
            >
              ×
            </button>
            <form onSubmit={handleProfileEdit} className="edit-profile-form">
              <h2>プロフィールを編集</h2>
              <div className="form-group">
                <label>ユーザー名</label>
                <input
                  type="text"
                  value={editData.username}
                  onChange={e => setEditData({...editData, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>自己紹介</label>
                <textarea
                  value={editData.bio}
                  onChange={e => setEditData({...editData, bio: e.target.value})}
                  maxLength={160}
                />
              </div>
              <button type="submit" className="save-button">保存</button>
            </form>
          </div>
        </div>
      )}

      {isImageModalOpen && (
        <div className="modal-overlay" onClick={() => setIsImageModalOpen(false)}>
          <div className="image-modal" onClick={e => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setIsImageModalOpen(false)}
            >
              ×
            </button>
            <img 
              src={profileData.user_info.profile_image 
                ? `http://127.0.0.1:5000/static/profile_images/${profileData.user_info.profile_image}`
                : '/default-avatar.png'
              } 
              alt="Profile"
              className="enlarged-image"
            />
          </div>
        </div>
      )}

      {selectedTab === 'likes' && (
        <div className="posts-list">
          {likedPosts.map(post => (
            <div key={post.id} className="post">
              <div className="post-header">
                <span className="username">{post.username}</span>
                <span className="post-date">
                  {new Date(post.created_at).toLocaleString('ja-JP')}
                </span>
              </div>
              <div className="post-content">{post.content}</div>
              <div className="post-actions">
                <button 
                  className={`like-button liked`}
                  onClick={() => handleLikeToggle(post.id)}
                >
                  ❤️ {post.like_count}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAvatarExpanded && (
        <div 
          className={`avatar-expand-overlay ${isAvatarExpanded ? 'active' : ''}`}
          onClick={closeExpandedAvatar}
        >
          <img 
            src={profileData.user_info.profile_image 
              ? `http://127.0.0.1:5000/static/profile_images/${profileData.user_info.profile_image}`
              : '/default-avatar.png'
            } 
            alt="Expanded profile" 
            className="expanded-avatar"
            onClick={(e) => e.stopPropagation()}
          />
          <button className="expand-close-button" onClick={closeExpandedAvatar}>
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;