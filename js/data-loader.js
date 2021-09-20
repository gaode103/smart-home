var DataLoader = function () {
  var data = {};
  var loaders = {};
  var listeners = {};

  function t() {
    return new Date().getTime();
  }

  var loader = {
    add: function (name, path, interval, type) {
      loaders[name] = {name: name, path: path, interval: interval, start: t(), type: type};
      data[name] = {
        lastRead: 0
      };
    },
    remove: function (name) {
      delete loaders[name];
    },
    load: function (name) {
      var loaderInfo = loaders[name];
      if (loaderInfo) {
        loaderInfo.start = t();
      }
    },
    listen: function (name, fn) {
      var listener = listeners[name];
      if (!listener) {
        listener = [];
        listeners[name] = listener;
      }
      listener.push(fn);
    },
    removeListener: function (name, fn) {
      var listener = listeners[name];
      if (listener) {
        var index = listener.indexOf(fn);
        if (index > -1) {
          listener.splice(index, 1);
        }
      }

    },
    get: function (name) {
      if (data[name]) {
        return data[name].payload
      }
    }
  };

  function onFail(e) {
    console.log(e);
  }

  function loadEntry(loaderInfo) {
    var url = loaderInfo.path;
    if (typeof url === 'function') {
      url = url();
    }
    if (loaderInfo.type === 'text') {
      getText(url, function(obj){
        var entry = data[loaderInfo.name];
        entry.payload = obj;
        entry.lastLoaded = t();
      }, onFail);
    } else {
      getJson(url, function (obj) {
        var entry = data[loaderInfo.name];
        entry.payload = obj;
        entry.lastLoaded = t();
      }, onFail);
    }
  }

  function load() {
    var now = t();
    for (var name in loaders) {
      try {
        var loaderInfo = loaders[name];
        if (loaderInfo && now > loaderInfo.start) {
          if (loaderInfo.interval) {
            loaderInfo.start = now + loaderInfo.interval;
          } else {
            loaderInfo.start = Number.MAX_VALUE;
          }
          setTimeout(loadEntry.bind(null, loaderInfo), 0);
        }
      } catch (e) {
        onFail(e);
      }
    }
    for (var name in listeners) {
      var entry = data[name];
      if (entry && entry.lastLoaded > entry.lastRead) {
        entry.lastRead = t();
        listeners[name].forEach(function (fn) {
          setTimeout(fn.bind(null, entry.payload), 0);
        });
      }
    }
  }

  setInterval(load, 1);
  return loader;
}();