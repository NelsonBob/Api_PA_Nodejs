'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.User.belongsToMany(models.Publication, {
        through: models.Like,
        foreignKey: 'userId',
        otherKey: 'publicationId',
      });

      models.Publication.belongsToMany(models.User, {
        through: models.Like,
        foreignKey: 'publicationId',
        otherKey: 'userId',
      });

      models.Like.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });

      models.Like.belongsTo(models.Publication, {
        foreignKey: 'publicationId',
        as: 'publication',
      });
    }
  }
  Like.init({
    publicationId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Publication',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    isLike: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Like',
  });
  return Like;
};