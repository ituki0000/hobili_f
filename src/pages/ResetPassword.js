import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/reset_password/${token}`, {
        new_password: newPassword
      }, {
        withCredentials: true
      });
      
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'パスワードのリセットに失敗しました');
    }
  };

  return (
    <div>
      <h2>新しいパスワードを設定</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>新しいパスワード:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">パスワードを更新</button>
      </form>
    </div>
  );
};

export default ResetPassword;