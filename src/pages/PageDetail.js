import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  Divider,
  Button,
} from '@chakra-ui/react';

const PageDetail = () => {
  const { pageName } = useParams();
  const [pageDetails, setPageDetails] = useState(null);

  useEffect(() => {
    const fetchPageDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/pages/${pageName}`);
        setPageDetails(response.data.page);
      } catch (error) {
        console.error('ページ詳細の取得に失敗:', error);
      }
    };

    fetchPageDetails();
  }, [pageName]);

  return (
    <Box p={5} maxW="800px" mx="auto">
      {pageDetails ? (
        <VStack align="start" spacing={3} mb={6}>
          <Heading>{pageDetails.name}</Heading>
          <Text color="gray.500">作成者: {pageDetails.username}</Text>
          <Text color="gray.500">作成日: {pageDetails.created_at}</Text>
          <Divider />
          <Text mt={4}>このページは現在、投稿がありません。</Text>
          <Button colorScheme="teal" mt={4}>新しい投稿を作成</Button>
        </VStack>
      ) : (
        <Text>ページの詳細を読み込んでいます...</Text>
      )}
    </Box>
  );
};

export default PageDetail;