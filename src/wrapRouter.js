const objectClass = Object;
// 解决跨微前端问题
objectClass.__keepAlive = true;

const wrapRouter = {
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
        wrapRouter.setKeepAlive(location.keepAlive);
      } else {
        wrapRouter.setKeepAlive(false);
      }
      return push.apply(this, args);
    };
    router.back = function(options) {
      if (options && typeof options.keepAlive === 'boolean') {
        wrapRouter.setKeepAlive(options.keepAlive);
      }
      return go.apply(this, [-1]);
    };
    router.go = function(num, options) {
      if (num > 0) {
        wrapRouter.setKeepAlive(false);
      }
      if (options && typeof options.keepAlive === 'boolean') {
        wrapRouter.setKeepAlive(options.keepAlive);
      }
      return go.apply(this, [num]);
    };
  }
};

export default wrapRouter;
