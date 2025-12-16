'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('configuracion_sri', {
      id_configuracion: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ambiente: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      tipo_emision: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      razon_social: {
        type: Sequelize.STRING(300),
        allowNull: false
      },
      nombre_comercial: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      ruc: {
        type: Sequelize.STRING(13),
        allowNull: false
      },
      establecimiento: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: '001'
      },
      punto_emision: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: '001'
      },
      direccion_matriz: {
        type: Sequelize.STRING(300),
        allowNull: false
      },
      obligado_contabilidad: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      contribuyente_especial: {
        type: Sequelize.STRING(5),
        allowNull: true
      },
      url_recepcion: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      url_autorizacion: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
    await queryInterface.dropTable({ tableName: 'configuracion_sri', schema: 'configuracion' });
  }
};
