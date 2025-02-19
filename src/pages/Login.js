import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, Text, useToast, Link } from '@chakra-ui/react';

// axiosのデフォルト設定 (バックエンド側でCORSを設定する必要あり)
axios.defaults.withCredentials = true;

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // ローディング中ならば処理しない

    setError(''); // エラーをクリア
    setLoading(true);

    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/api/login',
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
      );

      // レスポンスデータをデバッグ出力
      console.log('Response from server:', response.data);

      if (response.data.status === 'success') {
        console.log('Login successful:', response.data);
        navigate('/post'); // ログイン成功後にリダイレクト
      } else {
        setError(response.data.message || 'ログインに失敗しました');
        toast({
          title: 'ログイン失敗',
          description: response.data.message || 'ログインに失敗しました',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data?.message || 'ログインに失敗しました');
      toast({
        title: 'ログイン失敗',
        description: error.response?.data?.message || 'ログインに失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login-container" maxW="400px" mx="auto" mt="50px" p={5} bg="white">
      <Text fontSize="2xl" mb={4} textAlign="center" fontWeight="bold">ログイン</Text>
      {error && (
        <Box mb={4} p={3} borderRadius="md" bg="red.100">
          <Text color="red.500">{error}</Text>
        </Box>
      )}
      <form onSubmit={handleSubmit}>
        <FormControl mb={4} isRequired>
          <FormLabel htmlFor="email">Email</FormLabel>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            borderColor="teal.300"
            _hover={{ borderColor: "teal.500" }}
            _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
          />
        </FormControl>
        <FormControl mb={4} isRequired>
          <FormLabel htmlFor="password">Password</FormLabel>
          <Input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            borderColor="teal.300"
            _hover={{ borderColor: "teal.500" }}
            _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
          />
        </FormControl>
        <Button type="submit" isLoading={loading} colorScheme="teal" width="full" mt={4}>
          {loading ? 'ログイン中...' : 'ログイン'}
        </Button>
      </form>
      <Text mt={4} textAlign="center">
        アカウントがありませんか？ <Link color="teal" textDecoration="underline" href="/Signup">登録はこちら</Link>
      </Text>
    </Box>
  );
}

export default Login;
