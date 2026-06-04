'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const schema = 'cacao';

        await queryInterface.createTable('compra_externa', {
            id_compra_externa: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            fecha: {
                type: Sequelize.DATEONLY,
                allowNull: true
            },
            nombres: {
                type: Sequelize.STRING(250),
                allowNull: true
            },
            peso_proveedor: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            peso_diferencia: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            quintales_facturas: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            costo_unitario: {
                type: Sequelize.DECIMAL(10, 4),
                allowNull: true
            },
            total: {
                type: Sequelize.DECIMAL(12, 4),
                allowNull: true
            },
            peso_ass: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            peso_as: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            peso_pajarito: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            peso_basura: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            total_qq: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            libras_seco: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            libras_escurrido: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            quintales_escurrido: {
                type: Sequelize.DECIMAL(10, 4),
                allowNull: true
            },
            es_organico: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
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
                onDelete: 'SET NULL'
            }
        }, { schema });
    },

    async down(queryInterface, Sequelize) {
        const schema = 'cacao';
        await queryInterface.dropTable({ tableName: 'compra_externa', schema });
    }
};
