"use strict";

module.exports = function(sequelize, DataTypes) {
  var goods = sequelize.define('goods', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: DataTypes.TEXT,
    vencode: DataTypes.TEXT,
    num: DataTypes.INTEGER,
    inddate: DataTypes.DATE,
    prepay: DataTypes.TEXT,
    active: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    reject: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    orderId: DataTypes.INTEGER,
    processedId: DataTypes.INTEGER,
    spicdateId: DataTypes.INTEGER,
    orderedId: DataTypes.INTEGER,
    postponedId: DataTypes.INTEGER,
    callstatusId: DataTypes.INTEGER,
    issuedId: DataTypes.INTEGER
  },{
    classMethods: {
      associate: function(models) {
        goods.belongsTo(models.orders, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
        goods.belongsTo(models.processed);
        goods.belongsTo(models.spicdate);
        goods.belongsTo(models.ordered);
        goods.belongsTo(models.postponed);
        goods.belongsTo(models.callstatus);
        goods.belongsTo(models.issued);
      }
    }
  });
  return goods;
};
