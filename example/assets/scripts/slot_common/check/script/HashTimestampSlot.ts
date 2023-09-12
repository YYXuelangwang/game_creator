import { GData } from "../../common/utils/GData";
import { Layout } from "../../common/utils/Layout";
import BaseView from "../../main/BaseView";
import NetSlotConst from "../../network/NetSlotConst";
import SlotProtoManager from "../../network/SlotProtoManager";
import { GameEventNames } from "../../slotMachine/script/SlotConfigs/GameEventNames";
import SlotUtils from "../../slotMachine/script/SlotUtils/SlotUtils";


const { ccclass, property } = cc._decorator;

@ccclass
export default class HashTimestampSlot extends BaseView {

    @property(cc.Label)
    timeText: cc.Label = null;

    @property(cc.Label)
    hashText: cc.Label = null;

    @property(sp.Skeleton)
    ani: sp.Skeleton = null;

    private timetextStr: string = null;

    onLoad() {
        this.resize();
        this.addEvent();
        this.initCiphertext();
    }

    private addEvent(): void {
        game.EventManager.getInstance().addEventListener(NetSlotConst.SPINRESP, this.spinResp, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_SET_HASH_POINT, this.setNodePint, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_SHOW_HASH_LABLE, this.setHashData, this);
        game.EventManager.getInstance().addEventListener(NetSlotConst.LGACTIONRESP, this.buyFreeResp, this);
        game.EventManager.getInstance().addEventListener(NetSlotConst.BUYFREESPINRESP, this.buyFreeResp, this);
    }

    private buyFreeResp(event: string, resp): void {
        this.upCiphertext(resp.ciphertext);
    }

    private spinResp(ent: string, result: protoSlot.spinResp): void {
        this.upCiphertext(result.plaintext, result.ciphertext);
        if (this.ani) this.ani.setAnimation(0, "animation", false);
    }

    private setHashData(event: string, bo: boolean = true): void {
        this.node.active = bo && this.timetextStr ? true : false;
    }

    //初始密文
    private initCiphertext(): void {
        this.node.active = false;
    }

    private copyText(ent: any): void {
        core.CoreUtils.copyText(this.timeText.string);
    }

    /**更新密文 */
    public upCiphertext(timeText: string = null, ciphertext: string = null): void {
        if (!timeText) {
            this.node.active = false;
            return;
        }
        this.timetextStr = timeText;
        this.node.active = true && SlotUtils.isShowHashText;
        this.timeText.string = timeText;//game.TimeUtil.getTimeFormat(new Date(Number(timeText.substr(0, timeText.length - 3))));
        this.hashText.string = ciphertext.substr(0, 4) + "..." + ciphertext.substr(ciphertext.length - 18);
        cc.tween(this.timeText.node).to(0.2, { scale: 1.2 }).to(0.1, { scale: 1 }).start();
    }

    private setNodePint(ent: string, x: number, y: number): void {
        this.node.x = x;
        this.node.y = y;
    }

    private layoutManual(isLand: boolean) {
        let obj = GData.getParameter('layout');
        let x = 0, y = 0, scaleX = 1, scaleY = 1;
        if (cc.sys.isMobile) {
            if (isLand) {
                x = GData.getJsonValue_safe(obj, 'hashText_mobileL/x') || 0;
                y = GData.getJsonValue_safe(obj, 'hashText_mobileL/y') || 0;
                scaleX = GData.getJsonValue_safe(obj, 'hashText_mobileL/scaleX') || 1;
                scaleY = GData.getJsonValue_safe(obj, 'hashText_mobileL/scaleY') || 1;
            } else {
                x = GData.getJsonValue_safe(obj, 'hashText_mobileP/x') || 0;
                y = GData.getJsonValue_safe(obj, 'hashText_mobileP/y') || 0;
                scaleX = GData.getJsonValue_safe(obj, 'hashText_mobileP/scaleX') || 1;
                scaleY = GData.getJsonValue_safe(obj, 'hashText_mobileP/scaleY') || 1;
            }
        } else {
            if (isLand) {
                x = GData.getJsonValue_safe(obj, 'hashText_pcL/x') || 0;
                y = GData.getJsonValue_safe(obj, 'hashText_pcL/y') || 0;
                scaleX = GData.getJsonValue_safe(obj, 'hashText_pcL/scaleX') || 0;
                scaleY = GData.getJsonValue_safe(obj, 'hashText_pcL/scaleY') || 0;
            } else {
                x = GData.getJsonValue_safe(obj, 'hashText_pcP/x') || 0;
                y = GData.getJsonValue_safe(obj, 'hashText_pcP/y') || 0;
                scaleX = GData.getJsonValue_safe(obj, 'hashText_pcP/scaleX') || 0;
                scaleY = GData.getJsonValue_safe(obj, 'hashText_pcP/scaleY') || 0;
            }
        }
        this.setNodePint(null, x, y);
        this.node.scaleX = scaleX;
        this.node.scaleY = scaleY;
    }

    layoutLandscape(): void {
        this.layoutManual(true);
    }

    layoutPortrait(): void {
        this.layoutManual(false);
    }
}
