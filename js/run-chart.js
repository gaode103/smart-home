
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
        title: {
            display: true,
            text: 'Room Temperature'
        },
        scales: {
            xAxes: [{
                type: 'time',
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Time'
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
                    display: true,
                    labelString: 'Temperature'
                }
            }]
        }
    }
};

var cylinderChartConfig = {
    type: 'line',
    data: {
        datasets: []
    },
    options: {
        responsive: true,
        title: {
            display: true,
            text: 'Cylinder Temperature'
        },
        scales: {
            xAxes: [{
                type: 'time',
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Time'
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
                    display: true,
                    labelString: 'Temperature'
                }
            }]
        }
    }
};

window.onload = function() {
    var ctx = document.getElementById('room-chart').getContext('2d');
    window.roomChart = new Chart(ctx, roomChartConfig);
    window.cylinderChart = new Chart(ctx, cylinderChartConfig);
    getJson("/config/settings", function (settings) {
        var labels = {};
        for (var i = 0; i < settings.rooms.length; i++) {
            var room = settings.rooms[i];
            labels[room.sensorId] = room.label;
        }
        var cylinderSensorId = settings.cylinder.sensorId;
        getJson('/temperatureHistory', function (history) {
            for (var i = 0; i < history.length; i++) {
                var h = history[i];
                if (h.length === 0) continue;
                if (h[0].id === cylinderSensorId) {
                    var cylinderDataSet = {
                        label: 'Sensor Pocket',
                        borderColor: window.chartColors[cylinderSensorId],
                        fill: false,
                        data: []
                    };
                    for (var j = 0; j < h.length; j++) {
                        cylinderDataSet.data.push({
                            x: new Date(h[j].timestamp),
                            y: h[j].temperature.toFixed(1)
                        });
                    }
                    cylinderChartConfig.data.datasets.push(cylinderDataSet);
                } else {
                    var roomDataSet = {
                        label: labels[h[0].id],
                        borderColor: window.chartColors[h[0].id],
                        fill: false,
                        data: []
                    };
                    for (var j = 0; j < h.length; j++) {
                        roomDataSet.data.push({
                            x: new Date(h[j].timestamp),
                            y: h[j].temperature.toFixed(1)
                        });
                    }
                    roomChartConfig.data.datasets.push(roomDataSet);
                }
            }
            window.roomChart.update();
            window.cylinderChart.update();
        });
    });
};
