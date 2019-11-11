'use strict';
module.exports = (sequelize, DataTypes) => {
  const Posts = sequelize.define('Posts', {
    title: DataTypes.STRING,
    link: DataTypes.STRING,
    imageUrl: DataTypes.STRING
  }, {});
  Posts.associate = function(models) {
    // associations can be defined here
  };
  return Posts;
};