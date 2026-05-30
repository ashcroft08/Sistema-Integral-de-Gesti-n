'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const schema = 'cacao';

        // 1. Add index to 'compra_general(id_periodo_compra)'
        await queryInterface.addIndex(
            { tableName: 'compra_general', schema },
            ['id_periodo_compra'],
            {
                name: 'idx_compra_general_periodo',
                concurrently: false // concurrently is false by default in standard migrations unless configured
            }
        );

        // 2. Add index to 'compra_interna(id_periodo_compra)'
        await queryInterface.addIndex(
            { tableName: 'compra_interna', schema },
            ['id_periodo_compra'],
            {
                name: 'idx_compra_interna_periodo',
                concurrently: false
            }
        );
    },

    async down(queryInterface, Sequelize) {
        const schema = 'cacao';

        // 1. Remove index from 'compra_general'
        await queryInterface.removeIndex(
            { tableName: 'compra_general', schema },
            'idx_compra_general_periodo'
        );

        // 2. Remove index from 'compra_interna'
        await queryInterface.removeIndex(
            { tableName: 'compra_interna', schema },
            'idx_compra_interna_periodo'
        );
    }
};
