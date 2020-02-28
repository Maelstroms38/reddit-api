'use strict';
const faker = require('faker');

const posts = [...Array(100)].map((post) => (
  {
    title: faker.company.catchPhrase(),
    link: faker.internet.url(),
    imageUrl: "https://picsum.photos/200/200",
    createdAt: new Date(),
    updatedAt: new Date()
  }
))

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Posts', posts)
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
};
