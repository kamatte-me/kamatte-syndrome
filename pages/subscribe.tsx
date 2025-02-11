import type { NextPage } from 'next';
import Image from 'next/image';
import { BreadcrumbJsonLd, NextSeo } from 'next-seo';
import { Box, Container, Flex, Heading, Link, Paragraph, Text } from 'theme-ui';

import { author, baseUrl } from '@/constants/site';

const PAGE_TITLE = 'Subscribe';

const CulturePage: NextPage = () => {
  return (
    <>
      <NextSeo
        description={`${author}を信仰する`}
        title={PAGE_TITLE}
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
              <Box sx={{ mb: 1 }}>
                <Image
                  priority
                  alt="友だち追加QRコード"
                  height={160}
                  src="https://qr-official.line.me/gs/M_200qygmw_GW.png"
                  width={160}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                  }}
                />
              </Box>
              <Box>
                <a href="https://lin.ee/ZsmmUMP">
                  <Image
                    alt="友だち追加"
                    height={36}
                    quality={100}
                    src="https://scdn.line-apps.com/n/line_add_friends/btn/ja.png"
                    width={120}
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      objectFit: 'contain',
                    }}
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
            rel="noreferrer"
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
