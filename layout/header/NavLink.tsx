/** @jsxRuntime classic */
/** @jsx jsx */
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import { Box, jsx } from 'theme-ui';

interface NavLinkProps {
  to: string;
}

export const NavLink: React.FC<NavLinkProps> = ({ to, children }) => {
  const router = useRouter();

  const isActive = useMemo((): boolean => {
    return router.pathname.startsWith(to);
  }, [router.pathname]);

  return (
    <Link href={to}>
      <a>
        <Box
          sx={{
            variant: 'links.nav',
            color: isActive ? 'primary' : 'black',
            WebkitTextFillColor: isActive ? 'transparent' : undefined,
            '&:hover': {
              WebkitTextFillColor: 'transparent',
            },
          }}
        >
          {children}
        </Box>
      </a>
    </Link>
  );
};