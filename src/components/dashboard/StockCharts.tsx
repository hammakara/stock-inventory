import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { StockTransaction, Product, Category } from '../../types/inventory';

// Register all Chart.js controllers (BarController, DoughnutController, etc.), scales, and elements
ChartJS.register(...registerables);

interface StockChartsProps {
  transactions: StockTransaction[];
  products: Product[];
  categories: Category[];
}

export const StockMovementChart: React.FC<{ transactions: StockTransaction[] }> = ({ transactions }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy prior chart instance if exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Generate last 7 days buckets
    const days: string[] = [];
    const inboundMap: Record<string, number> = {};
    const outboundMap: Record<string, number> = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      days.push(label);
      inboundMap[dayStr] = 0;
      outboundMap[dayStr] = 0;
    }

    transactions.forEach((t) => {
      if (!t || !t.date) return;
      const dateKey = t.date.split('T')[0];
      if (inboundMap[dateKey] !== undefined && t.type === 'IN') {
        inboundMap[dateKey] += Number(t.quantity) || 0;
      }
      if (outboundMap[dateKey] !== undefined && t.type === 'OUT') {
        outboundMap[dateKey] += Math.abs(Number(t.quantity) || 0);
      }
    });

    const inboundData = Object.values(inboundMap);
    const outboundData = Object.values(outboundMap);

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [
          {
            label: 'Inbound Units',
            data: inboundData,
            backgroundColor: 'rgba(16, 185, 129, 0.85)',
            borderRadius: 4,
            barThickness: 16,
          },
          {
            label: 'Outbound Units',
            data: outboundData,
            backgroundColor: 'rgba(245, 158, 11, 0.85)',
            borderRadius: 4,
            barThickness: 16,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
            },
          },
          tooltip: {
            padding: 8,
            titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: 'bold' },
            bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 10 } },
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            ticks: {
              precision: 0,
              font: { family: "'JetBrains Mono', monospace", size: 10 },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [transactions]);

  return (
    <div className="h-64 w-full relative">
      <canvas ref={canvasRef} />
    </div>
  );
};

export const CategoryDistributionChart: React.FC<{ products: Product[]; categories: Category[] }> = ({
  products,
  categories,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const catCounts: Record<string, number> = {};
    categories.forEach((c) => {
      catCounts[c.name] = 0;
    });

    products.forEach((p) => {
      const name = p.categoryName || 'Other';
      catCounts[name] = (catCounts[name] || 0) + p.currentStock;
    });

    const labels = Object.keys(catCounts).filter((k) => catCounts[k] > 0);
    const data = labels.map((k) => catCounts[k]);

    if (labels.length === 0) {
      return;
    }

    const colors = [
      '#2563EB',
      '#0891B2',
      '#D97706',
      '#059669',
      '#475569',
      '#7C3AED',
      '#DB2777',
    ];

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 2,
            borderColor: '#FFFFFF',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 10,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
              padding: 12,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.label}: ${context.raw} units`,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [products, categories]);

  return (
    <div className="h-64 w-full relative flex items-center justify-center">
      <canvas ref={canvasRef} />
    </div>
  );
};
