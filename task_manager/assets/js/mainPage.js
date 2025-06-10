// Chart.js 官方預設色彩配置
const CHART_COLORS = {
  red: '#FF6384',
  blue: '#36A2EB', 
  yellow: '#FFCE56',
  teal: '#4BC0C0',
  purple: '#9966FF',
  orange: '#FF9F40',
  pink: '#FF6384',
  // 帶透明度的版本
  redAlpha: 'rgba(255, 99, 132, 0.1)',
  blueAlpha: 'rgba(54, 162, 235, 0.1)',
  yellowAlpha: 'rgba(255, 206, 86, 0.1)',
  tealAlpha: 'rgba(75, 192, 192, 0.1)',
  purpleAlpha: 'rgba(153, 102, 255, 0.1)',
  orangeAlpha: 'rgba(255, 159, 64, 0.1)',
  pinkAlpha: 'rgba(255, 99, 132, 0.1)'
};

// 動態時間問候功能
function updateGreeting() {
  const now = new Date();
  const hour = now.getHours();
  let greeting;

  if (hour >= 5 && hour < 12) {
    greeting = "早安";
  } else if (hour >= 12 && hour < 18) {
    greeting = "午安";
  } else {
    greeting = "晚安";
  }

  // 更新標題中的問候語
  const titleElement = document.querySelector(".title");
  if (titleElement) {
    const username = titleElement.textContent.replace(/^(早安|午安|晚安)\s/, "");
    titleElement.textContent = `${greeting} ${username}`;
  }
}

