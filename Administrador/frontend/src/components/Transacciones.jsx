import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Transacciones() {
    const [transacciones, setTransacciones] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8000/api/transacciones/')
            .then(response => setTransacciones(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <div>
            <h1>Transacciones</h1>
            <ul>
                {transacciones.map(transaccion => (
                    <li key={transaccion.id}>
                        Pedido ID: {transaccion.pedido} - Método de Pago: {transaccion.metodo_pago} - Estado: {transaccion.estado} - Fecha: {new Date(transaccion.fecha).toLocaleDateString()} - Monto: {transaccion.monto}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Transacciones;
