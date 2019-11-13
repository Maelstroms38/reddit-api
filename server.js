const express = require('express')
const { ApolloServer, gql } = require('apollo-server-express')
const { execute, subscribe } = require('graphql')
const { createServer } = require('http')
const { makeExecutableSchema } = require('graphql-tools')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const { PostgresPubSub } = require('graphql-postgres-subscriptions')
const cors = require('cors');
const bodyParser = require('body-parser')
const { Client } = require('pg');

const { Posts, sequelize } = require('./models');
const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || 'localhost'
const DATABASE_URL = process.env.DATABASE_URL || 'reddit_api_development'

const typeDefs = gql`
  type Post { title: String!, link: String!, imageUrl: String, id: Int! }
  type Query { posts: [Post] }
  type Mutation { addPost(title: String!, link: String!, imageUrl: String!): Int }
  type Subscription { postAdded: Post }
`;

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: process.env.DATABASE_URL ? true : false,
});

client.connect();

const pubsub = new PostgresPubSub({client});

const resolvers = {
  Query: {
    posts: async () => {
      const posts = await Posts.findAll({order: [['id', 'DESC']]})
      return posts
    },
  },
  Mutation: {
    addPost: async (_, { title, link, imageUrl }) => {
      const post = await Posts.create({title, link, imageUrl});
      pubsub.publish("postAdded", { postAdded: { id: post.id, title, link, imageUrl } });
      return post.id;
    }
  },
  Subscription: {
	  postAdded: {
	    subscribe: () => pubsub.asyncIterator('postAdded')
	  }
  },
}

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const apolloServer = new ApolloServer({
	schema, 
	uploads: false,
  introspection: true,
	playground: {
	  endpoint: '/graphql',
	  settings: {
	    "editor.theme": "light"
	  }
  }
});

const app = express();
const server = createServer(app);

apolloServer.applyMiddleware({ app })
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())

server.listen({ port: PORT }, () => {
	new SubscriptionServer({
	  schema,
	  execute,
	  subscribe,
    keepAlive: 10000,
	}, {
	  server,
	  path: '/graphql'
	})
})

console.log(`🚀 Server listening on http://${HOST}:${PORT}${apolloServer.graphqlPath}`)
console.log(`🚀 Subscriptions ready at ws://${HOST}:${PORT}${apolloServer.subscriptionsPath}`)