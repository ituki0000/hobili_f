import React, { useState } from 'react';
import axios from 'axios';

function CreatePost() {
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:5000/create_post', { content }, { withCredentials: true });
      if (response.status === 200) {
        alert('投稿に成功しました');
        window.location.href = '/feed';
      }
    } catch (error) {
      alert('投稿に失敗しました');
    }
  };

  return (
    <div>
      <h1>投稿を作成</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="内容を入力してください"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>
        <button type="submit">投稿</button>
      </form>
    </div>
  );
}

export default CreatePost;
