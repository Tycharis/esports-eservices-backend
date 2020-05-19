module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Registrant', {
    firstName: {
      type: DataTypes.TEXT,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.TEXT,
      field: 'last_name',
      allowNull: false
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    passwordHash: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    phone: {
      type: DataTypes.TEXT
    }
  });
};
