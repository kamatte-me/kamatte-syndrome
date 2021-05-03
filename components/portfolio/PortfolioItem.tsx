/** @jsxRuntime classic */
/** @jsx jsx */
import Image from 'next/image';
import React from 'react';
import { Badge, Box, Flex, jsx, Link, Text, Themed } from 'theme-ui';

import { PortfolioItem as PortfolioItemType } from '@/pages/portfolio';

const featuredImageSize = 120;

const FeaturedImage: React.FC<{
  url?: string | null;
}> = ({ url }) => {
  if (url) {
    return (
      <Image
        src={url}
        alt="me"
        objectFit="contain"
        width={featuredImageSize}
        height={featuredImageSize}
      />
    );
  }

  return (
    <Flex
      sx={{
        width: featuredImageSize,
        height: featuredImageSize,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: 'lightgray',
        borderRadius: '50%',

        '::before': {
          content: `'大人の事情で'`,
          textAlign: 'center',
          fontSize: '8px',
          color: 'darkgray',
        },
        '::after': {
          content: `'No image'`,
          textAlign: 'center',
          fontFamily: 'heading',
          fontWeight: 'bold',
          fontSize: 2,
          color: 'darkgray',
        },
      }}
    />
  );
};

interface PortfolioItemProps {
  item: PortfolioItemType;
}

export const PortfolioItem: React.FC<PortfolioItemProps> = ({ item }) => {
  return (
    <Flex
      key={item.id}
      sx={{
        flexDirection: ['column', 'row'],
        justifyContent: 'center',
        alignItems: ['center', 'flex-start'],
        mb: 3,
      }}
    >
      <Flex
        sx={{
          justifyContent: 'center',
          width: featuredImageSize,
          height: featuredImageSize,
          mr: [0, 4],
          mb: [4, 0],
        }}
      >
        {item.url ? (
          <Link href={item.url} target="_blank">
            <FeaturedImage url={item.featuredImageUrl} />
          </Link>
        ) : (
          <FeaturedImage url={item.featuredImageUrl} />
        )}
      </Flex>
      <Box sx={{ flex: 1, width: '100%' }}>
        <Box
          sx={{
            mb: 2,
            textAlign: ['center', 'left'],
          }}
        >
          <Themed.h2>
            {item.url ? (
              <Link href={item.url} target="_blank">
                {item.title}
              </Link>
            ) : (
              item.title
            )}
          </Themed.h2>
          <Text
            sx={{
              fontSize: 1,
              color: 'gray',
            }}
          >
            {item.category}
          </Text>
        </Box>
        <Text
          dangerouslySetInnerHTML={{
            __html: item.description,
          }}
        />
        <Box sx={{ mt: 3 }}>
          {item.technologies.map(tech => (
            <Badge
              key={tech}
              sx={{
                ':not(:last-child)': {
                  mr: 2,
                },
              }}
            >
              {tech}
            </Badge>
          ))}
        </Box>
      </Box>
    </Flex>
  );
};
