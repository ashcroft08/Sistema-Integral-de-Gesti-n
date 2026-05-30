'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const schema = 'cacao';
        const tableName = 'periodo_compra';

        // Add 'trimestre' column
        await queryInterface.addColumn(
            { tableName, schema },
            'trimestre',
            {
                type: Sequelize.INTEGER,
                allowNull: true, // Allow null so existing records don't break
                validate: {
                    min: 1,
                    max: 4
                }
            }
        );

        // Add 'anio' column
        await queryInterface.addColumn(
            { tableName, schema },
            'anio',
            {
                type: Sequelize.INTEGER,
                allowNull: true
            }
        );
    },

    async down(queryInterface, Sequelize) {
        const schema = 'cacao';
        const tableName = 'periodo_compra';

        // Remove 'trimestre' column
        await queryInterface.removeColumn(
            { tableName, schema },
            'trimestre'
        );

        // Remove 'anio' column
        await queryInterface.removeColumn(
            { tableName, schema },
            'anio'
        );
    }
};
