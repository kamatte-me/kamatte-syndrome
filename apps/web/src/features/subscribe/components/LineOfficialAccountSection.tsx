import lineButtonImage from 'virtual:content-image?src=../assets/line_button.png&widths=120;240';
import lineQrImage from 'virtual:content-image?src=../assets/line_qr.png&widths=140;280';
import { ContentImage } from '@/components/ui/ContentImage';
import { SubscribeSection } from './SubscribeSection';

export function LineOfficialAccountSection() {
  return (
    <SubscribeSection heading="LINE公式アカウント">
      <div className="grid gap-6 md:grid-cols-[180px_1fr] md:items-start">
        <div className="flex flex-col items-center gap-3">
          <ContentImage
            image={lineQrImage}
            alt="友だち追加QRコード"
            width={140}
            height={140}
            sizes="140px"
            loading="eager"
            className="size-[140px] object-contain"
          />
          <a
            href="https://lin.ee/ZsmmUMP"
            className="inline-flex hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-hole"
          >
            <ContentImage
              image={lineButtonImage}
              alt="友だち追加"
              width={120}
              height={36}
              sizes="120px"
              loading="eager"
              className="h-9 w-[120px] object-contain"
            />
          </a>
        </div>

        <div className="grid gap-5 text-base text-cutout-readable">
          <p>
            めったに更新されないことで一定の評価を得ているこのブログ。
            <br />
            でも更新されたらすぐ読みたい・・・
          </p>
          <p>
            そんなキミのために、LINEで
            <b className="font-bold text-cutout-hole">ブログの更新を通知</b>
            するぞ！！！
            <br />
            登録してライバルに差をつけろ！！！
            <br />
            ごくまれに限定のひとり言もあり〼。
          </p>
        </div>
      </div>
    </SubscribeSection>
  );
}
