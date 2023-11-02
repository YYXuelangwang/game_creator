import { LogManager } from "./LogManager";
import { resLoader } from "./ResLoader";
import { ProgressCallback } from "./ResUtils";
import { UIShowTypes, UIView } from "./UIView";

/**
 * UI栈结构体
 * @param uiId 界面id
 * @param uiView UIView对象
 * @param uiArgs 附加参数
 * @param preventNode 遮罩层
 * @param zOrder 层级
 * @param isClose 是否关闭
 * @param resToClear 待清理资源数组（预留）
 * @param resCache 带缓冲资源数组（预留）
*/
export interface IUIInfo {
    uiId: number;
    uiView: UIView;
    uiArgs: any;
    preventNode?: cc.Node;
    zOrder?: number;
    isClose?: boolean;
    resToClear?: string[];
    resCache?: string[];
}

/**
 * UI配置结构体
 * @param bundleName 包名，默认'resources'
 * @param path prefab路径
 * @param preventTouch 是否需要创建遮罩层，默认 false
 * @param preventKeyboard 是否拦截按键，默认 false（行为意识，不做实际事件拦截，使用 UIManager.getInstance().preventKeyboard 判定当前整体状态）
 * @param quickClose 是否支持快速关闭，默认 false
 * @param cache 界面关闭是否缓存，默认 false
 * @param showType 界面展示类型，默认 UIShowTypes.UI_SINGLE
 * @param openAni 界面开启动画，默认 UIDefAni.UI_OPEN
 * @param closeAni 界面关闭动画，默认 UIDefAni.UI_CLOSE
 * @param zOrder 层级
 * @param loadingAni 是否显示加载loading动画 默认 true
 * @param preventTouchOpacity 遮罩透明度，0~255,默认 180
 */
export interface IUIConf {
    /**bundle */
    bundleName?: string;
    /**prefab路径 */
    path: string;
    /**是否需要创建遮罩层，默认 false */
    preventTouch?: boolean;
    /**是否拦截按键，默认 false（行为意识，不做实际事件拦截，使用 UIManager.getInstance().preventKeyboard 判定当前整体状态） */
    preventKeyboard?: boolean;
    /**是否支持快速关闭，默认 false */
    quickClose?: boolean;
    /**界面关闭是否缓存，默认 false */
    cache?: boolean;
    /**界面展示类型，默认 UIShowTypes.UI_SINGLE */
    showType?: UIShowTypes;
    /**界面开启动画，默认 UIDefAni.UI_OPEN */
    openAni?: string;
    /**界面关闭动画，默认 UIDefAni.UI_CLOSE */
    closeAni?: string;
    /**层级 */
    zOrder?: number;
    /**是否显示加载loading动画 默认 true */
    loadingAni?: boolean;
    /**遮罩透明度，0~255,默认 180 */
    preventTouchOpacity?: number;
    /**是否手动调用隐藏loading*/
    isHideLoadingOnCb?: boolean;
    /**显示加载延时*/
    showLoadingDelayTime?: number;
}
/**
 * 附加参数基类(按需继承，非必要)
 * @param openType 界面打开类型，'quiet'时忽略open动画配置，不播动画直接打开
 */
export interface IUIArgs {
    openType?: 'quiet' | 'other';
}
/**
 * UI默认动画
 * @param UI_NONE 无动画
 * @param UI_OPEN 打开
 * @param UI_CLOSE 关闭
 */
export enum UIDefAni {
    UI_NONE = "uiNone",
    UI_OPEN = "uiOpen",
    UI_CLOSE = "uiClose"
}

