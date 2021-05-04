/** @jsxRuntime classic */
/** @jsx jsx * */
import React from 'react';
import { Box, Embed, Flex, jsx, Text, Themed } from 'theme-ui';

import { Close } from '@/components/elements/Icon';
import { Overlay } from '@/components/elements/Overlay';
import { Culture } from '@/lib/microcms/model';

export const YouTubeModal: React.FC<{
  cultureItem: Culture;
  open: boolean;
  handleClose: () => void;
}> = ({ cultureItem, open, handleClose }) => {
  if (!open) {
    return <></>;
  }

  return (
    <Box>
      <Overlay handleClose={handleClose} bgColor="#000" />
      <Close
        onClick={() => handleClose()}
        sx={{
          position: 'fixed',
          top: 3,
          right: 3,
          color: 'white',
          height: [48, 64],
          width: [48, 64],
          cursor: 'pointer',
          zIndex: 102,
        }}
      />

      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: ['100vw', 600, 600, 800],
          maxHeight: '100vh',
          p: 4,
          zIndex: 101,
          overflowY: 'auto',
        }}
      >
        <Themed.h1
          sx={{
            color: 'white',
            fontFamily: 'body',
            mb: 3,
          }}
        >
          {cultureItem.name}
        </Themed.h1>
        aaa
        <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Embed
            src={`https://www.youtube.com/embed/${cultureItem.youtubeVideoId}?autoplay=1`}
            sx={{
              bg: 'black',
            }}
          />
        </Flex>
        <Box sx={{ mt: 4 }}>
          <Text
            sx={{ color: 'white' }}
            dangerouslySetInnerHTML={{
              __html: cultureItem.description,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};
