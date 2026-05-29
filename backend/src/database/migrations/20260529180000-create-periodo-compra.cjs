'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const schema = 'cacao';

        // 1. Create table 'periodo_compra'
        await queryInterface.createTable('periodo_compra', {
            id_periodo_compra: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            nombre: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            fecha_inicio: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            fecha_fin: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            descripcion: {
                type: Sequelize.STRING(250),
                allowNull: true
            },
            activo: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        }, { schema });

        // 2. Add column 'id_periodo_compra' to 'compra_general'
        await queryInterface.addColumn(
            { tableName: 'compra_general', schema },
            'id_periodo_compra',
            {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: {
                        tableName: 'periodo_compra',
                        schema
                    },
                    key: 'id_periodo_compra'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            }
        );
    },

    async down(queryInterface, Sequelize) {
        const schema = 'cacao';

        // 1. Remove column 'id_periodo_compra' from 'compra_general'
        await queryInterface.removeColumn(
            { tableName: 'compra_general', schema },
            'id_periodo_compra'
        );

        // 2. Drop table 'periodo_compra'
        await queryInterface.dropTable({ tableName: 'periodo_compra', schema });
    }
};
