import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { ChakraProvider, Box, Button, Flex, Heading } from '@chakra-ui/react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';
import Post from './pages/Post';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Explore from './pages/Explore';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Board from './pages/Board';
import TablePost from './pages/TablePost';
import CreatedPage from './pages/CreatedPage';
import './static/styles.css'; // CSSファイルをインポート
import crossroadImage from './assets/images/crossroad.jpg'; // 画像をインポート

const Home = () => {
  const [showImage, setShowImage] = useState(false);
  const navigate = useNavigate(); // useNavigateフックを使用

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowImage(true); // 2秒後に画像を表示
    }, 2000); // 交差アニメーションの後に画像を表示

    return () => clearTimeout(timer);
  }, []);

  const handleLoginClick = () => {
    const container = document.getElementById('container');
    container.classList.add('zoom-in-left'); // 左方向にズームインアニメーションを追加
    setTimeout(() => {
      navigate('/login'); // 0.5秒後にログインページに遷移
    }, 500); // アニメーションの時間と同じにする
  };

  const handleSignupClick = () => {
    const container = document.getElementById('container');
    container.classList.add('zoom-in-right'); // 右方向にズームインアニメーションを追加
    setTimeout(() => {
      navigate('/signup'); // 0.5秒後に新規登録ページに遷移
    }, 500); // アニメーションの時間と同じにする
  };

  return (
    <Box id="container" position="relative" height="100vh" bgColor="rgba(207, 225, 240, 0.36)">
      {/* 交差する線 */}
      <div className="cross-line vertical" />
      <div className="cross-line horizontal" />
      
      {showImage && ( // showImageがtrueのときに画像を表示
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgImage={`url(${crossroadImage})`} // インポートした画像を使用
          bgSize="cover" // 背景画像をカバー
          bgPosition="center" // 背景画像の位置を中央に
          className="animated-background" // 背景フェードインアニメーションクラスを追加
        />
      )}
      <Flex
        direction="column"
        align="center"
        justify="center"
        height="100%" // Flexコンテナが親の高さを100%に
        color="teal" // 文字の色をtealに設定
        textAlign="center"
        zIndex={1} // テキストを前面に表示
        className="text-container" // 文字を含むコンテナ
      >
        <Heading as="h1" size="2xl" mb={6} className="animated-text" style={{ textShadow: '2px 2px 0 black' }}>
          ようこそ趣味の交差点へ
        </Heading>
        <Flex justifyContent="center" mt={4}>
          <Button id="login-button" colorScheme="teal" size="lg" mx={2} onClick={handleLoginClick}>
            ログイン
          </Button>
          <Button id="signup-button" colorScheme="teal" size="lg" mx={2} onClick={handleSignupClick}>
            新規登録
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          {/* ホームルート (/) */}
          <Route path="/" element={<Home />} />
          {/* 他のページルート */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/post" element={<Post />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/profile/:userId/edit" element={<EditProfile />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/board" element={<Board />} />
          <Route path="/table-post" element={<TablePost />} />
          <Route path="/pages/:pageId" element={<CreatedPage />} />
          <Route path="/post/*" element={<Post />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
