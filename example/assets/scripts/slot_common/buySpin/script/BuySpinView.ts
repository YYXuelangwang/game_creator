import { GData } from "../../common/utils/GData";
import NetSlotConst from "../../network/NetSlotConst";
import SlotProtoManager from "../../network/SlotProtoManager";
import { GameEventNames } from "../../slotMachine/script/SlotConfigs/GameEventNames";
import FreeGameManager from "../../slotMachine/script/SlotManager/FreeGameManager";
import PlayerManager from "../../slotMachine/script/SlotManager/PlayerManager";
import SpinManager from "../../slotMachine/script/SlotManager/SpinManager";
import SlotUtils from "../../slotMachine/script/SlotUtils/SlotUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BuySpinView extends game.View {

    @property(cc.Node)
    buyfreespins: cc.Node = null;

    // @property([cc.SpriteFrame])
    // bgSpr: cc.SpriteFrame[] = [];

    @property(cc.Node)
    scaleNode: cc.Node = null;

    @property(cc.Node)
    queding: cc.Node = null;

    @property(cc.Node)
    quxiao: cc.Node = null;

    @property(cc.Label)
    buyCost: cc.Label = null;

    private netNode: game.NetNode;


    private btnCall = null;
    onOpen(fromUI: number, ...args: any[]) {
        this.btnCall = args[0];
        setTimeout(() => {
            this.onTween();
        }, 30);
    }

    onLoad() {
        cc.log("===buySpinView onLoad");
        this.resize();
        super.onLoad && super.onLoad();
        this.setReceiveCallBack();
        this.quxiao.on(cc.Node.EventType.TOUCH_END, this.close, this);
        this.queding.on(cc.Node.EventType.TOUCH_END, this.buyFreeImdReq, this);
        this.buyCost.string = SlotUtils.formatNumber(SlotProtoManager.buyMultiNum / 10000 * SpinManager.instance.betCost);
        
        let aniName = GData.curLanguage == "zh"?"animation_fadein_zh":"animation_fadein_en";
        this.buyfreespins.getComponent(sp.Skeleton).setAnimation(0, aniName, false);
    }

    private setReceiveCallBack(): void {
        this.netNode = game.NetManager.getInstance().getNetNode();
        this.netNode.setResponeHandler([protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.buyFreeImdResp], this.buyFreeImdResp, this);
    }

    onDestroy() {
        super.onDestroy && super.onDestroy();
        this.quxiao.off(cc.Node.EventType.TOUCH_END, this.close, this);
        this.queding.off(cc.Node.EventType.TOUCH_END, this.buyFreeImdReq, this);

    }

    layoutLandscape() {
        super.layoutLandscape && super.layoutLandscape();
    }

    layoutPortrait() {
        super.layoutPortrait && super.layoutPortrait();
    }

    //开场缓动
    onTween() {
        cc.tween(this.scaleNode).to(0.2, { x: 0 }).start();
    }

    /**
    * 购买免费游戏请求
    */
    public buyFreeImdReq(event: string) {
        // this.btnTween(this.queding);
        game.SoundManager.getInstance().playBtnSound();
        console.log("===buy ✔ ,buyFreeImdReq--", event);
        let netNode = game.NetManager.getInstance().getNetNode();
        let reqType: protoSlot.spinReqType = <protoSlot.spinReqType>{};
        reqType.lines = SpinManager.instance.lineNum;
        reqType.cost = SpinManager.instance.getLineCostByIndex();
        reqType.rate = SpinManager.instance.getRealLineRate();
        reqType.assginLine = [];
        reqType.rateModulus = SpinManager.instance.rateModulus;
        reqType.lineMultiple = SpinManager.instance.getLinelMutiple();
        if (SpinManager.instance.extra != null) {
            reqType.extra = SpinManager.instance.extra;
        }
        console.log("===buy ✔ ,reqType.rate--", reqType.lineMultiple);

        //购买免费转的钱
        var betcost: number = Number(SlotProtoManager.buyMultiNum / 10000 * SpinManager.instance.betCost);
        var showCoin: number = PlayerManager.instance.showCoin;
        var minBalance: number = SlotProtoManager.getInstance().restoreResult?.spinCfg[0]?.minBalance;
        if (Number(showCoin) < Number(betcost) || (minBalance && Number(showCoin) < Number(minBalance))) {
            // var viewCoin = SlotUtils.formatNumber(minBalance ? betcost > minBalance ? betcost : minBalance : betcost);
            // 金币不足弹框（金币不足请先补充）
            // var tips = game.LanguageManager.getInstance().getDstStr("balanceLimitToRecharge", viewCoin);
            // let onlyOKBtn = true;
            // core.TipsManager.getInstance().showDialog(tips, null, null, onlyOKBtn);

            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_NO_MONEY_TIP_POP);
            
        } else {
            //发起购买请求
            let data = new protoSlot.buyFreeImdReq();
            data.req = reqType;
            let buff = core.ProtocolHelper.createGameSockBuff(protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.buyFreeImdReq, protoSlot.buyFreeImdReq, data);
            netNode.send(buff);
            console.log("===buy ✔111");
        }
    }

    //服务器购买成功返回
    buyFreeImdResp(data: any) {
        this.close(false);
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_BUY_FREE_EXPAND);//点击购买免费后，加可扩展事件
        SpinManager.instance.spinTouchEnable = false;
        // GameControlBase.instance.setBtnsVisible(false);
        let result = core.ProtocolHelper.buffDecode(protoSlot.buyFreeImdResp, data) as protoSlot.buyFreeImdResp;
        game.LogManager.getInstance().log("buyFreeImdResp", result);
        SpinManager.instance.totalWin = 0;//清除上次贏分避免彈出大獎動畫
        PlayerManager.instance.updateRealCoin(Number(result.balance));
        PlayerManager.instance.syncShowingCoin(Number(result.balance));//显示玩家购买后剩余的钱
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SLOT_REFSH_BALANCE);//派发更新总余额事件
        game.EventManager.getInstance().raiseEvent(NetSlotConst.BUYFREESPINRESP, result);
    }

    /**
     * 关闭界面
     */
    close(isCall: boolean = true) {
        console.log("===buy close ");
        game.SoundManager.getInstance().playBtnSound();
        if(isCall && !FreeGameManager.instance.hasFreeGame){
            this.btnCall && this.btnCall();
        }
        game.UIManager.getInstance().close();
    }

}
