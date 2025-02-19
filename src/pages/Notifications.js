import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './../static/styles.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
    // 通知を既読にする
    markNotificationsAsRead();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/notifications', {
        withCredentials: true
      });
      setNotifications(response.data.notifications);
      setLoading(false);
    } catch (error) {
      console.error('通知の取得に失敗:', error);
      setError('通知の取得に失敗しました');
      setLoading(false);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      await axios.post('http://127.0.0.1:5000/api/notifications/read', {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('通知の既読化に失敗:', error);
    }
  };

  const renderNotificationContent = (notification) => {
    switch (notification.type) {
      case 'like':
        return (
          <span>
            <strong>{notification.sender_name}</strong>があなたの投稿にいいねしました
          </span>
        );
      case 'reply':
        return (
          <span>
            <strong>{notification.sender_name}</strong>があなたの投稿に返信しました
          </span>
        );
      case 'follow':
        return (
          <span>
            <strong>{notification.sender_name}</strong>があなたをフォローしました
          </span>
        );
      default:
        return notification.content;
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
          <Link to="/notifications" className="nav-item active">
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
          <h2>通知</h2>
          {loading ? (
            <div className="loading">読み込み中...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="no-notifications">通知はありません</div>
          ) : (
            <div className="notifications-list">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                >
                  {renderNotificationContent(notification)}
                  <span className="notification-date">
                    {new Date(notification.created_at).toLocaleString('ja-JP')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications; 