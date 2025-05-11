import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const ProductivityChart = () => {
    const data = {
        labels: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
        datasets: [
            {
                label: 'Produttività (%)',
                data: [92, 88, 85, 82, 83, 84, 80, 79, 91, 88, 87, 91],
                fill: false,
                backgroundColor: 'rgba(75,192,192,0.2)',
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.1
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Andamento Mensile della Produttività',
                color: '#9cdcfe' // Stesso colore del titolo delle sezioni
            },
            legend: {
                labels: {
                    color: '#cccccc' // Colore del testo della legenda
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#cccccc' // Colore delle etichette dell'asse X
                },
                grid: {
                    color: 'rgba(204, 204, 204, 0.1)' // Colore della griglia dell'asse X
                }
            },
            y: {
                ticks: {
                    beginAtZero: true,
                    color: '#cccccc', // Colore delle etichette dell'asse Y
                    callback: function(value) {
                        return value + '%'; // Aggiungi il simbolo percentuale
                    }
                },
                grid: {
                    color: 'rgba(204, 204, 204, 0.1)' // Colore della griglia dell'asse Y
                }
            }
        }
    };

    return <Line data={data} options={options} />;
};

export default ProductivityChart;