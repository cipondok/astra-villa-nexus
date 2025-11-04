// Chart configurations and utilities
class ChartManager {
  constructor() {
    this.charts = {};
    this.defaultOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      }
    };
  }

  createTestTrendChart(ctx, data) {
    const dates = data.map(d => d.date);
    const passed = data.map(d => d.passed);
    const failed = data.map(d => d.failed);

    this.charts.testTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Passed',
            data: passed,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Failed',
            data: failed,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        ...this.defaultOptions,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 10
            }
          }
        }
      }
    });
  }

  createTestBreakdownChart(ctx, data) {
    this.charts.testBreakdown = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Unit Tests', 'E2E Tests', 'Visual Tests', 'Accessibility'],
        datasets: [{
          data: [85, 45, 42, 28],
          backgroundColor: [
            '#3b82f6',
            '#8b5cf6',
            '#ec4899',
            '#10b981'
          ]
        }]
      },
      options: {
        ...this.defaultOptions,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    });
  }

  createLighthouseScoresChart(ctx, data) {
    const dates = data.map(d => d.date);
    
    this.charts.lighthouseScores = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Performance',
            data: data.map(d => d.performance),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          },
          {
            label: 'Accessibility',
            data: data.map(d => d.accessibility),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        ...this.defaultOptions,
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: {
              callback: value => value + '%'
            }
          }
        }
      }
    });
  }

  createCoreWebVitalsChart(ctx, data) {
    const dates = data.map(d => d.date);
    
    this.charts.coreWebVitals = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'LCP (s)',
            data: data.map(d => d.lcp),
            borderColor: '#f59e0b',
            yAxisID: 'y',
            tension: 0.4
          },
          {
            label: 'CLS',
            data: data.map(d => d.cls),
            borderColor: '#8b5cf6',
            yAxisID: 'y1',
            tension: 0.4
          }
        ]
      },
      options: {
        ...this.defaultOptions,
        scales: {
          y: {
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: 'LCP (seconds)'
            }
          },
          y1: {
            type: 'linear',
            position: 'right',
            title: {
              display: true,
              text: 'CLS'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
  }

  createResourceBudgetChart(ctx, data) {
    this.charts.resourceBudget = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['HTML', 'JavaScript', 'CSS', 'Images', 'Fonts'],
        datasets: [{
          label: 'Current Size (KB)',
          data: [45, 480, 95, 850, 180],
          backgroundColor: '#3b82f6'
        }, {
          label: 'Budget (KB)',
          data: [50, 500, 100, 1000, 200],
          backgroundColor: '#d1d5db'
        }]
      },
      options: {
        ...this.defaultOptions,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => value + ' KB'
            }
          }
        }
      }
    });
  }

  createA11yViolationsChart(ctx, data) {
    const categories = Object.keys(data);
    const counts = Object.values(data);

    this.charts.a11yViolations = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categories,
        datasets: [{
          label: 'Violations',
          data: counts,
          backgroundColor: '#ef4444'
        }]
      },
      options: {
        ...this.defaultOptions,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  createCoverageTrendChart(ctx, data) {
    const dates = data.map(d => d.date);
    
    this.charts.coverageTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Lines',
            data: data.map(d => d.lines),
            borderColor: '#3b82f6',
            tension: 0.4
          },
          {
            label: 'Branches',
            data: data.map(d => d.branches),
            borderColor: '#8b5cf6',
            tension: 0.4
          },
          {
            label: 'Functions',
            data: data.map(d => d.functions),
            borderColor: '#10b981',
            tension: 0.4
          }
        ]
      },
      options: {
        ...this.defaultOptions,
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: {
              callback: value => value + '%'
            }
          }
        }
      }
    });
  }

  createCoverageByFileChart(ctx) {
    this.charts.coverageByFile = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['hooks/', 'components/ai/', 'components/ui/', 'lib/', 'pages/'],
        datasets: [{
          label: 'Coverage %',
          data: [92, 88, 75, 85, 70],
          backgroundColor: [
            '#10b981',
            '#10b981',
            '#f59e0b',
            '#10b981',
            '#ef4444'
          ]
        }]
      },
      options: {
        ...this.defaultOptions,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: {
              callback: value => value + '%'
            }
          }
        }
      }
    });
  }

  createVisualRegressionChart(ctx, data) {
    const dates = data.map(d => d.date);
    
    this.charts.visualRegression = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Passed',
            data: data.map(d => d.passed),
            backgroundColor: '#10b981',
            stack: 'stack0'
          },
          {
            label: 'Failed',
            data: data.map(d => d.failed),
            backgroundColor: '#ef4444',
            stack: 'stack0'
          }
        ]
      },
      options: {
        ...this.defaultOptions,
        scales: {
          y: {
            beginAtZero: true,
            stacked: true
          },
          x: {
            stacked: true
          }
        }
      }
    });
  }

  createBuildSizeChart(ctx, data) {
    const dates = data.map(d => d.date);
    
    this.charts.buildSize = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Total',
            data: data.map(d => d.total),
            borderColor: '#3b82f6',
            tension: 0.4
          },
          {
            label: 'JavaScript',
            data: data.map(d => d.js),
            borderColor: '#f59e0b',
            tension: 0.4
          },
          {
            label: 'CSS',
            data: data.map(d => d.css),
            borderColor: '#8b5cf6',
            tension: 0.4
          }
        ]
      },
      options: {
        ...this.defaultOptions,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => value + ' KB'
            }
          }
        }
      }
    });
  }

  createBundleSizeChart(ctx, data) {
    const dates = data.map(d => d.date);
    
    this.charts.bundleSize = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Total Size (KB)',
            data: data.map(d => d.totalSizeKB),
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Gzipped (KB)',
            data: data.map(d => d.gzipSizeKB),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'CSS (KB)',
            data: data.map(d => d.cssSizeKB),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        ...this.defaultOptions,
        plugins: {
          legend: {
            position: 'top'
          },
          annotation: {
            annotations: {
              totalLimit: {
                type: 'line',
                yMin: 500,
                yMax: 500,
                borderColor: 'rgba(239, 68, 68, 0.5)',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                  content: 'Total Limit: 500 KB',
                  enabled: true,
                  position: 'end',
                  backgroundColor: 'rgba(239, 68, 68, 0.8)'
                }
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => value + ' KB'
            }
          }
        }
      }
    });
  }

  destroyAll() {
    Object.values(this.charts).forEach(chart => chart.destroy());
    this.charts = {};
  }
}

window.chartManager = new ChartManager();
