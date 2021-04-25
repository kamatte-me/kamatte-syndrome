/* @jsx jsx */
import { Link } from 'gatsby';
import React from 'react';
import { HiOutlineBell } from 'react-icons/hi';
import { Flex, IconButton, jsx } from 'theme-ui';

export const HeaderHeight = 64;

const Header: React.FC = () => {
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
        <Flex>
          <Link
            to="/"
            sx={{
              variant: 'links.nav',
              mr: 3,
              '&.active, &:hover': {
                color: 'inherit',
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
              }}
            >
              {link.title}
            </Link>
          ))}
        </Flex>
        <Flex>
          <IconButton
            sx={{
              variant: 'links.nav',
              cursor: 'pointer',
              boxSizing: 'content-box',
            }}
          >
            <HiOutlineBell size={30} />
          </IconButton>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Header;
