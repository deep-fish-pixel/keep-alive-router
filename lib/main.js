'use strict';

var Vue = require('vue');
var Router = require('vue-router');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Vue__default = /*#__PURE__*/_interopDefaultLegacy(Vue);
var Router__default = /*#__PURE__*/_interopDefaultLegacy(Router);

const { push, go } = Router__default["default"].prototype;

let keepAlive = true;

Router__default["default"].prototype.push = function(...args) {
  const location = args[0];

  if (location && typeof location.keepAlive === 'boolean') {
    keepAlive = location.keepAlive;
  } else {
    keepAlive = false;
  }
  return push.apply(this, args);
};
Router__default["default"].prototype.back = function(options) {
  if (options && typeof options.keepAlive === 'boolean') {
    keepAlive = options.keepAlive;
  }
  return go.apply(this, [-1]);
};
Router__default["default"].prototype.go = function(num, options) {
  if (options && typeof options.keepAlive === 'boolean') {
    keepAlive = options.keepAlive;
  }
  return go.apply(this, [num]);
};

var wrapRouter = {
  getKeepAlive() {
    return keepAlive;
  },
  setKeepAlive(useKeepAlive) {
    keepAlive = useKeepAlive;
  }
};

const Main = {
  name: 'KeepAliveRouterView',
  props: {
    include: RegExp,
    exclude: RegExp,
    max: Number,
    name: String,
    disabled: Boolean
  },
  data() {
    return {
      hasDestroyed: false
    };
  },

  methods: {
    before(to, from, next) {
      if (this.hasDestroyed) {
        return next();
      }
      next();
    },
    after() {
      if (this.hasDestroyed) {
        return true;
      }
      this.$nextTick(() => {
        wrapRouter.setKeepAlive(true);
      });
    }
  },

  created () {
    this.cache = Object.create(null);
    this.$router.beforeEach(this.before);
    this.$router.afterEach(this.after);
  },
  destroyed () {
    this.hasDestroyed = true;
  },
  mounted () {
  },
  render () {
    const createElement = this._self._c || this.$createElement;

    return createElement(
      'div',
      {
        attrs: {
          include: this.include,
          exclude: this.exclude,
          max: this.max
        }
      },
      [
        createElement(
          'keep-alive',
          [!this.disabled && wrapRouter.getKeepAlive() ? createElement('router-view', {
            attrs: {
              name: this.name
            }
          }) : this._e()],
          1
        ),
        this.disabled || !wrapRouter.getKeepAlive() ? createElement('router-view', {
          attrs: {
            name: this.name
          }
        }) : this._e()
      ],
      1
    );
  }
};

Vue__default["default"].component(Main.name, Main);

module.exports = Main;
