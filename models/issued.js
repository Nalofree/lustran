"use strict";

module.exports = function(sequelize, DataTypes) {
  var issued = sequelize.define('issued', {
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
        issued.belongsTo(models.users, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
        // issued.belongsTo(models.goods, {
        //   onDelete: "CASCADE",
        //   foreignKey: {
        //     allowNull: false
        //   }
        // });
        issued.belongsTo(models.locations, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
        // goods.hasMany(models.actions);
      }
    }
  });
  return issued;
};
