import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './../static/styles.css';

const EditProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [editData, setEditData] = useState({
    username: '',
    bio: ''
  });
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/profile/${userId}`);
        setEditData({
          username: response.data.user_info.username,
          bio: response.data.user_info.bio || ''
        });
        setProfileImage(response.data.user_info.profile_image);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfileData();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('username', editData.username);
      formData.append('bio', editData.bio);
      formData.append('user_id', userId);

      const fileInput = document.getElementById('profile-image-input');
      if (fileInput && fileInput.files[0]) {
        formData.append('image', fileInput.files[0]);
      }

      const response = await axios.post(
        'http://127.0.0.1:5000/api/profile/edit',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data) {
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate(`/profile/${userId}`);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="post-page">
      <div className="post-container">
        <div className="sidebar-left">
          {/* サイドバー */}
        </div>

        <div className="main-content">
          <div className="edit-profile-page">
            <h1>プロフィールを編集</h1>
            
            {/* プロフィール画像アップロード部分 */}
            <div className="profile-image-edit">
              <div className="profile-avatar">
                <img 
                  src={profileImage 
                    ? `http://127.0.0.1:5000${profileImage}`
                    : '/default-avatar.png'
                  } 
                  alt="Profile"
                />
                <div className="profile-avatar-upload">
                  <label htmlFor="profile-image-input" className="upload-button">
                    <span>画像を変更</span>
                  </label>
                  <input
                    id="profile-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="edit-profile-form">
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
              <div className="form-buttons">
                <button type="button" className="cancel-button" onClick={() => navigate(`/profile/${userId}`)}>
                  キャンセル
                </button>
                <button type="submit" className="save-button">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="sidebar-right">
          {/* サイドバー */}
        </div>
      </div>
    </div>
  );
};

export default EditProfile; 