import { createFileRoute } from '@tanstack/react-router';
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
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-4 py-12">
      <section className="rounded-3xl border border-white/12 bg-white/8 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur sm:p-9">
        <h1 className="mb-6 font-bold text-4xl leading-tight sm:text-5xl">
          LINE公式アカウント
        </h1>

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
              className="inline-flex transition hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"
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

          <div className="text-base text-white/82 leading-8 md:pt-2">
            <p className="mb-4">
              めったに更新されないことで一定の評価を得ているこのブログ。
              <br />
              でも更新されたらすぐ読みたい・・・
            </p>
            <p>
              そんなキミのために、LINEで
              <b className="font-bold text-white">ブログの更新を通知</b>
              するぞ！！！
              <br />
              登録してライバルに差をつけろ！！！
              <br />
              ごくまれに限定のひとり言もあり〼。
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/25 p-7 sm:p-9">
        <h2 className="mb-5 font-bold text-4xl leading-tight sm:text-5xl">
          お布施
        </h2>
        <p className="text-base text-white/82 leading-8">
          え、ぼくを信仰してる？
          <br />
          特に何の関係もないのですが、
          <a
            href="https://www.amazon.jp/hz/wishlist/ls/1ILW0SXR5ZNR6?ref_=wl_share"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-300 underline decoration-cyan-300/40 underline-offset-4 transition hover:text-cyan-100"
          >
            これ
          </a>
          はAmazonのほしい物リストです。
          <br />
          そして余談ですが、誕生日は7月10日です。
        </p>
      </section>
    </main>
  );
}
