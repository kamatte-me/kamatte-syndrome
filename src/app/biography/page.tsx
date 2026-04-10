import Image from 'next/image';

const Biography: React.FC = () => {
  return (
    <main>
      <Image
        src="/avatar.svg"
        alt="kamatte"
        width={180}
        height={180}
        priority
      />
      kamatte
      <div>
        <h2>ステータス</h2>
      </div>
    </main>
  );
};

export default Biography;
