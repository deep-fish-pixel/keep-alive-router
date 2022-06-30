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
      if (this.keepAliveRef && (!wrapRouter.getKeepAlive() || !to.meta.keepAlive)) {
        this.deleteCache(to.name, to.matched && to.matched[0] && (to.matched[0].instances && to.matched[0].instances.default || to.matched[0].instances));
      }
      next();
    },
    after() {
      if (this.hasDestroyed) {
        return true;
      }
      // 微前端中需要延迟较多时间
      setTimeout(() => {
        if (this.disabled || !wrapRouter.getKeepAlive()) {
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
        const newCache = this.$refs.cachedPage.$options.parent.cache;
        const oldCache = this.cache;
        Object.keys(newCache).forEach(key => {
          if(!oldCache[key]){
            this.setkeepAliveInValidate(newCache[key].componentInstance);
          }
        });
        this.$refs.cachedPage.$options.parent.cache = this.cache;
      }
    },
    deleteCache(name, instance){
      const cache = this.cache;
      if (cache) {
        Object.keys(cache).some((index) => {
          const item = cache[index];
          if(item && (item.name === name || item.componentInstance === instance)){
            delete cache[index];
            this.setkeepAliveInValidate(item.componentInstance);
            this.restoreCached();
            return true;
          }
        });
      }
    },
    setkeepAliveInValidate(componentInstance){
      if (!componentInstance) {
        return;
      }
      const vnode = componentInstance.$vnode;
      if(vnode.data){
        vnode.data.keepAlive = false;
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
