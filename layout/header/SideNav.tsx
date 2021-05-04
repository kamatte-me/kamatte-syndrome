/** @jsxRuntime classic */
/** @jsx jsx */
import React from 'react';
import { Close, jsx } from 'theme-ui';

import { Overlay } from '@/components/elements/Overlay';
import { HeaderHeight } from '@/layout/header/index';

interface SideNavProps {
  open: boolean;
  handleClose: () => void;
}

export const SideNav: React.FC<SideNavProps> = ({
  open,
  handleClose,
  children,
}) => {
  return (
    <>
      {open && <Overlay handleClose={() => handleClose()} />}
      <div
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 101,
          minWidth: 0,
          width: '50vw',
          paddingTop: HeaderHeight,
          px: 3,
          maxHeight: '100vh',
          overflowX: 'visible',
          overflowY: 'auto',
          transition: 'transform .2s ease-out',
          transform: open ? 'translateX(0)' : 'translate(100%)',
          bg: 'background',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div
          sx={{
            position: 'absolute',
            top: 3,
            right: 3,
          }}
        >
          <Close onClick={() => handleClose()} />
        </div>
        {children}
      </div>
    </>
  );
};
