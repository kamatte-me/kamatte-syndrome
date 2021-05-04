/** @jsxRuntime classic */
/** @jsx jsx * */
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import React from 'react';
import { jsx } from 'theme-ui';

import { ListItem } from '@/components/pages/blog/ListItem';
import { getContents } from '@/lib/microcms';
import { Blog } from '@/lib/microcms/model';

export const getStaticProps: GetStaticProps<{
  posts: Blog[];
}> = async () => {
  const posts = await getContents<Blog>('blog', {
    orders: 'year',
    limit: 5,
  });

  return {
    props: {
      posts,
    },
  };
};

const BlogPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = ({
  posts,
}) => {
  return (
    <>
      {posts.map(post => (
        <ListItem post={post} />
      ))}
    </>
  );
};

export default BlogPage;
