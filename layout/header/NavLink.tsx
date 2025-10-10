import Link from 'next/link';
import { useRouter } from 'next/router';
import type React from 'react';
import { useMemo } from 'react';
import { Box } from 'theme-ui';

interface NavLinkProps {
  to: string;
  onClick?: React.ComponentProps<typeof Link>['onClick'];
  children: React.ReactNode;
}

export const NavLink: React.FC<NavLinkProps> = ({ to, onClick, children }) => {
  const router = useRouter();

  const isActive = useMemo((): boolean => {
    return router.pathname.startsWith(to);
  }, [router.pathname, to]);

  return (
    <Link
      href={to as React.ComponentProps<typeof Link>['href']}
      onClick={onClick}
    >
      <Box
        sx={{
          variant: 'links.nav',
          color: isActive ? 'primary' : 'black',
        }}
      >
        {children}
      </Box>
    </Link>
  );
};
