module.exports = (sequelize, DataTypes) => {
  let Qualification = sequelize.define('Qualification', {
    code: {
      type: DataTypes.TEXT,
      unique: true
    },
    name: {
      type: DataTypes.TEXT,
      unique: true
    }
  });

  Qualification.associate = models => {
    Qualification.belongsToMany(models.Member, {through: models.CompletedQualification});
    Qualification.belongsToMany(models.Task, {through: models.Requirements});
  }

  return Qualification;
};
