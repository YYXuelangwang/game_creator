import { GData } from "../common/utils/GData";
import { GameEventNames } from "../slotMachine/script/SlotConfigs/GameEventNames";
import PlayerManager from "../slotMachine/script/SlotManager/PlayerManager";
import SpinManager from "../slotMachine/script/SlotManager/SpinManager";
import SlotUtils from "../slotMachine/script/SlotUtils/SlotUtils";
import NetSlotConst from "./NetSlotConst";

export default class SlotProtoManager {


    netNode: game.NetNode;
    hashRest: number = null;
    ciphertext: string = null;

    //单例是为了 获取缓存的服务器数据
    private static _instance: SlotProtoManager = null;
    public static getInstance(): SlotProtoManager {
        if (this._instance == null) {
            this._instance = new SlotProtoManager();
        }
        return this._instance;
    }


    constructor() {
        this.init();
        console.log("slotprotomanager");
    }

    public registerMess(): void {
        this.setReceiveCallBack();
    };

    public destroyMess(): void {

    };


    public init(): void {
        this.registerMess();
        //this.protoHelper = <core.ProtocolHelper>this.netNode.getProtoHelper();
    };

    public destroy(): void {

    };

    //进行初始化 和 注册你的 网络消息接受函数
    private setReceiveCallBack(): void {
        this.netNode = game.NetManager.getInstance().getNetNode();
        this.netNode.setResponeHandler([protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.restoreResp], this.restoreResp, this);
        this.netNode.setResponeHandler([protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.spinResp], this.spinResp, this);
        this.netNode.setResponeHandler([protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.lgDataResp], this.lgDataResp, this);
        this.netNode.setResponeHandler([protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.lgActionResp], this.lgActionResp, this);

        this.netNode.setResponeHandler([protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.enterRoomPush], this.enterRoomPush, this);
        this.netNode.setResponeHandler([protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.leaveRoomPush], this.leaveRoomPush, this);
        this.netNode.setResponeHandler([protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.actionStopPush], this.actionStopPush, this);
        //this.netNode.setResponeHandler([protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.errorCodePush], this.errorCodePush, this);

        this.netNode.setResponeHandler([protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.userInfoPush], this.userInfoPush, this);

        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_SLOT_MACHINE_STOPPED, this.sendActionStopMessage, this);
        this.netNode.setResponeHandler([protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.rollerModeResp], this.rollerModeResp, this);
        this.netNode.setResponeHandler([protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.rollerModeDataResp], this.rollerModeDataResp, this);
        game.EventManager.getInstance().addEventListener(core.GameCoreConst.mess_netErrorCodePush, this.errorCodePush, this);

        this.netNode.setResponeHandler([protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.changeCostResp], this.changeCostResp, this);
        this.netNode.setResponeHandler([protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.winAmountRankResp], this.winAmountRankResp, this);
        this.netNode.setResponeHandler([protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.changeBetStateResp], this.changeBetStateResp, this);

