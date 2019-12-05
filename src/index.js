const { GraphQLServer } = require('graphql-yoga');
const resolvers = require('../resolvers');
const { pubSub } = require('./pubSub');

const typeDefs = `
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

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context: request => {
    return {
      ...request,
      pubSub
    };
  },
});

server.start(() => console.log(`Server is running at http://localhost:4000`))