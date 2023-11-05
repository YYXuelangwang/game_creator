import ResLeakChecker, { resLeakChecker } from "./ResLeakChecker";
import { CompleteCallback, ICacheResInfo, LoadRemoteArgs, LoadResArgs, LoadResMixArgs, ProgressCallback, ResUtils } from "./ResUtils";
import { ComUtils } from "./utils/ComUtils";

const { ccclass, property } = cc._decorator;


@ccclass
export default class ResLoader extends cc.Component {

    static _instance:ResLoader = null;
    static get instance():ResLoader {
      if (!this._instance) {
        this._instance = new ResLoader();
      }
      return this._instance;
    }

    private _resMap = new Map;
    private _usedId = 0;

    public static getInstance() {
        if (!ResLoader._instance) {
            ResLoader._instance = new ResLoader();
        }
        return ResLoader._instance;
    }

    public dump() {
        console.log(this._resMap);
    }

    /**
     * 生成一个资源使用Key
     * @param where 在哪里使用，如Scene、UI、Pool
     * @param who 使用者，如Login、UIHelp...
     * @param why 使用原因，自定义...
     */
    makeUseKey(where: string, who?: string, why?: string): string {
        who = who == null ? "none" : who;
        why = why == null ? "" : why;
        return "use_" + where + "_by_" + who + "_for_" + why;
    }

    /**
     * 自动生成一个唯一的资源id
     */
    nextUseKey(): string {
        return "@" + ++this._usedId;
    }

    /**
     * 获取资源缓存信息
     * @param uuid 资源uuid
     */
    getCacheResInfo(uuid: string): ICacheResInfo {
        return this._resMap.get(uuid);
    }
    /**
     * 完成一个Item的加载
     * @param item 资源对象实例
     * @param bundleName 包名
     * @param use 资源使用key
     * @param stack 堆栈信息
     */
    private _finishItem(item:any, bundleName:string, use:string, stack:string) {
        if (!this._cacheItem(item, bundleName, use, stack)) {
            cc.warn("_cacheItem item error! for " + item._uuid);
        }
    }

    /**
     * 缓存一个Item
     * @param item 资源对象实例
     * @param bundleName 包名
     * @param use 资源使用key
     * @param stack 堆栈信息
     */
    private _cacheItem(item:any, bundleName:string, use:string, stack:string): boolean {
        if (cc.isValid(item) && item._uuid) {
            if (!this._resMap.has(item._uuid)) {
                this._resMap.set(item._uuid, {
                    bundleName:bundleName,
                    uses: new Set,
                })
                item.addRef && item.addRef();
            }
            var info = this.getCacheResInfo(item._uuid);
            if (info && use) {
                info.uses.add(use);
                resLeakChecker.logLoad(item._uuid, use, stack)
            }
            return true;
        }
        return false
    }

    /**
     * 为某资源增加一个新的use
     * @param key 资源的uuid
     * @param use 新的use字符串
     */
    addUse(key: string, use: string): boolean{
        if (this._resMap.has(key)) {
            var m = this._resMap.get(key).uses;
            if (m.has(use)) {
                console.warn("addUse " + key + " by " + use + " faile, repeating use key");
                return false;
            }else{
                m.add(use);
                resLeakChecker.logLoad(key, use);
                return true;
            }
        }
        console.log("addUse " + key + " faile, key nofound, make sure you load with resloader");
        return false;
    }

    /**
     * 加载单个或一组资源
     * @param resArgs
     * @param paths 资源路径（数组）
     * @param type 资源类型
     * @param onProgress 加载进度回调函数
     * @param onComplete 加载完成回调函数
     * @param bundleName 包名
     * @param use 资源使用key
     */
    loadRes(resArgs: LoadResArgs): void;
    loadRes(paths: string | string[], type: typeof cc.Asset, onProgress: ProgressCallback, onComplete: CompleteCallback, bundleName: string, use: string): void;
    loadRes(paths: string | string[], onProgress: ProgressCallback, onComplete: CompleteCallback, bundleName: string, use: string): void;
    loadRes(paths: string | string[], type: typeof cc.Asset, onComplete: CompleteCallback, bundleName: string, use: string): void;
    loadRes(paths: string | string[], onComplete: CompleteCallback, bundleName: string, use: string): void;
    loadRes(paths: string | string[], type: typeof cc.Asset, bundleName: string, use: string): void;
    loadRes(paths: string | string[], bundleName: string, use: string): void;
    loadRes() {
        var self = this;
        var args = ResUtils.makeLoadResArgs.apply(this, arguments);
        if (args) {
            var m;
            if (resLeakChecker.checkFilter(args.url)) {
                m = ComUtils.getCallStack(1);
            }
            var onComplete = function(e:Error, asset:any) {
                if (e) {
                    console.error(e);
                }else if (asset instanceof Array){
                    for (let i = 0; i < asset.length; i++) {
                        self._finishItem(asset[i], args.bundleName, args.use, m);
                    }
                }else{
                    self._finishItem(asset, args.bundleName, args.use, m);
                }
                args.onComplete && args.onComplete(e, asset);
            }
            var bundle = cc.assetManager.getBundle(args.bundleName);
            if (cc.isValid(bundle)) {
                if (args.url) {
                    bundle.load(args.url, args.type, args.onProgress, onComplete);
                }else{
                    bundle.load(args.urls, args.type, args.onProgress, onComplete);
                }
            }else{
                console.error("ResLoader.loadRes() - bundle[" + args.bundleName + "]不存在")
            }
        }
    }

