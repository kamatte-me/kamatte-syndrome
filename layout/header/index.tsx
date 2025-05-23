import Image from 'next/image';
import Link from 'next/link';
import type React from 'react';
import { useCallback, useState } from 'react';
import { Box, Flex, MenuButton } from 'theme-ui';

import { siteName } from '@/constants/site';
import { SideNav } from '@/layout/header/SideNav';

import { NavLink } from './NavLink';

// eslint-disable-next-line react-refresh/only-export-components -- sometime fix
export const HeaderHeight = 64;

const links: {
  title: string;
  to: string;
}[] = [
  {
    title: 'Biography',
    to: '/biography',
  },
  {
    title: 'Portfolio',
    to: '/portfolio',
  },
  {
    title: 'Culture',
    to: '/culture',
  },
  {
    title: 'Blog',
    to: '/blog',
  },
  {
    title: 'Subscribe',
    to: '/subscribe',
  },
];

export const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const toggleMenuOpen = useCallback(() => {
    setMenuOpen((prevState) => !prevState);
  }, []);

  return (
    <>
      <Flex
        as="header"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 90,
          width: '100%',
        }}
      >
        <Flex
          sx={{
            width: '100%',
            height: HeaderHeight,
            alignItems: 'center',
            justifyContent: 'space-between',
            px: [3, 3, 4],
            bg: 'background',
            boxShadow: '0px 8px 8px #fff',
          }}
        >
          <Flex
            sx={{
              alignItems: 'center',
            }}
          >
            <Flex
              sx={{
                width: [110, 110, 120],
                height: [32, 32, 36],
                mr: [0, 3],
              }}
            >
              <Link href="/">
                <Image
                  alt={siteName}
                  height={36}
                  src="/logo.svg"
                  width={120}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                  }}
                />
              </Link>
            </Flex>
            <Flex
              as="nav"
              sx={{
                display: ['none', 'flex'],
              }}
            >
              {links.map((link) => (
                <NavLink key={link.to} to={link.to}>
                  {link.title}
                </NavLink>
              ))}
            </Flex>
          </Flex>

          <Flex
            sx={{
              alignItems: 'center',
            }}
          >
            <Flex
              sx={{
                variant: 'links.nav',
                alignItems: 'center',
                justifyContent: 'center',
                display: ['block', 'none'],
              }}
            >
              <MenuButton
                aria-label="Toggle Menu"
                sx={{
                  cursor: 'pointer',
                }}
                onClick={() => {
                  toggleMenuOpen();
                }}
              />
            </Flex>
          </Flex>
        </Flex>
      </Flex>

      <SideNav
        open={menuOpen}
        handleClose={() => {
          setMenuOpen(false);
        }}
      >
        <Box as="nav">
          <ul
            sx={{
              textAlign: 'right',
            }}
          >
            {links.map((link) => (
              <li key={link.to} sx={{ py: 1 }}>
                <NavLink
                  to={link.to}
                  onClick={() => {
                    setMenuOpen(false);
                  }}
                >
                  {link.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </Box>
      </SideNav>
    </>
  );
};
