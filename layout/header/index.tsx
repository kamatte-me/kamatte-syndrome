/** @jsxRuntime classic */
/** @jsx jsx */
import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useState } from 'react';
import { Box, Flex, jsx, MenuButton } from 'theme-ui';

import { siteName } from '@/constants/site';
import { SideNav } from '@/layout/header/SideNav';

import { NavLink } from './NavLink';

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
    setMenuOpen(prevState => !prevState);
  }, []);

  return (
    <>
      <Flex
        as="header"
        sx={{
          position: 'fixed',
          zIndex: 2,
          width: '100%',
        }}
      >
        <Flex
          sx={{
            width: '100%',
            height: HeaderHeight,
            alignItems: 'center',
            justifyContent: 'space-between',
            px: [3, 4],
            bg: 'background',
            boxShadow: '0px 5px 10px #fff',
          }}
        >
          <Flex
            sx={{
              alignItems: 'center',
            }}
          >
            <Flex
              sx={{
                width: [110, 120],
                height: [32, 36],
                mr: [0, 3],
              }}
            >
              <Link href="/">
                <a>
                  <Image
                    src="/logo.svg"
                    alt={siteName}
                    objectFit="contain"
                    width={120}
                    height={36}
                  />
                </a>
              </Link>
            </Flex>
            <Flex
              as="nav"
              sx={{
                display: ['none', 'flex'],
              }}
            >
              {links.map(link => (
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
                onClick={() => toggleMenuOpen()}
              />
            </Flex>
          </Flex>
        </Flex>
      </Flex>

      <SideNav open={menuOpen} handleClose={() => setMenuOpen(false)}>
        <Box as="nav">
          <ul
            sx={{
              textAlign: 'right',
            }}
          >
            {links.map(link => (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions
              <li key={link.to} onClick={() => setMenuOpen(false)}>
                <NavLink to={link.to}>{link.title}</NavLink>
              </li>
            ))}
          </ul>
        </Box>
      </SideNav>
    </>
  );
};
