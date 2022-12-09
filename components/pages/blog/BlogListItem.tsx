import Image from 'next/image';
import React from 'react';
import { Box, Flex, Heading } from 'theme-ui';

import { formatDate } from '@/lib/date';
import { Blog } from '@/lib/microcms/model';

export const BlogListItem: React.FC<{
  entry: Blog;
}> = ({ entry }) => {
  return (
    <Flex
      sx={{
        variant: 'styles.a',
        textDecoration: 'none',
      }}
    >
      <Flex
        sx={{
          justifyContent: 'center',
          width: [80, 200],
          height: [80, 120],
          mr: 3,
        }}
      >
        <Image
          src={entry.featuredImage ? entry.featuredImage.url : '/avatar.svg'}
          alt={entry.title}
          width={200}
          height={120}
          style={{
            maxWidth: '100%',
            height: 'auto',
            objectFit: 'contain',
            objectPosition: 'center top',
          }}
        />
      </Flex>
      <Box sx={{ flex: 1 }}>
        <Box>
          <Heading
            as="h2"
            sx={{
              variant: 'text.headingSerif',
              fontSize: [3, 4],
              mb: 2,
              lineHeight: 1.3,
            }}
          >
            {entry.title}
          </Heading>
        </Box>
        <Box sx={{ color: 'darkgray', fontSize: 1 }}>
          {formatDate(entry.publishedAt)}
        </Box>
      </Box>
    </Flex>
  );
};
