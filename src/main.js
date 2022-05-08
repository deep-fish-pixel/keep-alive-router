import Vue from 'vue';
import wrapRouter from './wrapRouter';

const Main = {
  name: 'KeepAliveRouter',
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

Vue.component(Main.name, Main);

export default Main;
