import { UIID } from "../../../main/script/CommonConst";
import { SOUND_NAME } from "../../common/enum/CommonEnum";
import { GData } from "../../common/utils/GData";
import { Layout } from "../../common/utils/Layout";
import { GameEventNames } from "../../slotMachine/script/SlotConfigs/GameEventNames";
import PlayerManager from "../../slotMachine/script/SlotManager/PlayerManager";
import SpinManager from "../../slotMachine/script/SlotManager/SpinManager";
import { Handler } from "../../slotMachine/script/SlotUtils/Handle";
import SlotUtils from "../../slotMachine/script/SlotUtils/SlotUtils";
import { SoundMger } from "../../sound/script/SoundMger";

export enum IMaterialTypeTurnCoinView {
    GRAY = 1,
    NORMAL,
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class TurnCoinView extends game.View {

    @property(cc.Node)
    bg: cc.Node = null;
    @property(cc.Node)
    bgAni: cc.Node = null;

    @property([cc.SpriteFrame])
    bgSpr: cc.SpriteFrame[] = [];

    @property(cc.Node)
    scaleNode: cc.Node = null;

    @property(cc.Node)
    coinUi: cc.Node = null;

    @property(cc.Node)
    coin: cc.Node = null;

    @property(cc.Node)
    guanbi: cc.Node = null;

    @property(cc.Node)
    operateNode: cc.Node = null;

    @property(cc.Node)
    avatarBtn: cc.Node = null;

    @property(cc.Node)
    numBtn: cc.Node = null;

    @property(cc.Label)
    curBase: cc.Label = null;

    @property(cc.Label)
    nextReward: cc.Label = null;

    @property(cc.Node)
    exchangeBtn: cc.Node = null;

    @property(cc.Node)
    settlementNode1: cc.Node = null;

    @property(cc.Node)
    settlementNode2: cc.Node = null;

    @property(cc.Node)
    hashNode: cc.Node = null;

    @property(cc.Node)
    gameIllustrate: cc.Node = null;

    @property(cc.Label)
    serverHash: cc.Label = null;

    @property(cc.Label)
    clientSeed: cc.Label = null;

    @property(cc.Label)
    randomNum: cc.Label = null;

    @property(cc.Node)
    gongpingxingBtn: cc.Node = null;

    @property(cc.Node)
    refreshBtn: cc.Node = null;

    @property(cc.Node)
    startMask: cc.Node = null;

    private netNode: game.NetNode;
    private btnCall = null;

    private coinSk: sp.Skeleton = null;
    private openBtnNode: cc.Node = null;
    private coinUiSk: sp.Skeleton = null;
    private isWin: boolean = false;
    private isLoop: boolean = false;
    private isGbClick: boolean = true;
    private isNumClick: boolean = true;
    private isExchange: boolean = false;
    private isHashClick: boolean = true;
    private isStartPlay: boolean = false;
    private isCloseView: boolean = false;
    private isResultshow: boolean = false;
    private isAvatarClick: boolean = true;
    private isStartLayout: boolean = true;
    private isExchangeClick: boolean = true;
    private lastRoundResultAvatar: boolean = true;
    private nextNum: number = 0;
    private startNum: number = 0;
    private _RefreshNextNum: number = 0;
    private _RefreshStartNum: number = 0;
    private closeTimeout: cc.Tween = null;
    private doubleCoin: protoSlot.doubleCoinType = null;
    private currentResult: protoSlot.doubleCoinResp = null;
    private lastDoublCoin: protoSlot.doubleCoinType = null;

    onOpen(fromUI: number, ...args: any[]) {
        if (!args) return;
        this.openBtnNode = args[0];
        // this.startMask.setPosition(this.openBtnNode.getPosition());
        this.coinUiSk = this.coinUi.getComponent(sp.Skeleton);
        this.coinSk = this.coin.getComponent(sp.Skeleton);
        this.resize();
        this.addEvent();
        this.stertInit();
        this.setReceiveCallBack();
        SpinManager.instance.spinTouchEnable = false;
        SoundMger.instance.playEffectSlotCommon(SOUND_NAME.Bg_Pop_Up);
        SoundMger.instance.playMusicSlotCommon(SOUND_NAME.Music_BGM);

        
    }

    private addEvent() {
        this.guanbi.on(cc.Node.EventType.TOUCH_END, this.close, this);
        this.avatarBtn.on(cc.Node.EventType.TOUCH_END, this.onAvatar, this);
        this.numBtn.on(cc.Node.EventType.TOUCH_END, this.onNum, this);
        this.exchangeBtn.on(cc.Node.EventType.TOUCH_END, this.onExchange, this);
        this.gongpingxingBtn.on(cc.Node.EventType.TOUCH_END, this.onOpenHash, this);
        this.refreshBtn.on(cc.Node.EventType.TOUCH_END, this.onRefresh, this);
    }

    private allInit(): void {
        this.recoverBtn();
        this.isWin = false;
        this.isLoop = false;
        this.isGbClick = true;
        this.isNumClick = true;
        this.isHashClick = true;
        this.isExchange = false;
        this.isStartPlay = false;
        this.isResultshow = false;
        this.currentResult = null;
        this.isAvatarClick = true;
        this.isStartLayout = true;
        this.isExchangeClick = false;
        this.lastRoundResultAvatar = true;
        // this.startMask.width = 0;
        // this.startMask.height = 0;
        this.node.opacity = 255;
        this.bg.opacity = 0;
        this.guanbi.opacity = 0;
        this.operateNode.opacity = 0;
        this.gameIllustrate.opacity = 0;
        this.settlementNode1.active = false;
        this.settlementNode2.active = false;
        this.settlementNode1.getComponent(cc.ParticleSystem).resetSystem();
        this.settlementNode2.children[0].getComponent(cc.ParticleSystem).resetSystem();
        this.settlementNode2.children[1].getComponent(cc.ParticleSystem).resetSystem();
    }

    private setReceiveCallBack(): void {
        this.netNode = game.NetManager.getInstance().getNetNode();
        this.netNode.setResponeHandler([protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.doubleCoinResp], this.doubleCoinResp, this);
        this.netNode.setResponeHandler([protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.doubleCoinInfoResp], this.doubleCoinInfoResp, this);
    }

    onDestroy() {
        super.onDestroy && super.onDestroy();
        this.guanbi.off(cc.Node.EventType.TOUCH_END, this.close, this);
        this.avatarBtn.off(cc.Node.EventType.TOUCH_END, this.onAvatar, this);
        this.numBtn.off(cc.Node.EventType.TOUCH_END, this.onNum, this);
        this.exchangeBtn.off(cc.Node.EventType.TOUCH_END, this.onExchange, this);
        this.gongpingxingBtn.off(cc.Node.EventType.TOUCH_END, this.onOpenHash, this);
        this.refreshBtn.off(cc.Node.EventType.TOUCH_END, this.onRefresh, this);
    }

    /**界面打开初始化 */
    private stertInit() {
        this.isCloseView = false;
        this.allInit();
        this.doubleCoin = SpinManager.instance.doubleCoin;
        if(!this.doubleCoin)return;
        this._RefreshStartNum = Number(this.doubleCoin.curBase);
        this._RefreshNextNum = Number(this.doubleCoin.nextReward);
        this.startNum = Number(this.doubleCoin.curBase);
        this.nextNum = Number(this.doubleCoin.nextReward);
        this.curBase.string = SpinManager.instance.isLastView ? "0.00" : game.ComUtils.formatNumToKMB(Number(this.doubleCoin.curBase));
        this.nextReward.string = SpinManager.instance.isLastView ? "0.00" : game.ComUtils.formatNumToKMB(Number(this.doubleCoin.nextReward));
        this.grayAllChildren(this.exchangeBtn, IMaterialTypeTurnCoinView.GRAY);
        this.exchangeBtn.getComponent(cc.Button).interactable = false;
        if (SpinManager.instance.isLastView) this.lastView();
        if (!SpinManager.instance.isLastView) SpinManager.instance.throwTimes = 0;
        this.onStartTween();
        this.hashView();
    }

    /**界面关闭初始化 */
    private closeInit() {
        this.unscheduleAllCallbacks();
        this.allInit();
        this.coinUi.active = false;
        this.isCloseView = true;
        this.doubleCoin = null;
        this._RefreshStartNum = 0;
        this._RefreshNextNum = 0;
        this.startNum = 0;
        this.nextNum = 0;
        this.curBase.string = "0.00";
        this.nextReward.string = "0.00";
        // clearTimeout(this.closeTimeout);
        this.closeTimeout && this.closeTimeout.stop();
        this.closeTimeout = null;

        SoundMger.instance.stopMusicSlotCommon(SOUND_NAME.Music_BGM);
        SoundMger.instance.playMusic(SOUND_NAME.Game_Back_Music);

        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_TRUN_COIN_VIEW_CLOSE_EXPAND);
    }

