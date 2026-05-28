'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const schema = 'cacao';

        // 1. CONTROL_LOTE_ORG
        await queryInterface.createTable('control_lote_org', {
            id_control_lote_org: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            id_lote_org: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'lote_org',
                        schema
                    },
                    key: 'id_lote_org'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            id_ruta_compra: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'ruta_compra',
                        schema
                    },
                    key: 'id_ruta_compra'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            id_stock_lote_org: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'stock_lote_org',
                        schema
                    },
                    key: 'id_stock_lote_org'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            fecha: {
                type: Sequelize.DATEONLY,
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

        // 2. CONTROL_LOTE_CV
        await queryInterface.createTable('control_lote_cv', {
            id_control_lote_cv: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            id_ruta_compra: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'ruta_compra',
                        schema
                    },
                    key: 'id_ruta_compra'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            id_lote_cv: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'lote_cv',
                        schema
                    },
                    key: 'id_lote_cv'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            id_stock_lote_org: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'stock_lote_org',
                        schema
                    },
                    key: 'id_stock_lote_org'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            fecha: {
                type: Sequelize.DATEONLY,
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
    },

    async down(queryInterface, Sequelize) {
        const schema = 'cacao';
        await queryInterface.dropTable({ tableName: 'control_lote_cv', schema });
        await queryInterface.dropTable({ tableName: 'control_lote_org', schema });
    }
};
