import { Global } from '@emotion/react';
import type React from 'react';

export const Overlay: React.FC<{
  handleClose: () => void;
  bgColor: string;
}> = ({ handleClose, bgColor }) => {
  return (
    <>
      <div
        role="dialog"
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          bg: bgColor,
          zIndex: 100,
        }}
        onClick={() => {
          handleClose();
        }}
        onKeyDown={() => {}}
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
