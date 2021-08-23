import Sequelize, { DataTypes, Model, Optional } from 'sequelize';
import type { user, userId } from './user';

export interface tokenAttributes {
  token: string;
  type: any;
  username: string;
  expire_timestamp: number;
}

export type tokenPk = "token";
export type tokenId = token[tokenPk];
export type tokenCreationAttributes = Optional<tokenAttributes, tokenPk>;

export class token extends Model<tokenAttributes, tokenCreationAttributes> implements tokenAttributes {
  token!: string;
  type!: any;
  username!: string;
  expire_timestamp!: number;

  // token belongsTo user
  user!: user;
  getuser!: Sequelize.BelongsToGetAssociationMixin<user>;
  setuser!: Sequelize.BelongsToSetAssociationMixin<user, userId>;
  createuser!: Sequelize.BelongsToCreateAssociationMixin<user>;

  static initModel(sequelize: Sequelize.Sequelize): typeof token {
    token.init({
    token: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: "ENUM('confirm_email','reset_password')",
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(32),
      allowNull: false,
      references: {
        model: 'user',
        key: 'username'
      }
    },
    expire_timestamp: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'token',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "token" },
        ]
      },
      {
        name: "fk_tokem_username",
        using: "BTREE",
        fields: [
          { name: "username" },
        ]
      },
      {
        name: "ix_expire_timestamp",
        using: "BTREE",
        fields: [
          { name: "expire_timestamp" },
        ]
      },
    ]
  });
  return token;
  }
}
