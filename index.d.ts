declare function install (app: any): void;

declare const _default: {
    install(app: any): void;
};

export default _default;

// 扩展cached
declare module 'vue-router/types/router' {
    export interface Location {
        cache?: Boolean;
    }

    export interface VueRouter {
        back({ cache: boolean }): void;
        forward({ cache: boolean }): void;
        go(delta: number, { cache: boolean }): void;
    }
}
