'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pago_cuenta_cobrar', {
      id_pago: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_cuenta_cobrar: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'cuenta_por_cobrar',
            schema: 'contabilidad'
          },
          key: 'id_cuenta_cobrar'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      id_metodo_pago: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'metodo_pago',
            schema: 'catalogo'
          },
          key: 'id_metodo_pago'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      id_usuario_registro: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'usuario',
            schema: 'seguridad'
          },
          key: 'id_usuario'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      monto_pago: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      fecha_pago: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      referencia_pago: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      fecha_registro: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }, {
      schema: 'contabilidad'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'pago_cuenta_cobrar', schema: 'contabilidad' });
  }
};
