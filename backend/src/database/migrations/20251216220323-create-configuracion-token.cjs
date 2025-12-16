'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('configuracion_token', {
      id_token: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tiempo_expiracion: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      fecha_creacion: {
        allowNull: false,
        type: Sequelize.DATE
      },
      fecha_actualizacion: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }, {
      schema: 'configuracion'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'configuracion_token', schema: 'configuracion' });
  }
};
