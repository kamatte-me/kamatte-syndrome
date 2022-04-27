import { keyframes } from '@emotion/react';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import { MdClose, MdRefresh } from 'react-icons/md';
import { Alert, IconButton } from 'theme-ui';

export const PreviewControl: React.FC = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const load = useCallback(() => {
    router.replace(router.asPath, undefined, {
      scroll: false,
    });
  }, [router]);

  useEffect(() => {
    const id = setTimeout(load, 15000);
    return () => {
      clearTimeout(id);
    };
  }, [load]);

  useEffect(() => {
    const start = () => {
      setIsLoading(true);
    };
    const done = () => {
      setIsLoading(false);
    };

    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', done);
    router.events.on('routeChangeError', done);
    return () => {
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', done);
      router.events.off('routeChangeError', done);
    };
  }, [router]);

  const loadingAnimation = keyframes`
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  `;

  return (
    <Alert
      sx={{
        position: 'fixed',
        bottom: 3,
        right: 3,
        zIndex: 5,
        fontFamily: 'heading',
        lineHeight: 1,
      }}
    >
      プレビュー
      <IconButton
        onClick={load}
        title="更新"
        ml={1}
        disabled={isLoading}
        sx={
          isLoading
            ? {
                animation: `${loadingAnimation} 0.8s linear infinite`,
              }
            : {
                ':hover': {
                  color: 'secondary',
                },
              }
        }
      >
        <MdRefresh
          sx={{
            width: 28,
            height: 28,
          }}
        />
      </IconButton>
      <IconButton
        onClick={() => {
          // eslint-disable-next-line no-alert
          const ok = window.confirm('プレビューモードを解除するぅ？');
          if (ok) {
            fetch('/api/clearPreviewData').then(() => {
              router.reload();
            });
          }
        }}
        title="解除"
        sx={{
          ':hover': {
            color: 'secondary',
          },
        }}
      >
        <MdClose
          sx={{
            width: 28,
            height: 28,
          }}
        />
      </IconButton>
    </Alert>
  );
};
