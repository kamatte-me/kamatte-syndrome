import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Box, Flex, Heading, Text } from 'theme-ui';

import { formatDate } from '@/lib/date';
import { Blog } from '@/lib/microcms/model';

export const BlogListItem: React.FC<{
  entry: Blog;
}> = ({ entry }) => {
  return (
    <Flex>
      <Box
        sx={{
          variant: 'styles.a',
        }}
      >
        <Link href={`/blog/${entry.id}`}>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a>
            <Flex
              sx={{
                justifyContent: 'center',
                width: [80, 200],
                height: [80, 120],
                mr: [3, 3],
              }}
            >
              <Image
                src={
                  entry.featuredImage ? entry.featuredImage.url : '/avatar.svg'
                }
                alt={entry.title}
                objectFit="contain"
                objectPosition="center top"
                width={200}
                height={120}
              />
            </Flex>
          </a>
        </Link>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Box
          sx={{
            variant: 'styles.a',
            textDecoration: 'none',
          }}
        >
          <Heading
            as="h2"
            sx={{ variant: 'text.headingSerif', fontSize: [3, 4], mb: 2 }}
          >
            <Link href={`/blog/${entry.id}`}>{entry.title}</Link>
          </Heading>
        </Box>
        <Text as="span" sx={{ color: 'darkgray', fontSize: 1 }}>
          {formatDate(entry.publishedAt)}
        </Text>
      </Box>
    </Flex>
  );
};
