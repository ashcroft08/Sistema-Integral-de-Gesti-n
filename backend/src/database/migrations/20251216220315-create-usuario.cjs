'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuario', {
      id_usuario: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_rol: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'rol',
            schema: 'seguridad'
          },
          key: 'id_rol'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      id_estado_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'estado_usuario',
            schema: 'seguridad'
          },
          key: 'id_estado_usuario'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      apellido: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      primer_ingreso: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      intentos_fallidos: {
        type: Sequelize.SMALLINT,
        defaultValue: 0
      },
      tiempo_bloqueo: {
        type: Sequelize.DATE,
        allowNull: true
      }
    }, {
      schema: 'seguridad'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'usuario', schema: 'seguridad' });
  }
};
