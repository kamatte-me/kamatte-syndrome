/* @jsx jsx */
import React from 'react';
import { jsx, Text } from 'theme-ui';

export const HistoryContainer: React.FC = ({ children }) => {
  return <ul>{children}</ul>;
};

interface ChronologyItemProps {
  year: number;
  body: string;
}

export const History: React.FC<ChronologyItemProps> = ({ year, body }) => {
  return (
    <div>
      <dt
        sx={{
          width: 72,
          float: 'left',
          clear: 'left',
          fontWeight: 'normal',
        }}
      >
        <Text>{year}年</Text>
      </dt>
      <dd sx={{ marginLeft: 72 }}>{body}</dd>
    </div>
  );
};
