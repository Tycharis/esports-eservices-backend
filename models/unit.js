module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Unit', {
    charter: {
      type: DataTypes.TEXT,
      unique: true
    },
    name: {
      type: DataTypes.TEXT,
      unique: true
    },
    parent: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Units',
        key: 'id'
      }
    }
  });
};
