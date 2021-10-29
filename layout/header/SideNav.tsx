/** @jsxImportSource theme-ui */
import React from 'react';

import { CloseIcon } from '@/components/elements/Icon';
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
      {open && <Overlay bgColor="primary" handleClose={() => handleClose()} />}
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
        <CloseIcon
          onClick={() => handleClose()}
          sx={{
            position: 'fixed',
            top: 3,
            right: 3,
            color: 'black',
            height: 32,
            width: 32,
            cursor: 'pointer',
            zIndex: 102,
          }}
        />
        {children}
      </div>
    </>
  );
};
