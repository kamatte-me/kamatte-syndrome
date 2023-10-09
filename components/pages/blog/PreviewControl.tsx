import { keyframes } from '@emotion/react';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import { MdClose, MdRefresh } from 'react-icons/md';
import { Alert, IconButton } from 'theme-ui';

const PreviewControl: React.FC = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const load = useCallback(() => {
    void router.replace(router.asPath, undefined, {
      scroll: false,
    });
  }, [router]);

  useEffect(() => {
    const id = setTimeout(() => {
      load();
    }, 15000);
    return () => {
      clearTimeout(id);
    };
  }, [load]);

  useEffect(() => {
    const start = (): void => {
      setIsLoading(true);
    };
    const done = (): void => {
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
        zIndex: 110,
        fontFamily: 'heading',
        lineHeight: 1,
      }}
    >
      プレビュー
      <IconButton
        disabled={isLoading}
        ml={1}
        onClick={load}
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
        title="更新"
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
          // eslint-disable-next-line no-alert -- 開発向け
          const ok = window.confirm('プレビューモードを解除するぅ？');
          if (ok) {
            void fetch('/api/clearPreviewData').then(() => {
              router.reload();
            });
          }
        }}
        sx={{
          ':hover': {
            color: 'secondary',
          },
        }}
        title="解除"
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

export default PreviewControl;
