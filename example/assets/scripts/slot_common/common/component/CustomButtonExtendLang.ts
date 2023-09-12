
import { GData } from "../utils/GData";
import CustomButton, { CustomBtnTransition, StateSprite } from "./CustomButton";

const { ccclass, property, menu } = cc._decorator;

/**按钮控制拓展用于多语言图片切换 方便配置不用手动拖入 */
@ccclass
@menu("按钮控制/CustomButtonExtendLang")
export default class CustomButtonExtendLang extends CustomButton {

    @property({ tooltip: "支持语言例如(zh,th,en)用逗号隔开" })
    Langs: String = ""

    @property({ displayName: 'loadUrl', tooltip: '资源加载地址 图集名需要用"|"分割,不需要图片名' })
    loadUrl: String = "";

    @property({ displayName: 'Normal', tooltip: '正常状态下图片名' })
    normalSpriteName: string = "";

    @property({ displayName: 'Pressed', tooltip: '按压状态下图片名' })
    pressedSpriteName: string = "";

    @property({ displayName: 'Hover', tooltip: '悬停状态下图片名' })
    hoverSpriteName: string = "";

    @property({ displayName: 'Disabled', tooltip: '禁用状态下图片名' })
    disabledSpriteName: string = "";

    onLoad() {
        this.spriteSetIdx = 0;
        this.transition = CustomBtnTransition.SPRITE;
        this.spriteSet.push(new StateSprite())
        super.onLoad();
        this.setBtnSprite();
    }

    setBtnSprite() {
        let url: string = this.rePlaceLanguage(this.loadUrl, this.Langs);
        let spriteNames = [this.normalSpriteName, this.pressedSpriteName, this.hoverSpriteName, this.disabledSpriteName]
        if (url.includes("|")) {
            url = url.replace("|", "/");
            game.ResLoader.getInstance().loadRes(url, cc.SpriteAtlas, (err, res: cc.SpriteAtlas) => {
                if (!err) {
                    for (let i = 0; i < spriteNames.length; i++) {
                        let spfName = spriteNames[i];
                        let spf = null;
                        if (spfName) {
                            switch (i) {
                                case 0:
                                    spf = res.getSpriteFrame(spfName);
                                    if (spf)
                                        this.spriteSet[this.spriteSetIdx].normalSprite = spf;
                                    break;
                                case 1:
                                    spf = res.getSpriteFrame(spfName);
                                    if (spf)
                                        this.spriteSet[this.spriteSetIdx].pressedSprite = spf;
                                    break;
                                case 2:
                                    spf = res.getSpriteFrame(spfName);
                                    if (spf)
                                        this.spriteSet[this.spriteSetIdx].hoverSprite = spf;
                                    break;
                                case 3:
                                    spf = res.getSpriteFrame(spfName);
                                    if (spf)
                                        this.spriteSet[this.spriteSetIdx].disabledSprite = spf;
                                    break;
                            }
                        }
                    }
                    this._updateState();
                }
            }, "slot", "btnSprite");
        } else {
            if (url) {
                let sPLoadUrlArr = []
                for (let j = 0; j < spriteNames.length; j++) {
                    let spName = spriteNames[j];
                    sPLoadUrlArr[j] = url + "/" + spName;
                }
                for (let i = 0; i < sPLoadUrlArr.length; i++) {
                    let loadUrl = sPLoadUrlArr[i];
                    if (loadUrl)
                        game.ResLoader.getInstance().loadRes(loadUrl, cc.SpriteFrame, (err, res: cc.SpriteFrame) => {
                            if (!err) {
                                switch (i) {
                                    case 0:
                                        this.spriteSet[this.spriteSetIdx].normalSprite = res;
                                        break;
                                    case 1:
                                        this.spriteSet[this.spriteSetIdx].pressedSprite = res;
                                        break;
                                    case 2:
                                        this.spriteSet[this.spriteSetIdx].hoverSprite = res;
                                        break;
                                    case 3:
                                        this.spriteSet[this.spriteSetIdx].disabledSprite = res;
                                        break;
                                }
                                this._updateState();
                            }
                        }, "slot", "btnSprite");
                }
            }
        }
    }

    private rePlaceLanguage(url, Langs) {
        if (!url) return;
        if (Langs.includes(GData.curLanguage)) {
            url = url.replace("&", GData.curLanguage);
            while (url.includes("&")) {
                url = url.replace("&", GData.curLanguage);
            }
        } else {
            url = url.replace("&", "en");
            while (url.includes("&")) {
                url = url.replace("&", "en");
            }
        }
        return url
    }

    // update (dt) {}
}