export class UIManager {
    private static _instance:UIManager;
    private _rootNode:cc.Node;
    private _backgroundUI:number;
    private _isClosing:boolean;
    private _isOpening:boolean;
    private _uiCache:{[key:number]:UIView};
    private _uiStack:IUIInfo[];
    private _uiOpenQueue:IUIInfo[];
    private _uiCloseQueue:UIView[];
    private _uiConf:{[key:number]:IUIConf};
    private _pureWhiteSPF:cc.SpriteFrame;
    private _pureWhiteLoading:boolean;
    private _preventKeyboard:boolean;
    private _loadingIconSPF:cc.SpriteFrame;
    private _loadingIconLoading:boolean;
    private _loadingMaskNode:cc.Node;
    private _loadingIconNode:cc.Node;
    private constructor() {
        this._rootNode = null;
        this._backgroundUI = 0;
        this._isClosing = false;
        this._isOpening = false;
        this._uiCache = {};
        this._uiStack = [];
        this._uiOpenQueue = [];
        this._uiCloseQueue = [];
        this._uiConf = {};
        this._pureWhiteSPF = null;
        this._pureWhiteLoading = false;
        this._preventKeyboard = false;
        this._loadingIconSPF = null;
        this._loadingIconLoading = false;
        this._loadingMaskNode = null;
        this._loadingIconNode = null;
    }

    static getInstance(): UIManager {
        if (!this._instance) {
            this._instance = new UIManager;
        }
        return this._instance;
    }

    getPureWhiteSPF(): cc.SpriteFrame {
        var self = this;
        if (!cc.isValid(this._pureWhiteSPF) && !this._pureWhiteLoading) {
            this._pureWhiteLoading = true;
            resLoader.loadRes("base_common/textures/pureWhite", cc.SpriteFrame, function (e, n) {
                if (!e) {
                    self._pureWhiteSPF = n;
                }
                self._pureWhiteLoading = false;
            }, "base", "@UIManager@pureWhite")
        }
        return this._pureWhiteSPF;
    }

    private getLoadingIcon() {
        var self = this;
        if (!cc.isValid(this._loadingIconSPF) && !this._loadingIconLoading) {
            this._loadingIconLoading = true;
            resLoader.loadRes("base_common/textures/loadingIcon", cc.SpriteFrame, function (e, n) {
                if (!e) {
                    self._loadingIconSPF = n;
                } 
                self._loadingIconLoading = false;
            }, "base", "@UIManager@pureWhite")
        }
        return this._loadingIconSPF;
    }

    setRootNode(node: cc.Node): void {
        if (cc.isValid(this._rootNode)) {
            LogManager.getInstance().console("UIManager.setRootNode(): 已经存在根节点")
        }else if (cc.isValid(node)) {
            this._rootNode = node;
            LogManager.getInstance().console("UIManager.setRootNode(): 成功设置根节点")
        }
    }

    getRootNode(): cc.Node {
        if (!cc.isValid(this._rootNode)) {
            this._rootNode = cc.find("Canvas");
        }
        return this._rootNode;
    }

    setBackgroundUI(count: number): void {
        this._backgroundUI = count;
    }

    /**
     * 初始化所有UI配置对象
     * @param conf 配置对象
     */
    initUIConf(conf: {
        [key: number]: IUIConf;
    }): void {
        this._uiConf = conf;
        this.getPureWhiteSPF();
        this.getLoadingIcon();
    }

    /**
     * 设置或覆盖某界面配置
     * @param uiId 待设置界面id
     * @param conf 配置对象
     */
    setUIConf(uiId: number, conf: IUIConf): void {
        this._uiConf[uiId] = conf;
    }

    /**
     * 添加防触摸层
     * @param zOrder 屏蔽层层级
     */
    private _preventTouch(zIndex:number) {
        var preventNode = new cc.Node();
        preventNode.name = "preventTouch";
        preventNode.setContentSize(cc.size(1e4, 1e4));
        var sprite = preventNode.addComponent(cc.Sprite);
        if (cc.isValid(sprite)) {
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            sprite.spriteFrame = this.getPureWhiteSPF();
            preventNode.color = new cc.Color(0,0,0);
            preventNode.opacity = 180;
        }
        preventNode.getComponent(cc.BlockInputEvents) || preventNode.addComponent(cc.BlockInputEvents);
        this.getRootNode().addChild(preventNode, zIndex);
        return preventNode;
    }

