// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { GData } from "../../common/utils/GData";

const { ccclass, property, requireComponent } = cc._decorator;

/**序列帧动画多语言资源的配置信息 */
@ccclass("languageAnimationClipDataInfo")
export class languageAnimationClipDataInfo {
    @property({
        tooltip: `语言缩写`
    })
    language: string = "";

    @property({
        tooltip: `bundle下的资源路劲(如果有多个序列动画添加，路径之间使用";"作为分隔符)`
    })
    path: string = "";
}

@ccclass
@requireComponent(cc.Animation)
export default class LanguageAnimation extends cc.Component {

    @property({
        tooltip: "多语言与序列帧动画信息映射配置",
        type: languageAnimationClipDataInfo,
    })
    protected languageDataInfos: languageAnimationClipDataInfo[] = [];

    onLoad() {
        let lang = GData.curLanguage;
        /**路径列表 */
        let urls = [];
        for (let index = 0; index < this.languageDataInfos.length; index++) {
            const element = this.languageDataInfos[index];
            if (element.language == "en") {
                urls = element.path.split(';');
            }
            if (element.language == lang) {
                urls = element.path.split(';');
                break;
            }
        }

        for (let index = 0; index < urls.length; index++) {
            const element = urls[index];
            game.ResLoader.getInstance().loadRes(element, (err, asset) => {
                if (err) {
                    console.error(err);
                }
                else {
                    if (this.isValid) {
                        let ani = this.getComponent(cc.Animation);
                        ani.addClip(asset, asset.name);
                        if (ani.playOnLoad) {
                            ani.play(asset.name);
                        }
                    }
                }
            }, GData.bundleName, element);
        }

    }

}
