import ResLoader, { resLoader } from "./ResLoader";
import { CompleteCallback, ProgressCallback, ResUtils } from "./ResUtils";

const { ccclass, property } = cc._decorator;

/** 自动释放配置 */
export interface IAutoResInfo {
    asset: cc.Asset;
    use: string;
}

@ccclass
export default class ResKeeper extends cc.Component {
    
    private _autoResInfo = [];

    /**
     * 完成一个Item的加载
     * @param item 资源对象实例
     * @param use 资源使用key
     */
    private _finishItem(item:any, use:string) {
        if (!this._cacheItem(item, use)) {
            cc.warn("_cacheItem item error! for uuid = " + item._uuid)
        }
    }
    /**
     * 缓存一个Item
     * @param item 资源对象实例
     * @param use 资源使用key
     */
    private _cacheItem(item:any, use:string):boolean {
        if (cc.isValid(item)) {
            var m = {
                asset:item,
                use:use
            }
            this._autoResInfo.push(m)
            return true
        }
        return false
    }

    /**
     * 加载资源
     * @param paths 资源路径
     * @param type 资源类型
     * @param onProgress 加载进度回调函数
     * @param onComplete 加载完成回调函数
     * @param bundleName 包名
     * @param use 资源使用key
     */
    loadRes(paths: string | string[], type: typeof cc.Asset, onProgress: ProgressCallback, onComplete: CompleteCallback, bundleName: string, use?: string): void;
    loadRes(paths: string | string[], onProgress: ProgressCallback, onComplete: CompleteCallback, bundleName: string, use?: string): void;
    loadRes(paths: string | string[], type: typeof cc.Asset, onComplete: CompleteCallback, bundleName: string, use?: string): void;
    loadRes(paths: string | string[], onComplete: CompleteCallback, bundleName: string, use?: string): void;
    loadRes(paths: string | string[], type: typeof cc.Asset, bundleName: string, use?: string): void;
    loadRes(paths: string | string[], bundleName: string, use?: string): void;
    loadRes() {
        var self = this;
        var args = ResUtils.makeLoadResArgs.apply(this, arguments);
        if (args) {
            var name = this.constructor.name;
            if (!args.use) {
                var key = "@" + name;
                args.use = key + resLoader.nextUseKey()
            }
            var complete = args.onComplete;
            args.onComplete = function (e:Error, asset:any) {
                if (!e) {
                    if (cc.isValid(asset)) {
                        if (asset instanceof Array) {
                            for (let i = 0; i < asset.length; i++) {
                                self._finishItem(asset[i], args.use);
                            }
                        }else{
                            self._finishItem(asset, args.use);
                        }
                    }
                }else{
                    if (asset instanceof Array) {
                        for (let i = 0; i < asset.length; i++) {
                            resLoader.releaseAsset(asset[i], args.use);
                        }
                    }else{
                        resLoader.releaseAsset(asset, args.use);
                    }
                    e = new Error(name + " Component ResKeeper inValid")
                    asset = null;
                }
                complete && complete(e, asset);
            }
            resLoader.loadRes(args);
        }
    }
    
    /**
     * 加载资源
     * @param dir 文件夹路径
     * @param type 资源类型
     * @param onProgress 加载进度回调函数
     * @param onComplete 加载完成回调函数
     * @param bundleName 包名
     * @param use 资源使用key
     */
    loadResDir(dir: string, type: typeof cc.Asset, onProgress: ProgressCallback, onComplete: CompleteCallback, bundleName: string, use?: string): void;
    loadResDir(dir: string, onProgress: ProgressCallback, onComplete: CompleteCallback, bundleName: string, use?: string): void;
    loadResDir(dir: string, type: typeof cc.Asset, onComplete: CompleteCallback, bundleName: string, use?: string): void;
    loadResDir(dir: string, onComplete: CompleteCallback, bundleName: string, use?: string): void;
    loadResDir(dir: string, type: typeof cc.Asset, bundleName: string, use?: string): void;
    loadResDir(dir: string, bundleName: string, use?: string): void;
    loadResDir() {
        var self = this;
        var args = ResUtils.makeLoadResArgs.apply(this, arguments);
        if (args) {
            var name = this.constructor.name;
            if (!args.use) {
                var key = "@" + name;
                args.use = key + resLoader.nextUseKey()
            }
            var complete = args.onComplete;
            args.onComplete = function (e:Error, asset:any) {
                if (!e) {
                    if (cc.isValid(asset)) {
                        if (asset instanceof Array) {
                            for (let i = 0; i < asset.length; i++) {
                                self._finishItem(asset[i], args.use);
                            }
                        }else{
                            self._finishItem(asset, args.use);
                        }
                    }
                }else{
                    if (asset instanceof Array) {
                        for (let i = 0; i < asset.length; i++) {
                            resLoader.releaseAsset(asset[i], args.use);
                        }
                    }else{
                        resLoader.releaseAsset(asset, args.use);
                    }
                    e = new Error(name + " Component ResKeeper inValid")
                    asset = null;
                }
                complete && complete(e, asset);
            }
            resLoader.loadResDir(args);
        }
    }
    
    /**
     * 加载远端资源
     * @param resArgs
     * @param url 远端地址
     * @param options 可选参数
     * @param onComplete 完成回调
     * @param use 资源使用key
     */
    loadRemote(url: string, options: Record<string, any>, onComplete: CompleteCallback, use?: string): void;
    loadRemote(url: string, options: Record<string, any>, use?: string): void;
    loadRemote(url: string, onComplete: CompleteCallback, use?: string): void;
    loadRemote(url: string, use?: string): void;
    loadRemote() {
        var self = this;
        var args = ResUtils.makeLoadResArgs.apply(this, arguments);
        if (args) {
            var name = this.constructor.name;
            if (!args.use) {
                var key = "@" + name;
                args.use = key + resLoader.nextUseKey()
            }
            var complete = args.onComplete;
            args.onComplete = function (e:Error, asset:any) {
                if (e) {
                    if (cc.isValid(self)) {
                        self._finishItem(asset, args.use);
                    }else{
                        resLoader.releaseAsset(asset, args.use);
                        e = new Error(name + " Component ResKeeper inValid");
                        asset = null;
                    }
                }
                complete && complete(e, asset);
            }
            resLoader.loadRemote(args);
        }
    }
    /**
     * 组件销毁时自动释放所有keep的资源
     */
    onDestroy(): void {
        this.releaseAutoRes();
    }
    /**
     * 释放资源，组件销毁时自动调用
     */
    releaseAutoRes(): void {
        for (let i = 0; i < this._autoResInfo.length; i++) {
            var item = this._autoResInfo[i];
            resLoader.releaseAsset(item.asset, item.use);
        }
        this._autoResInfo.length = 0;
    }
    /**
     * 加入一个自动释放的资源
     */
    addAutoRes(resConf: IAutoResInfo): void {
        resConf && this._finishItem(resConf.asset, resConf.use)
    }

}