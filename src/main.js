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

export default {
  install(Vue) {
    Vue.component(KeepAliveRouterView.name, KeepAliveRouterView);
  }
};
