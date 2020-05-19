module.exports = (sequelize, DataTypes) => {
  return sequelize.define('CompletedQualification', {
    approvedTime: {
      type: DataTypes.INTEGER
    },
	level: {
	  type: DataTypes.TINYINT,
	  allowNull: false,
	  defaultValue: 0
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