"use strict";

module.exports = function(sequelize, DataTypes) {
  var processed = sequelize.define('processed', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: DataTypes.INTEGER,
    // goodId: DataTypes.INTEGER,
    locationId: DataTypes.INTEGER,
    statusval: DataTypes.INTEGER,
    alias: DataTypes.TEXT
  },{
    classMethods: {
      associate: function(models) {
        processed.belongsTo(models.users, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
        // processed.belongsTo(models.goods, {
        //   onDelete: "CASCADE",
        //   foreignKey: {
        //     allowNull: false
        //   }
        // });
        processed.belongsTo(models.locations, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
        // goods.hasMany(models.actions);
      }
    }
  });
  return processed;
};
