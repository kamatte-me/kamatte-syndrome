/** @jsxImportSource theme-ui */
import Link from 'next/link';
import React from 'react';
import { Box, Flex } from 'theme-ui';

import { siteName } from '@/constants/site';

export const FooterHeight = 60;

const year = new Date().getFullYear();

const links: {
  title: string;
  to: string;
}[] = [
  {
    title: 'Terms',
    to: '/terms',
  },
  {
    title: 'Privacy',
    to: '/privacy',
  },
];

export const Footer: React.FC = () => {
  return (
    <Flex
      as="footer"
      sx={{
        flexDirection: 'column',
        position: 'absolute',
        bottom: 0,
        height: FooterHeight,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'gray',
      }}
    >
      <Box as="small" sx={{ fontSize: 0, mb: 1 }}>
        © {year} {siteName}
      </Box>
      <Flex
        as="ul"
        sx={{
          fontSize: 0,
          li: {
            ':not(:last-child)': {
              '::after': {
                content: `"|"`,
                mx: 2,
              },
            },
          },
        }}
      >
        {links.map(link => (
          <li key={link.to}>
            <Link href={link.to}>{link.title}</Link>
          </li>
        ))}
      </Flex>
    </Flex>
  );
};
