const { Posts, sequelize } = require('../models');

const posts = async () => {
  const posts = await Posts.findAll({ order: [['id', 'DESC']] });
  return posts;
}

module.exports = { posts }