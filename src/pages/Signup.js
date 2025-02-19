import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, FormControl, FormLabel, Input, Heading, VStack, useToast, Image } from '@chakra-ui/react';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast(); // Chakra UIのトーストを使用

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/signup', 
        { 
          name, 
          email, 
          password 
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.status === 201) {
        toast({
          title: '登録に成功しました。',
          description: 'ログインしてください。',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('サインアップエラー:', error);
      toast({
        title: 'サインアップに失敗しました。',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      height="100vh" 
      bgImage="url('https://source.unsplash.com/random/1600x900')" // 背景画像
      bgSize="cover" 
      bgPosition="center"
    >
      <Box 
        p={8} 
        borderRadius="md" 
        boxShadow="lg" 
        bg="white" 
        width="400px"
        opacity="0.9" // 背景を少し透過させる
      >
        <Heading as="h1" size="lg" mb={6} textAlign="center" color="teal.600">
          サインアップ
        </Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input 
                type="text" 
                placeholder="Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                borderColor="teal.400" // ボーダーの色
                _hover={{ borderColor: "teal.500" }} // ホバー時のボーダー色
                _focus={{ borderColor: "teal.600", boxShadow: "0 0 0 1px teal.600" }} // フォーカス時のスタイル
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                borderColor="teal.400"
                _hover={{ borderColor: "teal.500" }}
                _focus={{ borderColor: "teal.600", boxShadow: "0 0 0 1px teal.600" }}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                borderColor="teal.400"
                _hover={{ borderColor: "teal.500" }}
                _focus={{ borderColor: "teal.600", boxShadow: "0 0 0 1px teal.600" }}
              />
            </FormControl>
            <Button 
              type="submit" 
              colorScheme="teal" 
              width="full" 
              _hover={{ bg: "teal.500", transform: "scale(1.05)" }} // ホバー時の効果
              transition="all 0.2s" // アニメーション
            >
              登録
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  );
}

export default Signup;
