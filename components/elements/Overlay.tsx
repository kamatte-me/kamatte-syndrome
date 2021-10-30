/** @jsxImportSource theme-ui */
import { Global } from '@emotion/react';
import React from 'react';

export const Overlay: React.FC<{
  handleClose: () => void;
  bgColor: string;
}> = ({ handleClose, bgColor }) => {
  return (
    <>
      <div
        onClick={() => handleClose()}
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          bg: bgColor,
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