    /**
     * 历史显示
     */
    private lastView() {
        this.doubleCoinInfoReq();
    }

    /**
     * 哈希显示
     */
    private hashView() {
        if (this.doubleCoin.serverHash) {
            this.hashNode.active = true;
            this.serverHash.string = this.doubleCoin.serverHash.slice(0, 16) + "......" + this.doubleCoin.serverHash.slice(-16);
            this.clientSeed.string = this.doubleCoin.clientSeed;
            this.randomNum.string = String(this.doubleCoin.randomNum);
        } else {
            this.hashNode.active = false;
        }
    }


    layout(): void {
        super.layout && super.layout();
        this.updateUi();
        if (!this.isStartLayout) {
            // this.startMask.setPosition(0, 0);
        }
        this.isStartLayout = false;

        if(core.Global.gameBrand == core.GAME_BRAND.PG){
            this.scaleNode.scale = 0.65;
            this.gameIllustrate.scale = 0.8;
            return;
        }else if(core.Global.gameBrand == core.GAME_BRAND.MG){
            // this.scaleNode.scale = Layout.isLandscape?0.8:(cc.sys.isMobile?0.65:1);
            this.startMask.scale = Layout.isLandscape?0.75:(cc.sys.isMobile?0.7:1);
            if(Layout.isLandscape && !cc.sys.isMobile){
                let width = GData.getParameter("main").canvas.width;
                let height = GData.getParameter("main").canvas.height;
                let widthBet = cc.Canvas.instance.node.width / width;
                let heightBet = cc.Canvas.instance.node.height / height;
                if (widthBet > 1 || heightBet > 1) {
                    widthBet = widthBet > 2 ? 2 : widthBet;
                    heightBet = heightBet > 2 ? 2 : heightBet;
                    this.bg.scale = widthBet > heightBet ? widthBet : heightBet;
                }
            }else{
                this.bg.scale = 1;
            }
            return;
        }

        let width = Layout.isLandscape ? GData.getParameter("main").canvas.width : GData.getParameter("main").canvas.height;
        let height = Layout.isLandscape ? GData.getParameter("main").canvas.height : GData.getParameter("main").canvas.width;
        let widthBet = cc.Canvas.instance.node.width / width;
        let heightBet = cc.Canvas.instance.node.height / height;
        if (widthBet > 1 || heightBet > 1) {
            widthBet = widthBet > 2 ? 2 : widthBet;
            heightBet = heightBet > 2 ? 2 : heightBet;
            this.bg.scale = widthBet > heightBet ? widthBet : heightBet;
        }
        this.scaleNode.scale = Layout.isLandscape?1:(cc.sys.isMobile?0.8:1);
    }

