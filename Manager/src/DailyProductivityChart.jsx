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

const DailyProductivityChart = () => {
    const data = {
        labels: ['8:00', '9:00', '10:00', '11:00', '12:00', '12:30', '13:30', '14:30', '15:30', '16:30', '17:30', '18:00'],
        datasets: [
            {
                label: 'Produttività Media (%)',
                data: [60, 55, 70, 95, 85, 40, 45, 75, 88, 85, 70, 50],
                fill: false,
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                borderColor: 'rgba(255, 159, 64, 1)',
                tension: 0.3
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Produttività Giornaliera Media (8:00 - 18:00)',
                color: '#9cdcfe'
            },
            legend: {
                labels: {
                    color: '#cccccc'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#cccccc'
                },
                grid: {
                    color: 'rgba(204, 204, 204, 0.1)'
                }
            },
            y: {
                ticks: {
                    beginAtZero: true,
                    max: 100,
                    color: '#cccccc',
                    callback: function(value) {
                        return value + '%';
                    }
                },
                grid: {
                    color: 'rgba(204, 204, 204, 0.1)'
                }
            }
        }
    };

    return <Line data={data} options={options} />;
};

export default DailyProductivityChart;