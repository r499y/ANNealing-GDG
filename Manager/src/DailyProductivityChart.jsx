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
        labels: ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
        datasets: [
            {
                label: 'Productivity (%)',
                data: [58, 62, 74, 95, 89, 43, 47, 85, 90, 80, 56],
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
                text: 'Average Daily Productivity (8:00 - 18:00)',
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