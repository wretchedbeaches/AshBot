import Sequelize, { DataTypes, Model, Optional } from 'sequelize';
import type { device, deviceCreationAttributes, deviceId } from './device';

export interface accountAttributes {
  username: string;
  password: string;
  first_warning_timestamp?: number;
  failed_timestamp?: number;
  failed?: string;
  level: number;
  last_encounter_lat?: number;
  last_encounter_lon?: number;
  last_encounter_time?: number;
  spins: number;
  creation_timestamp?: number;
  warn?: number;
  warn_expire_timestamp?: number;
  warn_message_acknowledged?: number;
  suspended_message_acknowledged?: number;
  was_suspended?: number;
  banned?: number;
  last_used_timestamp?: number;
  group?: string;
}

export type accountPk = "username";
export type accountId = account[accountPk];
export type accountCreationAttributes = Optional<accountAttributes, accountPk>;

export class account extends Model<accountAttributes, accountCreationAttributes> implements accountAttributes {
  username!: string;
  password!: string;
  first_warning_timestamp?: number;
  failed_timestamp?: number;
  failed?: string;
  level!: number;
  last_encounter_lat?: number;
  last_encounter_lon?: number;
  last_encounter_time?: number;
  spins!: number;
  creation_timestamp?: number;
  warn?: number;
  warn_expire_timestamp?: number;
  warn_message_acknowledged?: number;
  suspended_message_acknowledged?: number;
  was_suspended?: number;
  banned?: number;
  last_used_timestamp?: number;
  group?: string;

  // account hasOne device
  device!: device;
  getdevice!: Sequelize.HasOneGetAssociationMixin<device>;
  setdevice!: Sequelize.HasOneSetAssociationMixin<device, deviceId>;
  createdevice!: Sequelize.HasOneCreateAssociationMixin<deviceCreationAttributes>;

  static initModel(sequelize: Sequelize.Sequelize): typeof account {
    account.init({
    username: {
      type: DataTypes.STRING(32),
      allowNull: false,
      primaryKey: true
    },
    password: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    first_warning_timestamp: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    failed_timestamp: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    failed: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    level: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    last_encounter_lat: {
      type: DataTypes.DOUBLE(18,14),
      allowNull: true
    },
    last_encounter_lon: {
      type: DataTypes.DOUBLE(18,14),
      allowNull: true
    },
    last_encounter_time: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    spins: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    creation_timestamp: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    warn: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    warn_expire_timestamp: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    warn_message_acknowledged: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    suspended_message_acknowledged: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    was_suspended: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    banned: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    last_used_timestamp: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    group: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'account',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "username" },
        ]
      },
    ]
  });
  return account;
  }
}
