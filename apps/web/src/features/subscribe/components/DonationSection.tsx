import { SubscribeSection } from './SubscribeSection';

export function DonationSection() {
  return (
    <SubscribeSection heading="お布施">
      <p className="text-base text-cutout-readable">
        え、ぼくを信仰してる？
        <br />
        特に何の関係もないのですが、
        <a
          href="https://www.amazon.jp/hz/wishlist/ls/1ILW0SXR5ZNR6?ref_=wl_share"
          target="_blank"
          rel="noreferrer"
          className="text-cutout-hole underline decoration-cutout-hole underline-offset-4 hover:text-cutout-hole"
        >
          これ
        </a>
        はAmazonのほしい物リストです。
        <br />
        そして余談ですが、誕生日は7月10日です。
      </p>
    </SubscribeSection>
  );
}
