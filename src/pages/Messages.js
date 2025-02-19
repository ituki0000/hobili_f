import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './../static/styles.css';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/messages', {
        withCredentials: true
      });
      setConversations(response.data.conversations);
      setLoading(false);
    } catch (error) {
      console.error('会話の取得に失敗:', error);
      setError('会話の取得に失敗しました');
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/messages/${userId}`, {
        withCredentials: true
      });
      setMessages(response.data.messages);
      setSelectedUser(userId);
    } catch (error) {
      console.error('メッセージの取得に失敗:', error);
      setError('メッセージの取得に失敗しました');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await axios.post('http://127.0.0.1:5000/api/messages/send', {
        receiver_id: selectedUser,
        content: newMessage
      }, {
        withCredentials: true
      });
      setNewMessage('');
      fetchMessages(selectedUser);
    } catch (error) {
      console.error('メッセージの送信に失敗:', error);
      setError('メッセージの送信に失敗しました');
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
          <Link to="/messages" className="nav-item active">
            <span className="nav-icon">✉️</span>
            メッセージ
          </Link>
          <Link to="/profile/1" className="nav-item">
            <span className="nav-icon">👤</span>
            プロフィール
          </Link>
        </div>

        <div className="main-content">
          <div className="messages-container">
            <div className="conversations-list">
              <h2>メッセージ</h2>
              {loading ? (
                <div className="loading">読み込み中...</div>
              ) : error ? (
                <div className="error">{error}</div>
              ) : conversations.length === 0 ? (
                <div className="no-conversations">会話がありません</div>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv.user_id}
                    className={`conversation-item ${selectedUser === conv.user_id ? 'active' : ''}`}
                    onClick={() => fetchMessages(conv.user_id)}
                  >
                    <span className="username">{conv.username}</span>
                    <span className="last-message">{conv.last_message}</span>
                  </div>
                ))
              )}
            </div>

            {selectedUser && (
              <div className="messages-content">
                <div className="messages-list">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`message-item ${message.sender_id === selectedUser ? 'received' : 'sent'}`}
                    >
                      <div className="message-content">{message.content}</div>
                      <div className="message-time">
                        {new Date(message.created_at).toLocaleString('ja-JP')}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={sendMessage} className="message-form">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="メッセージを入力..."
                    className="message-input"
                  />
                  <button type="submit" className="send-button">送信</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages; 