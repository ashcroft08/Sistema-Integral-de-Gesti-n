'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('configuracion_bloqueo', {
      id_config_bloqueo: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      intentos_maximos: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3
      },
      duracion_bloqueo_minutos: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 15
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
    await queryInterface.dropTable({ tableName: 'configuracion_bloqueo', schema: 'configuracion' });
  }
};
