'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const schema = 'cacao';

        // 1. COMPRA_INTERNA
        await queryInterface.createTable('compra_interna', {
            id_compra_interna: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            id_comunidad_mp: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'comunidad_mp',
                        schema
                    },
                    key: 'id_comunidad_mp'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            id_proveedor_mp: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'proveedor_mp',
                        schema
                    },
                    key: 'id_proveedor_mp'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            id_categoria_mp: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'categoria_mp',
                        schema
                    },
                    key: 'id_categoria_mp'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            id_producto_mp: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'producto_mp',
                        schema
                    },
                    key: 'id_producto_mp'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            id_negociador_mp: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'negociador_mp',
                        schema
                    },
                    key: 'id_negociador_mp'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            fecha_compra: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            cantidad_libra: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            costo_unitario: {
                type: Sequelize.DECIMAL(10, 4),
                allowNull: false
            },
            total: {
                type: Sequelize.DECIMAL(12, 4),
                allowNull: false
            }
        }, { schema });

        // 2. STOCK_LOTE_ORG
        await queryInterface.createTable('stock_lote_org', {
            id_stock_lote_org: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            id_compra_interna: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'compra_interna',
                        schema
                    },
                    key: 'id_compra_interna'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            cantidad_asignada: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            fecha_registro: {
                type: Sequelize.DATEONLY,
                allowNull: false
            }
        }, { schema });
    },

    async down(queryInterface, Sequelize) {
        const schema = 'cacao';
        await queryInterface.dropTable({ tableName: 'stock_lote_org', schema });
        await queryInterface.dropTable({ tableName: 'compra_interna', schema });
    }
};
