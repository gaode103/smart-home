// register the service worker if available
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(function (reg) {
    console.log('Successfully registered service worker', reg);
  }).catch(function (err) {
    console.warn('Error whilst registering service worker', err);
  });
}
var model = {
  config: {
    sensors: {}
  },
  instantRequest: {}
};

function initView(settings) {
  settings.rooms.forEach(function (room) {
    var roomElement = appendChildWithClass(container, 'card');
    var roomTitle = appendChildWithClass(roomElement, 'card-title');
    roomTitle.innerText = room.label;
    var roomBody = appendChildWithClass(roomElement, 'card-body card-room');
    var heatingOn = appendChildWithClass(roomBody, 'room-heating');
    heatingOn.id = 'roomHeating' + room.id;
    heatingOn.innerText = '•';
    var currentTemp = appendChildWithClass(roomBody, 'room-current');
    currentTemp.id = 'roomCurrent' + room.id;
    var targetTemp = appendChildWithClass(roomBody, 'room-target');
    targetTemp.id = 'roomTarget' + room.id;

    var roomRequest = appendChildWithClass(roomElement, 'card-body');
    roomRequest.roomId = room.id;
    var roomActions = appendChildWithClass(roomTitle, 'card-actions');
    if (!settings.boiler.summer) {
      appendLinkWithAction(roomActions, 'Set', function () {
        RequestDialog.show(room.id);
      });
    }
    roomBody.onclick = function () {
      localStorage.setItem('roomId', room.id);
      window.location.href = '/room.html';
    }
  })
}

function mapSensorToRoom(rooms) {
  rooms.forEach(function (room) {
    model.config.sensors[room.sensorId] = room.id;
  });
}

function updateTemperature() {
  var t = new Date().getTime();
  model.temperatureReport.forEach(function (report) {
    var roomView = document.getElementById('roomCurrent' + model.config.sensors[report.id]);
    if (roomView) {
      roomView.innerText = report.temperature.toFixed(1);
      var diff = t - report.timestamp;
      if (diff < 120000) {
        roomView.style.color = 'green';
      } else if (diff < 300000) {
        roomView.style.color = 'red';
      } else {
        roomView.style.color = 'grey';
      }
    } else if (report.id === model.config.settings.cylinder.sensorId) {
      //var text = (report.extra === '0' ? '<span class="material-icons" style="color:red;font-size:16px;">horizontal_split</span> ' : '') + report.temperature.toFixed(1);
      var text = Math.min(((Math.max(report.temperature.toFixed(1) - 15, 0))/32) * 100, 100).toFixed(0) + '%'
        + (report.extra === '0' ? '<br><span class="material-icons" style="color:red;font-size:16px;">horizontal_split</span> ' : '');
      var  cylinderView = document.getElementById('cylinderView');
      cylinderView.innerHTML = text;
      var diff = t - report.timestamp;
      if (diff < 120000) {
        cylinderView.style.color = 'green';
      } else if (diff < 300000) {
        cylinderView.style.color = 'red';
      } else {
        cylinderView.style.color = 'grey';
      }
    } else if ((report.id === model.config.settings.ventilation.intakeSensorId)){
      document.getElementById('intake-temperature').innerText = report.temperature.toFixed(1);
    } else if ((report.id === model.config.settings.ventilation.exhaustSensorId)){
      document.getElementById('exhaust-temperature').innerText = report.temperature.toFixed(1);
    } else if ((report.id === model.config.settings.ventilation.toRoomSensorId)){
      document.getElementById('to-room-temperature').innerText = report.temperature.toFixed(1);
    } else if ((report.id === model.config.settings.ventilation.fromRoomSensorId)){
      document.getElementById('from-room-temperature').innerText = report.temperature.toFixed(1);
    }
  })
}
function updateTarget() {
  for (var roomId in model.targetReport) {
    document.getElementById('roomTarget' + roomId).innerText = model.targetReport[roomId].toFixed(1);
  }
}
var updateSwitch = function () {
  var settings = model.config.settings;
  var switches = model.switches;
  if (settings.boiler.summer) {
    boilerView.innerText = 'SUMMER';
  } else {
    boilerView.innerText = switches.charCodeAt(settings.boiler.requestSwitchId) == 49 ? 'ON' : 'OFF';
  }
  ventilationView.innerHTML = 'Main: ' + (switches.charCodeAt(settings.ventilation.mainCutoffSwitchId) == 49 ? 'off' : 'on') + '&nbsp;';
  ventilationView.innerHTML += 'Boost: ' + (switches.charCodeAt(settings.ventilation.boostCutoffSwitchId) == 49 ? 'feed' : 'light') + '&nbsp;';
  ventilationView.innerHTML += 'Feed: ' + (switches.charCodeAt(settings.ventilation.boostFeedSwitchId) == 49 ? 'on' : 'off');
  settings.rooms.forEach(function (room) {
    var className;
    if (settings.boiler.summer) {
      className = 'room-no-heating';
    } else {
      var isSwitchOn = model.switches.charCodeAt(room.switchId) == 49;
      className = isSwitchOn ? 'room-heating on' : 'room-heating off'
    }
    document.getElementById('roomHeating' + room.id).className = className;
  });
};

function setHoliday(event) {
  setHolidayToday(event.target.value);
}

getJson("/config/settings", function (settings) {
  model.config.settings = settings;
  settings.rooms.sort(function (a, b) {
    return ('' + a.label).localeCompare(b.label);
  });
  initView(settings);
  mapSensorToRoom(settings.rooms);
  getJson("/config/timer", function (timer) {
    model.config.timer = timer;
    if (timer.holidayToday) {
      holidayMode.checked = true;
    } else {
      normalMode.checked = true;
    }
  });
  getJson("/instantRequest/ventilation", function (ventilation) {
    model.instantRequest.ventilation = ventilation;
  });
  getJson("/instantRequest/heating", function (heating) {
    model.instantRequest.heating = heating;
  });
  getJson("/maintenance", function (override) {
    model.override = override;
  });
  var updateFn = function () {
    if (!navigator || navigator.onLine) {
      getJson("/temperatureReport", function (reports) {
        model.temperatureReport = reports;
        updateTemperature();
      });
      getJson("/targetReport", function (reports) {
        model.targetReport = reports;
        updateTarget();
      });
      getText("/switch", function (switches) {
        model.switches = switches;
        updateSwitch();
        successRequest();
      }, badRequest);
    } else {
      noRequest();
    }
  };
  updateFn();
  setInterval(updateFn, 5000);
});