// Project Status Chart
document.addEventListener("DOMContentLoaded", function () {
  // 初始化時間問候
  updateGreeting();

  // 每分鐘更新一次問候語（可選）
  setInterval(updateGreeting, 60000);

  // Get the chart elements
  const projectChartElement = document.getElementById("myDonutChart");
  const taskChartElement = document.getElementById("taskStatusChart");

  // Resize function for responsive charts
  function handleResize() {
    if (window.innerWidth < 992) {
      // For smaller screens
      Chart.defaults.plugins.legend.position = "bottom";
    } else {
      // For larger screens
      Chart.defaults.plugins.legend.position = "right";
    }
  }

  // Call once to initialize and set up event listener
  handleResize();
  window.addEventListener("resize", handleResize);

  // Create a local array to store chart instances
  const chartInstances = [];

  if (projectChartElement) {
    const ctx = projectChartElement.getContext("2d");

    // Get project status data from data attributes on the canvas
    const projectCompleted = parseInt(
      projectChartElement.getAttribute("data-completed") || 0
    );
    const projectOverdue = parseInt(
      projectChartElement.getAttribute("data-overdue") || 0
    );
    const projectNotStarted = parseInt(
      projectChartElement.getAttribute("data-not-started") || 0
    );
    const projectInProgress = parseInt(
      projectChartElement.getAttribute("data-in-progress") || 0
    );

    // Get project status percentages
    const projectCompletedPercent = projectChartElement.getAttribute(
      "data-completed-percent"
    );
    const projectOverduePercent = projectChartElement.getAttribute(
      "data-overdue-percent"
    );
    const projectNotStartedPercent = projectChartElement.getAttribute(
      "data-not-started-percent"
    );
    const projectInProgressPercent = projectChartElement.getAttribute(
      "data-in-progress-percent"
    );

    const myDonutChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [
          `已完成： ${projectCompletedPercent}% (${projectCompleted})`,
          `已逾期： ${projectOverduePercent}% (${projectOverdue})`,
          `未開始： ${projectNotStartedPercent}% (${projectNotStarted})`,
          `進行中： ${projectInProgressPercent}% (${projectInProgress})`,
        ],
        datasets: [
          {
            label: "專案狀態",
            data: [
              projectCompleted,
              projectOverdue,
              projectNotStarted,
              projectInProgress,
            ],
            backgroundColor: [
              CHART_COLORS.teal,   // 青色 - 已完成
              CHART_COLORS.red,    // 紅色 - 已逾期
              CHART_COLORS.yellow, // 黃色 - 未開始
              CHART_COLORS.blue,   // 藍色 - 進行中
            ],
            borderColor: ["#fff", "#fff", "#fff", "#fff"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: window.innerWidth < 992 ? "bottom" : "right",
            align: "center",
            labels: {
              boxWidth: 15,
              padding: 8,
              font: {
                size: 14,
                weight: "bold",
              },
            },
          },
          title: {
            display: false,
          },
        },
        cutout: "60%",
        layout: {
          padding: {
            left: 5,
            right: 10,
            top: 5,
            bottom: 5,
          },
        },
      },
    });

    // Add chart instance to our array
    chartInstances.push(myDonutChart);
  }

  // Task Status Chart with similar responsive configuration
  if (taskChartElement) {
    const taskCtx = taskChartElement.getContext("2d");

    // Get task status data from data attributes on the canvas
    const taskCompleted = parseInt(
      taskChartElement.getAttribute("data-completed") || 0
    );
    const taskOverdue = parseInt(
      taskChartElement.getAttribute("data-overdue") || 0
    );
    const taskNotStarted = parseInt(
      taskChartElement.getAttribute("data-not-started") || 0
    );
    const taskInProgress = parseInt(
      taskChartElement.getAttribute("data-in-progress") || 0
    );

    // Get task status percentages
    const taskCompletedPercent = taskChartElement.getAttribute(
      "data-completed-percent"
    );
    const taskOverduePercent = taskChartElement.getAttribute(
      "data-overdue-percent"
    );
    const taskNotStartedPercent = taskChartElement.getAttribute(
      "data-not-started-percent"
    );
    const taskInProgressPercent = taskChartElement.getAttribute(
      "data-in-progress-percent"
    );

    const taskStatusChart = new Chart(taskCtx, {
      type: "doughnut",
      data: {
        labels: [
          `已完成： ${taskCompletedPercent}% (${taskCompleted})`,
          `已逾期： ${taskOverduePercent}% (${taskOverdue})`,
          `未開始： ${taskNotStartedPercent}% (${taskNotStarted})`,
          `進行中： ${taskInProgressPercent}% (${taskInProgress})`,
        ],
        datasets: [
          {
            label: "任務狀態",
            data: [taskCompleted, taskOverdue, taskNotStarted, taskInProgress],
            backgroundColor: [
              CHART_COLORS.teal,   // 青色 - 已完成
              CHART_COLORS.red,    // 紅色 - 已逾期
              CHART_COLORS.yellow, // 黃色 - 未開始
              CHART_COLORS.blue,   // 藍色 - 進行中
            ],
            borderColor: ["#fff", "#fff", "#fff", "#fff"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: window.innerWidth < 992 ? "bottom" : "right",
            align: "center",
            labels: {
              boxWidth: 15,
              padding: 8,
              font: {
                size: 14,
                weight: "bold",
              },
            },
          },
          title: {
            display: false,
          },
        },
        cutout: "60%",
        layout: {
          padding: {
            left: 5,
            right: 10,
            top: 5,
            bottom: 5,
          },
        },
      },
    });

    // Add chart instance to our array
    chartInstances.push(taskStatusChart);
  }

  // Line charts for project and task trends
  const projectLineChart = document.getElementById("projectLineChart");
  const taskLineChart = document.getElementById("taskLineChart");

  if (projectLineChart) {
    const ctx = projectLineChart.getContext("2d");

    // Get data from the data attribute
    let projectData;
    try {
      projectData = JSON.parse(
        projectLineChart.getAttribute("data-chart-data")
      );
    } catch (e) {
      console.error("Error parsing project chart data:", e);
      // Use fallback data if parsing fails
      projectData = {
        labels: ["一月", "二月", "三月", "四月", "五月", "六月"],
        datasets: [
          {
            label: "已完成",
            data: [5, 8, 12, 15, 18, 23],
            borderColor: CHART_COLORS.teal,
            backgroundColor: CHART_COLORS.tealAlpha,
            tension: 0.4,
            fill: true,
          },
          {
            label: "進行中",
            data: [10, 12, 15, 18, 20, 18],
            borderColor: CHART_COLORS.blue,
            backgroundColor: CHART_COLORS.blueAlpha,
            tension: 0.4,
            fill: true,
          },
          {
            label: "未開始",
            data: [8, 6, 4, 5, 3, 2],
            borderColor: CHART_COLORS.yellow,
            backgroundColor: CHART_COLORS.yellowAlpha,
            tension: 0.4,
            fill: true,
          },
          {
            label: "已逾期",
            data: [2, 3, 2, 1, 2, 1],
            borderColor: CHART_COLORS.red,
            backgroundColor: CHART_COLORS.redAlpha,
            tension: 0.4,
            fill: true,
          },
        ],
      };
    }

    // Update colors for existing datasets if they exist
    if (projectData.datasets) {
      projectData.datasets.forEach((dataset) => {
        dataset.tension = dataset.tension || 0.4;
        dataset.fill = dataset.fill !== undefined ? dataset.fill : true;
        
        // Apply Chart.js official colors based on label
        if (dataset.label.includes('已完成') || dataset.label.includes('完成')) {
          dataset.borderColor = CHART_COLORS.teal;
          dataset.backgroundColor = CHART_COLORS.tealAlpha;
        } else if (dataset.label.includes('進行中')) {
          dataset.borderColor = CHART_COLORS.blue;
          dataset.backgroundColor = CHART_COLORS.blueAlpha;
        } else if (dataset.label.includes('未開始')) {
          dataset.borderColor = CHART_COLORS.yellow;
          dataset.backgroundColor = CHART_COLORS.yellowAlpha;
        } else if (dataset.label.includes('逾期')) {
          dataset.borderColor = CHART_COLORS.red;
          dataset.backgroundColor = CHART_COLORS.redAlpha;
        }
      });
    }

    const projectChart = new Chart(ctx, {
      type: "line",
      data: projectData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "專案數量",
            },
          },
          x: {
            title: {
              display: true,
              text: "月份",
            },
          },
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              font: {
                size: 12,
              },
            },
          },
          title: {
            display: false,
          },
        },
      },
    });

    // Add chart instance to our array
    chartInstances.push(projectChart);
  }

  if (taskLineChart) {
    const ctx = taskLineChart.getContext("2d");

    // Get data from the data attribute
    let taskData;
    try {
      taskData = JSON.parse(taskLineChart.getAttribute("data-chart-data"));
    } catch (e) {
      console.error("Error parsing task chart data:", e);
      // Use fallback data if parsing fails
      taskData = {
        labels: ["一月", "二月", "三月", "四月", "五月", "六月"],
        datasets: [
          {
            label: "已完成",
            data: [12, 19, 25, 32, 39, 45],
            borderColor: CHART_COLORS.teal,
            backgroundColor: CHART_COLORS.tealAlpha,
            tension: 0.4,
            fill: true,
          },
          {
            label: "進行中",
            data: [25, 29, 32, 38, 36, 30],
            borderColor: CHART_COLORS.blue,
            backgroundColor: CHART_COLORS.blueAlpha,
            tension: 0.4,
            fill: true,
          },
          {
            label: "未開始",
            data: [18, 15, 12, 10, 8, 6],
            borderColor: CHART_COLORS.yellow,
            backgroundColor: CHART_COLORS.yellowAlpha,
            tension: 0.4,
            fill: true,
          },
          {
            label: "已逾期",
            data: [5, 6, 4, 3, 5, 4],
            borderColor: CHART_COLORS.red,
            backgroundColor: CHART_COLORS.redAlpha,
            tension: 0.4,
            fill: true,
          },
        ],
      };
    }

    // Update colors for existing datasets if they exist
    if (taskData.datasets) {
      taskData.datasets.forEach((dataset) => {
        dataset.tension = dataset.tension || 0.4;
        dataset.fill = dataset.fill !== undefined ? dataset.fill : true;
        
        // Apply Chart.js official colors based on label
        if (dataset.label.includes('已完成') || dataset.label.includes('完成')) {
          dataset.borderColor = CHART_COLORS.teal;
          dataset.backgroundColor = CHART_COLORS.tealAlpha;
        } else if (dataset.label.includes('進行中')) {
          dataset.borderColor = CHART_COLORS.blue;
          dataset.backgroundColor = CHART_COLORS.blueAlpha;
        } else if (dataset.label.includes('未開始')) {
          dataset.borderColor = CHART_COLORS.yellow;
          dataset.backgroundColor = CHART_COLORS.yellowAlpha;
        } else if (dataset.label.includes('逾期')) {
          dataset.borderColor = CHART_COLORS.red;
          dataset.backgroundColor = CHART_COLORS.redAlpha;
        }
      });
    }

    const taskChart = new Chart(ctx, {
      type: "line",
      data: taskData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "任務數量",
            },
          },
          x: {
            title: {
              display: true,
              text: "月份",
            },
          },
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              font: {
                size: 12,
              },
            },
          },
          title: {
            display: false,
          },
        },
      },
    });

    // Add chart instance to our array
    chartInstances.push(taskChart);
  }

  // Additional charts with updated data
  const activeUsersChart = document.getElementById("activeUsersChart");
  const messageStatisticsChart = document.getElementById(
    "messageStatisticsChart"
  );
  const projectStatusComparisonChart = document.getElementById(
    "projectStatusComparisonChart"
  );
  const fileUploadTrendChart = document.getElementById("fileUploadTrendChart");

  // Function to safely parse JSON data from DOM
  function safeParseJSON(element, attributeName) {
    if (!element) return null;

    try {
      return JSON.parse(element.getAttribute(attributeName));
    } catch (e) {
      console.error(`Error parsing ${attributeName} data:`, e);
      return null;
    }
  }

  // Function to apply Chart.js official colors to datasets
  function applyOfficialColors(datasets) {
    const colorKeys = ['teal', 'blue', 'red', 'yellow', 'purple', 'orange'];
    
    datasets.forEach((dataset, index) => {
      const colorKey = colorKeys[index % colorKeys.length];
      
      if (!dataset.borderColor) {
        dataset.borderColor = CHART_COLORS[colorKey];
      }
      if (!dataset.backgroundColor) {
        dataset.backgroundColor = CHART_COLORS[colorKey + 'Alpha'] || `${CHART_COLORS[colorKey]}33`;
      }
    });
  }

  // Create Active Users Chart
  if (activeUsersChart) {
    const ctx = activeUsersChart.getContext("2d");
    const chartData = safeParseJSON(activeUsersChart, "data-chart-data");

    if (chartData) {
      // Ensure consistent structure whether data is nested or not
      const dataToUse = chartData.data || chartData;

      // Add tension and fill properties to datasets if they don't exist
      if (dataToUse.datasets) {
        dataToUse.datasets.forEach((dataset) => {
          dataset.tension = dataset.tension || 0.4;
          dataset.fill = dataset.fill !== undefined ? dataset.fill : true;
        });
        
        // Apply Chart.js official colors
        applyOfficialColors(dataToUse.datasets);
      }

      const activeUsersChartInstance = new Chart(ctx, {
        type: "line",
        data: dataToUse,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "數量",
              },
            },
            x: {
              title: {
                display: true,
                text: "月份",
              },
            },
          },
          plugins: {
            legend: {
              position: "top",
              labels: {
                font: {
                  size: 12,
                },
              },
            },
            title: {
              display: false,
            },
          },
        },
      });

      // Add chart instance to our array
      chartInstances.push(activeUsersChartInstance);
    }
  }

  // Fix for the "charts is not iterable" error
  function resizeCharts() {
    // Use our local array of chart instances instead of Chart.instances
    chartInstances.forEach((chart) => {
      if (chart && typeof chart.resize === "function") {
        chart.resize();
      }
    });
  }

  // Add resize listener for charts
  window.addEventListener("resize", function () {
    handleResize();
    resizeCharts();
  });

  // Also adjust canvas when tabs are switched or DOM changes
  const resizeObserver = new ResizeObserver((entries) => {
    resizeCharts();
  });

  document.querySelectorAll(".chart-canvas-container").forEach((container) => {
    resizeObserver.observe(container);
  });

  // Create File Upload Trend Chart
  if (fileUploadTrendChart) {
    const ctx = fileUploadTrendChart.getContext("2d");
    const chartData = safeParseJSON(fileUploadTrendChart, "data-chart-data");

    if (chartData) {
      // Fix for JavaScript values in Python - convert string booleans to actual booleans
      if (chartData.options) {
        const fixBooleanValues = (obj) => {
          for (const key in obj) {
            if (obj[key] === "true") obj[key] = true;
            if (obj[key] === "false") obj[key] = false;
            if (typeof obj[key] === "object" && obj[key] !== null) {
              fixBooleanValues(obj[key]);
            }
          }
        };
        fixBooleanValues(chartData.options);
      }

      const chartType = chartData.type || "bar";

      // Ensure chartOptions exists
      if (!chartData.options) {
        chartData.options = {};
      }

      // Add tooltip callbacks that were removed from Python
      if (!chartData.options.plugins) {
        chartData.options.plugins = {};
      }

      if (!chartData.options.plugins.tooltip) {
        chartData.options.plugins.tooltip = {};
      }

      if (!chartData.options.plugins.tooltip.callbacks) {
        chartData.options.plugins.tooltip.callbacks = {};
      }

      // Add the footer callback directly in JavaScript
      chartData.options.plugins.tooltip.callbacks.footer = function (
        tooltipItems
      ) {
        return "月份統計資訊";
      };

      // Add label formatter for better tooltip display
      chartData.options.plugins.tooltip.callbacks.label = function (context) {
        let label = context.dataset.label || "";
        if (label) {
          label += ": ";
        }
        if (context.parsed.y !== null) {
          if (label.includes("MB")) {
            label += parseFloat(context.parsed.y).toFixed(2) + " MB";
          } else {
            label += context.parsed.y;
          }
        }
        return label;
      };

      // Use data property if available, otherwise use the chartData directly
      const dataToUse = chartData.data || chartData;

      // Apply Chart.js official colors to datasets
      if (dataToUse.datasets) {
        applyOfficialColors(dataToUse.datasets);
      }

      // Create chart with explicit dataset types for mixed chart
      const fileUploadChart = new Chart(ctx, {
        type: chartType,
        data: dataToUse,
        options: chartData.options,
      });

      // Add chart instance to our array
      chartInstances.push(fileUploadChart);
    }
  }
});