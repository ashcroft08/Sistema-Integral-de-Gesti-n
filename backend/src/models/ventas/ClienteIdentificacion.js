// models/clienteIdentificacion.js
export default (sequelize, DataTypes) => {
    const ClienteIdentificacion = sequelize.define('ClienteIdentificacion', {
        id_cliente_identificacion: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_cliente: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'cliente',
                key: 'id_cliente'
            }
        },
        id_tipo_identificacion: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: {
                    tableName: 'tipo_identificacion',
                    schema: 'catalogo'
                },
                key: 'id_tipo_identificacion'
            }
        },
        identificacion: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        es_principal: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'cliente_identificacion',
        schema: 'ventas',
        timestamps: false,
        indexes: [ // ✅ Índices se definen AQUÍ
            {
                unique: true,
                fields: ['id_tipo_identificacion', 'identificacion']
            },
            {
                fields: ['id_cliente'] // Índice para mejorar joins
            }
        ]
    });

    ClienteIdentificacion.associate = (models) => {
        ClienteIdentificacion.belongsTo(models.Cliente, { foreignKey: 'id_cliente' });
        ClienteIdentificacion.belongsTo(models.TipoIdentificacion, { foreignKey: 'id_tipo_identificacion' });
    }

    // Índice único compuesto: evitar duplicados por tipo + valor
    ClienteIdentificacion.addScope('defaultScope', {
        indexes: [
            {
                unique: true,
                fields: ['id_tipo_identificacion', 'identificacion']
            }
        ]
    }, { override: true });
    return ClienteIdentificacion;
}