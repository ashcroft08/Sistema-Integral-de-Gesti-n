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
      }
    }, {
    tableName: 'error',
    schema: 'auditoria',
    timestamps: false
  }
  )
  return Error
};