    /**
     * 打开界面动效
     */
    private onStartTween() {
        cc.tween(this.bg).to(0.1, { x: 0, y: 0 })
            .delay(0.1)
            .call(() => {
                let aniName = Layout.isLandscape ? "h" : "v";
                this.coinUi.active = true;
                this.coin.active = true;
                this.coinUiSk.setCompleteListener(() => {
                    if (this.isCloseView) return;
                    if (!this.isLoop) {
                        this.coinUiSk.setAnimation(0, `loop_${aniName}`, true);
                        this.updateUi();
                    }
                    this.isLoop = true;
                })
                this.gradientView(this.bg, 255);
                SoundMger.instance.playEffectSlotCommon(SOUND_NAME.Streamer);
                this.coinSk.setAnimation(0, "fadeIn", false);
                this.coinUiSk.setAnimation(0, `fadeIn_${aniName}`, false);
                this.scheduleOnce(() => {
                    if (this.isCloseView) return;
                    this.gradientView(this.guanbi, 255);
                    this.gradientView(this.operateNode, 255);
                    this.gradientView(this.gameIllustrate, 255);
                }, 0.4);
            })
            .start();
    }

    /**
    * 关闭界面动效
    */
    private onCloseTween() {
        this.updateUi();
        this.gradientView(this.guanbi, 0);
        this.gradientView(this.operateNode, 0);
        this.gradientView(this.gameIllustrate, 0);
        if (this.isCloseView) return;
        let aniName = Layout.isLandscape ? "h" : "v";
        this.coinUi.active = true;
        this.coin.active = true;
        this.coinSk.setAnimation(0, "fadeOut", false);
        this.coinUiSk.setAnimation(0, `fadeOut_${aniName}`, false);
        cc.tween(this.node)
            .call(() => {
                if (this.currentResult != null) {
                    this.openBtnNode.active = false;
                }
            })
            .delay(0.3)
            .to(0.5, { opacity: 0/**, x: this.openBtnNode.x, y: this.openBtnNode.y */ })
            .call(() => {
                if (this.isCloseView) return;
                this.closeInit();
                SpinManager.instance.spinTouchEnable = true;
                // SoundMger.instance.stopMusicCommon(SOUND_NAME.Music_BGM, true);
                // game.UIManager.getInstance().close();
                game.UIManager.getInstance().closeByUIID(UIID.UI_TURN_COIN_VIEW);
            })
            .start();

    }

