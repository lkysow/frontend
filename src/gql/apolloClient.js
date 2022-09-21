import {ApolloClient, createHttpLink, InMemoryCache} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';

let publicApiUrl = process.env.NEXT_PUBLIC_PUBLIC_API_URL
var lastLatency;

if (publicApiUrl === "") publicApiUrl = "http://localhost:8080"
if (publicApiUrl === "/") publicApiUrl = ""

const httpLink = createHttpLink({
  uri: `${publicApiUrl}/api`,
})

const authLink = setContext((_, { headers }) => {
  const token = JSON.parse(localStorage.getItem('token'))
  return {
    headers: {
      ...headers,
      Authorization: token ? `${token}` : "",
    }
  }
})

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
})

const queryFetcher = async (query) => {
  let t1 = window.performance.now();
  try {
    let result = await client.query({ query: query });
  } catch (e) {
    let t2 = window.performance.now();
    lastLatency = t2 - t1
    throw e
  }
  let t2 = window.performance.now();
  lastLatency = t2 - t1
  return result
}

const queryVarFetcher = async (q) => await client.query({
  query: q.query,
  variables: q.variables
});
const mutationFetcher = async (q) => await client.mutate({
  mutation: q.mutation,
  variables: q.variables
});
const getLatency = function() {
  return lastLatency
}

export {
  client,
  queryFetcher,
  queryVarFetcher,
  mutationFetcher,
    getLatency
};
