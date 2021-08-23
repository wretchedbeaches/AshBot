import Sequelize, { DataTypes, Model, Optional } from 'sequelize';

export interface invasion_statsAttributes {
  date: string;
  grunt_type: number;
  count: number;
}

export type invasion_statsPk = "date" | "grunt_type";
export type invasion_statsId = invasion_stats[invasion_statsPk];
export type invasion_statsCreationAttributes = Optional<invasion_statsAttributes, invasion_statsPk>;

export class invasion_stats extends Model<invasion_statsAttributes, invasion_statsCreationAttributes> implements invasion_statsAttributes {
  date!: string;
  grunt_type!: number;
  count!: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof invasion_stats {
    invasion_stats.init({
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      primaryKey: true
    },
    grunt_type: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'invasion_stats',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "date" },
          { name: "grunt_type" },
        ]
      },
    ]
  });
  return invasion_stats;
  }
}
