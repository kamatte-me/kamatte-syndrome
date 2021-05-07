/** @jsxRuntime classic */
/** @jsx jsx * */
import React from 'react';
import { Box, Container, Embed, Flex, Heading, jsx } from 'theme-ui';

import { CloseIcon } from '@/components/elements/Icon';
import { Overlay } from '@/components/elements/Overlay';
import { htmlToThemed } from '@/lib/htmlToThemed';
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
      <Overlay handleClose={handleClose} bgColor="black" />
      <CloseIcon
        onClick={() => handleClose()}
        sx={{
          variant: 'styles.a',
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

      <Container
        variant="layout.youtubeModalContainer"
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 101,
        }}
      >
        <Heading
          as="h1"
          sx={{
            variant: 'text.headingSerif',
            fontSize: 5,
            color: 'white',
            mb: 3,
          }}
        >
          {cultureItem.name}
        </Heading>
        <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Embed
            src={`https://www.youtube.com/embed/${cultureItem.youtubeVideoId}?autoplay=1`}
            sx={{
              bg: 'black',
            }}
          />
        </Flex>
        <Box sx={{ mt: 4, color: 'white' }}>
          {htmlToThemed(cultureItem.description)}
        </Box>
      </Container>
    </Box>
  );
};
