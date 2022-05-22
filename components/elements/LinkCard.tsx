import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Box, Flex, Grid, Spinner } from 'theme-ui';

import { EarthIcon, NotSupportedIcon } from '@/components/elements/Icon';
import { formatDate } from '@/lib/date';
import { EmbedApiResponse } from '@/pages/api/embed';

export const LinkCard: React.FC<{ url: string }> = ({ url }) => {
  const [isLoading, serIsLoading] = useState<boolean>(true);
  const [error, serError] = useState<Error | null>(null);
  const [metadata, setMetadata] = useState<EmbedApiResponse | null>(null);

  useEffect(() => {
    fetch(`/api/embed?url=${encodeURIComponent(url)}`)
      .then(res => {
        if (res.status > 300) {
          throw new Error(`Response error: ${res.status}`);
        }
        res.json().then((json: EmbedApiResponse) => setMetadata(json));
      })
      .catch(err => {
        serError(err);
      })
      .finally(() => serIsLoading(false));
  }, [url]);

  return (
    <Box
      my={3}
      variant="styles.a"
      sx={{
        color: 'inherit',
        textDecoration: 'inherit',
        borderRadius: 8,
        border: '1px solid',
        borderColor: 'gray',
      }}
    >
      <a href={url} target="_blank" rel="noreferrer" sx={{ height: '100%' }}>
        <Grid
          sx={{
            gap: 3,
            gridTemplateColumns: ['100px 1fr', '120px 1fr', '140px 1fr'],
            padding: 3,
          }}
        >
          <Box
            sx={{
              height: [100, 120, 140],
            }}
          >
            {isLoading || error ? (
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
                  error && <NotSupportedIcon size={32} sx={{ color: 'gray' }} />
                )}
              </Flex>
            ) : (
              metadata && (
                <Image
                  src={metadata.image || metadata.logo}
                  alt={metadata.title}
                  objectFit="cover"
                  width={160}
                  height={160}
                  unoptimized
                />
              )
            )}
          </Box>

          <Flex
            sx={{ flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <Box sx={{ marginBottom: 2 }}>
              <Box
                sx={{
                  fontWeight: 'bold',
                  fontSize: [1, 2],
                  lineHeight: 1.3,
                  marginBottom: [1, 1, 2],
                  display: '-webkit-box',
                  WebkitLineClamp: ['2', '2', '3'],
                  textOverflow: 'ellipsis',
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {(metadata && metadata.title) || url}
              </Box>
              {metadata && metadata.description && (
                <p
                  sx={{
                    color: 'darkgray',
                    fontSize: ['10px', 1],
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: '2',
                    textOverflow: 'ellipsis',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {metadata.description}
                </p>
              )}
            </Box>

            <Flex
              sx={{
                fontSize: ['12px', 1],
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
                  width: [14, 16, 18],
                  height: [14, 16, 18],
                  marginRight: '4px',
                  flexShrink: 0,
                }}
              >
                {metadata ? (
                  <Image
                    src={metadata.logo}
                    alt={metadata.title}
                    objectFit="contain"
                    width={18}
                    height={18}
                    unoptimized
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
              <Box
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: '1',
                  textOverflow: 'ellipsis',
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                <span>
                  {(metadata && metadata.publisher) || new URL(url).host}
                </span>
                {metadata && metadata.date && (
                  <span
                    sx={{
                      display: ['none', 'inline', 'inline'],
                    }}
                  >
                    {formatDate(metadata.date)}
                  </span>
                )}
                {metadata && metadata.author && (
                  <span
                    sx={{
                      display: ['none', 'inline', 'inline'],
                    }}
                  >
                    {metadata.author}
                  </span>
                )}
              </Box>
            </Flex>
          </Flex>
        </Grid>
      </a>
    </Box>
  );
};
