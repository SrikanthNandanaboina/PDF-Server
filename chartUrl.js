const querystring = require("querystring");

const getChartUrl = ({ labels, data }) => {
  // Your data object
  const chartData = {
    data: {
      datasets: [
        {
          data,
          fill: false,
          backgroundColor: "#1463FF",
          borderColor: "#1463FF",
          pointRadius: 0,
          borderWidth: 1.543,
        },
      ],
      labels,
    },
    options: {
      plugins: {
        renderer: "png",
        output: "base64",
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          grid: {
            display: false, // Remove vertical lines
          },
          ticks: {
            color: "#626E99",
            font: {
              size: 9.258,
            },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "#BAC2DB", // Set horizontal line color
            borderWidth: 0.772,
          },
          ticks: {
            stepSize: 200,
            color: "#626E99",
            font: {
              size: 9.258,
            },
          },
        },
      },
    },
    type: "line",
  };

  // Encode the data object into a query string
  const encodedChartData = querystring.stringify({
    c: JSON.stringify(chartData),
  });

  // Construct the final URL
  const baseURL = "https://quickchart.io/chart?w=495&h=134&v=4&";
  const finalURL = baseURL + encodedChartData;

  return finalURL;
};

module.exports = { getChartUrl };
