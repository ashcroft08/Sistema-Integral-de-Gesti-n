export default (sequelize, DataTypes) => {
  const Auditoria = sequelize.define('Auditoria', {
    id_auditoria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    accion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT
    },
    id_usuario: {
      type: DataTypes.INTEGER
    },
    usuario_nombre: {
      type: DataTypes.STRING
    },
    tabla: {
      type: DataTypes.STRING
    },
    llave: {
      type: DataTypes.TEXT
    }
  },{ 
    tableName: 'auditoria', 
    schema: 'auditoria', 
    timestamps: false }
  )
  return Auditoria;
};
