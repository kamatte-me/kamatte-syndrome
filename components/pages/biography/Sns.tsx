import React from 'react';
import { Box, Link } from 'theme-ui';

import { GitHubIcon } from '@/components/elements/Icon';

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
        <GitHubIcon size={32} color="#24292e" />
      </Link>
    </Box>
  );
};
