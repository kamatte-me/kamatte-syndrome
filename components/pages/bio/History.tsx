/** @jsxRuntime classic */
/** @jsx jsx * */
import React from 'react';
import { jsx } from 'theme-ui';

export const HistoryContainer: React.FC = ({ children }) => {
  return <ul>{children}</ul>;
};

interface HistoryItemProps {
  year: number;
  body: string;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ year, body }) => {
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
        <>{year}年</>
      </dt>
      <dd sx={{ marginLeft: 72 }}>{body}</dd>
    </div>
  );
};
