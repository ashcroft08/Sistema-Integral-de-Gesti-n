'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const schema = 'cacao';
        const tableName = 'periodo_compra';

        // 1. Remove column 'activo'
        await queryInterface.removeColumn(
            { tableName, schema },
            'activo'
        );

        // 2. Add column 'estado' with default 'PENDIENTE'
        // In PostgreSQL, to add a CHECK constraint, we can specify a type or create a constraint explicitly.
        // Sequelize can define constraints easily.
        await queryInterface.addColumn(
            { tableName, schema },
            'estado',
            {
                type: Sequelize.STRING(20),
                allowNull: false,
                defaultValue: 'PENDIENTE',
                validate: {
                    isIn: [['PENDIENTE', 'APROBADO']]
                }
            }
        );

        // Let's add the check constraint explicitly in SQL to ensure integrity at database level
        await queryInterface.sequelize.query(
            `ALTER TABLE "${schema}"."${tableName}" ADD CONSTRAINT chk_periodo_compra_estado CHECK (estado IN ('PENDIENTE', 'APROBADO'))`
        );
    },

    async down(queryInterface, Sequelize) {
        const schema = 'cacao';
        const tableName = 'periodo_compra';

        // 1. Remove check constraint
        await queryInterface.sequelize.query(
            `ALTER TABLE "${schema}"."${tableName}" DROP CONSTRAINT IF EXISTS chk_periodo_compra_estado`
        );

        // 2. Remove column 'estado'
        await queryInterface.removeColumn(
            { tableName, schema },
            'estado'
        );

        // 3. Re-add column 'activo'
        await queryInterface.addColumn(
            { tableName, schema },
            'activo',
            {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        );
    }
};
