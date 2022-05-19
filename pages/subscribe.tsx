import Image from 'next/image';
import { BreadcrumbJsonLd, NextSeo } from 'next-seo';
import React from 'react';
import { Box, Container, Flex, Heading, Link, Paragraph, Text } from 'theme-ui';

import { author, baseUrl } from '@/constants/site';

const PAGE_TITLE = 'Subscribe';

const CulturePage: React.FC = () => {
  return (
    <>
      <NextSeo
        title={PAGE_TITLE}
        description={`${author}を信仰する`}
        openGraph={{
          title: PAGE_TITLE,
        }}
      />
      <BreadcrumbJsonLd
        itemListElements={[
          {
            position: 1,
            name: PAGE_TITLE,
            item: `${baseUrl}/subscribe`,
          },
        ]}
      />

      <Container variant="narrowContainer">
        <Box sx={{ mb: 5 }}>
          <Heading as="h1" sx={{ fontSize: 5, mb: 1 }}>
            LINE公式アカウント
          </Heading>
          <Flex
            sx={{
              flexDirection: ['column', 'row'],
              alignItems: ['center', 'flex-start'],
            }}
          >
            <Box sx={{ textAlign: 'center', mr: [0, 3], mb: [3, 0] }}>
              <Box>
                <Image
                  src="https://qr-official.line.me/sid/L/200qygmw.png"
                  alt="友だち追加QRコード"
                  objectFit="contain"
                  width={180}
                  height={180}
                  priority
                />
              </Box>
              <Box>
                <a href="https://lin.ee/ZsmmUMP">
                  <Image
                    src="https://scdn.line-apps.com/n/line_add_friends/btn/ja.png"
                    alt="友だち追加"
                    objectFit="contain"
                    width={120}
                    height={36}
                    quality={100}
                  />
                </a>
              </Box>
            </Box>
            <Box sx={{ flex: 1, mt: [0, 2], mb: [0, 3] }}>
              <Paragraph sx={{ mb: 2 }}>
                めったに更新されないことで一定の評価を得ているこのブログ。
                <br />
                でも更新されたらすぐ読みたい・・・
              </Paragraph>
              <Paragraph>
                そんなキミのために、LINEで
                <b>ブログの更新を通知</b>するぞ！！！
                <br />
                登録してライバルに差をつけろ！！！
                <br />
                ごくまれに限定のひとり言もあり〼。
              </Paragraph>
            </Box>
          </Flex>
        </Box>

        <Heading as="h1" sx={{ fontSize: 5, mb: 3 }}>
          お布施
        </Heading>
        <Text>
          え、ぼくを信仰してる？
          <br />
          特に何の関係もないのですが、
          <Link
            href="https://www.amazon.jp/hz/wishlist/ls/1ILW0SXR5ZNR6?ref_=wl_share"
            target="_blank"
          >
            これ
          </Link>
          はAmazonのほしい物リストです。
          <br />
          そして余談ですが、誕生日は7月10日です。
        </Text>
      </Container>
    </>
  );
};

export default CulturePage;
