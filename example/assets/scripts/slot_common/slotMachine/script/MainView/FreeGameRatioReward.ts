import { SOUND_NAME } from "../../../common/enum/CommonEnum";
import { SoundMger } from "../../../sound/script/SoundMger";
import { GameEventNames } from "../SlotConfigs/GameEventNames";
import { WinType } from "../SlotDefinitions/SlotEnum";
import SpinManager from "../SlotManager/SpinManager";
import { Handler } from "../SlotUtils/Handle";
import SlotUtils from "../SlotUtils/SlotUtils";

const { ccclass, property } = cc._decorator;
export class FreeGameRatioReward extends cc.Component {

    @property(cc.Node)
    winEff: cc.Node = null;

    @property(cc.Node)
    multipleEff: cc.Node = null;

    @property(cc.Node)
    ratioNode: cc.Node = null;

    private _winMoney: number = 0;

    private effTime: number = 1;

    private multipleEffx: number;
    private multipleEffy: number;

    onLoad() {
        game.EventManager.getInstance().addEventListener(game.Const.mess_windowResize, this.layout, this);
        this.winEff.active = false;
        this.winEff.y = this.winEff.y;
        this.winEff.width = 1080;
        this.winEff.height = 200;
        this.winEff.getComponent(cc.Label).overflow = cc.Label.Overflow.SHRINK;
        this.winEff.getComponent(cc.Label).enableWrapText = false;
        this.winEff.getComponent(cc.Label).horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        this.winEff.getComponent(cc.Label).verticalAlign = cc.Label.VerticalAlign.CENTER;
        if (this.multipleEff) {
            this.multipleEffx = this.multipleEff.x;
            this.multipleEffy = this.multipleEff.y;
            this.multipleEff.active = false;
            this.multipleEff.setSiblingIndex(20);
        }
        this.layout();
    }

    protected onDestroy(): void {
        game.EventManager.getInstance().removeEventListener(game.Const.mess_windowResize, this.layout, this);
    }

    protected layout() {

    }

    set winMoney(value: number) {
        this._winMoney = value;
        this.winEff.getComponent(cc.Label).string = SlotUtils.formatNumber(value);
    }

    get winMoney(): number {
        return this._winMoney;
    }

    /**
     * 单局金币变化的动作
     * @param start 开始的金币值
     * @param end 变化到的金币值
     * @param cb 完成的回调
     */
    playScoreChangeEffect(start: number, end: number, cb?: Handler): void {
        this.winMoney = start;

        this.effTime = 0.8;
        //@ts-ignore
        cc.tween(this).to(this.effTime, { winMoney: end }).start();
        this.winEff.scale = 0.5;
        this.winEff.active = true;
        SoundMger.instance.playEffectCommon(SOUND_NAME.Score_Appear);

        cc.tween(this.winEff).to(this.effTime, { scale: 1 }, { easing: "backOut" }).call(() => {
            if (cb) {
                cb.run()
            }
        }).start();
    }

    /**
     * 单局金币消失到赢分处的动作
     * @param cb 
     */
    hideScoreChangeEffect(cb: Handler): void {
        let off = 0;
        if (!this.winEff.active) {
            if (cb) {
                cb.run();
            }
            return;
        }
        cc.tween(this.winEff).delay(0.5).to(0.1, { scale: 0.5, y: this.winEff.y - off }).call(() => {
            this.winEff.active = false;
            this.winEff.y = this.winEff.y + off;
            if (this.winMoney > SpinManager.instance.betCost) {

            }
            if (cb) {
                cb.run();
            }
        }).start();
    }

    private playRatioEffect(ratio: number, total: number, cb: Handler): void {
        if (!this.multipleEff || ratio < 2) {
            this.playOver(total, cb);
        } else {
            this.multipleEff.active = true;
            this.multipleEff.setScale(0.8, 0.8);
            let ratioLabel = this.multipleEff.getChildByName("ratioLabel") || this.ratioNode;
            if (ratioLabel) {
                ratioLabel.getComponent(cc.Label).string = ratio.toString();
            }
            SoundMger.instance.playEffectCommon(SOUND_NAME.Score_Ratio);

            cc.tween(this.multipleEff).delay(0.8).to(0.1, { scale: 1.5 }).to(0.2, { scale: 1 }).start();
            cc.tween(this.multipleEff).to(0.1, { scaleY: 1.1 }, { easing: "expoInOut" })
                .to(0.2, { scaleX: 1.3, scaleY: 1.3 }, { easing: "expoInOut" })
                .delay(0.5).call(() => {

                })
                .to(0.5, { x: this.winEff.x, y: this.winEff.y }, { easing: "expoInOut" }).call(() => {
                    this.multipleEff.x = this.multipleEffx;
                    this.multipleEff.y = this.multipleEffy;
                    this.multipleEff.active = false;
                    SoundMger.instance.playEffectCommon(SOUND_NAME.Score_Appear);

                    cc.tween(this.winEff).to(0.2, { scale: 1.3 }).to(0.4, { scale: 1 }).start();
                    //@ts-ignore
                    cc.tween(this).to(this.effTime, { winMoney: total }).call(() => {
                        this.playOver(total, cb);
                    }).start();
                }).start();


        }
    }

    playEff(ratio: number, total: number, base: number, cb: Handler): void {

        this.effTime = 0.8;


        if (!this.winEff.active) {
            this.winMoney = 0;
            //@ts-ignore
            cc.tween(this).to(this.effTime, { winMoney: base }).start();

            this.winEff.scale = 0.5;
            this.winEff.active = true;
            SoundMger.instance.playEffectCommon(SOUND_NAME.Score_Appear);
            cc.tween(this.winEff).to(this.effTime, { scale: 1 }, { easing: "backOut" }).call(() => {
                this.playRatioEffect(ratio, total, cb);
            }).start();
        } else {
            this.playRatioEffect(ratio, total, cb);
        }

    }

    private playOver(total: number, cb: Handler): void {
        let off = 0;
        if (!this.winEff.active) {
            if (cb) {
                cb.run();
            }
            return;
        }
        cc.tween(this.winEff).delay(1).to(0.1, { scale: 0.5, y: this.winEff.y - off }).call(() => {
            this.winEff.active = false;
            this.winEff.y = this.winEff.y + off;
            var winType = SlotUtils.getWinType(total, SpinManager.instance.betCost);
            if (winType == WinType.Normal) {
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_PLAYED_NORMAL_REWARD);
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_PLAY_REWARD_ANI, total, winType, cb);
            } else {
                if (cb) {
                    cb.run();
                }
            }

        }).start();

    }

}