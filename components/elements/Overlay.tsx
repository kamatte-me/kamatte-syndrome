import { Global } from '@emotion/react';
import type React from 'react';

export const Overlay: React.FC<{
  handleClose: () => void;
  bgColor: string;
}> = ({ handleClose, bgColor }) => {
  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions -- モーダル背景。やむなし */}
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
