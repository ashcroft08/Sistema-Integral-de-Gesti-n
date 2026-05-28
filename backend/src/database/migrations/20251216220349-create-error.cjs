'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('error', {
      id_error: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fecha: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      modulo: {
        type: Sequelize.STRING
      },
      mensaje: {
        type: Sequelize.TEXT
      },
      detalle: {
        type: Sequelize.TEXT
      },
      id_usuario: {
        type: Sequelize.INTEGER
      },
      usuario_nombre: {
        type: Sequelize.STRING
      },
      ruta: {
        type: Sequelize.STRING
      },
      metodo: {
        type: Sequelize.STRING(10)
      },
      parametros: {
        type: Sequelize.JSONB
      },
      nivel: {
        type: Sequelize.STRING(20),
        defaultValue: 'ERROR'
      }
    }, {
      schema: 'auditoria'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'error', schema: 'auditoria' });
  }
};

