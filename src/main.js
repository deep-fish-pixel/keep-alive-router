import wrapRouter from './wrapRouter';

const KeepAliveRouterView = {
  name: 'KeepAliveRouterView',
  props: {
    cache: Boolean,
    include: RegExp,
    exclude: RegExp,
    max: Number,
    name: String,
    defaultCache: Boolean,
  },
  data() {
    wrapRouter.setDefaultCached(this.defaultCache);

    return {
      hasDestroyed: false,
      keepAliveRef: null,
      oldCache: {},
      pathCache: {},
      disabledCachedKeys: {},
    };
  },
  methods: {
    before(route, prev, next) {
      if (this.hasDestroyed) {
        return next();
      }
      this.setKeepAliveRef();
      next();
    },
    after(route) {
      if (this.hasDestroyed) {
        return true;
      }
      setTimeout(() => {
        if (!this.cache) {
          this.restoreCached();
        }
      }, 10);
      this.afterSyncReset(route);
    },
    afterSyncReset(route){
      setTimeout(() => {
        this.setKeepAliveRef();
        this.setCacheByPath();
        this.setMermoryCache();
        wrapRouter.setKeepAlive(true);
      }, 10);
    },
    setCacheByPath() {
      if (this.keepAliveRef && this.keepAliveRef.cache) {
        const newCache = this.keepAliveRef.cache;
        const oldCache = this.oldCache;
        const pathCacheJson = JSON.stringify(this.pathCache);
        Object.keys(newCache).some(key => {
          if(!oldCache[key]){
            const path = this.getRoutePath();
            if (path && !this.pathCache[path] && !pathCacheJson.match(RegExp(`:"${key}"`))) {
              this.pathCache[path] = key;
              return true;
            }
          }
        });
      }
    },
    getRoutePath(){
      const matched = this.$route.matched || [];
      return matched.length ? matched[matched.length - 1].path : null;
    },
    setKeepAliveRef() {
      const cachePage = this.$refs.cachedPage;
      if (cachePage && cachePage.$options.parent && cachePage.$options.parent.cacheVNode) {
        this.keepAliveRef = cachePage.$options.parent;
      }
    },
    setMermoryCache() {
      this.setKeepAliveRef();
      if (this.keepAliveRef && this.$refs.cachedPage) {
        this.oldCache = {...(this.keepAliveRef.cache || {})};
      }
    },
    restoreCached() {
      const cachePage = this.$refs.cachedPage;
      if (cachePage) {
        this.setKeepAliveRef();
        const path = this.getRoutePath();
        const key = this.pathCache[path];
        if (path && key) {
          this.setkeepAliveInValidate(key, path);
        }
      }
    },
    setkeepAliveInValidate(key, path){
      const cachePage = this.$refs.cachedPage;
      const newCache = this.keepAliveRef.cache;

      if (newCache[key]) {
        const vnode = newCache[key].componentInstance.$vnode;
        if(vnode.data){
          vnode.data.keepAlive = false;
        }
      }

      if (cachePage) {
        const keys = this.keepAliveRef.keys;
        if(keys){
          this.keepAliveRef.keys = keys.filter(item => item !== key);
          delete this.keepAliveRef.cache[key];
        }
      }
      delete this.oldCache[key];
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
    if (!this.cache || !wrapRouter.getKeepAlive()) {
      this.restoreCached();
    }
    if(!this.$refs.cachedPage) {
      this.afterSyncReset();
    }

    return createElement(
      'div',
      {
        attrs: {
          class: 'keep-alive-cache'
        }
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
          [this.cache ? createElement('router-view', {
            ref: "cachedPage",
            props: {
              name: this.name,
              key: this.$route.fullPath
            }
          }) : this._e()],
          1
        ),
        this.cache ? this._e() : createElement('router-view', {
          ref: "cachedPage",
          props: {
            name: this.name
          }
        })
      ],
      1
    )
  }
};

export default {
  install(Vue) {
    Vue.component(KeepAliveRouterView.name, KeepAliveRouterView);
  }
};
