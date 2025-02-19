import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./../static/styles.css"

function Feed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/feed', { withCredentials: true });
        setPosts(response.data);
      } catch (error) {
        console.error('投稿の取得に失敗しました');
      }
    };
    fetchPosts();
  }, []);

  return (
    <div>
      <h1>フィード</h1>
      {posts.map((post) => (
        <div key={post.id}>
          <h3>{post.username}</h3>
          <p>{post.content}</p>
          <small>{post.created_at}</small>
        </div>
      ))}
    </div>
  );
}

export default Feed;
