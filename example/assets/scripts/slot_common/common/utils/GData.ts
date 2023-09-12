const { ccclass } = cc._decorator;
/**
 * 加载公共配置和自定义配置，通过合并配置后，通过getParameter方法获取指定配置数据
 */
@ccclass
export class GData extends cc.Component {
    /** 默认参数配置 */
    public static defaultParameters: Object = {};
    /** 自定义参数配置 */
    public static customParameters: Object = {};
    /** 合并参数配置 */
    private static mergeParameters: Object = {};
    /**外部bundle名称 */
    public static bundleName: string = null;
    private static callBack: Function = null;
    public static skinId: number = 1;

    public static isNormalGuide: boolean = true;

    /**
     * 原始的json配置
     */
    public static sourceConfig: cc.JsonAsset[] = [];
    /**
     * 开始加载公共库配置和本地配置(本地配置需在configs文件夹下)
     * @param bundleName 外部bundle名称
     * @param callBack 加载完成回调
     */
    static startLoad(bundleName: string, callBack: Function) {
        if (GData.bundleName == bundleName) {
            if (callBack)
                callBack();
            return;
        }
        GData.bundleName = bundleName;
        GData.callBack = callBack;
        GData.sourceConfig = [];
        this.loadCommonConfigs();

    }
    /** 加载公共配置 */
    private static loadCommonConfigs(): void {
        cc.assetManager.getBundle("slot").loadDir('./', cc.JsonAsset, (err: Error, resource: cc.JsonAsset[]) => {
            var len = resource.length;
            for (var i = 0; i < len; i++) {
                GData.defaultParameters[resource[i].name] = resource[i].json;
            }
            GData.sourceConfig = [].concat(resource);
            GData.loadCustomConfigs();
        })
    }
    /** 加载自定义配置 */
    private static loadCustomConfigs(): void {
        cc.assetManager.getBundle(GData.bundleName).loadDir('configs', cc.JsonAsset, (err: Error, resource: cc.JsonAsset[]) => {
            var len = resource.length;
            var gameId = core.Global.gameId.toString();
            gameId = gameId.substring(0, gameId.length - 2);
            gameId = `"gameId":${gameId}`;

            for (var i = 0; i < len; i++) {
                var jsonStr = JSON.stringify(resource[i].json);
                // console.error(jsonStr);
                if (jsonStr.indexOf(gameId) > 0) {
                    if (jsonStr.indexOf(`"gameId":${core.Global.gameId}`) < 0) {
                        continue;
                    }
                }
                // console.error(JSON.stringify(resource[i].json));
                GData.customParameters[resource[i].name] = resource[i].json;
            }
            GData.sourceConfig = GData.sourceConfig.concat(resource);

            GData.loadComplete();
        })
    }

    /**配置加载完成 */
    private static loadComplete(): void {
        let defaultParameters = JSON.parse(JSON.stringify(GData.defaultParameters));
        GData.mergeParameters = GData.mergeConfig(defaultParameters, GData.customParameters);
        console.log("gdata loadcomplte")
        if (GData.callBack) {
            GData.callBack.call(this);
        }
    }

    public static mergeConfig(pub: any, diff: any): any {
        if (!diff) return pub
        if (!pub) return diff;
        let diffKeys = Object.keys(diff),
            key = null;
        for (let i = 0; i < diffKeys.length; i++) {
            key = diffKeys[i];
            if (typeof diff[key] === 'object' && typeof pub[key] === 'object' && pub[key] !== null) {
                GData.mergeConfig(pub[key], diff[key]);
            } else {
                pub[key] = diff[key];
            }
        }
        return pub;
    }

    /**
     * 设置配置
     * @param _configName 配置名
     * @param conf 配置结构体
     */
    static setParameter(_configName: string, conf: any) {
        GData.mergeParameters[_configName] = conf;
    }

    /**通过配置名获取配置,没有找到返回undefined */
    static getParameter(_configName: string): any {
        return GData.mergeParameters[_configName];
    }

    static get curLanguage(): string {
        //return core.CoreUtils.getCurLanguage();
        return game.LanguageManager.getInstance().getCurLang();
    }

    static getUseKey(className: string): string {
        return ("@" + className + game.ResLoader.getInstance().nextUseKey());
    }

    // 安全获取属性值
    static getJsonValue_safe(obj: any, key: string) {
        let retVal: any = null;
        if (!obj) return retVal;

        let keyArr = key.split('/');
        let errMsg: string = '';
        retVal = obj;
        for (let i = 0; i < keyArr.length; ++i) {
            retVal = retVal[keyArr[i]];
            errMsg = errMsg + keyArr[i] + '/';
            if (!retVal) {
                console.log('safeGetJsonValue 属性不存在: ' + errMsg);
                return retVal;
            }
        }
        return retVal;
    }
}