    /**
     * 节点渐变
     * @param node 渐变节点
     * @opacity number = 255
     */
    gradientView(node: cc.Node, opacity: number = 255) {
        cc.tween(node).to(opacity == 255 ? 0.5 : 0.01, { opacity: opacity }).start();
    }

    /**
     * 窗口变化ui刷新
     */
    updateUi() {
        let isL = Layout.isLandscape;
        let aniName = isL ? "h" : "v";
        this.coinUiSk.setAnimation(0, `loop_${aniName}`, true);
        if(core.Global.gameBrand == core.GAME_BRAND.PG){
            this.bg.getComponent(cc.Sprite).spriteFrame = this.bgSpr[1];
            this.bgAni.getComponent(sp.Skeleton).setAnimation(0,"loop_v",true);
        }else{
            this.bg.getComponent(cc.Sprite).spriteFrame = this.bgSpr[isL ? 0 : 1];
            this.bgAni.getComponent(sp.Skeleton).setAnimation(0,`loop_${aniName}`,true);
        }
        this.settlementNode2.y = isL ? -580 : -1020;
        let canvas: cc.Node = cc.Canvas.instance.node;
        this.guanbi.getComponent(cc.Widget).target = canvas;
        this.guanbi.getComponent(cc.Widget).updateAlignment();
        if(core.Global.gameBrand == core.GAME_BRAND.PG){
            this.gongpingxingBtn.getComponent(cc.Widget).right = 0;
        }else{
            this.gongpingxingBtn.getComponent(cc.Widget).right = isL ? -100 : 0;
            this.gameIllustrate.y = isL ? -340 : -450;
            this.gameIllustrate.getComponent(cc.Layout).spacingY = isL ? 5 : 80;
        }
        this.gongpingxingBtn.getComponent(cc.Widget).updateAlignment();
        // this.startMask.width = isL ? 3200 : 2000;
        // this.startMask.height = isL ? 2000 : 3200;
    }

