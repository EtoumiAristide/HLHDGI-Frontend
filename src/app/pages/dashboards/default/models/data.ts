import { ChartType } from './saas.model';

// ── Donut chart répartition des types de factures ───────────────────────────
const salesAnalyticsDonutChart: ChartType = {
    series: [0, 0, 0],
    chart: {
        type: 'donut',
        height: 260,
    },
    labels: ['Ventes', 'Bordereau Achat', 'Avoirs'],
    colors: ['#556ee6', '#34c38f', '#f46a6a'],
    legend: {
        show: true,
        position: 'bottom',
        horizontalAlign: 'center',
    },
    plotOptions: {
        pie: {
            donut: {
                size: '70%',
                labels: {
                    show: true,
                    total: {
                        show: true,
                        label: 'Total',
                        fontSize: '13px',
                        fontWeight: 600,
                    }
                }
            }
        }
    },
    dataLabels: {
        enabled: false
    },
    tooltip: {
        y: {
            formatter: (val: number) => new Intl.NumberFormat('fr-FR').format(val) + ' FCFA'
        }
    }
};

// ── Bar chart mensuel ────────────────────────────────────────────────────────
const monthlyBarChart: ChartType = {
    series: [
        { name: 'Ventes', data: Array(12).fill(0) },
        { name: 'Bordereau Achat', data: Array(12).fill(0) },
        { name: 'Avoirs', data: Array(12).fill(0) },
    ],
    chart: {
        type: 'bar',
        height: 340,
        toolbar: { show: false },
        stacked: false,
    },
    colors: ['#556ee6', '#34c38f', '#f46a6a'],
    plotOptions: {
        bar: {
            columnWidth: '55%',
            borderRadius: 4,
        }
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
        categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
            'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    },
    yaxis: {
        labels: {
            formatter: (val: number) => {
                if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
                if (val >= 1_000) return (val / 1_000).toFixed(0) + 'k';
                return val.toString();
            }
        }
    },
    fill: { opacity: 1 },
    tooltip: {
        y: {
            formatter: (val: number) => new Intl.NumberFormat('fr-FR').format(val) + ' FCFA'
        }
    },
    legend: {
        position: 'top',
        horizontalAlign: 'right',
    },
    grid: {
        borderColor: '#f1f1f1',
    }
};

// ── Area chart évolution du CA ───────────────────────────────────────────────
const revenueAreaChart: ChartType = {
    series: [
        { name: 'Chiffre d\'affaires net', data: Array(12).fill(0) },
    ],
    chart: {
        type: 'area',
        height: 200,
        toolbar: { show: false },
        sparkline: { enabled: false },
    },
    colors: ['#556ee6'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
        type: 'gradient',
        gradient: {
            shadeIntensity: 1,
            inverseColors: false,
            opacityFrom: 0.45,
            opacityTo: 0.02,
            stops: [20, 100, 100, 100]
        },
    },
    xaxis: {
        categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
            'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    },
    yaxis: {
        labels: {
            formatter: (val: number) => {
                if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
                if (val >= 1_000) return (val / 1_000).toFixed(0) + 'k';
                return val.toString();
            }
        }
    },
    tooltip: {
        y: {
            formatter: (val: number) => new Intl.NumberFormat('fr-FR').format(val) + ' FCFA'
        }
    },
    grid: { borderColor: '#f1f1f1' }
};

export { salesAnalyticsDonutChart, monthlyBarChart, revenueAreaChart };