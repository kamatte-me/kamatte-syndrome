import { NextPage } from 'next';

import { SEO } from '@/components/elements/SEO';

const Custom404: NextPage = () => {
  return (
    <>
      <SEO title="404 Not Found" />
      <h1>404 - Page Not Found</h1>
    </>
  );
};

export default Custom404;
