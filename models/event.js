module.exports = (sequelize, DataTypes) => {
  let Event = sequelize.define('Event', {
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    location: {
      type: DataTypes.TEXT
    },
    startTime: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    endTime: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  Event.associate = models => {
    Event.hasOne(models.CompletedTask)
  };

  return Event;
};