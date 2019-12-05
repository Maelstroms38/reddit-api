const { pubSub } = require('../src/pubSub');

const postAdded = {
  subscribe: () => pubSub.asyncIterator('postAdded')
};
const postEdited = {
  subscribe: () => pubSub.asyncIterator('postEdited')
};
const postDeleted = {
  subscribe: () => pubSub.asyncIterator('postDeleted')
};

module.exports = { postAdded, postEdited, postDeleted }