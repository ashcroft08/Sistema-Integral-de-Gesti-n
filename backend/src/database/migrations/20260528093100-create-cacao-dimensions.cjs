'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const schema = 'cacao';

        // 1. Create table 'periodo_compra'
        await queryInterface.createTable('periodo_compra', {
            id_periodo_compra: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            nombre: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            fecha_inicio: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            fecha_fin: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            descripcion: {
                type: Sequelize.STRING(250),
                allowNull: true
            },
            estado: {
                type: Sequelize.STRING(50),
                allowNull: false,
                defaultValue: 'BORRADOR'
            },
            trimestre: {
                type: Sequelize.SMALLINT,
                allowNull: false
            },
            anio: {
                type: Sequelize.SMALLINT,
                allowNull: false
            }
        }, { schema });

        // 2. Create fecha_mp dimension table (Temporal Dimension)
        await queryInterface.createTable('fecha_mp', {
            id_fecha_mp: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            fecha: {
                type: Sequelize.DATEONLY,
                allowNull: false,
                unique: true
            },
            dia: {
                type: Sequelize.SMALLINT,
                allowNull: false
            },
            mes: {
                type: Sequelize.SMALLINT,
                allowNull: false
            },
            anio: {
                type: Sequelize.SMALLINT,
                allowNull: false
            },
            trimestre: {
                type: Sequelize.SMALLINT,
                allowNull: false
            },
            nombre_mes: {
                type: Sequelize.STRING(20),
                allowNull: false
            },
            nombre_dia_semana: {
                type: Sequelize.STRING(15),
                allowNull: false
            }
        }, { schema });

        // 3. COMPRA_GENERAL
        await queryInterface.createTable('compra_general', {
            id_compra_general: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            numero: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            fecha: {
                type: Sequelize.DATEONLY,
                allowNull: true
            },
            comunidad: {
                type: Sequelize.STRING(250),
                allowNull: true
            },
            codigo: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            proveedor: {
                type: Sequelize.STRING(250),
                allowNull: true
            },
            categoria: {
                type: Sequelize.STRING(250),
                allowNull: true
            },
            producto: {
                type: Sequelize.STRING(250),
                allowNull: true
            },
            cantidad: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            valor_unitario: {
                type: Sequelize.DECIMAL(10, 4),
                allowNull: true
            },
            total: {
                type: Sequelize.DECIMAL(10, 4),
                allowNull: true
            },
            negociador: {
                type: Sequelize.STRING(250),
                allowNull: true
            },
            id_periodo_compra: {
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
                onDelete: 'CASCADE'
            }
        }, { schema });

        // 4. COMUNIDAD_MP
        await queryInterface.createTable('comunidad_mp', {
            id_comunidad_mp: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            comunidad: {
                type: Sequelize.STRING(250),
                allowNull: false
            }
        }, { schema });

        // 5. PROVEEDOR_MP
        await queryInterface.createTable('proveedor_mp', {
            id_proveedor_mp: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            proveedor: {
                type: Sequelize.STRING(250),
                allowNull: false
            }
        }, { schema });

        // 6. NEGOCIADOR_MP
        await queryInterface.createTable('negociador_mp', {
            id_negociador_mp: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            negociador: {
                type: Sequelize.STRING(250),
                allowNull: false
            }
        }, { schema });

        // 7. CATEGORIA_MP
        await queryInterface.createTable('categoria_mp', {
            id_categoria_mp: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            categoria: {
                type: Sequelize.STRING(250),
                allowNull: false
            }
        }, { schema });

        // 8. PRODUCTO_MP
        await queryInterface.createTable('producto_mp', {
            id_producto_mp: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            producto: {
                type: Sequelize.STRING(250),
                allowNull: false
            }
        }, { schema });

        // 9. LOTE_ORG
        await queryInterface.createTable('lote_org', {
            id_lote_org: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            lote_org: {
                type: Sequelize.STRING(250),
                allowNull: false
            }
        }, { schema });

        // 10. LOTE_CV
        await queryInterface.createTable('lote_cv', {
            id_lote_cv: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            lote_cv: {
                type: Sequelize.STRING(250),
                allowNull: false
            }
        }, { schema });

        // 11. RUTA_COMPRA
        await queryInterface.createTable('ruta_compra', {
            id_ruta_compra: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            ruta_compra: {
                type: Sequelize.STRING(250),
                allowNull: false
            }
        }, { schema });
    },

    async down(queryInterface, Sequelize) {
        const schema = 'cacao';
        await queryInterface.dropTable({ tableName: 'ruta_compra', schema });
        await queryInterface.dropTable({ tableName: 'lote_cv', schema });
        await queryInterface.dropTable({ tableName: 'lote_org', schema });
        await queryInterface.dropTable({ tableName: 'producto_mp', schema });
        await queryInterface.dropTable({ tableName: 'categoria_mp', schema });
        await queryInterface.dropTable({ tableName: 'negociador_mp', schema });
        await queryInterface.dropTable({ tableName: 'proveedor_mp', schema });
        await queryInterface.dropTable({ tableName: 'comunidad_mp', schema });
        await queryInterface.dropTable({ tableName: 'compra_general', schema });
        await queryInterface.dropTable({ tableName: 'fecha_mp', schema });
        await queryInterface.dropTable({ tableName: 'periodo_compra', schema });
    }
};
