'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const schema = 'cacao';

        // 1. Create control_lote_org
        await queryInterface.createTable('control_lote_org', {
            id_control_lote_org: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            id_periodo_compra: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'periodo_compra',
                        schema
                    },
                    key: 'id_periodo_compra'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            odp: {
                type: Sequelize.CHAR(10),
                allowNull: true
            },
            lote: {
                type: Sequelize.STRING(250),
                allowNull: false
            },
            fecha: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            ruta_compra: {
                type: Sequelize.STRING(250),
                allowNull: false
            },
            cantidad_libra: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            costo: {
                type: Sequelize.DECIMAL(10, 4),
                allowNull: false
            },
            es_seco: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        }, { schema });

        // 2. Create control_lote_cv
        await queryInterface.createTable('control_lote_cv', {
            id_control_lote_cv: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            id_periodo_compra: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'periodo_compra',
                        schema
                    },
                    key: 'id_periodo_compra'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            lote: {
                type: Sequelize.STRING(250),
                allowNull: false
            },
            fecha: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            ruta_compra: {
                type: Sequelize.STRING(250),
                allowNull: false
            },
            cantidad_libra: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            costo: {
                type: Sequelize.DECIMAL(10, 4),
                allowNull: false
            },
            es_seco: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            odp: {
                type: Sequelize.CHAR(10),
                allowNull: true
            }
        }, { schema });
    },

    async down(queryInterface, Sequelize) {
        const schema = 'cacao';
        await queryInterface.dropTable({ tableName: 'control_lote_cv', schema });
        await queryInterface.dropTable({ tableName: 'control_lote_org', schema });
    }
};
