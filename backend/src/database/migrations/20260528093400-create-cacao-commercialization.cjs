'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const schema = 'cacao';

        // 1. LOTE_COMERCIALIZACION_ORG
        await queryInterface.createTable('lote_comercializacion_org', {
            id_lote_comercializacion_org: {
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
            id_control_lote_org: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'control_lote_org',
                        schema
                    },
                    key: 'id_control_lote_org'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            fecha_clasificacion: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            ass: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            as: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                field: 'as' // Definir explícitamente el nombre de la columna para evitar colisión de palabras reservadas
            },
            pajarito: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            impureza: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            total: {
                type: Sequelize.DECIMAL(10, 4),
                allowNull: false
            },
            porcentaje_perdida: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            }
        }, { schema });

        // 2. LOTE_COMERCIALIZACION_CV
        await queryInterface.createTable('lote_comercializacion_cv', {
            id_lote_comercializacion_cv: {
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
            id_control_lote_cv: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'control_lote_cv',
                        schema
                    },
                    key: 'id_control_lote_cv'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            fecha_clasificacion: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            ass: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            as: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                field: 'as' // Definir explícitamente el nombre de la columna
            },
            pajarito: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            impureza: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            total: {
                type: Sequelize.DECIMAL(10, 4),
                allowNull: false
            },
            porcentaje_perdida: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            }
        }, { schema });
    },

    async down(queryInterface, Sequelize) {
        const schema = 'cacao';
        await queryInterface.dropTable({ tableName: 'lote_comercializacion_cv', schema });
        await queryInterface.dropTable({ tableName: 'lote_comercializacion_org', schema });
    }
};
