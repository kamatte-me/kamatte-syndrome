import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import { Box } from 'theme-ui';

interface NavLinkProps {
  to: string;
}

export const NavLink: React.FC<NavLinkProps> = ({ to, children }) => {
  const router = useRouter();

  const isActive = useMemo((): boolean => {
    return router.pathname.startsWith(to);
  }, [router.pathname, to]);

  return (
    <Link href={to}>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a>
        <Box
          sx={{
            variant: 'links.nav',
            color: isActive ? 'primary' : 'black',
          }}
        >
          {children}
        </Box>
      </a>
    </Link>
  );
};
