
var roomId = localStorage.getItem('roomId');

var model = {
  room: {}
};

DataView.attach(isHeating, function(element, data) {
  element.innerText = data == 49 ? '•' : ''
});

DataView.attach(currentTemperature, function(element, data) {
  if (typeof data === 'number') {
    element.innerText = data.toFixed(1);
  }
});

DataView.attach(targetTemperature, function(element, data) {
  if (typeof data === 'number') {
    element.innerText = data.toFixed(1);
  }
});

instantRequest.onclick = function() {
  RequestDialog.show(roomId);
};

DataView.attach(instantRequest, function(element, data) {
  if (data && data.endTime > new Date().getTime()) {
    var time = new Date(data.endTime);
    element.innerHTML = data.temperature.toFixed(1) + ' → ' + time.getHours() + ':' + time.getMinutes();
  } else {
    element.innerHTML = 'Request';
  }
});

DataView.attach(schedule, function(element, data) {
  var offsetMillis = data.offsetMillis;
  element.innerHTML = '';
  model.schedules.forEach(function(s){
    var schedule = offsetMillisToTime(s.offsetMillis) + ' ' + s.temperature.toFixed(1);
    if (s.offsetMillis === offsetMillis) {
      schedule = '<span class="active-schedule">' + schedule + '</span>'
    }
    element.innerHTML += schedule + '<br/>';
  });
});


label.onclick = function() {
  window.location.href = '/';
};

DataView.attach(label, function(element, data) {
  element.innerText = data;
});


DataLoader.listen('settings', function(settings) {
  settings.rooms.forEach(function(r) {
    if (r.id == roomId) {
      model.room = r;
    }
  });

  label.updateView(model.room.label);

  DataLoader.add('schedules', '/config/schedule?roomId=' + roomId);
});

DataLoader.listen('schedules', function(schedules){
  model.schedules = schedules;
  DataLoader.add('switch', '/switch', 10000, 'text');
  DataLoader.add('temperatureReport', '/temperatureReport', 10000);
  DataLoader.add('targetReport', '/targetReport', 10000);
  DataLoader.add('instantRequest', '/instantRequest/heating', 10000);
  DataLoader.add('schedule', '/schedule/heating?roomId=' + roomId, 10000);
});

DataLoader.listen('switch', function(switches){
  if (model.room.switchId) {
    isHeating.updateView(switches.charCodeAt(model.room.switchId))
  }
});

DataLoader.listen('temperatureReport', function(data) {
  data.forEach(function(report){
    if (report.id === model.room.sensorId) {
      currentTemperature.updateView(report.temperature)
    }
  })
});

DataLoader.listen('targetReport', function(data) {
  targetTemperature.updateView(data[roomId]);
});

DataLoader.listen('instantRequest', function(data) {
  var req;
  data.forEach(function(request){
    if (request.roomId == roomId) {
      req = request;
    }
  });
  instantRequest.updateView(req);
});

DataLoader.listen('schedule', function(data) {
  if (data) {
    schedule.updateView(data);
  }
});

DataLoader.add('settings', '/config/settings');
