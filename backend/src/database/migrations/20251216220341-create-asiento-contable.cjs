'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('asiento_contable', {
      id_asiento: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fecha_asiento: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      glosa: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      tipo_asiento: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      id_factura: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      id_contador: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      estado: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      total_debe: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      total_haber: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      }
    }, {
      schema: 'contabilidad'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'asiento_contable', schema: 'contabilidad' });
  }
};
