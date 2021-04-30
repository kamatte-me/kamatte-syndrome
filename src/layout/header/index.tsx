/* @jsx jsx */
import { ThemeUIStyleObject } from '@theme-ui/css';
import { Sidenav } from '@theme-ui/sidenav';
import { Link } from 'gatsby';
import React, { useCallback, useMemo, useState } from 'react';
import { HiOutlineBell } from 'react-icons/hi';
import { Flex, IconButton, jsx, MenuButton } from 'theme-ui';

import { NavLink } from '@/layout/header/NavLink';

export const HeaderHeight = 64;

export const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const toggleMenuOpen = useCallback(() => {
    setMenuOpen(prevState => !prevState);
  }, []);

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

  const gradationStyles = useMemo((): ThemeUIStyleObject => {
    const degList = [217, 127, 336];
    for (let i = degList.length; i > 1; i -= 1) {
      const k = Math.floor(Math.random() * i);
      [degList[k], degList[i - 1]] = [degList[i - 1], degList[k]];
    }

    return {
      background: `linear-gradient(${degList[0]}deg, rgb(192,0,0), transparent 70.71%),
                   linear-gradient(${degList[1]}deg, rgb(0,148,0), transparent 70.71%),
                   linear-gradient(${degList[2]}deg, rgb(0,0,220), transparent 70.71%)`,
      backgroundSize: `1000px 1000px`,
      backgroundClip: 'text',
      animation: `gradient 7s linear infinite`,
    };
  }, []);

  return (
    <React.Fragment>
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
            <Link
              to="/"
              sx={{
                variant: 'links.nav',
                mr: [0, 3],
                textBaseline: 'bottom',
                '&.active, &:hover': {
                  color: 'black',
                },
              }}
            >
              かまって☆しんどろ〜む
            </Link>
            <Flex sx={gradationStyles}>
              {links.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  sx={{ display: ['none', 'block'] }}
                >
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
          </Flex>
        </Flex>
      </Flex>

      <Sidenav
        open={menuOpen}
        // @ts-ignore
        sx={{
          paddingTop: HeaderHeight,
          display: ['block', 'none'],
        }}
        onFocus={() => {
          setMenuOpen(true);
        }}
        onBlur={() => {
          setMenuOpen(false);
        }}
        onClick={() => {
          setMenuOpen(false);
        }}
        onKeyPress={() => {
          setMenuOpen(false);
        }}
      >
        <ul sx={{ listStyle: 'none', m: 0, p: 0, ...gradationStyles }}>
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              sx={{
                display: ['block', 'none'],
                variant: 'links.nav',
                pl: 4,
              }}
            >
              <li>{link.title}</li>
            </NavLink>
          ))}
        </ul>
      </Sidenav>
    </React.Fragment>
  );
};
