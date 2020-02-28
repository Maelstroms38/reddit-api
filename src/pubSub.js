const { PostgresPubSub } = require('graphql-postgres-subscriptions');
const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'reddit_api_development';

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: process.env.DATABASE_URL ? true : false
});

client.connect();

const pubSub = new PostgresPubSub({ client });
pubSub.subscribe("error", console.error);

module.exports = { pubSub }