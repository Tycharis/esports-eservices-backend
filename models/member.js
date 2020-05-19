module.exports = (sequelize, DataTypes) => {
  let Member = sequelize.define('Member', {
    firstName: {
      type: DataTypes.TEXT,
    },
    lastName: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    email: {
      type: DataTypes.TEXT,
      unique: true,
      allowNull: false
    },
    passwordHash: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    phone: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    grade: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    leadership: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    }
  });

  Member.associate = models => {
    Member.belongsTo(models.Unit);
    Member.belongsToMany(models.Task, {through: models.CompletedTask});
    Member.belongsToMany(models.Qualification, {through: models.CompletedQualification});
  }

  return Member;
};
