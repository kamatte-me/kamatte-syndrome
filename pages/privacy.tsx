import { BreadcrumbJsonLd, NextSeo } from 'next-seo';
import React from 'react';
import { Box, Container, Heading, Link, Paragraph } from 'theme-ui';

import { baseUrl, siteName } from '@/constants/site';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      <NextSeo
        title="プライバシーポリシー"
        description={`${siteName}のプライバシーポリシー`}
      />
      <BreadcrumbJsonLd
        itemListElements={[
          {
            position: 1,
            name: 'プライバシーポリシー',
            item: `${baseUrl}/privacy`,
          },
        ]}
      />

      <Container variant="narrowContainer">
        <Heading as="h1" sx={{ fontSize: 5, mb: 4 }}>
          プライバシーポリシー
        </Heading>
        <Box>
          <Heading as="h2" sx={{ fontSize: 4, mb: 3 }}>
            アクセス解析ツールについて
          </Heading>
          <Paragraph>
            当サイトでは、Googleの提供するアクセス解析サービス「Googleアナリティクス」を使用しています。
            <br />
            これにはデータ収集のためにCookieを使用しますが、このデータは匿名で収集されており、個人を特定するものではありません。
            <br />
            Googleアナリティクスのデータ収集、処理の仕組みについては、「
            <Link href="https://policies.google.com/technologies/partner-sites">
              Google のサービスを使用するサイトやアプリから収集した情報の Google
              による使用
            </Link>
            」のページを参照下さい。
            <br />
            なお、この機能はCookieを無効にすることで収集を拒否することが可能ですので、お使いのブラウザの設定をご確認ください。
          </Paragraph>

          <Heading as="h2" sx={{ fontSize: 4, mb: 3, mt: 4 }}>
            Amazonアソシエイトについて
          </Heading>
          <Paragraph>
            Amazonのアソシエイトとして、当サイトは適格販売により収入を得ています。
          </Paragraph>
        </Box>
      </Container>
    </>
  );
};

export default PrivacyPolicyPage;
