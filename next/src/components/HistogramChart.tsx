"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Chart.js のモジュールを登録
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type HistogramChartProps = {
  maxScore: number;
  minScore: number;
  averages: number[];
};

const HistogramChart: React.FC<HistogramChartProps> = ({ maxScore, minScore, averages }) => {
  // スコア分布を初期化（0点～7点の場合なら {0: 0, 1: 0, ..., 7: 0} ）
  const scoreDistribution: Record<number, number> = {};
  for (let i = minScore; i <= maxScore; i++) {
    scoreDistribution[i] = 0;
  }

  // 各 average の値を丸めてカウント
  averages.forEach((average) => {
    const roundedScore = Math.round(average);
    if (roundedScore >= minScore && roundedScore <= maxScore) {
      scoreDistribution[roundedScore]++;
    }
  });

  // Chart.js 用データ作成
  const chartData = {
    labels: Object.keys(scoreDistribution),
    datasets: [
      {
        label: "回答の分布",
        data: Object.values(scoreDistribution),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: { title: { display: true, text: "平均点" } },
      y: { 
        title: { display: true, text: "人数" }, 
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default HistogramChart;
