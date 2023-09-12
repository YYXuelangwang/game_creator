/*
 * @Date: 2022-06-01 16:01:20
 * @LastEditors: qtdog
 * @LastEditTime: 2022-06-01 21:45:47
 * @FilePath: \slot\assets\slot\slot_common\language\script\LanguageSkeleton.ts
 */
import { GData } from "../../common/utils/GData";
import { Property } from "../../common/utils/Property";
import ReplaceSkeletonTex from "../../common/utils/ReplaceSkeletonTex";

const { ccclass, property } = cc._decorator;

/**
 * Skeleton动画资源的多语言实现方式
 * 1、set_animation：setAnimation的模式 
 * 2、set_skeletionData：设置skeletonData的模式
 * 3、set_texture：替换骨骼贴图的模式的模式
 * 4、set_skin：setSkin的模式
 */
export enum SkLanguageMode {
    /**setAnimation的模式 */
    set_animation = 0,
    /**设置skeletonData的模式 */
    set_skeletionData,
    /**替换骨骼贴图的模式的模式 */
    set_texture,
    /**setSkin的模式 */
    set_skin,
}

/**骨骼多语言资源的配置信息 */
@ccclass("languageSkCfgDataInfo")
export class languageSkCfgDataInfo {
    @property({
        tooltip: `语言缩写`
    })
    language: string = "";

    @property({
        tooltip: `SkLanguageMode.set_animation模式下：表示动作animation名字；
        SkLanguageMode.set_skeletionData模式下：表示骨骼数据文件路径 ；
        SkLanguageMode.set_texture模式下：表示贴图路径(每个路劲下的贴图名和贴图尺寸必须一致,如果有多张贴图需要替换，贴图路劲使用","作为分隔符)；
        SkLanguageMode.set_skin模式下：表示skin名称；`
    })
    modelData: string = "";
}

@ccclass
export default class LanguageSkeleton extends cc.Component {

    @property({ type: cc.Enum(SkLanguageMode), tooltip: "骨骼动画资源多语言实现模式" })
    protected skLangMode: SkLanguageMode = SkLanguageMode.set_animation;

    @property({
        tooltip: "多语言与骨骼信息映射配置",
        type: languageSkCfgDataInfo,
        visible: function () {
            return this.skLangMode == SkLanguageMode.set_animation || this.skLangMode == SkLanguageMode.set_skeletionData
                || this.skLangMode == SkLanguageMode.set_texture || this.skLangMode == SkLanguageMode.set_skin;
        },
    })
    protected languageSkCfgDataInfos: languageSkCfgDataInfo[] = [];



    onLoad() {
        let sk = this.node.getComponent(sp.Skeleton);
        let conf: languageSkCfgDataInfo = null;
        for (let config of this.languageSkCfgDataInfos) {
            if (config.language == GData.curLanguage) {
                conf = config;
                break;
            }
            if (config.language == game.LanguageType.EN) {
                conf = config;
            }
        }
        let skinName = sk.defaultSkin;
        let animation = sk.defaultAnimation;
        let loop = sk.loop;
        switch (this.skLangMode) {
            case SkLanguageMode.set_animation:
                if (sk && conf && conf.modelData) {
                    sk.setAnimation(0, conf.modelData, loop);
                }
                break;
            case SkLanguageMode.set_skeletionData:
                Property.setSpProperty(sk, { json: this.getLanguageUrl(conf.modelData) }, GData.bundleName, (sp: sp.Skeleton) => {
                    if (sp) {
                        sp.setSkin(skinName);
                        sp.setAnimation(0, animation, loop);
                    }
                });
                break;
            case SkLanguageMode.set_texture:
                let urls = conf.modelData.split(',');
                for (let index = 0; index < urls.length; index++) {
                    const element = urls[index];
                    ReplaceSkeletonTex.replaceNewAniTex(sk, this.getLanguageUrl(element), animation, sk.loop);
                }
                break;
            case SkLanguageMode.set_skin:
                sk.setSkin(conf.modelData);
                sk.setAnimation(0, animation, loop);
                break;
            default:
                break;
        }
    }

    /**
     * 根据自定义格式转换成当前语言路径
     * @param url 
     */
    getLanguageUrl(url: string, lang: string = GData.curLanguage): string {
        if (!url) return null;
        lang = this.languageSkCfgDataInfos.length > 0 && this.languageSkCfgDataInfos.map(v => v.language).includes(lang) ? lang : "en";
        url = url.replace("&", lang);
        return url;
    }
}
