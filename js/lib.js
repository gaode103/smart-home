var config = {};
config.baseUrl = localStorage.getItem('baseUrl');
if (!config.baseUrl) {
  var serverIp = prompt("Please input server ip");
  config.baseUrl = "http://" + serverIp + ":8081";
  localStorage.setItem('baseUrl', config.baseUrl);
}

function getJson(url, cb, ce) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function (e) {
    var responseText = xhr.responseText;
    if (responseText) {
      resp = JSON.parse(responseText);
      //json.innerText += url + '\n' + JSON.stringify(resp, null, 2) + '\n';
      cb(resp);
    } else {
      cb(null);
    }
  };
  if (ce) {
    xhr.onerror = ce;
  }
  xhr.open("GET", config.baseUrl + url);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.send();
}
function setHolidayToday(isHoliday) {
  var xhr = new XMLHttpRequest();
  xhr.open("PUT", config.baseUrl + "/config/holidayToday?holiday=" + isHoliday);
  xhr.send();
}
function postJson(url, data, cb) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function (e) {
    cb(xhr.responseText);
  };
  xhr.open("POST", config.baseUrl + url);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(data));
}
function getText(url, cb, ce) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function (e) {
    cb(xhr.responseText);
  };
  if (ce) {
    xhr.onerror = ce;
  }
  xhr.open("GET", config.baseUrl + url);
  xhr.setRequestHeader("Accept", "text/plain");
  xhr.send();
}
function appendChildWithClass(elem, className) {
  var child = document.createElement('div');
  child.className = className;
  elem.appendChild(child);
  return child;
}
function appendLinkWithAction(elem, linkText, action) {
  var link = document.createElement('a');
  link.onclick = action;
  link.innerText = linkText;
  link.style = 'font-weight: 600';
  elem.appendChild(link);
  return link;
}
function appendButtonWithAction(elem, buttonText, action) {
  var button = document.createElement('button');
  button.onclick = action;
  button.innerText = buttonText;
  elem.appendChild(button);
  return button;
}
function appendChildWithAttribute(elem, tag, attrs) {
  var child = document.createElement(tag);
  for (var name in attrs) {
    child.setAttribute(name, attrs[name]);
  }
  elem.appendChild(child);
  return child;
}
function addValueButton(roomRequest, tempInput, number) {
  var button = appendButtonWithAction(roomRequest, number, function () {
    tempInput.value = number;
  });
  button.className = 'value-button';
}
function successRequest() {
  var indicator = document.getElementById('network_request');
  indicator.style.color = 'green';
  setTimeout(noRequest, 1000)
}
function noRequest() {
  var indicator = document.getElementById('network_request');
  indicator.style.color = 'black';
}
function badRequest() {
  var indicator = document.getElementById('network_request');
  indicator.style.color = 'red';
}

function offsetMillisToTime(millis) {
  var seconds = millis / 1000;
  var minutes = seconds / 60;
  var hours = Math.floor(minutes / 60);
  var minute = minutes % 60;
  if (hours < 10) hours = '0' + hours;
  if (minute < 10) minute = '0' + minute;
  return hours + ':' + minute;
}