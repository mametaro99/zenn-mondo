import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { Box } from '@mui/material';

Chart.register(...registerables);

type AverageScoreChartProps = {
  averages: { date: string; score: number }[];
  overallAvgScore: number;
  title: string;
};

const AverageScoreChart: React.FC<AverageScoreChartProps> = ({ averages, overallAvgScore, title }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null); // Ref to hold the chart instance

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        // Destroy the previous chart instance if it exists
        if (chartRef.current) {
          chartRef.current.destroy();
        }

        const labels = averages.map(item => item.date);
        const data = averages.map(item => item.score);
        
        // Create a new chart instance and save it to the ref
        chartRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: '各日の平均点',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
              },
              {
                label: '全受験者の平均点',
                data: Array(labels.length).fill(overallAvgScore),
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              x: {
                title: {
                  display: true,
                  text: '受験日',
                },
              },
              y: {
                title: {
                  display: true,
                  text: '平均点',
                },
                beginAtZero: true,
              },
            },
          },
        });
      }
    }
    
    // Cleanup function to destroy the chart when the component unmounts or updates
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [averages, overallAvgScore]);

  return (
    <Box sx={{ overflowX: 'auto' }}> 
    <section className="test-results-graph" style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '1.25rem', minWidth: '600px' }}>
      <h2>あなたの{title}の平均点の変化</h2>
      <canvas ref={canvasRef}></canvas>
    </section>
    </Box>
  );
};

export default AverageScoreChart;
