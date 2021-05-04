/* @jsxRuntime classic */
/* @jsx jsx */
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Box, Flex, jsx, Themed } from 'theme-ui';

import { formatDate } from '@/lib/date';
import { Blog } from '@/lib/microcms/model';

export const ListItem: React.FC<{
  post: Blog;
}> = ({ post }) => {
  return (
    <Flex
      sx={{
        justifyContent: 'center',
        mb: 3,
      }}
    >
      <Link href={`/blog/${post.id}`}>
        <Flex
          sx={{
            justifyContent: 'center',
            width: [60, 90],
            height: [60, 90],
            mr: [2, 4],
            cursor: 'pointer',
          }}
        >
          <Image
            src={post.featuredImage ? post.featuredImage.url : '/avatar.png'}
            alt="me"
            objectFit="contain"
            width={90}
            height={90}
          />
        </Flex>
      </Link>
      <Box sx={{ flex: 1 }}>
        <span sx={{ color: 'gray', fontSize: 1 }}>
          {formatDate(post.publishedAt)}
        </span>
        <Themed.h2 sx={{ fontFamily: 'body', fontSize: 3 }}>
          <Link href={`/blog/${post.id}`}>{post.title}</Link>
        </Themed.h2>
      </Box>
    </Flex>
  );
};
