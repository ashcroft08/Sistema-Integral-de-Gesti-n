require('dotenv/config');

module.exports = {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        dialect: 'postgres',
        logging: console.log,
        seederStorage: 'sequelize',
        seederStorageTableName: 'sequelize_seeders',
        migrationStorageTableName: 'sequelize_migrations'
    },
    test: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: `${process.env.DB_NAME}_test`,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        dialect: 'postgres',
        logging: false
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        seederStorage: 'sequelize',
        seederStorageTableName: 'sequelize_seeders',
        migrationStorageTableName: 'sequelize_migrations'
    }
};