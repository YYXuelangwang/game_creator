import { SOUND_NAME } from "../../common/enum/CommonEnum";
import { GData } from "../../common/utils/GData";
import { Layout } from "../../common/utils/Layout";
import BaseView from "../../main/BaseView";
import { GameEventNames } from "../../slotMachine/script/SlotConfigs/GameEventNames";
import SlotUtils from "../../slotMachine/script/SlotUtils/SlotUtils";
import { SoundMger } from "../../sound/script/SoundMger";


const { ccclass, property } = cc._decorator;

@ccclass
export default class SettlementAni extends BaseView {

    @property(cc.Label)
    coinLabel: cc.Label = null;

    @property(sp.Skeleton)
    congratuteSk: sp.Skeleton = null;

    @property(sp.Skeleton)
    congratuteSk_v: sp.Skeleton = null;

    @property(sp.Skeleton)
    badLuckSk: sp.Skeleton = null;

    @property(sp.Skeleton)
    badLuckSk_v: sp.Skeleton = null;

    @property(sp.Skeleton)
    starSk: sp.Skeleton = null;

    private freeAdmissionPlayComplete: Function = null;
    private playScheduleOnce: any = null;
    private winCoin: number = 0;
    private _winMoney: number = 0;
    onLoad() {
        if (this.starSk) {
            this.starSk.setCompleteListener(this.playComplete.bind(this));
        }
        this.coinLabel.node.width = 900;
        super.resize();
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_SETTLEMENT_ANI_HIDE, this.playComplete, this);
    }

    onDestroy(): void {
        super.onDestroy && super.onDestroy();
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_SETTLEMENT_ANI_HIDE, this.playComplete, this);
    }

    private playComplete(): void {
        this.hide();
        this.node.active = false;
        this.unscheduleAllCallbacks();
        SoundMger.instance.stopEffectSlotCommon(SOUND_NAME.Prize_Loop);//提前关闭界面前停止音效
    }

    layout() {
        let scale = GData.skinId == 1?0.9:0.78;
        if(core.Global.gameBrand == core.GAME_BRAND.PG){
            this.node.scale = cc.sys.isMobile?0.6:0.55;
            return;
        }
        if (!Layout.isLandscape && GData.skinId == 1) {
            scale = 0.7;
        }else if(!Layout.isLandscape && (GData.skinId == 2 || GData.skinId == 3)){
            scale = GData.curLanguage == "zh"?0.7 : 0.7;
        }
        this.node.scale = scale;
    }

    layoutPortrait() {
        if (this.badLuckSk_v) {
            this.badLuckSk.node.opacity = 0;
            this.badLuckSk_v.node.opacity = 255;
        }
        this.congratuteSk.node.y = GData.skinId == 2 ? -150 : 0;
        if (this.congratuteSk_v) {
            this.congratuteSk.node.opacity = 0;
            this.congratuteSk_v.node.opacity = 255;
            this.congratuteSk_v.node.y = this.congratuteSk.node.y;
        }


    }

    layoutLandscape() {
        if (this.badLuckSk_v) {
            this.badLuckSk.node.opacity = 255;
            this.badLuckSk_v.node.opacity = 0;
        }
        this.congratuteSk.node.y = 0;
        if (this.congratuteSk_v) {
            this.congratuteSk.node.opacity = 255;
            this.congratuteSk_v.node.opacity = 0;
            this.congratuteSk_v.node.y = this.congratuteSk.node.y;
        }

    }

    set winMoney(value: number) {
        this._winMoney = value;
        this.coinLabel.string = SlotUtils.formatNumber(value);
    }

    get winMoney(): number {
        return this._winMoney;
    }

    play(winCoin: number, cb: Function): void {
        this.node.active = true;
        this.winCoin = winCoin;

        this.freeAdmissionPlayComplete = cb;

        if (winCoin == 0) {
            if (this.congratuteSk) {
                this.congratuteSk.node.active = false
            }
            if (this.congratuteSk_v) {
                this.congratuteSk_v.node.active = false
            }
            if (this.starSk) {
                this.starSk.node.active = false
            }
            this.coinLabel.node.active = false;
            let playName: string = GData.curLanguage == 'zh' ? 'Badluck-cn' : 'Badluck-en';
            let lang = GData.curLanguage == 'zh' ? "zh" : "en";
            if (this.badLuckSk_v) {
                this.badLuckSk.node.active = true;
                this.badLuckSk_v.node.active = true;
                this.badLuckSk.setAnimation(0, ("h_" + lang), false);
                this.badLuckSk_v.setAnimation(0, ("v_" + lang), false);
            } else {
                this.badLuckSk.node.active = true;
                this.badLuckSk.setAnimation(0, playName, false);
            }
            SoundMger.instance.playEffectSlotCommon(SOUND_NAME.Settle_Failed, false);

            this.scheduleOnce(this.playComplete.bind(this), 3);

        } else {
            if (this.badLuckSk) {
                this.badLuckSk.node.active = false
            }
            if (this.badLuckSk_v) {
                this.badLuckSk_v.node.active = false
            }

            this.coinLabel.enableWrapText = false;
            this.coinLabel.overflow = cc.Label.Overflow.SHRINK;
            let len = this.winCoin.toString().length;
            this.congratuteSk.node.y = GData.skinId == 2 ? (Layout.isLandscape ? 0 : -150) : this.congratuteSk.node.y;
            this.coinLabel.node.active = true;
            this.coinLabel.node.opacity = 100;
            this.coinLabel.node.scale = 0.2;
            this.winMoney = Math.round(Math.random() * 10 * len);
            let playName: string = GData.curLanguage == 'zh' ? 'congratulations-cn' : 'congratulations-en';
            let lang = GData.curLanguage == 'zh' ? "zh" : "en";
            if (this.congratuteSk_v) {
                this.congratuteSk.node.active = true;
                this.congratuteSk_v.node.active = true;
                this.congratuteSk.setAnimation(0, ("h_" + lang), false);
                this.congratuteSk_v.setAnimation(0, ("v_" + lang), false);
            } else {
                this.congratuteSk.node.active = true;
                this.congratuteSk.setAnimation(0, playName, false);
            }
            if (winCoin != 0) {
                SoundMger.instance.playEffectSlotCommon(SOUND_NAME.Prize_Loop, true);
                this.scheduleOnce(() => { SoundMger.instance.playEffectSlotCommon(SOUND_NAME.Prize_Stop, false); }, 1.2);
            }
            // @ts-ignore
            cc.tween(this).to(0.45, { winMoney: winCoin * 0.4 }).to(1.15, { winMoney: winCoin }).call(() => {
                SoundMger.instance.stopEffectCommon(SOUND_NAME.Prize_Loop);

            }).start();
            let sca = 1;
            cc.tween(this.coinLabel.node).to(0.6, { scale: 1.4, opacity: 225 }).to(0.25, { scale: sca }).call(this.playStarAni.bind(this)).start();

        }
    }

    private playStarAni(): void {
        this.coinLabel.node.scale = 1;
        if (this.starSk) {
            this.starSk.node.active = true;
            this.starSk.setAnimation(0, "FX", false);
        } else {
            this.scheduleOnce(this.playComplete.bind(this), 3);
        }
    }

    private hide(): void {
        if (this.freeAdmissionPlayComplete) {
            this.freeAdmissionPlayComplete.call(this);
            this.freeAdmissionPlayComplete = null;
        }
        this.node.active = false;
    }

}
