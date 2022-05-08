import Router from 'vue-router';

const { push, go } = Router.prototype;

let keepAlive = true;

Router.prototype.push = function(...args) {
  const location = args[0];

  if (location && typeof location.keepAlive === 'boolean') {
    keepAlive = location.keepAlive;
  } else {
    keepAlive = false;
  }
  return push.apply(this, args);
};
Router.prototype.back = function(options) {
  if (options && typeof options.keepAlive === 'boolean') {
    keepAlive = options.keepAlive;
  }
  return go.apply(this, [-1]);
};
Router.prototype.go = function(num, options) {
  if (options && typeof options.keepAlive === 'boolean') {
    keepAlive = options.keepAlive;
  }
  return go.apply(this, [num]);
};

export default {
  getKeepAlive() {
    return keepAlive;
  },
  setKeepAlive(useKeepAlive) {
    keepAlive = useKeepAlive;
  }
};
