import Sequelize, { DataTypes, Model, Optional } from 'sequelize';

export interface sessionsAttributes {
  session_id: string;
  expires: number;
  data?: string;
}

export type sessionsPk = "session_id";
export type sessionsId = sessions[sessionsPk];
export type sessionsCreationAttributes = Optional<sessionsAttributes, sessionsPk>;

export class sessions extends Model<sessionsAttributes, sessionsCreationAttributes> implements sessionsAttributes {
  session_id!: string;
  expires!: number;
  data?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof sessions {
    sessions.init({
    session_id: {
      type: DataTypes.STRING(128),
      allowNull: false,
      primaryKey: true
    },
    expires: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    data: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'sessions',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "session_id" },
        ]
      },
    ]
  });
  return sessions;
  }
}
