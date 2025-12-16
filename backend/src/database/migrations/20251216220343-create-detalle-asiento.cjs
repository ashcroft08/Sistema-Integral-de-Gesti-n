'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('detalle_asiento', {
      id_detalle_asiento: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_asiento_contable: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'asiento_contable',
            schema: 'contabilidad'
          },
          key: 'id_asiento'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_plan_cuenta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'plan_cuenta',
            schema: 'contabilidad'
          },
          key: 'id_cuenta'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      debe: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      haber: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      }
    }, {
      schema: 'contabilidad'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'detalle_asiento', schema: 'contabilidad' });
  }
};
