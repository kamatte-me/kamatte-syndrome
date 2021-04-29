/* @jsx jsx */
import { ThemeUIStyleObject } from '@theme-ui/css';
import { Link } from 'gatsby';
import React, { useMemo } from 'react';
import { jsx } from 'theme-ui';

interface NavLinkProps {
  to: string;
  sx?: ThemeUIStyleObject;
  readonly className?: string;
}

export const NavLink: React.FC<NavLinkProps> = ({
  to,
  children,
  className,
}) => {
  const isActive = useMemo((): boolean => {
    return window.location.pathname.startsWith(to);
  }, [window.location.pathname]);

  return (
    <Link
      to={to}
      className={className}
      sx={{
        variant: 'links.nav',
        color: isActive ? 'primary' : 'black',
        '-webkit-text-fill-color': isActive ? 'transparent' : undefined,
        '&:hover': {
          '-webkit-text-fill-color': 'transparent',
        },
      }}
    >
      {children}
    </Link>
  );
};