    /**
     * 预加载单个或一组资源
     * @param resArgs
     * @param paths 资源路径（数组）
     * @param type 资源类型
     * @param onProgress 加载进度回调函数
     * @param onComplete 加载完成回调函数
     * @param bundleName 包名
     */
    preloadRes(resArgs: LoadResArgs): void;
    preloadRes(paths: string | string[], type: typeof cc.Asset, onProgress: ProgressCallback, onComplete: CompleteCallback, bundleName: string): void;
    preloadRes(paths: string | string[], onProgress: ProgressCallback, onComplete: CompleteCallback, bundleName: string): void;
    preloadRes(paths: string | string[], type: typeof cc.Asset, onComplete: CompleteCallback, bundleName: string): void;
    preloadRes(paths: string | string[], onComplete: CompleteCallback, bundleName: string): void;
    preloadRes(paths: string | string[], type: typeof cc.Asset, bundleName: string): void;
    preloadRes(paths: string | string[], bundleName: string): void;
    preloadRes() {
        var args = ResUtils.makeLoadResArgs.apply(this, arguments);
        if (args) {
            var bundle = cc.assetManager.getBundle(args.bundleName);
            if (cc.isValid(bundle)) {
                if (args.url) {
                    bundle.preload(args.url, args.type, args.onProgress, args.onComplete);
                }else{
                    bundle.preload(args.urls, args.type, args.onProgress, args.onComplete);
                }
            }else{
                console.error("ResLoader.preloadRes() - bundle[" + args.bundleName + "]不存在");
            }
        }
    }

    /**
     * 加载目标文件夹资源
     * @param resArgs
     * @param dir 文件夹路径
     * @param type 资源类型
     * @param onProgress 加载进度回调函数
     * @param onComplete 加载完成回调函数
     * @param bundleName 包名
     * @param use 资源使用key
     */
    loadResDir(resArgs: LoadResArgs): void;
    loadResDir(dir: string, type: typeof cc.Asset, onProgress: ProgressCallback, onComplete: CompleteCallback, bundleName: string, use: string): void;
    loadResDir(dir: string, onProgress: ProgressCallback, onComplete: CompleteCallback, bundleName: string, use: string): void;
    loadResDir(dir: string, type: typeof cc.Asset, onComplete: CompleteCallback, bundleName: string, use: string): void;
    loadResDir(dir: string, type: typeof cc.Asset, bundleName: string, use: string): void;
    loadResDir(dir: string, onComplete: CompleteCallback, bundleName: string, use: string): void;
    loadResDir(dir: string, bundleName: string, use: string): void;
    loadResDir() {
        var self = this;
        var args = ResUtils.makeLoadResArgs.apply(this, arguments);
        if (args) {
            var m;
            if (resLeakChecker.checkFilter(args.url)) {
                m = ComUtils.getCallStack(1);
            }
            var onComple = function(e:Error, asset:any) {
                if (e) {
                    console.error(e);
                }else if (asset instanceof Array) {
                    for (let i = 0; i < asset.length; i++) {
                        self._finishItem(asset[i], args.bundleName, args.use, m)
                    }
                }else{
                    self._finishItem(asset, args.bundleName, args.use, m);
                }
                args.onComple && args.onComple(e, asset);
            }
            var bundle = cc.assetManager.getBundle(args.bundleName);
            if (cc.isValid(bundle)) {
                bundle.loadDir(args.url, args.type, args.onProgress, onComple);
            }else{
                console.error("ResLoader.loadResDir() - bundle[" + args.bundleName + "]不存在");
            }
        }
    }

    /**
     * 预加载目标文件夹资源
     * @param resArgs
     * @param dir 文件夹路径
     * @param type 资源类型
     * @param onProgress 加载进度回调函数
     * @param onComplete 加载完成回调函数
     * @param bundleName 包名
     */
    preloadResDir(resArgs: LoadResArgs): void;
    preloadResDir(dir: string, type: typeof cc.Asset, onProgress: ProgressCallback, onComplete: CompleteCallback, bundleName: string): void;
    preloadResDir(dir: string, onProgress: ProgressCallback, onComplete: CompleteCallback, bundleName: string): void;
    preloadResDir(dir: string, type: typeof cc.Asset, onComplete: CompleteCallback, bundleName: string): void;
    preloadResDir(dir: string, type: typeof cc.Asset, bundleName: string): void;
    preloadResDir(dir: string, onComplete: CompleteCallback, bundleName: string): void;
    preloadResDir(dir: string, bundleName: string): void;
    preloadResDir() {
        var args = ResUtils.makeLoadResArgs.apply(this, arguments);
        if (args) {
            var bundle = cc.assetManager.getBundle(args.bundleName);
            if (cc.isValid(bundle)) {
                bundle.preloadDir(args.url, args.type, args.onProgress, args.onComplete);
            }else{
                console.error("ResLoader.preloadResDir() - bundle[" + args.bundleName + "]不存在");
            }
        }
    }

