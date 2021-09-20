var DataView={
  attach: function(element, fn) {
    if(element && fn) {
      element.updateView = function (data) {
        setTimeout(fn.bind(null, element, data), 0);
      }
    } else {
      console.log(element ? 'function not provided' : 'element not provided');
    }
  }
}