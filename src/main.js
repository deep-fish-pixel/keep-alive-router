import wrapRouter from './wrapRouter';

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

export default {
  install(Vue) {
    Vue.component(KeepAliveRouterView.name, KeepAliveRouterView);
  }
};