    //点击头像按钮
    onAvatar() {
        if (!this.isAvatarClick) return;
        this.btnTween(this.avatarBtn);
        if (!this.isExchange) this.doubleCoinReq(protoSlot.doubleCoinReqType.guess, protoSlot.doubleCoinResult.football);
    }

    //点击数字按钮
    onNum() {
        if (!this.isNumClick) return;
        this.btnTween(this.numBtn);
        if (!this.isExchange) this.doubleCoinReq(protoSlot.doubleCoinReqType.guess, protoSlot.doubleCoinResult.basketball);
    }

    /**
     * 兑换
     */
    onExchange() {
        if (!this.isExchangeClick) return;
        SoundMger.instance.playEffectSlotCommon(SOUND_NAME.Click_DH);
        this.btnTween(this.exchangeBtn);
        if (!this.isExchange) this.doubleCoinReq(protoSlot.doubleCoinReqType.get)
    }

    /** 按钮点击效果*/
    private btnTween(node: cc.Node) {
        cc.tween(node)
            .to(0.05, { scale: 1.2 })
            .delay(0.03)
            .to(0.05, { scale: 1 })
            .start();
    }

    /**
     * 刷新客户端种子
     */
    onRefresh() {
        // SoundMger.instance.playEffectSlotCommon(SOUND_NAME.Click_Effect);
        this.btnTween(this.refreshBtn);
        this.doubleCoinReq(protoSlot.doubleCoinReqType.refresh_client_seed)
    }

    /**
    * 操作请求
    */
    public doubleCoinReq(reqType: protoSlot.doubleCoinReqType, guessResult: protoSlot.doubleCoinResult = protoSlot.doubleCoinResult.football) {
        let netNode = game.NetManager.getInstance().getNetNode();
        let data = new protoSlot.doubleCoinReq();
        data.reqType = reqType;
        data.guessResult = guessResult;
        if (reqType == protoSlot.doubleCoinReqType.guess) {
            SoundMger.instance.playEffectSlotCommon(SOUND_NAME.Click_JC);
            this.refreshBtn.active = false;
            this.isStartPlay = true;
            this.disabledBtn(guessResult == protoSlot.doubleCoinResult.football);
        }
        console.log("reqType:", reqType, "guessResult:", guessResult, "data:", data);
        let buff = core.ProtocolHelper.createGameSockBuff(protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.doubleCoinReq, protoSlot.doubleCoinReq, data);
        netNode.send(buff);
    }

