"use strict";

module.exports = function(sequelize, DataTypes) {
  var callstatus = sequelize.define('callstatus', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: DataTypes.INTEGER,
    // goodId: DataTypes.INTEGER,
    locationId: DataTypes.INTEGER,
    statusval: DataTypes.INTEGER,
    alias: DataTypes.TEXT,
    comment: DataTypes.TEXT
  },{
    classMethods: {
      associate: function(models) {
        callstatus.belongsTo(models.users, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
        // callstatus.belongsTo(models.goods, {
        //   onDelete: "CASCADE",
        //   foreignKey: {
        //     allowNull: false
        //   }
        // });
        callstatus.belongsTo(models.locations, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
        // goods.hasMany(models.actions);
      }
    }
  });
  return callstatus;
};
