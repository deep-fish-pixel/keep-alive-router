'use strict';

const objectClass = Object;
// 解决跨微前端问题
objectClass.__keepAlive = true;

var wrapRouter = {
  getKeepAlive() {
    return objectClass.__keepAlive;
  },
  setKeepAlive(useKeepAlive) {
    objectClass.__keepAlive = useKeepAlive;
  },
  wrap(router) {
    const { push, go } = router;

    router.push = function(...args) {
      const location = args[0];

      if (location && typeof location.keepAlive === 'boolean') {
        objectClass.__keepAlive = location.keepAlive;
      } else {
        objectClass.__keepAlive = false;
      }
      return push.apply(this, args);
    };
    router.back = function(options) {
      if (options && typeof options.keepAlive === 'boolean') {
        objectClass.__keepAlive = options.keepAlive;
      }
      return go.apply(this, [-1]);
    };
    router.go = function(num, options) {
      if (num > 0) {
        objectClass.__keepAlive = false;
      }
      if (options && typeof options.keepAlive === 'boolean') {
        objectClass.__keepAlive = options.keepAlive;
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
      cache: {}
    };
  },

  methods: {
    before(to, from, next) {
      if (this.hasDestroyed) {
        return next();
      }
      this.setKeepAliveRef();
      next();
    },
    after() {
      if (this.hasDestroyed) {
        return true;
      }
      // 微前端中需要延迟较多时间
      setTimeout(() => {
        if (this.disabled) {
          this.restoreCached();
        }
        wrapRouter.setKeepAlive(true);
      }, 10);
    },
    setKeepAliveRef() {
      if (this.$refs.cachedPage) {
        this.keepAliveRef = this.$refs.cachedPage.$options.parent;
        this.cache = {...(this.keepAliveRef.cache || {})};
      }
    },
    restoreCached() {
      if (this.$refs.cachedPage) {
        this.$refs.cachedPage.$options.parent.cache = this.cache;
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
  render () {
    const createElement = this._self._c || this.$createElement;

    return [
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
    ];
  }
};

var main = {
  install(Vue) {
    Vue.component(KeepAliveRouterView.name, KeepAliveRouterView);
  }
};

module.exports = main;
