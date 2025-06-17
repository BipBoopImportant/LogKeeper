import React, { useEffect, useRef } from 'react';
import { MileageOverTimeData } from '../../utils/vehicleUtils';

// Ensure Chart.js types are available (global from CDN)
declare const Chart: any;

interface MileageOverTimeChartProps {
  data: MileageOverTimeData;
}

const MileageOverTimeChart: React.FC<MileageOverTimeChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null); // To store the chart instance

  useEffect(() => {
    if (chartRef.current && data) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }

        const hasDataPoints = data.datasets.some(dataset => dataset.data.some(d => d > 0));

        if (!hasDataPoints) {
            ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height);
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#737373'; // theme-text-muted
            ctx.font = '12px Inter, sans-serif'; 
            const canvasWidth = chartRef.current.width;
            const canvasHeight = chartRef.current.height;
             if (canvasWidth > 50 && canvasHeight > 20) {
                ctx.fillText("Aucun kilométrage enregistré pour cette période.", canvasWidth / 2, canvasHeight / 2);
            }
            ctx.restore();
            return;
        }

        chartInstanceRef.current = new Chart(ctx, {
          type: 'line',
          data: data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false, 
              },
              title: {
                display: true,
                text: 'Kilométrage sur la période (6 derniers mois)',
                 font: {
                  size: 14, 
                  weight: '600', 
                },
                color: '#1A1A1A', // theme-text-default
                padding: { top: 5, bottom: 10 }
              },
              tooltip: {
                callbacks: {
                  label: function(context: any) {
                    let label = context.dataset.label || '';
                    if (label) {
                      label += ': ';
                    }
                    if (context.parsed.y !== null) {
                      label += context.parsed.y.toLocaleString('fr-CA') + ' km';
                    }
                    return label;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Kilomètres',
                    color: '#737373', // theme-text-muted
                    font: { size: 10 }
                },
                ticks: { color: '#737373', font: {size: 10} }, 
                grid: { 
                    color: '#E5E5E5' // theme-border-default
                }
              },
              x: {
                title: {
                    display: false, 
                },
                ticks: { color: '#737373', font: {size: 10} }, 
                grid: { 
                    display: false 
                }
              }
            }
          },
        });
      }
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data]);

  return <canvas ref={chartRef} className="w-full h-full"></canvas>;
};

export default MileageOverTimeChart;