    private showLoadingIcon(uiInfo:IUIInfo) {
        var self = this;
        var rootNode = this.getRootNode();
        var uiConfig = this._uiConf[uiInfo.uiId];
        var zOrder = uiInfo.zOrder;
        if ((!uiInfo.preventNode || uiInfo.preventNode.opacity < 80)) {
            if (this._loadingMaskNode) {
                rootNode.addChild(this._loadingMaskNode, zOrder + 1);
            }else{
                this._loadingMaskNode = this._preventTouch(zOrder+1);
                this._loadingMaskNode.name = "loadingMaskNode";
            }
        }
        if (!this._loadingIconNode) {
            var loadingIcon = new cc.Node();
            loadingIcon.name = "loadingIcon";
            loadingIcon.addComponent(cc.Sprite).spriteFrame = this.getLoadingIcon();
            this._loadingIconNode = loadingIcon;
            rootNode.addChild(this._loadingIconNode);
        }
        if (!this._loadingIconNode.parent) {
            cc.Tween.stopAllByTarget(this._loadingIconNode);
            rootNode.addChild(this._loadingIconNode);
        }
        this._loadingIconNode.zIndex = zOrder + 2;
        this._loadingIconNode.active = false;
        this._loadingMaskNode && (this._loadingMaskNode.opacity = 0);
        var opacity = null == uiConfig.preventTouchOpacity ? 180 : uiConfig.preventTouchOpacity;
        uiInfo.preventNode && (uiInfo.preventNode.opacity = 0);

        var delayTime = 0.5;
        if (uiConfig && null != uiConfig.showLoadingDelayTime) {
            delayTime = uiConfig.showLoadingDelayTime;
        }
        cc.tween(this)
            .delay(delayTime)
            .call(() => {
                this._loadingMaskNode && (this._loadingMaskNode.opacity = 180);
                uiInfo.preventNode && (uiInfo.preventNode.opacity = opacity);
                this._loadingIconNode.active = true;
                cc.tween(this._loadingIconNode).repeatForever(cc.tween(this._loadingIconNode).by(.5, {angle:360})).start()
            })
            .start();
    }

    /**隐藏loading加载转圈动画 */
    hideLoadingIcon(): void {
        if (this._loadingIconNode) {
            cc.Tween.stopAllByTarget(this._loadingIconNode);
            this._loadingIconNode.removeFromParent(true);
        }
        this._loadingMaskNode && this._loadingMaskNode.removeFromParent();
    }

    private _autoExecNextUI() {
        if (this._uiCloseQueue.length > 0) {
            var view = this._uiCloseQueue[0];
            this._uiCloseQueue.splice(0, 1);
            this.close(view);
        }else if (this._uiOpenQueue.length > 0) {
            var info = this._uiOpenQueue[0];
            this._uiOpenQueue.splice(0,1);
            this.open(info.uiId, info.uiArgs);
        }
    }

    /**
     * 自动检测动画组件及特定动画，如存在则播放，无论动画是否播放，都执行回调
     * @param uiView ui对象
     * @param aniName 动画名
     * @param aniOverCallback 动画播放完成回调
     */
    private _autoExecAnimation(uiView:UIView, aniName:string, aniOverCallback:Function) {
        aniOverCallback();
    }

    /**
     * 自动检测资源预加载组件，如果存在则加载完成后调用onComplete，否则直接调用
     * @param uiView ui对象
     * @param onComplete 资源加载完成回调
     */
    private _autoLoadRes(uiView:UIView, onComplete:Function) {
        onComplete();
    }

    private _sortUIStack() {
        this._uiStack.sort((a,b) => a.zOrder-b.zOrder);
    }

    private _updateUI() {
       var bgUI = 0;
       var i = this._uiStack.length - 1;
       for (i = this._uiStack.length - 1; i >= 0; i--) {
        var view = this._uiStack[i].uiView;
        if (cc.isValid(view)) {
            var sType = view.showType;
            view.node.active = true;
            if (UIShowTypes.UI_FULLSCREEN == sType) break;
            if (UIShowTypes.UI_SINGLE == sType) {
                for (let j = 0; j < this._backgroundUI; j++) {
                    this._uiStack[j] && (this._uiStack[j].uiView.node.active = true);
                }
                bgUI = this._backgroundUI;
                break;
            }
        }
       } 
       for (let j = bgUI; j < i; j++) {
        var view = this._uiStack[j].uiView;
        view && (view.node.active = false);
       }
       this._checkKeyboard();
    }

