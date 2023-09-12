import { MAIN_NODE_NAME } from "../../common/enum/CommonEnum";
import { GData } from "../../common/utils/GData";
import { Layout } from "../../common/utils/Layout";
import BaseView from "../../main/BaseView";
import NetSlotConst from "../../network/NetSlotConst";
import SlotProtoManager from "../../network/SlotProtoManager";
import { GameEventNames } from "../../slotMachine/script/SlotConfigs/GameEventNames";
import SlotUtils from "../../slotMachine/script/SlotUtils/SlotUtils";


const { ccclass, property } = cc._decorator;

@ccclass
export default class HashCiphertextSlot extends BaseView {

    @property(cc.Label)
    ciphertext: cc.Label = null;

    @property(cc.Node)
    text: cc.Node = null;

    @property(sp.Skeleton)
    ani: sp.Skeleton = null;

    private ciphertextStr: string = null;
    onLoad() {
        this.resize();
        this.addEvent();
        this.initCiphertext();
    }

    private addEvent(): void {
        game.EventManager.getInstance().addEventListener(NetSlotConst.SPINRESP, this.spinResp, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_SET_HASH_POINT, this.setNodePint, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_SHOW_HASH_LABLE, this.setHashData, this);
        game.EventManager.getInstance().addEventListener(NetSlotConst.LGACTIONRESP, this.updateCiphert, this);
        game.EventManager.getInstance().addEventListener(NetSlotConst.BUYFREESPINRESP, this.buyFreeResp, this);
    }

    private updateCiphert(event: string, resp): void {
        let ciphertext = resp.ciphertext
        this.ciphertextStr = ciphertext;
        this.ciphertext.string = ciphertext.substr(0, 4) + "..." + ciphertext.substr(ciphertext.length - 18);
        // this.node.active = Boolean(ciphertext) && SlotUtils.isShowHashText;
        cc.tween(this.ciphertext.node).to(0.2, { scale: 1.4 }).to(0.1, { scale: 1.2 }).start();
    }

    private buyFreeResp(event: string, resp): void {
        this.upCiphertext(resp.ciphertext);
    }

    private spinResp(ent: string, result: protoSlot.spinResp): void {
        this.upCiphertext(result.ciphertext);
        if (this.ani) this.ani.setAnimation(0, "animation", false);
    }

    private setHashData(event: string, bo: boolean = true): void {
        this.node.active = bo && this.ciphertextStr ? true : false;
    }

    private onCopyBtn(): void {
        game.SoundManager.getInstance().playBtnSound();
        core.CoreUtils.copyText(this.ciphertextStr);
    }

    //初始密文
    private initCiphertext(): void {
        if (SlotProtoManager.getInstance().restoreResult) {
            this.upCiphertext(SlotProtoManager.getInstance().restoreResult.ciphertext);
        }
    }

    /**更新密文 */
    public upCiphertext(ciphertext: string = null): void {
        this.ciphertextStr = ciphertext;
        this.ciphertext.string = ciphertext.substr(0, 4) + "..." + ciphertext.substr(ciphertext.length - 18);
        this.node.active = Boolean(ciphertext) && SlotUtils.isShowHashText;
        cc.tween(this.ciphertext.node).to(0.2, { scale: 1.4 }).to(0.1, { scale: 1.2 }).start();
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
