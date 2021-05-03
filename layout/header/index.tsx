/** @jsxRuntime classic */
/** @jsx jsx */
import { ThemeUIStyleObject } from '@theme-ui/css';
import Link from 'next/link';
import React, { useCallback, useState } from 'react';
import { HiOutlineBell } from 'react-icons/hi';
import { Flex, IconButton, jsx, MenuButton } from 'theme-ui';

import { SideNav } from '@/layout/header/SideNav';

import { NavLink } from './NavLink';

export const HeaderHeight = 64;

const gradationStyles: ThemeUIStyleObject = {
  background: `linear-gradient(217deg, rgb(192,0,0), transparent 70.71%),
                   linear-gradient(127deg, rgb(0,148,0), transparent 70.71%),
                   linear-gradient(336deg, rgb(0,0,255), transparent 70.71%)`,
  backgroundSize: `1000px 1000px`,
  backgroundClip: 'text',
  animation: `gradient 9s linear infinite`,
};

const links: {
  title: string;
  to: string;
}[] = [
  {
    title: 'Bio',
    to: '/bio',
  },
  {
    title: 'Portfolio',
    to: '/portfolio',
  },
  {
    title: 'Illustration',
    to: '/illustration',
  },
  {
    title: 'Culture',
    to: '/culture',
  },
  {
    title: 'Blog',
    to: '/blog',
  },
];

export const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const toggleMenuOpen = useCallback(() => {
    setMenuOpen(prevState => !prevState);
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes gradient {
            0% {
              background-position: 0% 0%
            }
            25% {
              background-position: 100% 0%
            }
            50% {
              background-position: 100% 100%
            }
            75% {
              background-position: 0% 100%
            }
            100% {
              background-position: 0% 0%
            }
          }
        `}
      </style>

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
              <div
                sx={{
                  variant: 'links.nav',
                  mr: [0, 3],
                  '&.active, &:hover': {
                    color: 'black',
                  },
                  cursor: 'pointer',
                }}
              >
                かまって☆しんどろ〜む
              </div>
            </Link>
            <Flex
              sx={{
                display: ['none', 'flex'],
                ...gradationStyles,
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
              }}
            >
              <IconButton
                sx={{
                  cursor: 'pointer',
                }}
              >
                <HiOutlineBell size={24} />
              </IconButton>
            </Flex>
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
        <ul
          sx={{
            textAlign: 'right',
            ...gradationStyles,
          }}
        >
          {links.map(link => (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions
            <li key={link.to} onClick={() => setMenuOpen(false)}>
              <NavLink to={link.to}>{link.title}</NavLink>
            </li>
          ))}
        </ul>
      </SideNav>
    </>
  );
};
