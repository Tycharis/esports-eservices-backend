module.exports = (sequelize, DataTypes) => {
  let Task = sequelize.define('Task', {
    name: {
      type: DataTypes.TEXT
    },
    description: {
      type: DataTypes.TEXT
    }
  });

  Task.associate = models => {
    Task.belongsToMany(models.Qualification, {through: models.Requirements});
    Task.belongsToMany(models.Member, {through: models.CompletedTask});
  };

  return Task;
}