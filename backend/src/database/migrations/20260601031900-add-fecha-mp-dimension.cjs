'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const schema = 'cacao';

        // 1. Create fecha_mp dimension table
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

        // 2. Populate fecha_mp from existing compra_interna.fecha_compra (if data exists)
        await queryInterface.sequelize.query(`
            INSERT INTO cacao.fecha_mp (fecha, dia, mes, anio, trimestre, nombre_mes, nombre_dia_semana)
            SELECT DISTINCT
                fecha_compra,
                EXTRACT(DAY FROM fecha_compra)::smallint,
                EXTRACT(MONTH FROM fecha_compra)::smallint,
                EXTRACT(YEAR FROM fecha_compra)::smallint,
                EXTRACT(QUARTER FROM fecha_compra)::smallint,
                CASE EXTRACT(MONTH FROM fecha_compra)
                    WHEN 1 THEN 'ENERO' WHEN 2 THEN 'FEBRERO' WHEN 3 THEN 'MARZO'
                    WHEN 4 THEN 'ABRIL' WHEN 5 THEN 'MAYO' WHEN 6 THEN 'JUNIO'
                    WHEN 7 THEN 'JULIO' WHEN 8 THEN 'AGOSTO' WHEN 9 THEN 'SEPTIEMBRE'
                    WHEN 10 THEN 'OCTUBRE' WHEN 11 THEN 'NOVIEMBRE' WHEN 12 THEN 'DICIEMBRE'
                END,
                CASE EXTRACT(DOW FROM fecha_compra)
                    WHEN 0 THEN 'DOMINGO' WHEN 1 THEN 'LUNES' WHEN 2 THEN 'MARTES'
                    WHEN 3 THEN 'MIÉRCOLES' WHEN 4 THEN 'JUEVES' WHEN 5 THEN 'VIERNES'
                    WHEN 6 THEN 'SÁBADO'
                END
            FROM cacao.compra_interna
            WHERE fecha_compra IS NOT NULL
            ON CONFLICT (fecha) DO NOTHING;
        `);

        // 3. Add id_fecha_compra column to compra_interna
        await queryInterface.addColumn(
            { tableName: 'compra_interna', schema },
            'id_fecha_compra',
            {
                type: Sequelize.INTEGER,
                allowNull: true // temporarily nullable for migration
            }
        );

        // 4. Populate id_fecha_compra from fecha_mp using existing fecha_compra values
        await queryInterface.sequelize.query(`
            UPDATE cacao.compra_interna ci
            SET id_fecha_compra = f.id_fecha_mp
            FROM cacao.fecha_mp f
            WHERE ci.fecha_compra = f.fecha;
        `);

        // 5. Make id_fecha_compra NOT NULL and add FK
        await queryInterface.changeColumn(
            { tableName: 'compra_interna', schema },
            'id_fecha_compra',
            {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'fecha_mp',
                        schema
                    },
                    key: 'id_fecha_mp'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            }
        );

        // 6. Drop old fecha_compra column
        await queryInterface.removeColumn(
            { tableName: 'compra_interna', schema },
            'fecha_compra'
        );

        // 7. Make id_periodo_compra NOT NULL (if exists and was nullable)
        try {
            await queryInterface.changeColumn(
                { tableName: 'compra_interna', schema },
                'id_periodo_compra',
                {
                    type: Sequelize.INTEGER,
                    allowNull: false
                }
            );
        } catch (e) {
            // Column might not exist yet or already NOT NULL, safe to ignore
            console.log('Note: id_periodo_compra constraint update skipped:', e.message);
        }
    },

    async down(queryInterface, Sequelize) {
        const schema = 'cacao';

        // 1. Re-add fecha_compra column
        await queryInterface.addColumn(
            { tableName: 'compra_interna', schema },
            'fecha_compra',
            {
                type: Sequelize.DATEONLY,
                allowNull: true
            }
        );

        // 2. Populate fecha_compra from fecha_mp
        await queryInterface.sequelize.query(`
            UPDATE cacao.compra_interna ci
            SET fecha_compra = f.fecha
            FROM cacao.fecha_mp f
            WHERE ci.id_fecha_compra = f.id_fecha_mp;
        `);

        // 3. Make fecha_compra NOT NULL
        await queryInterface.changeColumn(
            { tableName: 'compra_interna', schema },
            'fecha_compra',
            {
                type: Sequelize.DATEONLY,
                allowNull: false
            }
        );

        // 4. Drop id_fecha_compra column
        await queryInterface.removeColumn(
            { tableName: 'compra_interna', schema },
            'id_fecha_compra'
        );

        // 5. Drop fecha_mp table
        await queryInterface.dropTable({ tableName: 'fecha_mp', schema });

        // 6. Revert id_periodo_compra to nullable
        try {
            await queryInterface.changeColumn(
                { tableName: 'compra_interna', schema },
                'id_periodo_compra',
                {
                    type: Sequelize.INTEGER,
                    allowNull: true
                }
            );
        } catch (e) {
            console.log('Note: id_periodo_compra revert skipped:', e.message);
        }
    }
};
