"use strict";

module.exports = function(sequelize, DataTypes) {
  var spicdate = sequelize.define('spicdate', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: DataTypes.INTEGER,
    // goodId: DataTypes.INTEGER,
    locationId: DataTypes.INTEGER,
    statusval: DataTypes.DATE,
    alias: DataTypes.TEXT,
    comment: DataTypes.TEXT
  },{
    classMethods: {
      associate: function(models) {
        spicdate.belongsTo(models.users, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
        // spicdate.belongsTo(models.goods, {
        //   onDelete: "CASCADE",
        //   foreignKey: {
        //     allowNull: false
        //   }
        // });
        spicdate.belongsTo(models.locations, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
        // goods.hasMany(models.actions);
      }
    }
  });
  return spicdate;
};
