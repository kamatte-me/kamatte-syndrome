/** @jsxRuntime classic */
/** @jsx jsx */
import { Global } from '@emotion/react';
import React from 'react';
import { Close, jsx } from 'theme-ui';

import { HeaderHeight } from '@/layout/header/index';

const Overlay: React.FC<{
  handleClose: () => void;
}> = ({ handleClose }) => {
  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions,jsx-a11y/no-static-element-interactions */}
      <div
        onClick={() => handleClose()}
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          bg: 'primary',
          zIndex: 100,
        }}
      />
      <Global
        styles={{
          body: {
            overflow: 'hidden',
          },
        }}
      />
    </>
  );
};

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
