import React, { useEffect, useRef } from 'react';
import { MileageByPurposeData } from '../../utils/vehicleUtils';

// Ensure Chart.js types are available (global from CDN)
declare const Chart: any;

interface MileageByPurposeChartProps {
  data: MileageByPurposeData;
}

const MileageByPurposeChart: React.FC<MileageByPurposeChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null); // To store the chart instance

  useEffect(() => {
    if (chartRef.current && data) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }
        
        if (data.labels.length === 0 || data.datasets[0].data.length === 0 || data.datasets[0].data.every(d => d === 0)) {
            ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height);
            ctx.save(); 
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#737373'; // theme-text-muted
            ctx.font = '12px Inter, sans-serif'; 
            const canvasWidth = chartRef.current.width;
            const canvasHeight = chartRef.current.height;
            if (canvasWidth > 50 && canvasHeight > 20) { 
                 ctx.fillText("Aucune donnée de kilométrage par motif.", canvasWidth / 2, canvasHeight / 2);
            }
            ctx.restore(); 
            return;
        }

        chartInstanceRef.current = new Chart(ctx, {
          type: 'doughnut',
          data: data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                    color: '#737373', // theme-text-muted
                    boxWidth: 12,
                    padding: 15,
                    font: { size: 11 }
                }
              },
              title: {
                display: true,
                text: 'Kilométrage par motif',
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
                    let label = context.label || '';
                    if (label) {
                      label += ': ';
                    }
                    if (context.parsed !== null) {
                      label += context.parsed.toLocaleString('fr-CA') + ' km';
                    }
                    return label;
                  }
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

export default MileageByPurposeChart;