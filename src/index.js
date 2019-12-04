const { GraphQLServer } = require('graphql-yoga');
const { PostgresPubSub } = require('graphql-postgres-subscriptions');
const { Client } = require('pg');

const { Posts, sequelize } = require('../models');
const DATABASE_URL = process.env.DATABASE_URL || 'reddit_api_development';

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

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: process.env.DATABASE_URL ? true : false
});

client.connect();

const pubSub = new PostgresPubSub({ client });

const resolvers = {
  Query: {
    posts: async () => {
      const posts = await Posts.findAll({ order: [['id', 'DESC']] });
      return posts;
    }
  },
  Mutation: {
    addPost: async (_, { title, link, imageUrl }) => {
      const post = await Posts.create({ title, link, imageUrl });
      pubSub.publish('postAdded', {
        postAdded: { id: post.id, title, link, imageUrl }
      });
      return post.id;
    },
    editPost: async (_, { id, title, link, imageUrl }) => {
      const [updated] = await Posts.update(
        { title, link, imageUrl },
        {
          where: { id: id }
        }
      );
      if (updated) {
        const updatedPost = await Posts.findOne({ where: { id: id } });
        pubSub.publish('postEdited', { postEdited: updatedPost });
        return updatedPost;
      }
      return new Error('Post not updated');
    },
    deletePost: async (_, { id }) => {
      const deleted = await Posts.destroy({
        where: { id: id }
      });
      if (deleted) {
        pubSub.publish('postDeleted', { postDeleted: id });
        return id;
      }
      return new Error('Post not deleted');
    }
  },
  Subscription: {
    postAdded: {
      subscribe: () => pubSub.asyncIterator('postAdded')
    },
    postEdited: {
      subscribe: () => pubSub.asyncIterator('postEdited')
    },
    postDeleted: {
      subscribe: () => pubSub.asyncIterator('postDeleted')
    }
  }
};

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
