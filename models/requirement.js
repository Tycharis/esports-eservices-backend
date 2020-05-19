module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Requirements', {
    category: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    }
  });
}