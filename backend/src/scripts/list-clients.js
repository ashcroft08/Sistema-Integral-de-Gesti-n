import './load-env.js';
import axios from 'axios';

const PORT = process.env.PORT || 3000;
const API_URL = `http://localhost:${PORT}/api`;

async function listClients() {
    try {
        console.log('1. Login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@gmail.com',
            password: 'Admin08_*'
        });
        const token = loginRes.data.token;

        console.log('2. Fetching clients...');
        const res = await axios.get(`${API_URL}/clients`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`Total clients: ${res.data.clients.length}`);
        res.data.clients.forEach(c => {
            console.log(`ID: ${c.id_cliente}, Identificacion: '${c.identificacion}', Nombre: '${c.nombre}', Email: '${c.email}'`);
        });

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) console.error(error.response.data);
    }
}

listClients();
