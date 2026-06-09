'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const schema = 'cacao';

        // 1. Create table historial_estado_lote
        await queryInterface.createTable('historial_estado_lote', {
            id_historial: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            id_control_lote: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            tipo_lote: {
                type: Sequelize.STRING(3),
                allowNull: false
            },
            estado: {
                type: Sequelize.ENUM('ESCURRIDO', 'FERMENTADO', 'SECO', 'PRESECADO'),
                allowNull: false
            },
            fecha_inicio: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            fecha_fin: {
                type: Sequelize.DATEONLY,
                allowNull: true
            },
            observacion: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            creado_en: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        }, { schema });

        // Add check constraint for tipo_lote
        await queryInterface.addConstraint({
            tableName: 'historial_estado_lote',
            schema
        }, {
            type: 'check',
            fields: ['tipo_lote'],
            where: {
                tipo_lote: ['ORG', 'CV']
            },
            name: 'check_tipo_lote_historial'
        });

        // 2. Create table presecado_lote
        await queryInterface.createTable('presecado_lote', {
            id_presecado: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            id_control_lote: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            id_historial: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'historial_estado_lote',
                        schema
                    },
                    key: 'id_historial'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            tipo_lote: {
                type: Sequelize.STRING(3),
                allowNull: false
            },
            nro_ciclo: {
                type: Sequelize.SMALLINT,
                allowNull: false
            },
            fecha_inicio: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            fecha_fin: {
                type: Sequelize.DATEONLY,
                allowNull: true
            },
            peso_antes: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            peso_despues: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            perdida_libras: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            porcentaje_libras: {
                type: Sequelize.DECIMAL(5, 2),
                allowNull: false
            },
            observacion: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            creado_en: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        }, { schema });

        // Add check constraint for tipo_lote in presecado
        await queryInterface.addConstraint({
            tableName: 'presecado_lote',
            schema
        }, {
            type: 'check',
            fields: ['tipo_lote'],
            where: {
                tipo_lote: ['ORG', 'CV']
            },
            name: 'check_tipo_lote_presecado'
        });
    },

    async down(queryInterface, Sequelize) {
        const schema = 'cacao';
        await queryInterface.dropTable({ tableName: 'presecado_lote', schema });
        await queryInterface.dropTable({ tableName: 'historial_estado_lote', schema });
    }
};
