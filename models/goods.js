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
    orderId: DataTypes.INTEGER,
    // processedId: DataTypes.INTEGER,
    // spicdateId: DataTypes.INTEGER,
    // orderedId: DataTypes.INTEGER,
    // postponedId: DataTypes.INTEGER,
    // callstatusId: DataTypes.INTEGER,
    // issuedId: DataTypes.INTEGER
  },{
    classMethods: {
      associate: function(models) {
        goods.belongsTo(models.orders, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
        // goods.belongsTo(models.locations, {
        //   onDelete: "CASCADE",
        //   foreignKey: {
        //     allowNull: false
        //   }
        // });
        // goods.hasOne(models.actions, {as: 'procaction', foreignKey : 'processedId'});
      }
    }
  });
  return goods;
};
