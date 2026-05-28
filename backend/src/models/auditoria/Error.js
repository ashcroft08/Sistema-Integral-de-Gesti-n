export default (sequelize, DataTypes) => {
  const ErrorSistema = sequelize.define(
    'tb_error',
    {
      id_error: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      modulo: {
        type: DataTypes.STRING
      },
      mensaje: {
        type: DataTypes.TEXT
      },
      detalle: {
        type: DataTypes.TEXT
      },
      id_usuario: {
        type: DataTypes.INTEGER
      },
      usuario_nombre: {
        type: DataTypes.STRING
      },
      ruta: {
        type: DataTypes.STRING,
        comment: 'Ruta/Endpoint HTTP donde ocurrió el error'
      },
      metodo: {
        type: DataTypes.STRING(10),
        comment: 'Método HTTP utilizado (GET, POST, etc.)'
      },
      parametros: {
        type: DataTypes.JSONB,
        comment: 'Cuerpo o parámetros de la petición sanitizados'
      },
      nivel: {
        type: DataTypes.STRING(20),
        defaultValue: 'ERROR',
        comment: 'Severidad del error (DEBUG, INFO, WARNING, ERROR, FATAL)'
      }
    }, {
    tableName: 'error',
    schema: 'auditoria',
    timestamps: false
  }
  )
  return ErrorSistema;
};

