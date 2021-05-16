/** @jsxRuntime classic */
/** @jsx jsx */
import { Global } from '@emotion/react';
import React from 'react';
import { jsx } from 'theme-ui';

export const Overlay: React.FC<{
  handleClose: () => void;
  bgColor: string;
}> = ({ handleClose, bgColor }) => {
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
