/* @jsx jsx */
import { Sidenav } from '@theme-ui/sidenav';
import { Link } from 'gatsby';
import React, { useCallback, useState } from 'react';
import { HiOutlineBell } from 'react-icons/hi';
import { Flex, IconButton, jsx, MenuButton } from 'theme-ui';

export const HeaderHeight = 64;

const Index: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const isActive = useCallback((path: string): boolean => {
    return window.location.pathname.startsWith(path);
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

  return (
    <Flex
      as="header"
      sx={{
        position: 'fixed',
        zIndex: 10,
        width: '100%',
      }}
    >
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
              onClick={() => setMenuOpen(true)}
            />
          </Flex>
          <Link
            to="/"
            sx={{
              variant: 'links.nav',
              mr: [0, 3],
              '&.active, &:hover': {
                color: 'black',
              },
            }}
          >
            かまって☆しんどろ〜む
          </Link>
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              sx={{
                variant: 'links.nav',
                display: ['none', 'block'],
                color: isActive(link.to) ? 'primary' : 'black',
                background:
                  isActive(link.to) &&
                  `
                  repeating-linear-gradient(190deg, rgba(255, 0, 0, 0.5) 40px,
                    rgba(255, 153, 0, 0.5) 80px, rgba(255, 255, 0, 0.5) 120px,
                    rgba(0, 255, 0, 0.5) 160px, rgba(0, 0, 255, 0.5) 200px,
                    rgba(75, 0, 130, 0.5) 240px, rgba(238, 130, 238, 0.5) 280px,
                    rgba(255, 0, 0, 0.5) 300px),
                  repeating-linear-gradient(-190deg, rgba(255, 0, 0, 0.5) 30px,
                    rgba(255, 153, 0, 0.5) 60px, rgba(255, 255, 0, 0.5) 90px,
                    rgba(0, 255, 0, 0.5) 120px, rgba(0, 0, 255, 0.5) 150px,
                    rgba(75, 0, 130, 0.5) 180px, rgba(238, 130, 238, 0.5) 210px,
                    rgba(255, 0, 0, 0.5) 230px),
                  repeating-linear-gradient(23deg, red 50px, orange 100px,
                    yellow 150px, green 200px, blue 250px,
                    indigo 300px, violet 350px, red 370px)
                  `,
                backgroundClip: isActive(link.to) && 'text',
                backgroundSize: '400% 400%',
                animation: isActive(link.to) && 'gradient 13s ease infinite',
                textFillColor: isActive(link.to) && 'transparent',
                '&:hover': {
                  background: `
                    repeating-linear-gradient(190deg, rgba(255, 0, 0, 0.5) 40px,
                      rgba(255, 153, 0, 0.5) 80px, rgba(255, 255, 0, 0.5) 120px,
                      rgba(0, 255, 0, 0.5) 160px, rgba(0, 0, 255, 0.5) 200px,
                      rgba(75, 0, 130, 0.5) 240px, rgba(238, 130, 238, 0.5) 280px,
                      rgba(255, 0, 0, 0.5) 300px),
                    repeating-linear-gradient(23deg, red 50px, orange 100px,
                      yellow 150px, green 200px, blue 250px,
                      indigo 300px, violet 350px, red 370px),
                    repeating-linear-gradient(-190deg, rgba(255, 0, 0, 0.5) 30px,
                      rgba(255, 153, 0, 0.5) 60px, rgba(255, 255, 0, 0.5) 90px,
                      rgba(0, 255, 0, 0.5) 120px, rgba(0, 0, 255, 0.5) 150px,
                      rgba(75, 0, 130, 0.5) 180px, rgba(238, 130, 238, 0.5) 210px,
                      rgba(255, 0, 0, 0.5) 230px)
                  `,
                  backgroundClip: 'text',
                  backgroundSize: '500% 600%',
                  animation: 'gradient 13s ease infinite',
                  textFillColor: 'transparent',
                },
              }}
            >
              {link.title}
            </Link>
          ))}
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
      <Sidenav
        open={menuOpen}
        // @ts-ignore
        sx={{
          top: HeaderHeight,
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
        <ul sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              sx={{
                variant: 'links.nav',
                pl: 4,
              }}
            >
              <li>{link.title}</li>
            </Link>
          ))}
        </ul>
      </Sidenav>
    </Flex>
  );
};

export default Index;
