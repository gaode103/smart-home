window.chartColors = [
  'rgb(255, 99, 132)',
  'rgb(255, 159, 64)',
  'rgb(255, 205, 86)',
  'rgb(75, 192, 192)',
  'rgb(54, 162, 235)',
  'rgb(153, 102, 255)',
  'rgb(201, 203, 207)',
  'rgb(255, 99, 132)',
  'rgb(255, 159, 64)'
];

var roomChartConfig = {
  type: 'line',
  data: {
    datasets: []
  },
  options: {
    responsive: true,
    legend: {
      display: false
    },
    title: {
      display: false
    },
    elements: {
      point:{
        radius: 0
      }
    },
    scales: {
      xAxes: [{
        type: 'time',
        time: {
          unit: 'minute',
          stepSize: 10,
          displayFormats: {
            minute: 'HH:mm'
          }
        },
        display: true,
        scaleLabel: {
          display: false
        },
        ticks: {
          major: {
            fontStyle: 'bold',
            fontColor: '#FF0000'
          }
        }
      }],
      yAxes: [{
        display: true,
        scaleLabel: {
          display: false
        },
        ticks: {
          suggestedMin: 10,
          suggestedMax: 40
        }
      }]
    }
  }
};

var ctx = document.getElementById('room-chart').getContext('2d');
window.roomChart = new Chart(ctx, roomChartConfig);
var roomId = localStorage.getItem('roomId');
var roomDataSet;

var lastLoad = {
  timestamp: new Date().getTime() - 3600000 * 4
};

DataLoader.listen('temperatureHistory', function(h) {
  var len = h.length;
  if (len === 0) return;

  var init = !roomDataSet;
  if (init) {
    roomDataSet = {
      borderColor: window.chartColors[roomId],
      fill: false,
      data: []
    };
  }

  var excess = roomDataSet.data.length + len - 240;

  if (excess > 0) {
    roomDataSet.data.splice(0, excess);
  }
  for (var j = 0; j < len; j++) {
    roomDataSet.data.push({
      x: new Date(h[j].timestamp),
      y: h[j].temperature.toFixed(1)
    });
  }
  lastLoad.timestamp = h[len - 1].timestamp;
  if (init) {
    roomChartConfig.data.datasets.push(roomDataSet)
  }
  window.roomChart.update();
});

function url() {
  return '/temperatureHistory/' + roomId + "?t=" + lastLoad.timestamp;
}

DataLoader.add('temperatureHistory', url, 10000);
