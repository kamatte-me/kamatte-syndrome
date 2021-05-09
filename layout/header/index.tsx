/** @jsxRuntime classic */
/** @jsx jsx */
import Link from 'next/link';
import React, { useCallback, useState } from 'react';
import { Box, Flex, jsx, MenuButton } from 'theme-ui';

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
            px: 3,
            background:
              'linear-gradient(180deg, rgba(255,255,255,1) 85%, rgba(255,255,255,0) 100%)',
          }}
        >
          <Flex
            sx={{
              alignItems: 'center',
            }}
          >
            <Link href="/">
              <a>
                <div
                  sx={{
                    variant: 'links.nav',
                    mr: [0, 3],
                    '&.active, &:hover': {
                      color: 'black',
                    },
                  }}
                >
                  かまって☆しんどろ〜む
                </div>
              </a>
            </Link>
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
