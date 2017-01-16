"use strict";

module.exports = function(sequelize, DataTypes) {
  var users = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: DataTypes.TEXT,
    pin: DataTypes.TEXT,
    status: DataTypes.TEXT,
    active: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
  });
  return users;
};
