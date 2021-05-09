import React from 'react';
import { Box, Container, Heading, Link, Text } from 'theme-ui';

import { SEO } from '@/components/elements/SEO';
import { author } from '@/constants/site';

const CulturePage: React.FC = () => {
  return (
    <>
      <SEO title="Subscribe" description={`${author}を信仰する`} />
      <Container variant="narrowContainer">
        <Box sx={{ mb: 5 }}>
          <Heading as="h1" sx={{ fontSize: 5, mb: 2 }}>
            ブログの更新通知を受け取る
          </Heading>
          <Box sx={{ mb: 3 }}>
            めったに更新されないことで一定の評価を得ているこのブログ。
            <br />
            でも更新されたらすぐ読みたい・・・
            <br />
            そんなキミは通知を受け取ってライバルに差をつけろ！！！
            <br />
            ごくまれに通知限定のひとり言も配信するぞ！！！
          </Box>
        </Box>

        <Heading as="h1" sx={{ fontSize: 5, mb: 2 }}>
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
