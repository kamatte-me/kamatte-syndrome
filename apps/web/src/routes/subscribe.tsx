import { createFileRoute } from '@tanstack/react-router';
import PageMain from '@/components/layouts/PageMain';
import { author } from '@/constants/site';

const PAGE_TITLE = 'Subscribe';

export const Route = createFileRoute('/subscribe')({
  head: () => ({
    meta: [
      {
        title: `${PAGE_TITLE} | kamatte syndrome`,
      },
      {
        name: 'description',
        content: `${author}を信仰する`,
      },
    ],
  }),
  component: SubscribePage,
});

function SubscribePage() {
  return (
    <PageMain>
      <section className="border-cutout-hole border-b pb-8">
        <div className="grid gap-5">
          <div>
            <h1 className="font-display font-normal text-5xl leading-none sm:text-6xl">
              Subscribe
            </h1>
          </div>
        </div>
      </section>

      <section className="border border-cutout-hole p-7 sm:p-9">
        <h2 className="mb-6 font-bold text-4xl leading-tight sm:text-5xl">
          LINE公式アカウント
        </h2>

        <div className="grid gap-6 md:grid-cols-[180px_1fr] md:items-start">
          <div className="flex flex-col items-center gap-3">
            <img
              src="https://qr-official.line.me/gs/M_200qygmw_GW.png"
              alt="友だち追加QRコード"
              width={160}
              height={160}
              loading="eager"
              className="size-40 object-contain"
            />
            <a
              href="https://lin.ee/ZsmmUMP"
              className="inline-flex hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-hole"
            >
              <img
                src="https://scdn.line-apps.com/n/line_add_friends/btn/ja.png"
                alt="友だち追加"
                width={120}
                height={36}
                className="h-9 w-[120px] object-contain"
              />
            </a>
          </div>

          <div className="text-base text-cutout-readable leading-8 md:pt-2">
            <p className="mb-4">
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
      </section>

      <section className="border border-cutout-hole p-7 sm:p-9">
        <h2 className="mb-5 font-bold text-4xl leading-tight sm:text-5xl">
          お布施
        </h2>
        <p className="text-base text-cutout-readable leading-8">
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
      </section>
    </PageMain>
  );
}
