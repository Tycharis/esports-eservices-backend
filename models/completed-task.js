module.exports = (sequelize, DataTypes) => {
  return sequelize.define('CompletedTask', {
    approvedTime: {
      type: DataTypes.INTEGER
    },
    evaluatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Members',
        key: 'id'
      }
    }
  });
};