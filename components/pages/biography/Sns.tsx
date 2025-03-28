import type React from 'react';
import { Box, Link } from 'theme-ui';

import { GitHubIcon } from '@/components/elements/Icon';

export const Sns: React.FC = () => {
  return (
    <Box
      sx={{
        variant: 'styles.a',
        textAlign: ['center', 'left'],
      }}
    >
      <Link
        href="https://github.com/kamatte-me"
        target="_blank"
        rel="noreferrer"
      >
        <GitHubIcon color="#24292e" size={32} />
      </Link>
    </Box>
  );
};
