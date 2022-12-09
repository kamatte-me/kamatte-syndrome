import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import { Box, Flex, Grid, Spinner, ThemeUIStyleObject } from 'theme-ui';

import { EarthIcon, NotSupportedIcon } from '@/components/elements/Icon';
import { formatDate } from '@/lib/date';
import { EmbedApiResponse } from '@/pages/api/embed';

const CARD_HEIGHTS: number[] = [128, 144, 180];

const TEXT_ELLIPSE_STYLE = (lines: number | number[]): ThemeUIStyleObject => ({
  display: '-webkit-box',
  WebkitLineClamp:
    typeof lines === 'number' ? lines.toString() : lines.map(l => l.toString()),
  textOverflow: 'ellipsis',
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

export const LinkCard: React.FC<{ url: string }> = ({ url }) => {
  const [isLoading, serIsLoading] = useState<boolean>(true);
  const [metadata, setMetadata] = useState<EmbedApiResponse | null>(null);

  const decodedURL = useMemo(() => decodeURIComponent(url), [url]);

  useEffect(() => {
    fetch(`/api/embed?url=${encodeURIComponent(url)}`)
      .then(res => {
        if (res.status > 300) {
          throw new Error(`Response error: ${res.status}`);
        }
        res.json().then((json: EmbedApiResponse) => setMetadata(json));
      })
      .finally(() => serIsLoading(false));
  }, [url]);

  return (
    <Box
      variant="styles.a"
      sx={{
        color: 'inherit',
        textDecoration: 'inherit',
        borderRadius: 8,
        border: '1px solid',
        borderColor: 'gray',
        overflow: 'hidden',
      }}
    >
      <a href={url} target="_blank" rel="noreferrer" sx={{ height: '100%' }}>
        <Grid
          sx={{
            gap: 0,
            gridTemplateColumns: CARD_HEIGHTS.map(h => `${h}px 1fr`),
            height: CARD_HEIGHTS,
          }}
        >
          <Flex
            sx={{
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'lightgray',
            }}
          >
            {isLoading ? (
              <Spinner color="gray" strokeWidth={3} />
            ) : (
              <>
                {metadata && (metadata.image || metadata.logo) ? (
                  <Image
                    src={metadata.image || metadata.logo!}
                    alt={metadata.title || decodedURL}
                    width={180}
                    height={180}
                    unoptimized
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <NotSupportedIcon size={32} sx={{ color: 'gray' }} />
                )}
              </>
            )}
          </Flex>

          <Box
            sx={{
              padding: [2, 3],
              borderLeft: '1px solid',
              borderColor: 'lightgray',
            }}
          >
            <Flex
              sx={{
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
              }}
            >
              <Box sx={{ marginBottom: 2 }}>
                <Box
                  sx={{
                    fontWeight: 'bold',
                    fontSize: [1, 2, 2],
                    lineHeight: 1.3,
                    marginBottom: [1, 1, 2],
                    ...TEXT_ELLIPSE_STYLE([3, 2, 3]),
                  }}
                >
                  {(metadata && metadata.title) || decodedURL}
                </Box>
                {metadata && metadata.description && (
                  <p
                    sx={{
                      color: 'darkgray',
                      fontSize: ['10px', 1],
                      lineHeight: 1.4,
                      ...TEXT_ELLIPSE_STYLE(2),
                    }}
                  >
                    {metadata.description}
                  </p>
                )}
              </Box>

              <Flex
                sx={{
                  fontSize: ['10px', 1],
                  alignItems: 'center',
                  lineHeight: 1,
                  'span + span': {
                    ':before': {
                      content: '""',
                      height: '100%',
                      width: 0,
                      border: '0.5px solid',
                      borderColor: 'gray',
                      margin: '0 8px',
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    width: [12, 16, 18],
                    height: [12, 16, 18],
                    marginRight: '4px',
                    flexShrink: 0,
                  }}
                >
                  {metadata && metadata.favicon ? (
                    <Image
                      src={metadata.favicon}
                      alt={metadata.title || decodedURL}
                      width={18}
                      height={18}
                      unoptimized
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <EarthIcon
                      size="100%"
                      sx={{
                        color: 'darkgray',
                      }}
                    />
                  )}
                </Box>
                <Box sx={TEXT_ELLIPSE_STYLE(1)}>
                  <span>
                    {(metadata && metadata.publisher) || new URL(url).host}
                  </span>
                  {metadata && (
                    <>
                      {metadata.date && (
                        <span
                          sx={{
                            display: ['none', 'inline'],
                          }}
                        >
                          {formatDate(metadata.date)}
                        </span>
                      )}
                      {metadata.author && (
                        <span
                          sx={{
                            display: ['none', 'inline'],
                          }}
                        >
                          {metadata.author}
                        </span>
                      )}
                    </>
                  )}
                </Box>
              </Flex>
            </Flex>
          </Box>
        </Grid>
      </a>
    </Box>
  );
};
