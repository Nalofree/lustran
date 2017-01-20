"use strict";

module.exports = function(sequelize, DataTypes) {
  var postponed = sequelize.define('postponed', {
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
        postponed.belongsTo(models.users, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
        // postponed.belongsTo(models.goods, {
        //   onDelete: "CASCADE",
        //   foreignKey: {
        //     allowNull: false
        //   }
        // });
        postponed.belongsTo(models.locations, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
        // goods.hasMany(models.actions);
      }
    }
  });
  return postponed;
};
