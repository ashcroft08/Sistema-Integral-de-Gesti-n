'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cuenta_por_cobrar', {
      id_cuenta_cobrar: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_factura: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'factura',
            schema: 'ventas'
          },
          key: 'id_factura'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
        onDelete: 'RESTRICT'
      },
      monto_total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      monto_pagado: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      saldo_pendiente: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      fecha_emision: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      fecha_vencimiento: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      dias_vencidos: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      estado: {
        type: Sequelize.ENUM('PENDIENTE', 'PAGADA', 'VENCIDA', 'PARCIAL'),
        allowNull: false,
        defaultValue: 'PENDIENTE'
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
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
      schema: 'contabilidad'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'cuenta_por_cobrar', schema: 'contabilidad' });
  }
};
