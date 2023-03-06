const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 防抖s
const debounce = ()=> {
  let timer = 0;
  let lastTimer = 0;
  return function (fn, delay = 300, immediate = true) {
    if (timer) {
      clearTimeout(timer);
    }
    if (immediate) {
      // 立即执行
      let callNow = !timer;
      timer = setTimeout(() => {
        if (lastTimer !== timer) {
          timer = 0;
          lastTimer = 0;
          fn();
        }
      }, delay);
      if (callNow) {
        lastTimer = timer;
        fn();
      }
    } else {
      // 非立即执行
      timer = setTimeout(() => {
        fn();
        timer = 0;
      }, delay);
    }
  };
}

module.exports = {
  formatTime,
  debounce
}