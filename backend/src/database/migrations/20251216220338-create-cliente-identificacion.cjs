'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cliente_identificacion', {
      id_cliente_identificacion: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_cliente: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'cliente',
            schema: 'ventas'
          },
          key: 'id_cliente'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_tipo_identificacion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'tipo_identificacion',
            schema: 'catalogo'
          },
          key: 'id_tipo_identificacion'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      identificacion: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      es_principal: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    }, {
      schema: 'ventas'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'cliente_identificacion', schema: 'ventas' });
  }
};
