const { ApolloServer, gql } = require('apollo-server');
const resolvers = require('../resolvers');
const { pubSub } = require('./pubSub');

const port = process.env.PORT || 4000;

const typeDefs = gql`
  type Post {
    title: String!
    link: String!
    imageUrl: String
    id: ID!
  }
  type Query {
    posts: [Post]
  }
  type Mutation {
    addPost(title: String!, link: String!, imageUrl: String!): ID
    editPost(id: ID!, title: String!, link: String!, imageUrl: String!): Post
    deletePost(id: ID!): ID
  }
  type Subscription {
    postAdded: Post
    postEdited: Post
    postDeleted: ID
  }
`;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: request => {
    return {
      ...request,
      pubSub
    };
  },
});

server.listen({port}, () => console.log(`Server is running at http://localhost:${port}`))