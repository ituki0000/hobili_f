import React, { useState } from 'react';
import axios from 'axios';

const RequestReset = () => {
  const [email, setEmail] = useState('');
  const [provider, setProvider] = useState('gmail');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/request_password_reset', {
        email,
        provider
      }, {
        withCredentials: true
      });
      
      setMessage(response.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'リクエストに失敗しました');
      setMessage('');
    }
  };

  return (
    <div>
      <h2>パスワードリセット</h2>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>メールアドレス:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label>メールプロバイダー:</label>
          <select value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="gmail">Gmail</option>
            <option value="docomo">docomo</option>
          </select>
        </div>

        <button type="submit">リセットリンクを送信</button>
      </form>
    </div>
  );
};

export default RequestReset;