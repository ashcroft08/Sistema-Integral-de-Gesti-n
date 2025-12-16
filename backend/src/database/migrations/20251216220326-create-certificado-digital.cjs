'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('certificado_digital', {
      id_certificado: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_empresa: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      nombre: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      certificado_encriptado: {
        type: Sequelize.BLOB,
        allowNull: false
      },
      iv: {
        type: Sequelize.BLOB,
        allowNull: false
      },
      password_encriptado: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      fecha_emision: {
        type: Sequelize.DATE,
        allowNull: false
      },
      fecha_expiracion: {
        type: Sequelize.DATE,
        allowNull: false
      },
      emisor: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      subido_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: {
            tableName: 'usuario',
            schema: 'seguridad'
          },
          key: 'id_usuario'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.dropTable({ tableName: 'certificado_digital', schema: 'configuracion' });
  }
};
