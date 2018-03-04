import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

export default () => {
  const httpLink = new HttpLink({ uri: 'https://api.graphcms.com/simple/v1/kamatte' });

  // middleware
  const middlewareLink = new ApolloLink((operation, forward) => {
    const token = process.env.graphCmsToken;

    operation.setContext({
      headers: { authorization: `Bearer ${token}` },
    });
    return forward(operation);
  });
  const link = middlewareLink.concat(httpLink);

  return {
    link,
    cache: new InMemoryCache(),
  };
};
