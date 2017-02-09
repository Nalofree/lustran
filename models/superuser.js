"use strict";

module.exports = function(sequelize, DataTypes) {
  var superusers = sequelize.define('superusers', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: DataTypes.TEXT,
    password: DataTypes.TEXT,
    key: DataTypes.TEXT 
    // name: DataTypes.TEXT,
    // pin: DataTypes.TEXT,
    // status: DataTypes.TEXT,
    // active: {
    //     type: DataTypes.INTEGER,
    //     defaultValue: 1
    // }
  });
  return superusers;
};
