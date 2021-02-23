export default function throttle(func, timeFrame) {
  var lastTime = 0;
  return (...args) => {
    var now = Date.now()
    if (now - lastTime >= timeFrame) {
      func(...args);
      lastTime = now;
    }
  };
}