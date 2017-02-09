"use strict";

module.exports = function(sequelize, DataTypes) {
  var actions = sequelize.define('actions', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // number: DataTypes.INTEGER,
    locationId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    goodId: DataTypes.INTEGER,
    statusval: DataTypes.TEXT,
    alias: DataTypes.TEXT,
    comment: DataTypes.TEXT,
  },{
    classMethods: {
      associate: function(models) {
        actions.belongsTo(models.users, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
        actions.belongsTo(models.locations, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
        actions.belongsTo(models.goods, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  });
  return actions;
};
