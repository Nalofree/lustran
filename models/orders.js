"use strict";

module.exports = function(sequelize, DataTypes) {
  var orders = sequelize.define('orders', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    number: DataTypes.TEXT,
    locationId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    active: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    customername: DataTypes.TEXT,
    customerphone: DataTypes.TEXT,
    comment: DataTypes.TEXT
  },{
    classMethods: {
      associate: function(models) {
        orders.belongsTo(models.users, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
        orders.belongsTo(models.locations, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
        orders.hasMany(models.goods);
        // orders.belongsToMany(models.goods, {through: 'ordersgoods'});
      }
    }
  });
  return orders;
};
