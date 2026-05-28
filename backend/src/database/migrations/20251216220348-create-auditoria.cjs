'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('auditoria', {
      id_auditoria: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fecha: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      accion: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT
      },
      id_usuario: {
        type: Sequelize.INTEGER
      },
      usuario_nombre: {
        type: Sequelize.STRING
      },
      tabla: {
        type: Sequelize.STRING
      },
      llave: {
        type: Sequelize.TEXT
      },
      valores_anteriores: {
        type: Sequelize.JSONB
      },
      valores_nuevos: {
        type: Sequelize.JSONB
      },
      ip_direccion: {
        type: Sequelize.STRING(45)
      },
      user_agent: {
        type: Sequelize.TEXT
      }
    }, {
      schema: 'auditoria'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'auditoria', schema: 'auditoria' });
  }
};

