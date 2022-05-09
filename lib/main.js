'use strict';

let keepAlive = true;

var wrapRouter = {
  getKeepAlive() {
    return keepAlive;
  },
  setKeepAlive(useKeepAlive) {
    keepAlive = useKeepAlive;
  },
  wrap(router) {
    const { push, go } = router;

    router.push = function(...args) {
      const location = args[0];

      if (location && typeof location.keepAlive === 'boolean') {
        keepAlive = location.keepAlive;
      } else {
        keepAlive = false;
      }
      return push.apply(this, args);
    };
    router.back = function(options) {
      if (options && typeof options.keepAlive === 'boolean') {
        keepAlive = options.keepAlive;
      }
      return go.apply(this, [-1]);
    };
    router.go = function(num, options) {
      if (options && typeof options.keepAlive === 'boolean') {
        keepAlive = options.keepAlive;
      }
      return go.apply(this, [num]);
    };
  }
};

const KeepAliveRouterView = {
  name: 'KeepAliveRouterView',
  props: {
    disabled: Boolean,
    include: RegExp,
    exclude: RegExp,
    max: Number,
    name: String
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
    wrapRouter.wrap(this.$router.constructor.prototype);
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
      [
        createElement(
          'keep-alive',
          {
            attrs: {
              include: this.include,
              exclude: this.exclude,
              max: this.max
            }
          },
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

var main = {
  install(Vue) {
    Vue.component(KeepAliveRouterView.name, KeepAliveRouterView);
  }
};

module.exports = main;