    private _checkKeyboard() {
        this._preventKeyboard = false;
        for (let i = 0; i < this._uiStack.length; i++) {
            var view = this._uiStack[i].uiView;
            if (cc.isValid(view) && view.node.active) {
                var uiId = this._uiStack[i].uiId;
                var conf = this._uiConf[uiId];
                if (conf && conf.preventKeyboard) {
                    this._preventKeyboard = true;
                    break
                }
            }
        }
    }

    get preventKeyboard(): boolean{
        return this._preventKeyboard;
    }

    private _getOrCreateUI(uiId: number,  onProgress?: ProgressCallback, onComplete?:(uiView:UIView) => void, uiArgs?: any) {
        var view = this._uiCache[uiId];
        if (view) {
            onComplete(view);
        }else{
            var conf = this._uiConf[uiId];
            if (!conf) {
                LogManager.getInstance().console("_getOrCreateUI " + uiId + " faile, _uiConf not found");
                onComplete(null);
                return
            }
            if (!conf.path) {
                LogManager.getInstance().console("_getOrCreateUI " + uiId + " faile, prefab conf not found")
                onComplete(null);
                return;
            }
            this._loadUI(uiId, onProgress, onComplete, uiArgs);
        }
    }

    private _loadUI(uiId: number,  onProgress?: ProgressCallback, onComplete?:(uiView:UIView) => void, uiArgs?: any) {
        var self = this,
            conf = this._uiConf[uiId],
            url = conf.path,
            bundleName = conf.bundleName || "resources",
            key = "@UIManager" + resLoader.nextUseKey();
        resLoader.loadRes(url, cc.Prefab, onProgress, function(e:Error, asset:cc.Prefab) {
            if (e) {
                LogManager.getInstance().console("_getOrCreateUI loadRes " + uiId + " faile, path: " + url);
                onComplete(null);
                return;
            }
            var node = cc.instantiate(asset);
            if (!cc.isValid(node)) {
                LogManager.getInstance().console("_getOrCreateUI instantiate " + uiId + " faile, path: " + url);
                onComplete(null);
                resLoader.releaseAsset(asset, key);
                return;
            }
            var uiView = node.getComponent(UIView);
            if (!uiView) {
                LogManager.getInstance().console("_getOrCreateUI getComponent " + uiId + " faile, path: " + url);
                node.destroy();
                onComplete(null);
                resLoader.releaseAsset(asset, key);
                return;
            }
            self._autoLoadRes(uiView, function() {
                uiView.initProperty(uiId, conf);
                uiView.init(uiArgs);
                uiView.addAutoRes({
                    asset: asset,
                    use: key
                });
                onComplete(uiView);
            })
        }, bundleName, key);
    }

    /**
     * 打开界面并添加进界面栈
     * @param uiId _uiConf 中的key值
     * @param uiArgs 附加参数
     * @param onProgress 进程回调
     */
    open(uiId: number, uiArgs?: any, onProgress?: ProgressCallback): void {
        if (undefined == uiArgs) uiArgs = null;
        if (undefined == onProgress) onProgress = null;
        var conf = this._uiConf[uiId];
        if (conf) {
            var info:IUIInfo = {
                uiId : uiId,
                uiArgs:uiArgs,
                uiView:null
            }
            if (this._isOpening || this._isClosing) {
                console.log("isOpening:::1", "_isOpening:", this._isOpening, this._isClosing);
                this._uiOpenQueue.push(info);
                return
            }
            if (-1 != this.getUIIndex(uiId)) {
                console.log("closeToUI::::", "uiId:", uiId);
                this.closeToUI(uiId, uiArgs);
                return;
            }
            if (conf.zOrder) {
                info.zOrder = conf.zOrder;
            }else if (this._uiStack.length <= 0) {
                info.zOrder = 1;
            }else{
                info.zOrder = this._uiStack[this._uiStack.length - 1].zOrder + 1;
            }
            this._uiStack.push(info);
            this._sortUIStack();
            if (conf.preventTouch && !info.preventNode) {
                info.preventNode = this._preventTouch(info.zOrder);
            }
            if (undefined == conf.loadingAni || conf.loadingAni) {
                this.showLoadingIcon(info);
            }
            this._isOpening = true;
            this._getOrCreateUI(uiId, onProgress, (uiView:UIView) => {
                if (info.isClose || null == uiView) {
                    LogManager.getInstance().console("_getOrCreateUI " + uiId + "faile!\n close state: " + info.isClose + " , uiView : " + uiView);
                    if (cc.isValid(info.preventNode)) {
                        info.preventNode.destroy();
                        info.preventNode = null;
                    }
                    return;
                }
                if (info.preventNode) {
                    if (null != conf.preventTouchOpacity) {
                        info.preventNode.opacity = conf.preventTouchOpacity;
                    }else{
                        info.preventNode.opacity = 180;
                    }
                }
                console.log("open:::2", "uiId: ", uiId);
                if (conf.isHideLoadingOnCb) {
                    uiArgs || (uiArgs = {});
                    uiArgs.hideLoadingCb = () => {
                        this.hideLoadingIcon();
                    }
                }else{
                    this.hideLoadingIcon();
                }
                this._onUIOpen(uiId, uiView, info, uiArgs);
            }, uiArgs)
        }
    }
     
