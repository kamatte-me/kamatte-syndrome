import React from 'react';
import { GoMarkGithub } from 'react-icons/go';
import { Box, Link } from 'theme-ui';

export const Sns: React.FC = () => {
  return (
    <Box
      sx={{
        textAlign: ['center', 'left'],
        transition: 'opacity .2s ease-in',
        '&:hover': {
          opacity: 0.7,
        },
      }}
    >
      <Link href="https://github.com/kamatte-me" target="_blank">
        <GoMarkGithub size={32} color="#24292e" />
      </Link>
    </Box>
  );
};
