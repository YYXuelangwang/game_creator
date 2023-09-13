import ResKeeper from "./ResKeeper";
import { resLoader } from "./ResLoader";

export type ProgressCallback = (finish: number, total: number, item: any) => void;
export type CompleteCallback = (err: Error, assets: any | any[]) => void;


/**
 * LoadRes方法的参数结构
 * @param url 单个资源路径
 * @param urls 资源路径数组
 * @param type 资源类型
 * @param onProgress 进度回调
 * @param onComplete 完成回调
 * @param bundleName 包名
 * @param use 资源使用key
 */
export class LoadResArgs {
    url?: string;
    urls?: string[];
    type?: typeof cc.Asset;
    onProgress?: ProgressCallback;
    onComplete?: CompleteCallback;
    bundleName?: string;
    use?: string;
}
/**
 * loadRemote方法的参数结构
 * @param url 单个资源路径
 * @param options 可选参数
 * @param onComplete 完成回调
 * @param use 资源使用key
 *
 */
export class LoadRemoteArgs {
    url?: string;
    options?: Record<string, any>;
    onComplete?: CompleteCallback;
    use?: string;
}
/**
 * preloadResMix方法的参数结构（url、urls、dir互斥，择一填充）
 * @param url 单个资源路径
 * @param urls 资源路径数组
 * @param dir 资源目录
 * @param type 资源类型
 * @param bundleName 包名
 */
export class LoadResMixArgs {
    url?: string;
    urls?: string[];
    dir?: string;
    type?: typeof cc.Asset;
    bundleName?: string;
}

export interface ICacheResInfo {
    bundleName: string;
    uses: Set<string>;
}

export class ResUtils {
    /**
     * ResLoader 加载接口参数预处理
     */
    static makeLoadResArgs(): LoadResArgs {
        if (arguments.length < 1) {
            console.error("makeLoadResArgs error " + arguments);
            return null;
        }
        var ret:LoadResArgs = {
            bundleName:"resources"
        }
        if ("string" == typeof arguments[0]) {
            ret.url = arguments[0];
        }else{
            if (!(arguments[0] instanceof Array)) {
                if (1 == arguments.length && arguments[0] instanceof Object) {
                    return arguments[0];
                }else{
                    console.error("makeLoadResArgs error " + arguments);
                    return null;
                }
            }
            ret.urls = arguments[0];
        }
        var ischildclassOf = cc.js.isChildClassOf;
        for (let t = 1; t < arguments.length; t++) {
            if (1 == t && ischildclassOf(arguments[t], cc.Asset)) {
                ret.type = arguments[t];
            }else if ("string" == typeof arguments[t]) {
                if (t >= 2 && "string" == typeof arguments[t-1]) {
                    ret.use = arguments[t];
                }else{
                    ret.bundleName = arguments[t];
                }
            }else if ("function" == typeof arguments[t]) {
               if (arguments.length > t + 1 && "function" == typeof arguments[t + 1]) {
                    ret.onProgress = arguments[t];
                }else{
                    ret.onComplete = arguments[t];
                }
            }
        }
        return ret;
    }
    
    /**
     * ResLoaderManager.loadRemote 方法的参数预处理
     */
    static makeLoadRemoteArgs(): LoadRemoteArgs {
        if (arguments.length < 1) {
            console.error("makeLoadRemoteArgs error " + arguments);
            return null;
        } 
        var ret:LoadRemoteArgs = {};
        if ("string" != typeof arguments[0]) {
            if (1 == arguments.length && arguments[0] instanceof Object) {
                return arguments[0];
            }else{
                console.error("makeLoadRemoteArgs error " + arguments);
                return null;
            }
        } 
        ret.url = arguments[0];
        for (let t = 1; t < arguments.length; t++) {
            if ("function" == typeof arguments[t]) {
                ret.onComplete = arguments[t];
            }else if ("string" == typeof arguments[t]) {
                ret.use = arguments[t];
            }else{
                ret.options = arguments[t];
            }
        } 
        return ret;
    }

    /**
     * 从目标节点或其父节点递归查找一个资源挂载组件
     * @param attachNode 目标节点
     * @param autoCreate 当目标节点找不到ResKeeper时是否自动创建一个
     */
    static getResKeeper(attachNode: cc.Node, autoCreate?: boolean): ResKeeper {
        if (attachNode) {
            let comp = attachNode.getComponent(ResKeeper);
            if (!comp) {
                if (autoCreate) {
                    return attachNode.addComponent(ResKeeper);
                }else{
                    return ResUtils.getResKeeper(attachNode.parent, autoCreate);
                }
            }else{
                return comp;
            }
        }
        return null;
    }

    /**
     * 赋值srcAsset（通过框架接口动态加载），并使其跟随targetNode自动释放，用法如下
     * mySprite.spriteFrame = AssignWith(otherSpriteFrame, mySpriteNode);
     * @param srcAsset 用于赋值的资源，如cc.SpriteFrame、cc.Texture等等
     * @param targetNode
     * @param autoCreate
     */
    static assignWith(srcAsset: any, targetNode: cc.Node, autoCreate?: boolean): any {
        var keeper = ResUtils.getResKeeper(targetNode, autoCreate);
        if (cc.isValid(keeper) && cc.isValid(srcAsset) && cc.isValid(targetNode)) {
            var key = "@" + keeper.constructor.name + resLoader.nextUseKey();
            if (resLoader.addUse(srcAsset._uuid, key)) {
                keeper.addAutoRes({
                    asset : srcAsset,
                    use: key,
                })
                return srcAsset;
            }
        }
        console.error("AssignWith " + srcAsset + " to " + targetNode + " fail");
        return null;
    }

    static dumpRes(): void {

    }

    static dumpBundle(): void {
        
    }
}