    /**
     * UI被打开时回调，对UI进行初始化设置，刷新其他界面的显示，并根据
     * @param uiId 哪个界面被打开了
     * @param uiView 界面对象
     * @param uiInfo 界面栈对应的信息结构
     * @param uiArgs 界面初始化参数
     */
    private _onUIOpen(uiId: number, uiView:UIView, uiInfo:IUIInfo, uiArgs?: any) {
        var self = this;
        if (cc.isValid(uiView)) {
            uiInfo.uiView = uiView;
            uiView.node.active = true;
            uiView.node.zIndex = uiInfo.zOrder || this._uiStack.length;
            if (uiView.quickClose) {
                var bg = uiView.node.getChildByName("background");
                if (!bg) {
                    bg = new cc.Node("background");
                    bg.setContentSize(cc.size(1e4, 1e4));
                    uiView.node.addChild(bg, -1);
                }
                bg.targetOff(cc.Node.EventType.TOUCH_START);
                bg.on(cc.Node.EventType.TOUCH_START, function (e) {
                    e.stopPropagation();
                    self._isOpening || self._isClosing || self.close(uiView);
                }, bg)
            }

            var rootNode = this.getRootNode();
            uiView.node.parent || rootNode.addChild(uiView.node);
            this._updateUI();
            var pid = -1;
            if (this._uiStack.length > 1) pid = this._uiStack[this._uiStack.length - 2].uiId;
            var sType = null;
            if (uiArgs && "quiet" == uiArgs.openType) {
                sType = UIDefAni.UI_NONE;
            }else{
                var config = this._uiConf[uiId];
                config && (sType = config.openAni || UIDefAni.UI_OPEN);
            }
            uiView.onOpen(pid, uiArgs);
            this._autoExecAnimation(uiView, sType, function () {
                self._isOpening = false;
                self._autoExecNextUI();
                uiView.onOpenAniOver();
            })
        }
    }

    /**
     * 关闭界面
     * @param closeUI ui对象（不填则关闭栈顶ui）
     */
    close(closeUI?: UIView): void {
        var self = this;
        var len = this._uiStack.length;
        if (len < 0 || this._isClosing || this._isOpening) {
            if (closeUI) {
                this._uiCloseQueue.push(closeUI);
            }else if (len > 1) {
                var last = this._uiStack[len - 1].uiView;
                this._uiCloseQueue.push(last);
            }
        }else{
            var info:IUIInfo;
            if (closeUI) {
                for (let i = this._uiStack.length - 1; i >= 0; i--) {
                    var item = this._uiStack[i];
                    if (item.uiView == closeUI) {
                        info = item;
                        this._uiStack.splice(i, 1);
                        break;
                    }
                }
                if (!info) return;
            }else{
                info = this._uiStack.pop();
            }
            var uid = info.uiId, uiview = info.uiView;
            info.isClose = true;
            if (cc.isValid(info.preventNode)) {
                info.preventNode.destroy();
                info.preventNode = null;
            }
            if (cc.isValid(info.uiView)) {
                var p = this._uiStack[len - 2];
                this._updateUI();
                var conf = this._uiConf[uid];
                var ani = null;
                if (conf) {
                    ani = conf.closeAni || UIDefAni.UI_CLOSE;
                }
                this._isClosing = true;
                this._autoExecAnimation(uiview, ani, function() {
                    if (p && p.uiView && self.isTopUI(p.uiId)) {
                        p.uiView.node && (p.uiView.node.active = true);
                        p.uiView.onTop(p.uiId, uiview.onClose());
                    }else{
                        uiview.onClose();
                    }
                    if (uiview.cache) {
                        self._uiCache[uid] = uiview;
                        uiview.node.removeFromParent(false);
                        LogManager.getInstance().console("uiView removeFromParent " + uid);
                    }else{
                        uiview.node.destroy();
                        LogManager.getInstance().console("uiView destroy " + uid);
                    }
                    self._isClosing = false;
                    self._autoExecNextUI();
                })
            }
        }
    }

