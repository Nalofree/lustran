"use strict";

module.exports = function(sequelize, DataTypes) {
  var locations = sequelize.define('locations', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fullname: DataTypes.TEXT,
    opentime: DataTypes.TEXT,
    closetime: DataTypes.TEXT,
    password: DataTypes.TEXT,
    alias: DataTypes.TEXT,
    adres: DataTypes.TEXT
  });
  return locations;
};