        this.netNode.setResponeHandler([protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.collectChooseResp], this.collectChooseResp, this);
        this.netNode.setResponeHandler([protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.buyFreeImdDataResp], this.buyFreeImdDataResp, this);
        game.EventManager.getInstance().addEventListener(core.GameCoreConst.mess_netJpResp, this.jtResp, this);

    }

    private errorCodePush(event: string, result): void {
        // let result = core.ProtocolHelper.buffDecode(protoSlot.errorCodePush,data);

        // game.LogManager.getInstance().log("errorCodePush", result);
        var tips = result.content;//game.LanguageManager.getInstance().getSrcStr("zdyc_tips");

        switch (result.code) {
            case protoSlot.code_type.err_slot_line_costs://线住错误
                // tips = LanguageCreate.instance.getLanguageLabel("10002");
                break;
        }
        SpinManager.instance.isInAuto = false;
        SpinManager.instance.inGame = false;
        //通知菜单栏可点击
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_MENU_INTERACTABLE);
        // let onlyOKBtn = true;
    }

    //当前滚轴是哪一种模式
    private _rollerModeId: number = 1;
    public get rollerModeId() {
        return this._rollerModeId;
    }
    //是否可以选择滚轴模式
    private _isSelectModeId: number = 0;
    public get isSelectModeId() {
        return this._isSelectModeId;
    }

    private _rollerModeList: number[] = [];
    public get rollerModeList() {
        return this._rollerModeList;
    }

    /**
 * 是否取得模式数据
 */
    public isRollerModeResp: boolean = false;

    /**
     * 是否取得jp数据
     */
    public isGetJpResp: boolean = false;

    public restoreResult: protoSlot.restoreResp = null;

    private restoreResp(data: any): void {
        let result = core.ProtocolHelper.buffDecode(protoSlot.restoreResp, data) as protoSlot.restoreResp;
        this.restoreResult = result;

        game.LogManager.getInstance().log("resoreResp all", result);
        // this._rollerModeId = result.curRollerMode;
        // this._isSelectModeId = result.rollerModeSwitch;
        this.handleHashChainInfo(result);

        let myRestore: protoSlot.restoreType;
        for (let index = 0; index < result.restore.length; index++) {
            const r = result.restore[index] as protoSlot.restoreType;
            if ((r.userInfo.userId as Long).toNumber() == (PlayerManager.instance.userInfo.userId as Long).toNumber()) {
                myRestore = r;
                SpinManager.instance.isSpinResp = true;
            } else {

            }
        }
        let roundId = result.roundId ? (result.roundId as Long) : Long.fromNumber(0);
        SpinManager.instance.isOldSpinResp = SpinManager.instance.roundId.equals(roundId);
        SpinManager.instance.roundId = roundId;

        game.LogManager.getInstance().log("resoreResp my", myRestore);

        SpinManager.instance.rollerLv = result.rollerLv;//因为金玉满堂新加了等级rollerLv(重连刷新用)
        game.EventManager.getInstance().raiseEvent(NetSlotConst.RESTORERESP, myRestore);

    }

    /**创世哈希玩法 */
    handleHashChainInfo(result: any) {
        /**服务器不返回0 */
        if (result.hashRest == null) return
        if (result.hashRest < 0) return
        console.log('handleHashChainInfo--------', result.hashRest);
        if (core.CoreUtils.getGameModel() !== 4) return;
        if (result.ciphertext) {
            this.ciphertext = result.ciphertext;
        }
        if (this.hashRest !== result.hashRest) {
            this.hashRest = result.hashRest;
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_HASH_REST_UPDATE, this.hashRest);
        }
    }

    private userInfoPush(data: any): void {
        let result = core.ProtocolHelper.buffDecode(protoSlot.userInfoPush, data) as protoSlot.userInfoPush;
        game.EventManager.getInstance().raiseEvent(NetSlotConst.USERINFO_PUSH, result);
        game.LogManager.getInstance().log("userInfoPush", result);

    }

    private enterRoomPush(data: any): void {

    }

    //选择滚轴模式后的返回（data为空，说明成功）
    private rollerModeResp(data: any): void {
        let result = core.ProtocolHelper.buffDecode(protoSlot.rollerModeResp, data) as protoSlot.rollerModeResp;
        game.LogManager.getInstance().log("rollerModeResp", result);
        //后续可以在这里加切换模式后的表现效果等等....
    }

    private leaveRoomPush(data: any): void {
        let result = core.ProtocolHelper.buffDecode(protoSlot.leaveRoomPush, data) as protoSlot.leaveRoomPush;
        //game.LogManager.getInstance().log("leaveRoomPush", result);
        let userId = (result.userId as Long).toNumber();
        game.EventManager.getInstance().raiseEvent(NetSlotConst.LEAVEROOMPUSH, userId);
    }


    private spinResp(data: any): void {
        let result = core.ProtocolHelper.buffDecode(protoSlot.spinResp, data) as protoSlot.spinResp;

        if ((result.userId as Long).toNumber() == (PlayerManager.instance.userInfo.userId as Long).toNumber()) {
            game.LogManager.getInstance().log("spinResp", result);
            
            this.fixSpinRespData(result);
            /**服务器不返回0 */
            if (result.hashRest > 0) {
                this.handleHashChainInfo(result);
            }

            game.EventManager.getInstance().raiseEvent(NetSlotConst.SPINRESP, result);
            SpinManager.instance.isSpinResp = true;

            if (result.doubleCoin) {
                SpinManager.instance.doubleCoin = result.doubleCoin;
            } else {
                SpinManager.instance.doubleCoin = null;
            }
        } else {
            
        }
    }

    private fixSpinRespData(resp:protoSlot.spinResp):void{
        let updateList = resp.updateList;
        let index = SlotUtils.findIndexFromArray(updateList, (e, i, arr) => {
            return 6 === e.type;
        });
        if(index>0){
            let handleData = updateList[index];
            let temp = updateList[0];
            updateList[0] = handleData;
            updateList[index] = temp;
        }
    }

    private lgDataResp(data: any): void {
        let result = core.ProtocolHelper.buffDecode(protoSlot.lgDataResp, data) as protoSlot.lgDataResp;
        game.LogManager.getInstance().log("lgDataResp", result);
        game.EventManager.getInstance().raiseEvent(NetSlotConst.LGDATARESP, result);
    }

    private lgActionResp(data: any): void {
        let result = core.ProtocolHelper.buffDecode(protoSlot.lgActionResp, data) as protoSlot.lgActionResp;
        game.LogManager.getInstance().log("lgActionResp", result);

        if ((result.userId as Long).toNumber() == (PlayerManager.instance.userInfo.userId as Long).toNumber()) {
            game.EventManager.getInstance().raiseEvent(NetSlotConst.LGACTIONRESP, result);

        } else {
            game.EventManager.getInstance().raiseEvent(GameEventNames.LGACTIONRESP_OTHER, result);
        }
    }


    private actionStopPush(data: any): void {
        let result = core.ProtocolHelper.buffDecode(protoSlot.actionStopPush, data) as protoSlot.actionStopPush;
        //game.LogManager.getInstance().log("actionStopPush", result);
        let userId = (result.userId as Long).toNumber();
        game.EventManager.getInstance().raiseEvent(NetSlotConst.ACTIONSTOPPUSH, userId);
    }

    // 请求上次的游戏数据
    public requestLastGameInfo(): void {
        game.LogManager.getInstance().log("restoreReq");

        //向服务器请求有没有购买功能
        SlotProtoManager.getInstance().buyFreeImdDataReq();

        //翻倍功能（还是得用请求服务器开关）
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_TURN_COIN_BTN);

        let data = new protoSlot.restoreReq();
        let buff = core.ProtocolHelper.createGameSockBuff(protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.restoreReq, protoSlot.restoreReq, data);
        this.netNode.send(buff);
    }


    // 请求旋转
    public requestSpinFreely(data): void {
        let buff = core.ProtocolHelper.createGameSockBuff(protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.spinReq, protoSlot.spinReq, data);

        game.LogManager.getInstance().log("spinReq", data);

        this.netNode.send(buff);

        cc.sys.localStorage.setItem("lineCostIndex_" + core.CommonProto.getInstance().userinfo.userName + "_" + GData.bundleName, SpinManager.instance.lineCostIndex);

    }

    //请求小游戏数据
    public requestBonusGameInfo(bonusGameId: Long): void {
        let data = new protoSlot.lgDataReq;
        data.lgId = bonusGameId;
        let buff = core.ProtocolHelper.createGameSockBuff(protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.lgDataReq, protoSlot.lgDataReq, data);

        game.LogManager.getInstance().log("lgDataReq", data);

        this.netNode.send(buff);

    }

    /**
     * 向服务器请求发起小游戏操作
     * @public
     * @method requestAction
     * @param {number[]} choose
     */
    public requestAction(bonusGameId: Long, choose: number[] = []): void {
        let data = new protoSlot.lgActionReq;
        data.lgId = bonusGameId;
        data.choose = choose;
        let buff = core.ProtocolHelper.createGameSockBuff(protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.lgActionReq, protoSlot.lgActionReq, data);

        game.LogManager.getInstance().log("lgActionReq", data);

        this.netNode.send(buff);

    }

    public handleStateReq(): void {
        let data = new protoSlot.handleStateReq();
        let buff = core.ProtocolHelper.createGameSockBuff(protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.handleStateReq, protoSlot.handleStateReq, data);

        game.LogManager.getInstance().log("handleStateReq");

        this.netNode.send(buff);

    }

    public openRecordReq(): void {
        let data = new protoSlot.guessReq();
        let buff = core.ProtocolHelper.createGameSockBuff(protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.guessReq, protoSlot.guessReq, data);

        game.LogManager.getInstance().log("guessReq");

        this.netNode.send(buff);

    }

    //玩家滚轴停止
    private sendActionStopMessage(): void {
        let data = new protoSlot.actionStopReq();
        let buff = core.ProtocolHelper.createGameSockBuff(protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.actionStopReq, protoSlot.actionStopReq, data);

        game.LogManager.getInstance().log("requestActionStop");

        this.netNode.send(buff);
    }

    //选择滚轴模式请求
    public rollerModeReq(modeid: number): void {
        let data = new protoSlot.rollerModeReq();
        data.rollerModeId = modeid;
        this._rollerModeId = modeid;
        let buff = core.ProtocolHelper.createGameSockBuff(protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.rollerModeReq, protoSlot.rollerModeReq, data);

        game.LogManager.getInstance().log("rollerModeReq", data);

        this.netNode.send(buff);
        // this.buyFreeImdDataReq();
    }

    /** 服务器返回 是否有购买次数 */
    public static buyMultiNum: number = 0;

    //buyFreeImdReq请求
    public buyFreeImdDataReq(): void {
        let data = new protoSlot.buyFreeImdDataReq();
        let buff = core.ProtocolHelper.createGameSockBuff(protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.buyFreeImdDataReq, protoSlot.buyFreeImdDataReq, data);
        game.LogManager.getInstance().log("buyFreeImdDataReq");
        this.netNode.send(buff);
    }

    public buyFreeImdDataResp(data: any): void {
        let result = core.ProtocolHelper.buffDecode(protoSlot.buyFreeImdDataResp, data) as protoSlot.buyFreeImdDataResp;
        SlotProtoManager.buyMultiNum = Number(result.multi);
        // game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_RENEW_BUY_FREE_BTN, result);
        console.log("result--->buyfree", result)
    }

    //进入房间的时候请求是否有滚轴模式或有几个滚轴模式
    public rollerModeDataReq(): void {
        let data = new protoSlot.rollerModeDataReq();
        let buff = core.ProtocolHelper.createGameSockBuff(protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.rollerModeDataReq, protoSlot.rollerModeDataReq, data);

        game.LogManager.getInstance().log("rollerModeDataReq", data);

        this.netNode.send(buff);
    }

    //选择滚轴模式后的返回（data为空，说明成功）
    private rollerModeDataResp(data: any): void {
        let result = core.ProtocolHelper.buffDecode(protoSlot.rollerModeDataResp, data) as protoSlot.rollerModeDataResp;
        this._rollerModeId = result.rollerModeId;
        this._isSelectModeId = result.rollerModeSwitch;
        this._rollerModeList = result.rollerModeList;
        game.LogManager.getInstance().log("rollerModeDataResp", result);
        this.isRollerModeResp = true;
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_ROLLER_MODE_DATA_RESP);

    }

    public changeCostReq(): void {
        let data = new protoSlot.changeCostReq();

        let reqType: protoSlot.spinReqType = <protoSlot.spinReqType>{};
        reqType.lines = SpinManager.instance.lineNum;
        reqType.cost = SpinManager.instance.getLineCostByIndex();
        reqType.rate = SpinManager.instance.getRealLineRate();
        reqType.rateModulus = SpinManager.instance.rateModulus;
        reqType.assginLine = [];
        reqType.lineMultiple = SpinManager.instance.getLinelMutiple();
        reqType.extra = [];
        data.req = reqType;
        let buff = core.ProtocolHelper.createGameSockBuff(protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.changeCostReq, protoSlot.changeCostReq, data);

        game.LogManager.getInstance().log("changeCostReq", data);

        this.netNode.send(buff);
    }

    private changeCostResp(data: any): void {
        let result = core.ProtocolHelper.buffDecode(protoSlot.changeCostResp, data) as protoSlot.changeCostResp;
        game.LogManager.getInstance().log("changeCostResp", result);

        game.EventManager.getInstance().raiseEvent(NetSlotConst.CHANGECOSTRESP, result);

    }

    private jtResp(): void {
        this.isGetJpResp = false;
    }

    /**
     * 赢赏数据请求
     */
    public winAmountRankReq() {
        let data = new protoSlot.winAmountRankReq();
        let buff = core.ProtocolHelper.createGameSockBuff(protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.winAmountRankReq, protoSlot.winAmountRankReq, data);

        game.LogManager.getInstance().log("winAmountRankReq", data);

        this.netNode.send(buff);
    }

    /**
     * 赢赏数据返回
     * @param data 
     */
    private winAmountRankResp(data: any) {
        let result = core.ProtocolHelper.buffDecode(protoSlot.winAmountRankResp, data) as protoSlot.winAmountRankResp;
        game.LogManager.getInstance().log("winAmountRankResp", result);

        game.EventManager.getInstance().raiseEvent(NetSlotConst.WINAMOUNTRANKRESP, result);
    }

    /**
     * 切换投注状态请求
     * @param state 0：关闭；   1：开启
     */
    public changeBetStateReq(state: number) {
        let data = new protoSlot.changeBetStateReq();
        data.betState = state;
        let buff = core.ProtocolHelper.createGameSockBuff(protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.changeBetStateReq, protoSlot.changeBetStateReq, data);
        game.LogManager.getInstance().log("changeBetStateReq", data);
        this.netNode.send(buff);
    }
    /**
     * 切换投注状态响应数据返回
     * @param data 
     */
    private changeBetStateResp(data: any) {
        let result = core.ProtocolHelper.buffDecode(protoSlot.changeBetStateResp, data) as protoSlot.changeBetStateResp;
        game.LogManager.getInstance().log("changeBetStateResp", result);
        game.EventManager.getInstance().raiseEvent(NetSlotConst.CHANGEBETSTATERESP, result);
    }

    /**
     * 收集任务请求
     * @param taskId  任务id
     * @param targetNum 已达到的任务的收集数量
     */
    public collectChooseReq(taskId: number, targetNum: number) {
        let data = new protoSlot.collectChooseReq();
        data.taskId = taskId;
        data.targetNum = targetNum;
        let buff = core.ProtocolHelper.createGameSockBuff(protoSlot.cmd.msg_slot_spin, protoSlot.slot_spin_cmd.collectChooseReq, protoSlot.collectChooseReq, data);
        game.LogManager.getInstance().log("collectChooseReq", data, buff);
        this.netNode.send(buff);
    }
    /**
     * 收集任务数据返回
     * @param data 
     */
    private collectChooseResp(data: any) {
        let result = core.ProtocolHelper.buffDecode(protoSlot.collectChooseResp, data) as protoSlot.collectChooseResp;
        game.LogManager.getInstance().log("collectChooseResp", result);
        game.EventManager.getInstance().raiseEvent(NetSlotConst.COLLECTCHOOSERESP, result);
    }
}
