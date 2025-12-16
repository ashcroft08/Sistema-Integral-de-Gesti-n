'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('plan_cuenta', {
      id_cuenta: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      codigo_cuenta: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      nombre_cuenta: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      tipo_cuenta: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      id_cuenta_padre: {
        type: Sequelize.INTEGER,
        allowNull: true,
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
      nivel: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      permitir_movimientos: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      activa: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      }
    }, {
      schema: 'contabilidad'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'plan_cuenta', schema: 'contabilidad' });
  }
};
