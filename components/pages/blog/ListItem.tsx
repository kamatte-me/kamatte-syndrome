/* @jsxRuntime classic */
/* @jsx jsx */
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Box, Flex, jsx, Text, Themed } from 'theme-ui';

import { formatDate } from '@/lib/date';
import { Blog } from '@/lib/microcms/model';

export const ListItem: React.FC<{
  post: Blog;
}> = ({ post }) => {
  return (
    <Flex
      sx={{
        justifyContent: 'center',
        mb: 4,
      }}
    >
      <Link href={`/blog/${post.id}`}>
        <Flex
          sx={{
            justifyContent: 'center',
            width: [80, 200],
            height: [80, 120],
            mr: [3, 3],
            cursor: 'pointer',
          }}
        >
          <Image
            src={post.featuredImage ? post.featuredImage.url : '/avatar.png'}
            alt="me"
            objectFit="contain"
            objectPosition="center top"
            width={200}
            height={120}
          />
        </Flex>
      </Link>
      <Box sx={{ flex: 1 }}>
        <Themed.h2 sx={{ fontFamily: 'body', fontSize: [3, 4], mb: 2 }}>
          <Link href={`/blog/${post.id}`}>{post.title}</Link>
        </Themed.h2>
        <Text as="span" sx={{ color: 'gray', fontSize: 1 }}>
          {formatDate(post.publishedAt)}
        </Text>
      </Box>
    </Flex>
  );
};
