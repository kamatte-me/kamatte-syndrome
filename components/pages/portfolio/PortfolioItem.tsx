/** @jsxRuntime classic */
/** @jsx jsx */
import Image from 'next/image';
import React from 'react';
import { Badge, Box, Flex, Heading, jsx, Link, Text } from 'theme-ui';

import { htmlToThemed } from '@/lib/htmlToThemed';
import { PortfolioItem as PortfolioItemType } from '@/pages/portfolio';

const FeaturedImage: React.FC<{
  item: PortfolioItemType;
}> = ({ item }) => {
  if (item.featuredImage) {
    return (
      <Image
        src={item.featuredImage.url}
        alt={item.title}
        objectFit="contain"
        width={item.featuredImage.width}
        height={item.featuredImage.height}
      />
    );
  }

  return (
    <Flex
      sx={{
        width: 120,
        height: 120,
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
      as="li"
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
          width: ['100%', 120],
          height: 120,
          mr: [0, 4],
          mb: [4, 0],
          a: {
            textDecoration: 'none',
          },
        }}
      >
        {item.url ? (
          <Link href={item.url} target="_blank">
            <FeaturedImage item={item} />
          </Link>
        ) : (
          <FeaturedImage item={item} />
        )}
      </Flex>
      <Box sx={{ flex: 1, width: '100%' }}>
        <Box
          sx={{
            mb: 2,
            textAlign: ['center', 'left'],
          }}
        >
          <Heading as="h2" sx={{ variant: 'text.headingSerif', fontSize: 4 }}>
            {item.url ? (
              <Link href={item.url} target="_blank">
                {item.title}
              </Link>
            ) : (
              item.title
            )}
          </Heading>
          <Text
            sx={{
              fontSize: 1,
              color: 'darkgray',
            }}
          >
            {item.category}
          </Text>
        </Box>
        <Box>{htmlToThemed(item.description)}</Box>
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
