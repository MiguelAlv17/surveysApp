const { Pool } = require('pg');

// Configura tu conexión PostgreSQL
const pool = new Pool({
    user: 'tu_usuario',
    host: 'localhost',
    database: 'tu_base_de_datos',
    password: 'tu_contraseña',
    port: 5432, // puerto por defecto de PostgreSQL
});

async function getUsuarios() {
    try {
        const res = await pool.query('SELECT * FROM usuarios');
        return {
            status: 200,
            data: res.rows
        };
    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        return {
            status: 500,
            message: 'Error en la consulta a PostgreSQL',
            error: err.message
        };
    }
}

module.exports = { getUsuarios };