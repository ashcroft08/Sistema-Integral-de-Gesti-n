'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const schema = 'cacao';

        // 1. Drop existing tables if they exist (in reverse dependency order)
        // Check schemas or just drop. Adding cascade: true is helpful for dropping related tables.
        try {
            await queryInterface.dropTable({ tableName: 'lote_comercializacion_cv', schema }, { cascade: true });
        } catch (e) {}
        try {
            await queryInterface.dropTable({ tableName: 'lote_comercializacion_org', schema }, { cascade: true });
        } catch (e) {}
        try {
            await queryInterface.dropTable({ tableName: 'control_lote_cv', schema }, { cascade: true });
        } catch (e) {}
        try {
            await queryInterface.dropTable({ tableName: 'control_lote_org', schema }, { cascade: true });
        } catch (e) {}
        try {
            await queryInterface.dropTable({ tableName: 'stock_lote_org', schema }, { cascade: true });
        } catch (e) {}
        try {
            await queryInterface.dropTable({ tableName: 'lote_org', schema }, { cascade: true });
        } catch (e) {}
        try {
            await queryInterface.dropTable({ tableName: 'lote_cv', schema }, { cascade: true });
        } catch (e) {}

        // 2. Create control_lote_org
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

        // 3. Create control_lote_cv
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

        // 4. Create lote_comercializacion_org
        await queryInterface.createTable('lote_comercializacion_org', {
            id_lote_comercializacion_org: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
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
                field: 'as'
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

        // 5. Create lote_comercializacion_cv
        await queryInterface.createTable('lote_comercializacion_cv', {
            id_lote_comercializacion_cv: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
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
                field: 'as'
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
        await queryInterface.dropTable({ tableName: 'lote_comercializacion_cv', schema }, { cascade: true });
        await queryInterface.dropTable({ tableName: 'lote_comercializacion_org', schema }, { cascade: true });
        await queryInterface.dropTable({ tableName: 'control_lote_cv', schema }, { cascade: true });
        await queryInterface.dropTable({ tableName: 'control_lote_org', schema }, { cascade: true });
    }
};
