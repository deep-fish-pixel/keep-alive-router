# keep-alive-router-view  [中文](./README-CH.md)
Extend vue keep-alive and router-view, add the function of automatically judging whether to use the cache. 

If the page uses keep-alive and router-view, the advantage is that the operation state of the previous step is quickly restored when the next page operation returns, and this experience is very good. 

But it also brings problems. 

When the user enters the page from the navigation menu or breadcrumb, a brand new page is needed, but the cached page is actually used, and this result is not what we want. 

keep-alive-router-view solves this problem. 

It only uses the cache when you operate $router.back and $router.go to return the page by default, and $router.push does not use the cache by default.

### Install
```npm i keep-alive-router-view```

### Steps for usage

#### First: import lib module

```
import 'keep-alive-router-view';
```

#### Second: use keep-alive-router-view component replace keep-alive and router-view components

keep-alive-router-view encapsulates keep-alive and router-view internally, 

so you only need to write the keep-alive-router-view component element.

The disabled attribute is used to disable the use of page caching.

```
<div id="app">
    <keep-alive-router-view :disabled="!$route.meta.keepAlive" />
</div>
```

#### Third: must use the method of the vue-router instance. Only after $router.go and $router.back are called, the cached page is used.

### keep-alive-router-view properties descriptions

| property | description | type | option | default |
| --- | --- | --- | --- | --- |
| disabled | whether to disable page caching | Boolean  | true/false | true |
| name | router-view name | String  | - | - |
| include | only components with matching names will be cached | RegExp  | - | - |
| exclude | any component whose name matches will not be cached | RegExp  | - | - |
| max | maximum number of component instances that can be cached | Number  | - | - |


### vue-router interface extensions

#### $router.push

The page displayed by the push interface does not use the cache function by default. If you need to use it, configure keepAlive to true

```javascript
this.$router.push({
  name: 'list',
  keepAlive: true
});
```
#### $router.back

The page displayed by the back interface uses the cache function by default. If disabled, configure keepAlive to false

```javascript
this.$router.back({
  keepAlive: false
});
```

#### $router.go

The page displayed by the go interface uses the cache function by default. If disabled, configure keepAlive to false

```javascript
this.$router.go(-1, {
  keepAlive: false
});
```