    /**
     * 服务器数据返回
     * @param data 数据
     */
    doubleCoinResp(data: any) {
        console.log("===========结果返回", data);
        let result = core.ProtocolHelper.buffDecode(protoSlot.doubleCoinResp, data) as protoSlot.doubleCoinResp;
        game.LogManager.getInstance().log("doubleCoinResp", result);
        this.doubleCoin = result.doubleCoin;
        if (result.reqType == protoSlot.doubleCoinReqType.guess) {
            //竞猜
            this.isWin = result.doubleCoin.curBase > 0;
            this.currentResult = result;
            SpinManager.instance.throwTimes++;
            this.coinAni(result.result == protoSlot.doubleCoinResult.football);
            if (!this.isWin) {
                SpinManager.instance.isLastView = true;
                this.updateCoin(Number(PlayerManager.instance.showCoin - Number(SpinManager.instance.doubleCoin.curBase)));
            }
        } else if (result.reqType == protoSlot.doubleCoinReqType.get) {
            this.isExchange = true;
            //兑换
            this.viewStreamer();
            if (GData.skinId == 1) this.settlementNode2.active = true;
            SpinManager.instance.isLastView = true;
            let cd = new Handler;
            this.scheduleOnce(() => {
                if (this.isCloseView) return;
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SETTLEMENT_ANI_PLAY, Number(this.currentResult.doubleCoin.curBase), cd);
            }, 1.2);
            SoundMger.instance.playEffectSlotCommon(SOUND_NAME.DH_Effect);
            this.scheduleOnce(() => {
                if (this.isCloseView) return;
                this.coinNum(this.startNum, 0, true);
                this.coinNum(this.nextNum, 0, false);
                this.closeTimeout = cc.tween(this).delay(4.4).call(()=>{
                    if (this.isCloseView) return;
                    // game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SETTLEMENT_ANI_HIDE);
                    this.settlementNode2.active = false;
                    this.onCloseTween && this.onCloseTween();
                }).start();
            }, 0.8);
            this.isGbClick = true;
            this.isStartPlay = false;
            this.updateCoin(Number(result.balance));
            this.doubleCoinInfoReq();
        } else if (result.reqType == protoSlot.doubleCoinReqType.refresh_client_seed) {
            //刷新客户端种子
            this.hashView();
        }
    }

    /**
    * 服务器种子请求
    */
    public doubleCoinInfoReq() {
        this.isAvatarClick = this.isNumClick = this.isExchangeClick = false;
        this.grayAllChildren(this.avatarBtn, IMaterialTypeTurnCoinView.GRAY);
        this.grayAllChildren(this.numBtn, IMaterialTypeTurnCoinView.GRAY);
        this.grayAllChildren(this.exchangeBtn, IMaterialTypeTurnCoinView.GRAY);
        this.avatarBtn.getComponent(cc.Button).interactable = false;
        this.numBtn.getComponent(cc.Button).interactable = false;
        this.exchangeBtn.getComponent(cc.Button).interactable = false;
        let netNode = game.NetManager.getInstance().getNetNode();
        let data = new protoSlot.doubleCoinInfoReq();
        let buff = core.ProtocolHelper.createGameSockBuff(protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.doubleCoinInfoReq, protoSlot.doubleCoinInfoReq, data);
        netNode.send(buff);
        console.log("服务器种子请求--")
    }

    /**
     * 服务器数据返回
     * @param data 数据
     */
    doubleCoinInfoResp(data: any) {
        let result = core.ProtocolHelper.buffDecode(protoSlot.doubleCoinInfoResp, data) as protoSlot.doubleCoinInfoResp;
        game.LogManager.getInstance().log("doubleCoinInfoResp", result);
        this.lastDoublCoin = result.lastDoubleCoin;
    }

    /**
     * 金币动画
     * @param isAvatar 是否为头像面 
     */
    coinAni(isAvatar: boolean) {
        setTimeout(() => {
            if (this.isCloseView) return;
            SoundMger.instance.playEffectSlotCommon(SOUND_NAME.Coin_Rotate);
        }, 0.3);
        let aniName = this.lastRoundResultAvatar ? isAvatar ? "goldToGold" : "goldToSilver" : isAvatar ? "silverToGold" : "silverToSilver";
        this.coinSk.setAnimation(0, aniName, false);
        this.lastRoundResultAvatar = isAvatar;
        this.scheduleOnce(() => {
            if (this.isCloseView) return;
            this.isResultshow = true;
            if (this.isWin) {
                this.viewStreamer();
                this.scheduleOnce(() => {
                    if (this.isCloseView) return;
                    this.recoverBtn();
                    this.onBtnView(this.currentResult.result == protoSlot.doubleCoinResult.football ? this.avatarBtn : this.numBtn);
                    this.coinNum(this.startNum, this.currentResult.doubleCoin.curBase, true);
                    this.coinNum(this.nextNum, this.currentResult.doubleCoin.nextReward, false);
                    this.startNum = this.currentResult.doubleCoin.curBase;
                    this.nextNum = this.currentResult.doubleCoin.nextReward;
                }, 1.2);
            } else {
                this.doubleCoinInfoReq();
                this.recoverBtn();
                this.isStartPlay = false;
                this.coinNum(this.startNum, 0, true);
                this.coinNum(this.nextNum, 0, false);
                SoundMger.instance.playEffectSlotCommon(SOUND_NAME.Over_Effect);
                this.closeTimeout = cc.tween(this).delay(1.7).call(()=>{
                    this.onCloseTween && this.onCloseTween();
                }).start();
            }
        }, 6.5);
    }

    /**
     * 更新金币
     * @param coin 显示的金币
     */
    updateCoin(coin: number) {
        console.log("更新玩家金币---------------", coin);
        PlayerManager.instance.syncShowingCoin(coin);//显示玩家购买后剩余的钱
        PlayerManager.instance.updateRealCoin(coin);
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_RESET_SCROLLER);
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SLOT_REFSH_BALANCE);//派发更新总余额事件
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FORCE_UPDATE_WINSCORE, 0);
    }


    set RefreshStartNum(value: number) {
        this._RefreshStartNum = value;
        this.curBase.string = SlotUtils.formatNumber(value);
    }

    get RefreshStartNum(): number {
        return this._RefreshStartNum;
    }

    set RefreshNextNum(value: number) {
        this._RefreshNextNum = value;
        this.nextReward.string = SlotUtils.formatNumber(value);
    }

    get RefreshNextNum(): number {
        return this._RefreshNextNum;
    }

    /**数字滚动 */
    coinNum(start: number, end: number, isRefreshStartNum: boolean = true) {
        SoundMger.instance.playEffectSlotCommon(SOUND_NAME.Num_Scroll);
        console.log("start-", start, "end-", end);
        let startNum = Number(start);
        let endNum = Number(end);
        if (isRefreshStartNum) {
            this._RefreshStartNum = startNum;
            this.curBase.string = SlotUtils.formatNumber(startNum);
            // @ts-ignore
            cc.tween(this).to(1, { RefreshStartNum: endNum }).start();
        } else {
            this._RefreshNextNum = startNum;
            this.nextReward.string = SlotUtils.formatNumber(startNum);
            // @ts-ignore
            cc.tween(this).to(1, { RefreshNextNum: endNum }).start();
        }
    }

    /**请求打开公平验证界面 */
    onOpenHash() {
        if (!this.isHashClick) return;
        // clearTimeout(this.closeTimeout);
        this.closeTimeout && this.closeTimeout.stop();
        this.closeTimeout = null;
        SoundMger.instance.playEffectSlotCommon(SOUND_NAME.Click_Effect);
        this.btnTween(this.gongpingxingBtn);
        let isSettlement: boolean = false;
        isSettlement = this.lastDoublCoin ? true : false;
        let doubleCoin = new protoSlot.doubleCoinType();
        doubleCoin = isSettlement ? this.lastDoublCoin : this.doubleCoin;
        let hashData = new protoReport.layout_hash_type();
        if (doubleCoin?.randomNum) hashData.nonce = doubleCoin.randomNum;
        if (doubleCoin?.serverSeed) hashData.serverSeed = doubleCoin.serverSeed;
        if (doubleCoin?.clientSeed) hashData.clientSeed = doubleCoin.clientSeed;
        if (doubleCoin?.serverHash) hashData.serverSeedHash = doubleCoin.serverHash;
        let data: core.IcoinHashVerify = {
            toggleIndex: 2,
            game_id: 1000000,
            hashDataGame: isSettlement ? [null, hashData] : [hashData, null],
            throwTimes: SpinManager.instance.throwTimes
        }
        game.UIManager.getInstance().open(core.COREUIID.UI_SLOT_GAME_HASH_VERIFICATION_INSTRUCTIONS, data);
    }

    /**显示彩带 */
    viewStreamer() {
        this.settlementNode1.active = true;
        SoundMger.instance.playEffectSlotCommon(SOUND_NAME.Streamer);
        this.scheduleOnce(() => {
            if (this.isCloseView) return;
            this.settlementNode1.active = false;
            this.settlementNode1.getComponent(cc.ParticleSystem).resetSystem();
        }, 1.2)
    }

    /**
     * 按钮闪烁
     * @param node 
     */
    onBtnView(node: cc.Node) {
        cc.tween(node)
            .to(0.4, { opacity: 50 })
            .to(0.4, { opacity: 255 })
            .to(0.4, { opacity: 50 })
            .to(0.4, { opacity: 255 })
            .start();
    }

    /**
     * 禁用按钮
     * @param isAvatar 是否头像按钮
     */
    disabledBtn(isAvatar: boolean) {
        this.isAvatarClick = this.isNumClick = this.isGbClick = this.isExchangeClick = this.isHashClick = false;
        this.avatarBtn.getComponent(cc.Button).interactable = isAvatar;
        this.numBtn.getComponent(cc.Button).interactable = !isAvatar;
        this.exchangeBtn.getComponent(cc.Button).interactable = false;
        this.grayAllChildren(this.numBtn, isAvatar ? IMaterialTypeTurnCoinView.GRAY : IMaterialTypeTurnCoinView.NORMAL);
        this.grayAllChildren(this.avatarBtn, isAvatar ? IMaterialTypeTurnCoinView.NORMAL : IMaterialTypeTurnCoinView.GRAY);
        this.grayAllChildren(this.exchangeBtn, IMaterialTypeTurnCoinView.GRAY);
    }

    /**
     * 恢复按钮
     */
    recoverBtn() {
        if (this.isCloseView) return;
        this.isGbClick = this.isHashClick = true;
        if (this.isWin || !this.isStartPlay) {
            this.isExchangeClick = true;
            this.isAvatarClick = this.isNumClick = true;
            this.avatarBtn.getComponent(cc.Button).interactable = true;
            this.numBtn.getComponent(cc.Button).interactable = true;
            this.exchangeBtn.getComponent(cc.Button).interactable = true;
            this.grayAllChildren(this.avatarBtn, IMaterialTypeTurnCoinView.NORMAL);
            this.grayAllChildren(this.numBtn, IMaterialTypeTurnCoinView.NORMAL);
            this.grayAllChildren(this.exchangeBtn, IMaterialTypeTurnCoinView.NORMAL);
        }
    }

    /**
     * 窗口关闭
     */
    private close(isTween: boolean = true) {
        if (this.isCloseView) return;
        if (isTween) SoundMger.instance.playEffectSlotCommon(SOUND_NAME.Click_Effect);
        if (isTween) this.btnTween(this.guanbi);
        if (this.isStartPlay && this.isWin && this.isResultshow) {
            // let args = {
            //     startPos: cc.v3(0, -50, 0),
            //     endPos: cc.v3(0, 0, 0),
            //     fontSize: 35,
            //     showTime: 2,
            // }
            // let str: string = game.LanguageManager.getInstance().getDstStr('public_tips01');
            // game.TipsManager.getInstance().showToast(str, args);
            if (!this.isExchange) this.doubleCoinReq(protoSlot.doubleCoinReqType.get);//直接走兑换流程
            return;
        }
        if (!this.isGbClick) return;
        if (this.isExchange) return;
        this.isGbClick = false;
        this.settlementNode2.active = false;
        this.onCloseTween();
    }


    /**
    * 置灰节点以及子节点
    * @param node 
    * @param type 
    */
    public grayAllChildren(node: cc.Node, type: IMaterialTypeTurnCoinView) {
        let render: cc.RenderComponent[] = node.getComponentsInChildren(cc.RenderComponent);
        let material: cc.Material = null;
        let _IgrayMaterial: cc.Material = node['_IgrayMaterial'];
        let _InormalMaterial: cc.Material = node['_InormalMaterial'];
        for (let i = 0; i < render.length; i++) {
            let renderComp: cc.RenderComponent = render[i];
            if (renderComp.node.getComponent(cc.Sprite) || renderComp.node.getComponent(cc.Label)) {
                if (type == IMaterialTypeTurnCoinView.GRAY) {
                    material = _IgrayMaterial;
                    if (!material) {
                        material = cc.Material.getBuiltinMaterial('2d-gray-sprite');
                    }
                    material = _IgrayMaterial = cc.MaterialVariant.create(material, renderComp);
                } else {
                    material = _InormalMaterial;
                    if (!material) {
                        material = cc.Material.getBuiltinMaterial('2d-sprite');
                    }
                    material = _InormalMaterial = cc.MaterialVariant.create(material, renderComp);
                }
                renderComp.setMaterial(0, material);
            }
        }
    }
}
