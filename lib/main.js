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
      if (num > 0) {
        keepAlive = false;
      }
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
      hasDestroyed: false,
      keepAliveRef: null,
    };
  },

  methods: {
    before(to, from, next) {
      if (this.hasDestroyed) {
        return next();
      }
      this.setKeepAliveRef();
      if (this.keepAliveRef && (!wrapRouter.getKeepAlive() || !to.meta.keepAlive)) {
        this.deleteCache(to.name, to.matched && to.matched[0] && (to.matched[0].instances && to.matched[0].instances.default || to.matched[0].instances));
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
    },
    setKeepAliveRef() {
      if (this.$refs.cachedPage) {
        this.keepAliveRef = this.$refs.cachedPage.$options.parent;
      }
    },
    deleteCache(name, instance){
      const keepAliveRef = this.keepAliveRef;
      if (keepAliveRef) {
        const cache = keepAliveRef.cache || {};
        Object.keys(cache).some((index) => {
          const item = keepAliveRef.cache[index];
          if(item && (item.name === name || item.componentInstance === instance)){
            return delete keepAliveRef.cache[index];
          }
        });
      }
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
      {
        ref: "xxxxx",
      },
      [
        createElement(
          'keep-alive',
          {
            props: {
              include: this.include,
              exclude: this.exclude,
              max: this.max
            },
          },
          [createElement('router-view', {
            ref: "cachedPage",
            props: {
              name: this.name
            }
          })],
          1
        )
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
