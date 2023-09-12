import { GData } from "../../../common/utils/GData";
import JTItemRender from "../Scroller/com/base/JTItemRender";
import { JTGLoaderAssetType } from "../Scroller/renders/JTGLoader";
import { SDictionary } from "../SlotData/SDictionary";
import SlotConfigManager from "../SlotManager/SlotConfigManager";



export interface SpinElementMap {
    normalImage: string;
    normalImageScale: number;
    normalImageTrim: boolean;
    blurImage: string;
    blurImageScale: number;
    blurImageTrim: boolean;
    fadeImage: string;
    fadeImageScale: number;
    fadeImageTrim: boolean;
    /** 渲染模式(0:实时渲染；  1：共享缓存；  2：私有缓存)*/
    animationCacheMode: number;
    skeletonUrl: string;
    skeletonAniName: string;
    /**图集路径 */
    frameClipUrl: string | string[];
    /**如果为数组形式，表示多个动作叠加表现*/
    normalAniName: string | string[];
    /**如果为数组形式，表示多个动作叠加表现*/
    blurAniName: string | string[];
    /**如果为数组形式，表示多个动作叠加表现*/
    fadeAniName: string | string[];
    sample: number;
    speed: number;
    dragonAssetUrl: string;
    dragonAssetAtlasUrl: string;
    dragonArmature: string;
    dragonAnimation: string;
    premultipliedAlpha: boolean;
    /**多语言图片路径 */
    langTexUrl?: string;
    /**骨骼动画默认皮肤名 */
    defaultSkinName?: string;
    /**元素资源类型（0：图片； 1：序列帧； 2：骨骼； 3：龙骨） */
    LoaderAssetType?: number;
    /**增加一个混合类型：模糊状态用图0，其他是骨骼 */
    blurType?: number;
    /**元素资源_多语言种类(eg:["zh","en"])*/
    langResTypes?: string[];
    /**帧动画缩放大小 */
    clipScale?: number
}

export default class SpinElementManager {

    private static _instance: SpinElementManager = null;

    public static get instance(): SpinElementManager {
        if (!this._instance) {
            this._instance = new SpinElementManager();
        }

        return this._instance;
    }

    private elementMapConfig: SDictionary = null;

    constructor() {
        this.elementMapConfig = new SDictionary();
    }

    public init(): void {
        let resConf = GData.getParameter("spinElementResConfig").spinElementResConfig;
        if (!resConf) {
            console.error("无元素资源配置")
            return;
        }
        let elementConf = SlotConfigManager.instance.DataElement.getIds();

        let getLanguagePath = (url: string | string[], curLanguage?: string) => {
            if (url == null) return null;
            let lang_clip = GData.curLanguage == "zh" ? "zh" : "en";
            curLanguage && (lang_clip = curLanguage);
            let replaceCb = (url: string) => {
                while (url.includes("&")) {
                    url = url.replace("&", lang_clip);
                }
                return url
            }
            if (url instanceof Array) {
                for (let index = 0; index < url.length; index++) {
                    let _url = url[index];
                    url[index] = replaceCb(_url)
                }
            } else {
                url = replaceCb(url)
            }
            return url;
        }

        for (let eleId of elementConf) {
            let r = resConf[eleId];
            if (!r) {
                console.log(`元素ID:${eleId} 无资源配置`);
                continue;
            }
            let map = <SpinElementMap>{};
            map.normalImage = r.normalImage;
            map.blurImage = r.blurImage;
            map.fadeImage = r.fadeImage;
            map.langResTypes = r.langResTypes;
            if (r.langResTypes) {
                if (map.langResTypes.indexOf(GData.curLanguage) > -1) {
                    map.skeletonUrl = getLanguagePath(r.skeletonUrl, GData.curLanguage) as string;
                    map.frameClipUrl = getLanguagePath(r.frameClipUrl, GData.curLanguage);
                }
                else {
                    map.skeletonUrl = getLanguagePath(r.skeletonUrl) as string;
                    map.frameClipUrl = getLanguagePath(r.frameClipUrl);
                }
            }
            else {
                map.skeletonUrl = r.skeletonUrl;
                map.frameClipUrl = r.frameClipUrl;
            }
            map.animationCacheMode = r.animationCacheMode == null ? sp.Skeleton.AnimationCacheMode.REALTIME : r.animationCacheMode;
            map.blurImageScale = r.blurImageScale;
            map.normalImageScale = r.normalImageScale;
            map.fadeImageScale = r.fadeImageScale;
            map.premultipliedAlpha = r.premultipliedAlpha;
            map.normalAniName = r.normalAniName;
            map.blurAniName = r.blurAniName;
            map.fadeAniName = r.fadeAniName;
            map.sample = r.sample || 24;
            map.speed = r.speed || 0.5;
            map.langTexUrl = r.langTexUrl ? r.langTexUrl.replace('&', GData.curLanguage) : null;
            map.defaultSkinName = r.defaultSkinName;
            map.LoaderAssetType = r.LoaderAssetType == null ? JTGLoaderAssetType.Skeleton : r.LoaderAssetType;
            map.blurType = r.blurType == null ? map.LoaderAssetType : r.blurType;
            map.clipScale = r.clipScale;
            if (r.normalImageTrim === undefined) {
                map.normalImageTrim = true;
            } else {
                map.normalImageTrim = r.normalImageTrim;
            }
            if (r.fadeImageTrim === undefined) {
                map.fadeImageTrim = true;
            } else {
                map.fadeImageTrim = r.fadeImageTrim;
            }
            if (r.blurImageTrim === undefined) {
                map.blurImageTrim = true;
            } else {
                map.blurImageTrim = r.blurImageTrim;
            }
          

            this.elementMapConfig.set(eleId, map);
        }
    }


    public getSpinElementConfig(id: number): SpinElementMap {
        let c = this.elementMapConfig.get(id);
        return c;
    }

    /**
     * 根据元素id和
     * @param id 元素id
     * @param frame 元素当前状态（0：默认正常停留状态；  1：滚动状态；  2：滚动结束状态）
     * @returns 返回当前状态下元素的：资源路径、缩放尺寸、是否去掉节点约束框内的透明区域
     */
    public getElementImageConfig(id: number, frame: number): { url: string, scale: number, trim: boolean } {
        let c = this.getSpinElementConfig(id);
        let url = "";
        let scale = 1;
        let trim = true;
        switch (frame) {
            case JTItemRender.STATE_DEFAULT:
                url = c.normalImage;
                scale = c.normalImageScale || 1;
                trim = c.normalImageTrim;
                break;
            case JTItemRender.STATE_ROLLING:
                if (c.blurImage) {
                    url = c.blurImage;
                    scale = c.blurImageScale || 1;
                    trim = c.blurImageTrim;
                } else {
                    url = c.normalImage;
                    scale = c.normalImageScale || 1;
                    trim = c.normalImageTrim;
                }
                break;
            case JTItemRender.STATE_OVER:
                if (c.fadeImage) {
                    url = c.fadeImage;
                    scale = c.fadeImageScale || 1;
                    trim = c.fadeImageTrim;
                } else {
                    url = c.normalImage;
                    scale = c.normalImageScale || 1;
                    trim = c.normalImageTrim;

                }
                break;
            default:
                break;
        }
        return { url: url, scale: scale, trim: trim };
    }


}
