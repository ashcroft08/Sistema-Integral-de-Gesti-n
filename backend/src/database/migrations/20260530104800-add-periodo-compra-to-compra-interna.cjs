'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const schema = 'cacao';
        const tableName = 'compra_interna';

        // Add 'id_periodo_compra' column to 'compra_interna'
        await queryInterface.addColumn(
            { tableName, schema },
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
                onDelete: 'SET NULL' // Set null so deleting a period doesn't force cascade delete on DW unless preferred
            }
        );
    },

    async down(queryInterface, Sequelize) {
        const schema = 'cacao';
        const tableName = 'compra_interna';

        // Remove column 'id_periodo_compra' from 'compra_interna'
        await queryInterface.removeColumn(
            { tableName, schema },
            'id_periodo_compra'
        );
    }
};