    /**
     * 关闭界面，一直关闭到顶部为uiId的界面，为避免循环打开UI导致UI栈溢出
     * @param uiId 要关闭到的uiId，关闭其顶部UI
     * @param uiArgs 附加参数
     */
    closeToUI(uiId: number, uiArgs: any): void {
        var index = this.getUIIndex(uiId);
        if (-1 !- index) {
            var linfo = this._uiStack[this._uiStack.length - 1];
            var cInfo = this._uiStack[index];
            for (let i = this._uiStack.length - 1; i > index; i--) {
                var info = this._uiStack.pop();
                var uid = info.uiId;
                var uiview = info.uiView;
                info.isClose = true;
                if (info.preventNode) {
                    info.preventNode.destroy();
                    info.preventNode = null;
                }
                if (uiview) {
                    uiview.onClose();
                    if (uiview.cache) {
                        this._uiCache[uid] = uiview;
                        uiview.node.removeFromParent(false);
                    }else{
                        uiview.node.destroy();
                    }
                }
            }
            this._updateUI();
            this._uiOpenQueue = [];
            this._uiCloseQueue = [];
            cInfo.uiView.onOpen(linfo.uiId, uiArgs);
        }
    }

    /**
     * 关闭界面
     * @param uiId 界面id（不填则关闭栈顶ui）
     */
    closeByUIID(uiId?: number): boolean {
        var uiview = null;
        var index = null == uiId ? this._uiStack.length - 1 : this.getUIIndex(uiId);
        if (index >= 0) {
            uiview = this._uiStack[index].uiView;
        }
        uiview && this.close(uiview);
        return true
    }

    closeAll(): void {
        for (let i = 0; i < this._uiStack.length; i++) {
            var info = this._uiStack[i];
            info.isClose = true;
            if (info.preventNode) {
                info.preventNode.destroy();
                info.preventNode = null;
            }
            var uiview = info.uiView;
            if (uiview) {
                uiview.onClose();
                if (uiview.cache) {
                    uiview.node.removeFromParent(false);
                }else{
                    uiview.node.destroy();
                }
            } 
        }
        this._uiOpenQueue = [], this._uiCloseQueue = [], this._uiStack = [], this._isOpening = !1, this._isClosing = !1;
    }

    clearCache(): void {
        for (const uid in this._uiCache) {
            var view = this._uiCache[uid];
            cc.isValid(view) && view.node.destroy();
        }
        this._uiCache = {};
    }

    replace(uiId: number, uiArgs?: any): void {
        if (undefined == uiArgs) uiArgs = null;
        this.close();
        this.open(uiId, uiArgs);
    }

    isTopUI(uiId: number): boolean {
        return this._uiStack.length > 0 ? this._uiStack[this._uiStack.length - 1].uiId == uiId : false;
    }

    getUIIndex(uiId: number): number {
        for (let i = 0; i < this._uiStack.length; i++) {
            if (uiId == this._uiStack[i].uiId) return i;
        }
        return -1;
    }

    getUI(uiId: number): UIView {
        var uiview;
        for (let i = 0; i < this._uiStack.length; i++) {
            if (this._uiStack[i].uiId == uiId) {
                uiview = this._uiStack[i].uiView;
                break;
            }
        }
        return uiview;
    }

    getTopUI(): UIView {
        return this._uiStack.length > 0 ? this._uiStack[this._uiStack.length - 1].uiView : null;
    }
}