    /**
     * 预加载一堆资源
     * @param res 混合资源结构体
     * @param onProgress 加载进度回调（因不可控原因，进度存在回跳可能，需自行处理）
     * @param onComplete 加载完成回调（res数组任意元素完成预载入都会回调）
     */
    preloadResMix(res: LoadResMixArgs[], onProgress: ProgressCallback, onComplete: CompleteCallback): void {
        var finished = [], totaled = [];
        var caluArr = function(arr) {
            return arr.reduce((p,c) => p+c);
        }
        let preloadRes = function (index:number) {
            finished.push(0), totaled.push(0);
            var loadRes = res[index];
            if (!loadRes.bundleName) {
                loadRes.bundleName = "resources";
            }
            var bundler = cc.assetManager.getBundle(loadRes.bundleName);
            if (cc.isValid(bundler)) {
                var progress = function (finish: number, total: number, item: cc.AssetManager.RequestItem) {
                    finished[index] = finish, totaled[index] = total;
                    onProgress && onProgress(caluArr(finished), caluArr(totaled), item);
                };
                var complete = function (e:Error, asset:any) {
                    if (e) {console.log(e)}
                    onComplete && onComplete(e, asset);
                };
                if (loadRes.dir) {
                    bundler.preloadDir(loadRes.dir, loadRes.type, progress, complete);
                }else if (loadRes.url) {
                    bundler.preload(loadRes.url, loadRes.type, progress, complete);
                }else{
                    bundler.preload(loadRes.urls, loadRes.type, progress, complete);
                }
            }else{
                console.error("ResLoader.preloadResMix() - bundle[" + loadRes.bundleName + "]不存在");
            }
        }
        for (let i = 0; i < res.length; i++) {
            preloadRes(i);
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
    loadRemote(resArgs: LoadRemoteArgs): void;
    loadRemote(url: string, options: Record<string, any>, onComplete: CompleteCallback, use: string): void;
    loadRemote(url: string, options: Record<string, any>, use: string): void;
    loadRemote(url: string, onComplete: CompleteCallback, use: string): void;
    loadRemote(url: string, use: string): void;
    loadRemote() {
        var self = this;
        var args = ResUtils.makeLoadRemoteArgs.apply(this, arguments);
        if (args) {
            var m;
            if (resLeakChecker.checkFilter(args.url)) {
                m = ComUtils.getCallStack(1);
            }
            var complete = function (e:Error, asset:any) {
                if (e) {
                    console.error(e);
                }else{
                    self._finishItem(asset, null, args.use, m);
                }
                args.onComplete && args.onComplete(e, asset);
            }
            cc.assetManager.loadRemote(args.url, args.options, complete);
        }
    }

    /**
     * 直接通过asset释放资源（如cc.Prefab、cc.SpriteFrame）
     * @param asset 要释放的asset
     * @param use 资源使用key
     */
    releaseAsset(asset: any, use: string): void {
        if (cc.isValid(asset) && asset._uuid) {
            var uuid = asset._uuid;
            var info = this.getCacheResInfo(uuid);
            if (info) {
                if (use) {
                    info.uses.delete(use);
                    resLeakChecker.logRelease(uuid, use);
                }
                if (info.uses.size <= 0) {
                    asset.decRef();
                    this._resMap.delete(uuid);
                }
            }
        }
    }

    /**
     * 释放一组asset
     * @param assets 要释放的asset数组
     * @param use 资源使用key
     */
    releaseArray(assets: cc.Asset[], use: string): void {
        for (let i = 0; i < assets.length; i++) {
            this.releaseAsset(assets[i], use);
        }
    }

    /**
     * 释放包中所有资源
     * @param bundleName 包名，不填则删除全部网络资源
     */
    releaseAll(bundleName?: string): void {
        var arr = [];
        if (bundleName) {
            var bundle = cc.assetManager.getBundle(bundleName);
            if (cc.isValid(bundle)) {
                bundle.releaseAll();
                this._resMap.forEach((v, k) => {
                    if (v.bundleName == bundleName) arr.push(k);
                })
            }
        }else{
            this._resMap.forEach((v, k) => {
                if (!v.bundleName) {
                    var asset = cc.assetManager.assets.get(k);
                    if (cc.isValid(asset)) {
                        cc.assetManager.releaseAsset(asset)
                    }
                    arr.push(k);
                }
            })
        }
        for (let i = 0; i < arr.length; i++) {
            this._resMap.delete(arr[i]);
        }
    }
}

export let resLoader = ResLoader.instance;
