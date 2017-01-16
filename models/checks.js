"use strict";

module.exports = function(sequelize, DataTypes) {
  var checks = sequelize.define('checks', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: DataTypes.INTEGER,
    locationId: DataTypes.INTEGER,
    late: DataTypes.INTEGER,
    io: DataTypes.INTEGER
  },{
    classMethods: {
      associate: function(models) {
        // Using additional options like CASCADE etc for demonstration
        // Can also simply do Task.belongsTo(models.User);
        checks.belongsTo(models.users, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
        checks.belongsTo(models.locations, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  });
  return checks;
};
