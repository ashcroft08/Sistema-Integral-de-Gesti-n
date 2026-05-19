'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const schemas = [
            'seguridad',
            'configuracion',
            'auditoria'
        ];

        for (const schema of schemas) {
            await queryInterface.sequelize.query(`CREATE SCHEMA IF NOT EXISTS ${schema};`);
        }
    },

    async down(queryInterface, Sequelize) {
        const schemas = [
            'auditoria',
            'configuracion',
            'seguridad'
        ];

        for (const schema of schemas) {
            await queryInterface.sequelize.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE;`);
        }
    }
};
