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
    },
    valores_anteriores: {
      type: DataTypes.JSONB,
      comment: 'Estado anterior del registro antes de la acción (para UPDATE o DELETE)'
    },
    valores_nuevos: {
      type: DataTypes.JSONB,
      comment: 'Estado nuevo del registro después de la acción (para INSERT o UPDATE)'
    },
    ip_direccion: {
      type: DataTypes.STRING(45),
      comment: 'Dirección IP de origen del cliente'
    },
    user_agent: {
      type: DataTypes.TEXT,
      comment: 'Navegador y sistema operativo del cliente'
    }
  },{ 
    tableName: 'auditoria', 
    schema: 'auditoria', 
    timestamps: false }
  )
  return Auditoria;
};

