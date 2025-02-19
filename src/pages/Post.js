import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Box, Button, Text, VStack, HStack, Image, Textarea, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, useToast, Link, IconButton, Heading } from '@chakra-ui/react';
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FaReply, FaPlus } from 'react-icons/fa';

axios.defaults.withCredentials = true;  // グローバルで設定

const Post = () => {
  const { pageName } = useParams(); // URLパラメータからページ名を取得
  const [pageDetails, setPageDetails] = useState(null);
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);  // 返信対象の投稿
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false); // 返信モーダルの状態
  const [isPostModalOpen, setIsPostModalOpen] = useState(false); // 新規投稿モーダルの状態
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null); // 選択された投稿を管理
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [loggedInUserProfileImage, setLoggedInUserProfileImage] = useState(''); // プロフィール画像の状態を追加
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const location = useLocation();
  const genre = (location.pathname).split("/")[2] //url

  // 投稿一覧を取得
  const fetchPosts = useCallback(async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/posts', {
        params: { genre }, // クエリパラメータとしてgenreを送信
        withCredentials: true
      });
      
      // 各投稿の返信といいね情報を取得
      const postsWithReplies = await Promise.all(
        response.data.posts.map(async (post) => {
          try {
            const repliesResponse = await axios.get(
              `http://127.0.0.1:5000/api/posts/${post.id}/replies`,
              { withCredentials: true }
            );
            
            return {
              ...post,
              replies: repliesResponse.data.replies || [],
              is_liked: post.is_liked || false,
              like_count: post.like_count || 0
            };
          } catch (error) {
            console.error(`Failed to fetch replies for post ${post.id}:`, error);
            return {
              ...post,
              replies: [],
              is_liked: false,
              like_count: 0
            };
          }
        })
      );

      setPosts(postsWithReplies);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  }, []);

  // 初期読み込み時に投稿一覧を取得
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const fetchLoggedInUserId = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/check_auth', {
          withCredentials: true
        });
        if (response.data && response.data.authenticated) {
          setLoggedInUserId(response.data.user_id);
          setLoggedInUserProfileImage(response.data.profile_image); // プロフィール画像のURLを取得
          console.log('Logged in user ID:', response.data.user_id); // デバッグ用
          console.log('Profile Image URL:', response.data.profile_image); // デバッグ用
        }
      } catch (error) {
        console.error('Failed to fetch logged in user ID:', error);
      }
    };

    fetchLoggedInUserId();
  }, []);

  useEffect(() => {
    fetchPageDetails();
  }, [pageName]);

  const fetchPageDetails = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/pages/${pageName}`, {
        withCredentials: true,
      });
      setPageDetails(response.data.page);
    } catch (error) {
      console.error('ページ詳細の取得に失敗:', error);
    }
  };

  // 画像選択ハンドラー
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // プレビュー用のURL作成
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // メディア選択ハンドラーを修正
  const handleMediaSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedMedia(file);
      setMediaType(file.type.startsWith('video/') ? 'video' : 'image');

      // プレビュー用のURL作成
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 返信を投稿する処理
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(
        `http://127.0.0.1:5000/api/posts/${replyingTo.id}/replies`,
        { 
          content,
          parent_id: replyingTo.id,  // 親投稿のIDを追加
          is_nested_reply: Boolean(replyingTo.reply_to)  // 返信への返信かどうか
        },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      setMessage('返信を投稿しました');
      setContent('');
      setReplyingTo(null);
      setIsReplyModalOpen(false); // 返信モーダルを閉じる

      // 投稿リストを更新
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === replyingTo.id) {
            return {
              ...post,
              replies: [...(post.replies || []), response.data]
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('返信失敗:', error);
      setMessage(error.response?.data?.message || '返信に失敗しました');
    }
  };

  // 返信モーダルを開く
  const handleReplyClick = (targetPost) => {
    setReplyingTo(targetPost);
    setContent('');
    setIsReplyModalOpen(true); // 返信モーダルを開く
  };

  // 新規投稿を投稿する処理
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('content', content);
      
      // 画像または動画が選択している場合
      if (selectedImage) {
        formData.append('image', selectedImage);
      } else if (selectedMedia) {
        formData.append('image', selectedMedia);  // バックエンドでは'image'として処理
      }

      const response = await axios.post(
        'http://127.0.0.1:5000/api/posts',
        formData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast({
        title: '投稿が成功しました！',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setContent('');
      setSelectedImage(null);
      setSelectedMedia(null);
      setImagePreview(null);
      setMediaPreview(null);
      setMediaType(null);
      setIsPostModalOpen(false); // 新規投稿モーダルを閉じる
      
      if (response.data.post) {
        setPosts(prevPosts => [response.data.post, ...prevPosts]);
      } else {
        fetchPosts();
      }
    } catch (error) {
      console.error('投稿失敗:', error);
      toast({
        title: '投稿に失敗しました',
        description: error.response?.data?.message || 'エラーが発生しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // 日付が有効かどうかをチェックする関数
  const isValidDate = (date) => {
    const parsedDate = Date.parse(date);
    return !isNaN(parsedDate); // getTime()がNaNを返す場合は無効な日付
  };

  // 投稿をクリックしたときの処理
  const handlePostClick = (post) => {
    console.log('Clicked post:', post); // デバッグ用
    navigate(`/post/${post.id}`); // 投稿の詳細ページに移動
  };

  // いいねの切り替え処理を修正
  const handleLikeToggle = async (postId, isReply = false) => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:5000/api/posts/${postId}/like`,
        {},
        { withCredentials: true }
      );

      // 投稿リストを更新
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (isReply) {
            // 返信へのいいねの場合
            if (post.replies) {
              return {
                ...post,
                replies: post.replies.map(reply => 
                  reply.id === postId ? {
                    ...reply,
                    is_liked: response.data.is_liked,
                    like_count: response.data.like_count
                  } : reply
                )
              };
            }
          } else {
            // 通常の投稿へのいいねの場合
            if (post.id === postId) {
              return {
                ...post,
                is_liked: response.data.is_liked,
                like_count: response.data.like_count
              };
            }
          }
          return post;
        })
      );
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  // ユーザーIDを取得
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('=== Auth Check Start ===');
        const response = await axios.get('http://127.0.0.1:5000/api/check_auth', {
          withCredentials: true
        });
        console.log('Response data:', {
          authenticated: response.data.authenticated,
          user_id: response.data.user_id
        });

        if (response.data && response.data.authenticated) {
          console.log('User is authenticated with ID:', response.data.user_id);
        } else {
          console.log('User is not authenticated');
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        console.log('=== Auth Check End ===');
      }
    };

    checkAuth();
  }, []);

  // 画像クリックハンドラーを追加
  const handleImageClick = (e, imageUrl) => {
    e.stopPropagation();  // 投稿クリックイベントの伝播を停止
    setExpandedImage(imageUrl);
  };

  // 画像ダウンロードハンドラーを追加
  const handleImageDownload = async (e, imageUrl, filename) => {
    e.stopPropagation();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'downloaded-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('画像のダウンロードに失敗しました:', error);
    }
  };

  // メディアダウンロードハンドラーを追加
  const handleMediaDownload = async (e, mediaUrl, filename) => {
    e.stopPropagation();
    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'downloaded-media.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('メディアのダウンロードに失敗ました:', error);
    }
  };

  return (
    <Box className="post-page" display="flex" flexDirection="column" height="100vh">
      <Sidebar />
      <Box className="main-content" flex="1" p={4} overflowY="auto">
        {message && <Text color="red.500">{message}</Text>}
        {pageDetails && (
          <VStack align="start" spacing={3} mb={6}>
            <Heading>{pageDetails.name}</Heading>
            <Text color="gray.500">{pageDetails.genre_name}</Text>
          </VStack>
        )}
        <VStack spacing={4} align="stretch" width="100%" ml="0">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Box 
                key={post.id} 
                borderWidth="1px" 
                borderRadius="lg" 
                p={4} 
                boxShadow="md" 
                onClick={() => handlePostClick(post)}
                bg={selectedPost?.id === post.id ? 'gray.100' : 'white'} // 返信先の投稿を強調
                borderColor="gray.300" // ボーダーの色を設定
                marginBottom="20px" // 各投稿の間に余白を追加
              >
                <HStack spacing={3}>
                  {post.user_profile_image && (  // 投稿したユーザーのプロフィール画像を表示
                    <Link as={RouterLink} to={`/profile/${post.user_id}`}>
                      <Image 
                        src={post.user_profile_image} 
                        alt="User Profile" 
                        boxSize="40px" 
                        borderRadius="full" 
                      />
                    </Link>
                  )}
                  <Box flex="1">
                    <Text fontWeight="bold" fontSize="lg"> {/* フォントサイズを大きくする */}
                      <Link as={RouterLink} to={`/profile/${post.user_id}`} color="teal.500">
                        {post.username}
                      </Link>
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {new Date(post.created_at).toLocaleString('ja-JP')}
                    </Text>
                    <Text mt={2} fontSize="md">{post.content}</Text> {/* フォントサイズを調整 */}
                  </Box>
                </HStack>
                {post.image_url && (
                  <Box mt={2}>
                    {post.image_url.toLowerCase().match(/\.(mp4|mov|avi|wmv)$/) ? (
                      <video 
                        src={`http://localhost:5000${post.image_url}`} 
                        controls 
                        style={{ width: '100%', borderRadius: '8px' }} 
                      />
                    ) : (
                      <Image 
                        src={`http://localhost:5000${post.image_url}`} 
                        alt="Post" 
                        borderRadius="8px" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedImage(`http://localhost:5000${post.image_url}`);
                        }} 
                      />
                    )}
                  </Box>
                )}
                <HStack mt={2}>
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLikeToggle(post.id);
                    }}
                  >
                    {post.is_liked ? '❤️' : '🤍'} {post.like_count}
                  </Button>
                  <IconButton 
                    icon={<FaReply />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReplyClick(post);
                    }}
                    aria-label="返信"
                  />
                </HStack>
                {/* 返信の表示 */}
                {selectedPost?.id === post.id && post.replies.length > 0 && (
                  <Box mt={4} pl={6} borderWidth="1px" borderRadius="lg" p={2} bg="gray.50">
                    <Box position="relative" mb={2}>
                      <Box position="absolute" left="-10px" top="0" height="100%" width="2px" bg="gray.300" />
                      {post.replies.map(reply => (
                        <Box 
                          key={reply.id} 
                          borderWidth="1px" 
                          borderRadius="lg" 
                          p={2} 
                          mt={2} 
                          _hover={{ 
                            transform: 'scale(1.05)', 
                            backgroundColor: 'rgba(200, 200, 200, 0.2)', 
                            transition: 'transform 0.2s ease, background-color 0.2s ease' 
                          }} // ホバー時のスタイル
                        >
                          <Text fontWeight="bold">{reply.username}</Text>
                          <Text>{reply.content}</Text>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            ))
          ) : (
            <Text>まだ投稿がありません。</Text>
          )}
        </VStack>
      </Box>

      {/* 新規投稿ボタンを右下に配置 */}
      <Box position="fixed" bottom="20px" right="20px">
        <IconButton 
          icon={<FaPlus />}
          colorScheme="teal" 
          onClick={() => setIsPostModalOpen(true)}
          aria-label="新規投稿"
          isRound
        />
      </Box>

      {/* 返信モーダル */}
      <Modal isOpen={isReplyModalOpen} onClose={() => setIsReplyModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>返信</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="返信を入力..." 
              required 
              autoFocus 
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleReplySubmit}>
              返信する
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 新規投稿モーダル */}
      <Modal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>新規投稿</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="投稿内容を入力..." 
              required 
              autoFocus 
            />
            {/* 画像アップロード */}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageSelect} 
            />
            {/* 動画アップロード */}
            <input 
              type="file" 
              accept="video/*" 
              onChange={handleMediaSelect} 
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handlePostSubmit}>
              投稿する
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Post;
