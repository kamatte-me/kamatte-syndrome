import type React from 'react';
import { Flex } from 'theme-ui';

interface HistoryItemProps {
  year: number;
  body: string;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ year, body }) => {
  return (
    <Flex>
      <dt sx={{ fontWeight: 'normal', width: '68px' }}>{year}年</dt>
      <dd sx={{ flex: 1, width: '100%', marginLeft: 2 }}>{body}</dd>
    </Flex>
  );
};
