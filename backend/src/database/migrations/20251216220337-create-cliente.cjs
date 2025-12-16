'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cliente', {
      id_cliente: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      apellido: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      es_empresa: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      celular: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      direccion: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      id_parroquia: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'parroquia',
            schema: 'catalogo'
          },
          key: 'id_parroquia'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      id_estado_cliente: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'estado_cliente',
            schema: 'catalogo'
          },
          key: 'id_estado_cliente'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
      schema: 'ventas'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'cliente', schema: 'ventas' });
  }
};
