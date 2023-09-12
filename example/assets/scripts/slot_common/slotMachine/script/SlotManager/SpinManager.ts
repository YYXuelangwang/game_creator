import SimpleManagerTemplate from "./SimpleManagerTemplate";
import SlotUtils from "../SlotUtils/SlotUtils";
import { Handler } from "../SlotUtils/Handle";
import BonusGameManager from "./BonusGameManager";
import FreeGameManager from "./FreeGameManager";
import GlobalQueueManager from "./GlobalQueueManager";
import RollingResult from "../SlotData/RollingResult";
import { RollingDirection, OperationState } from "../SlotDefinitions/SlotEnum";
import PlayerManager from './PlayerManager';
import { GameEventNames } from "../SlotConfigs/GameEventNames";
import SlotConfigManager from './SlotConfigManager';
import { globalTaskFlags } from "../SlotDefinitions/globalTaskFlags";
import SlotTimeManager from './SlotTimeManager';
import NetSlotConst from "../../../network/NetSlotConst";
import SlotProtoManager from "../../../network/SlotProtoManager";
import SlotGameManager from "./SlotGameManager";
import { SoundMger } from "../../../sound/script/SoundMger";
import { SOUND_NAME } from "../../../common/enum/CommonEnum";
import MultipleGameManager from "./MultipleGameManager";
import { GData } from "../../../common/utils/GData";
import CustomButton from "../../../common/component/CustomButton";

export enum GameType {

    None = 0,
    MainGame = 1,   // 主游戏
    FreeGame = 2,   // 免费游戏
    BonusGame = 3, //  小游戏
    JackPotGame = 4
}

/**
* 游戏的规则管理器
*/
export default class SpinManager implements SimpleManagerTemplate {

    /**在重转模式下正常显示次数（如娃娃乐) 暂时没用 po将需求更改*/
    public _normalGameShowAutoTimesOnRespin: boolean = false;
    /**在重转中 暂时没用 po将需求更改*/
    private _onRespinTime: boolean = false;
    /**
     * 滚轴间隔时间
     */
    private _spinGap: number = 0;
    /**
     * 上一次滚动时间
     */
    private _lastSpinTime: number;
    /**
     * 滚轴数据请求是否返回
     */
    public isSpinResp: boolean = false;
    public static get instance(): SpinManager {
        if (!this._instance) this._instance = new SpinManager();
        return this._instance;
    }
    private static _instance: SpinManager = null;

    /**
     * 当前的游戏类型，区分是在进行主游戏还是在进行小游戏
     */
    public get nowGameType(): GameType {
        return this._nowGameType;
    }

    /**
     * 设置正常滚轴的滚动间隔时间
     */
    public setSpinGap(value: number): void {
        this._spinGap = value;
    }
    public set nowGameType(v: GameType) {
        if (v !== this._nowGameType) {
            this._nowGameType = v;
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_GAME_TYPE_CHANGED);
        }
    }
    private _nowGameType: GameType;

    /**
     * 自定义数据是否需要互动
     */
    public get isCustomDataInterActive(): boolean {
        return this._isCustomDataInterActive;
    }
    public set isCustomDataInterActive(v: boolean) {
        this._isCustomDataInterActive = v;
    }
    private _isCustomDataInterActive: boolean = false;

    /**
     * 玩家压了多少线
     */
    public get lineNum(): number {
        return this._lineNum;
    }
    public set lineNum(v: number) {
        // 检查值是否合法
        if (v <= 0) {
            return;
        }
        if (v > SlotConfigManager.instance.totalLineIds.length) {
            this._lineNum = SlotConfigManager.instance.totalLineIds.length;
            cc.sys.localStorage.setItem("lineNum_" + core.Global.gameId, this._lineNum);
            return;
        }
        let needEvent: boolean = v !== this._lineNum;
        if (v != 0) {
            this._lineNum = v;
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FORCE_UPDATE_BETSCORE, v);
        }
        if (needEvent) {
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_LINE_NUM_CHANGED, [this._lineNum]);
            cc.sys.localStorage.setItem("lineNum_" + core.Global.gameId, this._lineNum);
        }
    }

    /** 基础倍数 */
    private _lineNum: number = 0;

    /** 不乘倍率的基础投注 */
    public get singleBetCost(): number {
        let rate = core.CommonProto.getInstance().coinRate;//多国倍率
        if (!SlotUtils.isNullOrUndefined(this._betCost)) {
            return this._betCost * rate / this._lineNum;
        }
        return this._lineNum * this.getLineCostByIndex() * this.getRealLineRate() * rate * this.rateModulus / 100 * this.getLinelMutiple();

    }

    public get betRate(): number {
        return this.betStateType ? this.betStateType.betRate / 100 : 1;
    }

    /**
     * 线注（可以加减的线注） (线注×线号=总赌注)
     */
    public get betScore(): number {
        let rate = core.CommonProto.getInstance().coinRate;//多国倍率
        if (!SlotUtils.isNullOrUndefined(this._betScore)) {
            return this._betScore * rate;//* this.rateModulus/100;
        }
        return this.getLineCostByIndex() * rate * this.rateModulus / 100 * this.getLinelMutiple() * this.betRate;
    }
    public set betScore(linevalue: number) {
        this._betScore = linevalue;
        console.log("setbetLine>>", linevalue);
    }
    private _betScore: number = null;


    /**
     * 旋转费用(总赌注)  (线注×线号=总赌注)
     */
    public get betCost(): number {
        let rate = core.CommonProto.getInstance().coinRate;//多国倍率
        if (!SlotUtils.isNullOrUndefined(this._betCost)) {
            return this._betCost * rate;//* this.rateModulus/100;
        }
        return this._lineNum * this.getLineCostByIndex() * this.getRealLineRate() * rate * this.rateModulus / 100 * this.getLinelMutiple() * this.betRate;
    }
    public set betCost(cost: number) {
        this._betCost = cost;
        console.log("setBetCost>>", cost)
    }
    private _betCost: number = null;

    /**
     * 通过给定形参计算旋转费用
     * @param lineCostIndex 投注大小索引
     */
    public calcBetCost(lineCostIndex?: number) {
        let rate = core.CommonProto.getInstance().coinRate;//多国倍率
        if (!SlotUtils.isNullOrUndefined(this._betCost)) {
            return this._betCost * rate;//* this.rateModulus/100;
        }
        return this._lineNum * this.getLineCostByIndex(lineCostIndex) * this.getRealLineRate() * rate * this.rateModulus / 100 * this.getLinelMutiple() * this.betRate;
    }

    /**
     * 开始按钮可见状态
     */
    public get startBtnVisible(): boolean {
        return this._startBtnVisible;
    }
    public set startBtnVisible(v: boolean) {
        if (v !== this._startBtnVisible) {
            this._startBtnVisible = v;
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_START_BTN_VISIBLE_CHANGED);
        }
    }
    private _startBtnVisible: boolean = true;

    /**
     * 押线索引，注意是索引
     */
    public get lineCostIndex(): number {
        return this._lineCostIndex;
    }
    public set lineCostIndex(v: number) {
        // 检查值是否合法
        if (v == this._lineCostIndex) {
            // game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_LINE_COST_CHANGED,false);
            return;
        }
        if (v < 0) {
            this._lineCostIndex = SlotConfigManager.instance.lineCostList.length - 1;
        } else if (v >= SlotConfigManager.instance.lineCostList.length) {
            this._lineCostIndex = 0;
        } else {
            this._lineCostIndex = v;
        }
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_LINE_COST_CHANGED);
    }

    private _lineCostIndex: number = 0;

    /**
     * 翻倍硬币数据
     */
    public set doubleCoin(data: protoSlot.doubleCoinType) {
        this._doubleCoin = data;
    }
    public get doubleCoin(): protoSlot.doubleCoinType {
        return this._doubleCoin;
    }
    private _doubleCoin: protoSlot.doubleCoinType = null;

    /**
     * 线倍率(索引)
     */
    public set lineRate(v: number) {
        this._lineRate = v;
    }
    public get lineRate(): number {
        return this._lineRate;
    }
    private _lineRate: number = 0;

    /**
     * 押分系数
     */
    public set rateModulus(v: number) {
        this._rateModulus = v;
    }
    public get rateModulus(): number {
        return this._rateModulus;
    }
    private _rateModulus: number = 100;

    /**
     * PT 是否在自动游戏中（只有在弹框是否继续，点击了否才结束）
     */
    public get isInNormalAutoGame(): boolean {
        return this._isInNormalAutoGame;
    }
    public set isInNormalAutoGame(value: boolean) {
        this._isInNormalAutoGame = value;
    }
    private _isInNormalAutoGame: boolean = false;

    /**
     * 自动尝试次数，玩家的设定值，只能玩家手动设定
     */
    public get autoTimes(): number {
        return this._autoTimes;
    }
    public set autoTimes(t: number) {
        t = t || -1;
        if (t !== this._autoTimes) {
            this._autoTimes = t;
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_AUTO_TIMES_CHANGED);
        }
    }
    private _autoTimes: number = 0;

    /**
     * 剩余自动尝试次数,如果小于0表示直到环节，其它表示剩余尝试次数
     * 如果非直到，则每玩一次，剩余次数自减
     */
    public get restAutoTimes(): number {
        return this._restAutoTimes;
    }
    public set restAutoTimes(v: number) {
        if (v !== this._restAutoTimes) {
            this._restAutoTimes = v;
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_REST_AUTO_TIMES_CHANGED);
        }
    }
    private _restAutoTimes: number = 0;

    /**
     * 是否在进行自动游戏
     */
    public get isInAuto(): boolean {
        return this._isInAuto;
    }
    public set isInAuto(v: boolean) {
        this._isInAuto = v;
        //派发自动游戏状态改变事件
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_AUTO_STATE_CHANGED);
    }
    private _isInAuto: boolean = false;
    private _isInAutoInit: boolean = false;

    /**
     * 是否在快速模式
     */
    public get isInTurbo(): boolean {
        if (!this._isInAutoInit) {
            this._isInAutoInit = true;
        }

        return this._isInTurbo;
    }
    public set isInTurbo(v: boolean) {
        let needEvent: boolean = v !== this._isInTurbo;
        this._isInTurbo = v;
        if (this._isInTurbo) this.ignoreStopImmediatelyTimes();
        needEvent && game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_TURBO_STATUS_CHANGD);
    }
    private _isInTurbo: boolean = false;

    /**
     * 旋转方向(正向:1, 反方向:-1)
     */
    public get rollingDirection(): RollingDirection {
        return this._rollingDirection;
    }
    public set rollingDirection(v: RollingDirection) {
        this._rollingDirection = v;
    }
    private _rollingDirection: RollingDirection = RollingDirection.Down;

    /**
     * 滚动结果
     */
    public get rollingResult(): protoSlot.spinResp {
        return this._rollingResult;
    }
    private _rollingResult: protoSlot.spinResp = null;

    /**
     * 平坦化后的旋转线结果，供滚轴界面显示线结果用
     */
    public get flattenLineRewardsResults(): RollingResult[] {
        return this._flattenLineRewardsResults || [];
    }
    private _flattenLineRewardsResults: RollingResult[];

    /**
     * 一次SPIN总共赢取的奖励(包括奖池)
     */
    public get totalWin(): number {
        return this._totalWin;
    }
    public set totalWin(win: number) {
        this._totalWin = win;
        this._totalWinRate = this._totalWin / this.betCost;
    }
    private _totalWin: number = 0;

    /**
     * 旋转赢的钱
     */
    public get spinWin(): any {
        return this._spinWin;
    }
    private _spinWin: any = 0;

    /**
     * 本次SPIN总共赢取的奖励与押分的比率
     */
    public get totalWinRate(): number {
        return this._totalWinRate;
    }
    private _totalWinRate: number = 0;


    /**
     * 滚动结果的格子索引与元素的映射spin
     */
    // private _spinGridsMap:{} = {};    

    /**
     * 游戏当前的滚轴数据, 是一个二维数组，
     */
    public get spinSlotsData(): number[] {
        return this._spinSlotsData;
    }
    private _spinSlotsData: number[] = null;

    /**
     * 游戏当前改变后的的滚轴数据, 是一个二维数组，
     */
    public get spinSlotsGridChangedData(): number[] {
        return this._spinSlotsGridChangedData;
    }
    private _spinSlotsGridChangedData: number[] = null;

    /**
     * 基础信息是否已经刷新了
     */
    public get baseDataUpdated(): boolean {
        return this._basedDataUpdated;
    }
    private _basedDataUpdated: boolean = false;

    /**
     * 是否正在进行游戏
     * 自动游戏时，需要所有次数用完后，才会退出游戏状态
     */
    public get inGame(): boolean {
        return this._inGame;
    }
    public set inGame(v: boolean) {
        if (v !== this._inGame) {
            this._inGame = v;
            // game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_IN_GAME_STATE_CHANGED, SpinManager.instance);
        }
    }
    private _inGame: boolean = false;

    /**
     * 永久的增速比率,该比率会永久性的影响滚轴的旋转时间，比率越大，旋转时间越长
     */
    public get permanentSpeedUpRate(): number {
        return this._permanentSpeedUpRate;
    }
    public set permanentSpeedUpRate(v: number) {
        this._permanentSpeedUpRate = v;
    }
    private _permanentSpeedUpRate: number = 1;

    /**
     * 是否需要播放未中奖动画（连续3次未中奖)
     */
    public get needPlayUnhittedAni(): boolean {
        return this._continuousUnHittedTimes >= 3;
    }
    private _continuousUnHittedTimes = 0;

    /**
     * 是否有线全中了
     */
    public get isFullLineWin(): boolean {
        return this._isFullLineWin;
    }
    private _isFullLineWin: boolean;

    /**
     * 五连的中奖动画是否开启
     */
    public get isFullLineAvailable(): boolean {
        return this._isFullLineAvailable;
    }
    public set isFullLineAvailable(available: boolean) {
        this._isFullLineAvailable = available;
    }
    private _isFullLineAvailable: boolean = true;

    /**
     * 滚轴是否已经停止转动
     */
    public isSlotMachineStopped: boolean = true;


    /**
     * 触摸滚轴或空格键是否有效
     */
    public _spinTouchEnable: boolean = false;
    /**
     * 触摸滚轴或空格键是否有效
     */
    public get spinTouchEnable(): boolean {
        return this._spinTouchEnable;
    }
    public set spinTouchEnable(value: boolean) {
        this._spinTouchEnable = value;
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_MENBTS_SETSTATE, { state: value, num: 1 });
    }


    /**
     * 更新的子游戏扩展数据
     */
    public get customUpdateData(): protoSlot.handleStateType {
        return this._customUpdateData;
    }
    private _customUpdateData: protoSlot.handleStateType = null;

    // 最小可游戏金币;
    public get minGameMoney(): number {
        return this._minGameMoney;
    }
    public set minGameMoney(num: number) {
        this._minGameMoney = num;
    }
    private _minGameMoney: number = 1;

    public get cur_roller_mode(): number {
        return this._cur_roller_mode;
    }
    private _cur_roller_mode: number = 0;

    public get roundId(): Long {
        return this._roundId;
    }
    public set roundId(id: Long) {
        this._roundId = id;
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_UPDATE_ROUND_ID);
    }

    private _roundId: Long = Long.fromNumber(0);

    public isOldSpinResp: boolean = false;

    //重连刷新 提升的等级
    private _rollerLv: number = 0;
    public get rollerLv(): number {
        return this._rollerLv;
    }
    public set rollerLv(value: number) {
        this._rollerLv = value;
    }

    public get lineValueMultipleIndex(): number {
        return this._lineValueMultipleIndex;
    }
    public set lineValueMultipleIndex(v: number) {
        // 检查值是否合法
        if (v == this._lineValueMultipleIndex) {
            return;
        }
        if (v < 0) {
            this._lineValueMultipleIndex = SlotConfigManager.instance.lineValueMultiples.length - 1;
        } else if (v >= SlotConfigManager.instance.lineValueMultiples.length) {
            this._lineValueMultipleIndex = 0;
        } else {
            this._lineValueMultipleIndex = v;
        }
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_LINE_COST_CHANGED, true);

    }

    private _lineValueMultipleIndex: number = 0;



    constructor() {
    }

    init() {
        // this._initData();
        this._addEventListener();

    }

    dispose() {
        this._removeEventListener();
        this._nowGameType = null;
        this._rollingResult = null;
        this._customUpdateData = null;
        SpinManager._instance = null;
    }

    /**
     * 忽略快速提示
     */
    public ignoreStopImmediatelyTimes() {
        this._stopImmediatelyTimes = -1;
    }



    /**
     * 重置连续不中奖的次数
     */
    public resetUnHitTimes(): void {
        this._continuousUnHittedTimes = 0;
    }

    /**
     * 将线数设置为最大
     */
    public setLineNumMax() {
        this.lineNum = SlotConfigManager.instance.totalLineIds.length;
    }

    /**
     * 设置为最小线数
     */
    public setLineNumMin() {
        this.lineNum = 1;
    }

    /**
     * 押线设置为最大
     */
    public setLineCostIndexMax() {
        this.lineCostIndex = SlotConfigManager.instance.lineCostList.length - 1;
    }

    /**
     * 押线设置为最小
     */
    public setLineCostIndexMin() {
        this.lineCostIndex = 0;
    }


    /**
     * 请求上次的游戏数据
     */
    public requestLastGameInfo() {
        // let req: slot.restoreReq = new slot.restoreReq();
        this._basedDataUpdated = false;

        SlotProtoManager.getInstance().requestLastGameInfo()
        // 伪造数据
        // let resp:protocol.RestoreResp = new protocol.RestoreResp();
        // resp.redBalck = [],
        // this._onLastGameInfoResp(resp);
    }

    /**
     * 请求玩家基础数据
     */
    public requestPlayerData() {
        // let req:protocol.PLAYER_DATA_READ_MSG_30005 = ProtoBufferUtil.buildProtocolRequestMessage(CommandCodes.PPPlayerData);
        // NetworkManager.instance.send(CommandCodes.PPPlayerData, req);
        // this._basedDataUpdated = false;
    }


    /**
     * 通过索引获取对应的押线
     */
    public getLineCostByIndex(index: number = null): number {
        index = null === index ? this._lineCostIndex : index;
        return SlotUtils.getLineCostByIndex(index);
    }


    public initLineNumAndCost(state: protoSlot.stateType) {

        if (!state) return;
        switch (state.state) {
            case OperationState.Normal:
            case OperationState.BonusGame:
                if (state.freeData) {
                    this._initLineNumAndCostBySpinParam(state.freeData.spinInfo.spinParam as protoSlot.spinParamType);
                }
                else {
                    this._initLineNumAndCostBySpinParam(state.normalData.spinInfo.spinParam as protoSlot.spinParamType);
                }
                break;
            case OperationState.Free:
            case OperationState.ReSpin:
                this._initLineNumAndCostBySpinParam(state.freeData.spinInfo.spinParam as protoSlot.spinParamType);
                break;
            default:
                break;
        }
    }

    public checkGlobalQueue() {
        // if(this._waitToResume) return;
        if (this._hasNewCustomData) {
            this._notifyCustomDataUpdated(GlobalQueueManager.instance.continueHandler);
            if (this._isCustomDataInterActive) {
                return;
            }
        }

        GlobalQueueManager.instance.removeAllTasksByName(globalTaskFlags.GLOBAL_TASK_CANCEL_WHEN_START);

        if (this.hasDumyQueue && GlobalQueueManager.instance.queueLen <= 1) {
            GlobalQueueManager.instance.reset();
        }
        this.hasDumyQueue = false;

        // 检查全局队列中是否有未完事件
        if (GlobalQueueManager.instance.queueLen > 0) {
            // this._waitToResume = true;
            GlobalQueueManager.instance.execute();
            // this.isInAuto = false;
            // this.autoTimes = 0;
            // this.restAutoTimes = 0;
            return;
        }
    }

    public _autoTempTimesData: number = 0;//临时记录自动次数
    public set tempAutoTimes(value: number) {
        this._autoTempTimesData = value;
    }
    public get tempAutoTimes(): number {
        return this._autoTempTimesData;
    }

    private _planedFreeGame: boolean = false;
    /**
     * 触发了免费游戏或小游戏
     */
    public onFreeGameTrigger() {
        // 开启定时：5秒后，开始自动游戏
        this._cancelAllPlan();
        this._planedFreeGame = true;
        // Laya.timer.once(2000, this, this.autoFreeGame);
        setTimeout(() => {
            this.autoFreeGame();
        }, 500);
        // cc.director.getScheduler().schedule(this.autoFreeGame, this, 2, 0, 0);
        // SlotTimeManager.instance.once();
    }

    /**
     * 每局结束后，继续下一句免费或自动游戏等操作
     * @param isAutoFreeGame 是否自动下一句免费
     * @returns 
     */
    public onShowLineOver(isAutoFreeGame: boolean = true): void {

        if (FreeGameManager.instance.hasFreeGame && !BonusGameManager.instance.hasBonusGame && isAutoFreeGame) {
            if (!this._planedFreeGame) {
                this._cancelAllPlan();
                //this._onClickSingleStartBtnNotInGame();
                FreeGameManager.instance.doAniDelayCb((time: number) => {
                    this._planToSingleStart(time)
                });
                return;
            }
        }

        if (!(BonusGameManager.instance.hasBonusGame || FreeGameManager.instance.hasFreeGame)) {
            this.recoverAutoGameTimes();
        }

        if (!FreeGameManager.instance.hasFreeGame) {
            FreeGameManager.instance.isFreeGameBalanced = true;
        }

        this._onSlotMachineCompleted(null);
    }


    /**
     * 触发小游戏时，准备自动开始
     */
    // public onBonusGameTrigger()
    // {
    //     Laya.timer.once(5000, this, this._autoBonusGame);
    // }

    /**
     * 免费游戏结束了
     */
    public onFreeOrBonusGameOver(delayBalanceFreeGame: boolean = false) {
        // 回复数据
        if (!(BonusGameManager.instance.hasBonusGame || FreeGameManager.instance.hasFreeGame)) {
            if (!delayBalanceFreeGame) this.recoverAutoGameTimes();
        }

        if ((!FreeGameManager.instance.hasFreeGame) && !delayBalanceFreeGame) {
            FreeGameManager.instance.isFreeGameBalanced = true;
        }
        if (this._restAutoTimes !== 0) {
            this.isInAuto = true;
            //this.inGame = true;
            this.nowGameType = GameType.MainGame;
            this._planToAutoGame(500);
        }
        else {
            this.nowGameType = GameType.None;
        }
        this.onceWin = 0;
    }

    public storeAutoGameTimes(ifEvent: boolean = false) {
        // 将自动游戏次数存给临时数据
        if (this._restAutoTimes === -1) {
            this._autoTempTimesData = -1;
        }
        else {
            if (this._restAutoTimes > 0) this._autoTempTimesData = this._restAutoTimes;
        }
        if (ifEvent) {
            this.restAutoTimes = 0
        }
        else {
            this._restAutoTimes = 0;
        }
        if (this._normalGameShowAutoTimesOnRespin) {
            this._onRespinTime = true;
        } else {
            this.isInAuto = false;
        }
    }

    public switchTipsWhenSlotMachineStop() {

    }

    /**
     * 恢复自动游戏次数
     */
    public recoverAutoGameTimes() {
        if (this._autoTempTimesData === 0) return;
        this._restAutoTimes = this._autoTempTimesData;
        this._autoTempTimesData = 0;
        this.isInAuto = true;
        this._onRespinTime = false;
    }

    public autoFreeGame() {
        this._planedFreeGame = false;
        SlotTimeManager.instance.clear(this, this.autoFreeGame)
        // cc.director.getScheduler().unschedule(this.autoFreeGame, this);
        if (!FreeGameManager.instance.hasFreeGame) return;
        // this._restAutoTimes = FreeGameManager.instance.freeGameInfo.times;        
        this._onClickSingleStartBtn();
    }

    public planToUpdateCustomData() {
        if (!this._customUpdateData) return;
        GlobalQueueManager.instance.pushToQueue(Handler.create(this, this._notifyCustomDataUpdated));
    }

    public updateCustomData() {
        this._notifyCustomDataUpdated(Handler.create(this, this._onCustomDataUpdate, []));
    }

    // public hasJpOrMystJp(): boolean {
    //     let ret: protoSlot.spinResp = this._rollingResult;
    //     if (!ret) return false;
    //     if (!ret.spinResult) return false;
    //     if (ret.spinResult.jpCoin <= 0 && !ret.spinResult.mystJp) return false;
    //     return true;
    // }

    private _onCustomDataUpdate() {
    }

    private _notifyCustomDataUpdated(cb: Handler) {
        if (!this._hasNewCustomData) return cb.run();
        this._hasNewCustomData = false;
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_CUSTOM_DATA_UPDATED, cb);
    }

    private _addEventListener() {
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_PLAYER_CLICKED_SINGLE_START_BTN, this._onClickSingleStartBtn, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_SLOT_MACHINE_COMPLETED, this._onSlotMachineCompleted, this)
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_PLAYER_CLICKED_MULTI_START_BTN, this._onClickedMultiStartBtn, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_SLOT_MACHINE_STOPPED, this._onSlotMachineStopped, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_PLAYER_SLID_SLOTMACHINE, this._onSlideSlotMachine, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_PLAYER_CLICKED_SLOTMACHINE, this._onClickSlotMachineView, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_SHOW_LINE_OVER, this._onShowLineOver, this);

        game.EventManager.getInstance().addEventListener(NetSlotConst.RESTORERESP, this._onLastGameInfoResp, this);
        game.EventManager.getInstance().addEventListener(NetSlotConst.SPINRESP, this._onRollingResp, this);

        game.EventManager.getInstance().addEventListener(NetSlotConst.CHANGECOSTRESP, this._onChangeCostResp, this);
        game.EventManager.getInstance().addEventListener(NetSlotConst.CHANGEBETSTATERESP, this._onChangeBetStateResp, this);
        game.EventManager.getInstance().addEventListener(NetSlotConst.COLLECTCHOOSERESP, this._onCollectChooseResp, this);
        game.EventManager.getInstance().addEventListener(NetSlotConst.BUYFREESPINRESP, this._onBuyFreeRollingResp, this);

    }

    private _removeEventListener() {
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_PLAYER_CLICKED_SINGLE_START_BTN, this._onClickSingleStartBtn, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_SLOT_MACHINE_COMPLETED, this._onSlotMachineCompleted, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_PLAYER_CLICKED_MULTI_START_BTN, this._onClickedMultiStartBtn, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_SLOT_MACHINE_STOPPED, this._onSlotMachineStopped, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_PLAYER_SLID_SLOTMACHINE, this._onSlideSlotMachine, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_PLAYER_CLICKED_SLOTMACHINE, this._onClickSlotMachineView, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_SHOW_LINE_OVER, this._onShowLineOver, this);

        game.EventManager.getInstance().removeEventListener(NetSlotConst.RESTORERESP, this._onLastGameInfoResp, this);
        game.EventManager.getInstance().removeEventListener(NetSlotConst.SPINRESP, this._onRollingResp, this);

        game.EventManager.getInstance().removeEventListener(NetSlotConst.CHANGECOSTRESP, this._onChangeCostResp, this);
        game.EventManager.getInstance().removeEventListener(NetSlotConst.CHANGEBETSTATERESP, this._onChangeBetStateResp, this);
        game.EventManager.getInstance().removeEventListener(NetSlotConst.COLLECTCHOOSERESP, this._onCollectChooseResp, this);
        game.EventManager.getInstance().removeEventListener(NetSlotConst.BUYFREESPINRESP, this._onBuyFreeRollingResp, this);

    }

    private _initAutoTimes() {
        this._autoTimes = SlotConfigManager.instance.autoTimesList[SlotConfigManager.instance.autoTimesList.length - 1] || -1;
    }

    private _initLineNum() {
        this._lineNum = SlotConfigManager.instance.totalLineIds.length;
    }

    private _initLineNumAndCostBySpinParam(spinParam: protoSlot.spinParamType) {
        this.lineNum = spinParam.lineList.length;
        this.appointRate = spinParam.lineRate;
        this.rateModulus = spinParam.rateModulus;
        let lineCost: number = (spinParam.lineCost as Long).toNumber();
        // 找出其所在索引
        let lineCostIndex = SlotUtils.getIndexByLineCost(lineCost) || 0;
        this.lineCostIndex = lineCostIndex;
        let lineValueMultipleIndex = SlotConfigManager.instance.lineValueMultiples.indexOf(spinParam.lineMultiple);
        this.lineValueMultipleIndex = lineValueMultipleIndex > -1 ? lineValueMultipleIndex : 0;
        // TODO
        // game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_UPDATE_LINE_COST);
    }

    private platformRate = 1;

    /**
     * 获取真实的线倍率
     */
    public getRealLineRate(): number {
        if (this._appointRate == -1) {
            console.log("gameId:", SlotConfigManager.instance.gameID);
            let configedLineRates: number[] = SlotConfigManager.instance.DataGame.getData(SlotConfigManager.instance.gameID).lineRate;
            let configedLineRate: number = configedLineRates.length <= 0 ? 1 : configedLineRates[this._lineRate];
            return configedLineRate * this.platformRate;
        }
        else
            return this._appointRate * this.platformRate;
    }


    public getLinelMutiple(): number {
        let lineValueMultiples: number[] = SlotConfigManager.instance.lineValueMultiples;
        if (lineValueMultiples.length == 0) {
            return 1;
        } else {
            return lineValueMultiples[this.lineValueMultipleIndex];
        }

    }

    /**
     * 初始化押线
     */
    private _initLineCostIndex() {
        this.lineCostIndex = 0;
    }

    private _initialized: boolean = false;

    public lastTimeSpinResult: protoSlot.spinInfoType = null;
    public lastTimeSpinHandle: protoSlot.handleStateType = null;
    /**玩家投注状态与倍率数据信息 */
    public betStateType: protoSlot.betStateType = null;
    /**
     * 收到了现场还原信息
     */
    private _onLastGameInfoResp(msg: string, resp: protoSlot.restoreType) {

        // if(this._lineNum <= 0) this._initLineNum();
        // if(this._lineCostIndex < 0) this._initLineCostIndex();

        this._initSpinSlotsData(resp);

        this.lastTimeSpinResult = resp.state.freeData ? resp.state.freeData.spinInfo as protoSlot.spinInfoType : resp.state.normalData.spinInfo as protoSlot.spinInfoType;
        this.lastTimeSpinHandle = resp.state.freeData ? resp.state.freeData.handleState : resp.state.normalData.handleState;
        this.betStateType = resp.betStateType;
        this.initLineNumAndCost(resp.state as protoSlot.stateType);

        let rollingResult = new protoSlot.spinResp();
        rollingResult.spinResult = this.lastTimeSpinResult.spinResult;
        rollingResult.state = resp.state.state;
        this._rollingResult = rollingResult;
        console.log(JSON.stringify(resp))
        this._basedDataUpdated = true;
        if (resp.state.normalData) {
            this._rollingResult.randomElemPos = resp.state.normalData.randomElemPos;
            if (resp.state.normalData.handleState) {
                this._customUpdateData = resp.state.normalData.handleState;
            }
        }

        if (resp.state.freeData) {
            this._rollingResult.randomElemPos = resp.state.freeData.randomElemPos;
            if (resp.state.freeData.handleState) {
                this._customUpdateData = resp.state.freeData.handleState;
            }
        }

        let updateType = new protoSlot.stateUpdateType();
        let value = new protoSlot.stateUpdateType.updateType();
        value.handleState = this.lastTimeSpinHandle;
        updateType.value = value;
        this._rollingResult.updateList = [updateType];

        let wild = [];
        if (resp.state.freeData && resp.state.freeData.wild && resp.state.freeData.wild.length > 0) {
            wild = resp.state.freeData.wild.concat([]);
        }

        if (wild.length == 0 && resp.state.normalData && resp.state.normalData.wild && resp.state.normalData.wild.length > 0) {
            wild = resp.state.normalData.wild.concat([]);
        }

        if (wild.length > 0) {
            let updateType = new protoSlot.stateUpdateType();
            let value = new protoSlot.stateUpdateType.updateType();
            value.wild = wild;
            updateType.value = value;
            updateType.type = 4;
            this._rollingResult.updateList.push(updateType);
        }

        this.doFlattenLineRewardsResult(rollingResult.spinResult);

        if (!resp.state.freeData) {
            let total = resp.state.normalData.sumSpinCoin.toNumber() + resp.state.normalData.sumLgCoin.toNumber();
            if (total > 0) {
                this._totalWin = total;
            }
        }

        let totalWin = this.totalWin;
        if (this.isOldSpinResp) {
            this._totalWin = 0;
        }

        this._initAutoTimes();

        this._initialized = true;
        this._nowGameType = GameType.None;

        // 处理小游戏数据
        BonusGameManager.instance.render(resp.state as protoSlot.stateType, true);
        // 免费游戏
        FreeGameManager.instance.renderResume(resp.state as protoSlot.stateType);

        PlayerManager.instance.isNew = resp.userInfo.isNewer == 1;

        PlayerManager.instance.syncShowingCoin(Number(resp.userInfo.balance));

        MultipleGameManager.instance.resume(resp.state);

        if (FreeGameManager.instance.hasFreeGame) {
            let freeTotalWin = FreeGameManager.instance.freeGameInfo.sumCoin;
            if (!this.isSlotMachineStopped) {
                freeTotalWin -= this.totalWin;
            }
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FORCE_UPDATE_WINSCORE, freeTotalWin);
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SET_WINSCORE_RETAIN, true);
        } else {
            if (this.flattenLineRewardsResults.length > 0) {
                if (this.isSlotMachineStopped) {
                    game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FORCE_UPDATE_WINSCORE, totalWin);
                } else {
                    GlobalQueueManager.instance.pushToQueue(Handler.create(this, () => {
                        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_UPDATE_WINSCORE, totalWin);
                    }));
                }
            }

        }

        if (SlotGameManager.instance.isFirstEnterRoom) {
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_LAST_GAME_INFO_GET);
        } else {//重连后重今房间
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_REENTER_ROOM_SUCCESS);
        }
    }


    private _onChangeCostResp(msg: string, resp: protoSlot.changeCostResp): void {
        if (!resp.normalData && !resp.freeData) {
            return;
        }

        this.lastTimeSpinResult = resp.freeData ? resp.freeData.spinInfo as protoSlot.spinInfoType : resp.normalData.spinInfo as protoSlot.spinInfoType;
        this.lastTimeSpinHandle = resp.freeData ? resp.freeData.handleState : resp.normalData.handleState;

        let rollingResult = new protoSlot.spinResp();
        rollingResult.spinResult = this.lastTimeSpinResult.spinResult;
        rollingResult.state = resp.state;
        this._rollingResult = rollingResult;
        console.log(JSON.stringify(resp))
        this._basedDataUpdated = true;
        if (resp.normalData && resp.normalData.handleState) {
            this._customUpdateData = resp.normalData.handleState;
        }

        if (resp.freeData && resp.freeData.handleState) {
            this._customUpdateData = resp.freeData.handleState;
        }

        let updateType = new protoSlot.stateUpdateType();
        let value = new protoSlot.stateUpdateType.updateType();
        value.handleState = this.lastTimeSpinHandle;
        updateType.value = value;
        this._rollingResult.updateList = [updateType];

        this.doFlattenLineRewardsResult(rollingResult.spinResult);

        if (!resp.freeData) {
            let total = resp.normalData.sumSpinCoin.toNumber() + resp.normalData.sumLgCoin.toNumber();
            if (total > 0) {
                this._totalWin = total;//重连时如果最后一局是免费的金额
            }
        }

        let totalWin = this.totalWin;
        this._totalWin = 0;

        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_CHANGE_COST_SUCCESS);
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_UPDATE_WINSCORE, totalWin);

    }
    /**切换投注状态协议数据返回 */
    private _onChangeBetStateResp(msg: string, resp: protoSlot.changeBetStateResp): void {
        this.betStateType = resp.betStateType;
        let ciphertext = resp.ciphertext;

        //更新投注文本
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FORCE_UPDATE_BETSCORE, this.betCost);
    }

    /** 
     * 收集任务数据返回
    */
    private _onCollectChooseResp(msg: string, resp: protoSlot.collectChooseResp): void {
        if (resp.nextState) {
            if (resp.nextState.state == OperationState.Free || resp.nextState.state == OperationState.ReSpin) {//触发免费或重转
                FreeGameManager.instance.renderResume(resp.nextState, true);
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_CLEAR_FREEGAMEOVER_TASK)
            } else if (resp.nextState.state == OperationState.BonusGame) {//触发小游戏
                BonusGameManager.instance.render(resp.nextState);
            }
        }
    }

    /**
     * 设置自定义格子数据回调方法,带一个形参grids（适用于不规则滚轴，如：2529-群星闪耀)
     * @param grids 待修改的原始格子数据
     * @param gridChanged 待修改的原始格子数据
     * */
    public static customGridsCallback: Function;

    /**
     * 设置自定义格子数据（适用于不规则滚轴，如：2529-群星闪耀)
     * @param grid 待修改的原始格子数据
     * */
    private setCustomGrids(grids: number[], gridChanged: number[]): void {
        if (SpinManager.customGridsCallback) {
            SpinManager.customGridsCallback(grids, gridChanged);
        }
    }

    /**
     * 设置自定义结果（适用于消除类)
     */
    public static customResultCallBack: Function;

    public getCustomResult(): any {
        if (SpinManager.customResultCallBack) {
            return SpinManager.customResultCallBack();
        }
    }

    /**
     * 初始化滚轴槽信息
     */
    private _initSpinSlotsData(resp: protoSlot.restoreType) {

        if (resp.state.normalData && resp.state.normalData.spinInfo && resp.state.normalData.spinInfo.spinResult) {
            this.setCustomGrids(resp.state.normalData.spinInfo.spinResult.grid, resp.state.normalData.spinInfo.spinResult.gridChanged);
        }

        if (resp.state.freeData && resp.state.freeData.spinInfo && resp.state.freeData.spinInfo.spinResult) {
            this.setCustomGrids(resp.state.freeData.spinInfo.spinResult.grid, resp.state.freeData.spinInfo.spinResult.gridChanged);
        }

        // let allGrids:number[] = this._rollingResult.grid;
        // 临时数据
        this._spinSlotsData = this._getGridsFromLastGameInfo(resp);
        this._spinSlotsGridChangedData = this._getGridsFromLastGameInfo(resp);
    }

    private _getGridsFromLastGameInfo(resp: protoSlot.restoreType) {
        switch (resp.state.state) {
            case OperationState.Free:
            case OperationState.ReSpin:
                return resp.state.freeData.spinInfo.spinResult.gridChanged;
            case OperationState.BonusGame:
                if (resp.state.freeData) {
                    return resp.state.freeData.spinInfo.spinResult.gridChanged;
                }
                else {
                    return resp.state.normalData.spinInfo.spinResult.gridChanged;
                }
            default:
                return resp.state.normalData.spinInfo.spinResult.gridChanged;
        }
    }

    // private _canceledAuto:boolean = true;
    /**
     * 玩家开始了单次滚动
     */
    private _onClickSingleStartBtn() {
        // console.log("-----------------------------------")
        // console.log(`_startBtnVisible:${this.startBtnVisible}>>doingBonusGame:${BonusGameManager.instance.doingBonusGame}>>spinTouchEnable:${this.spinTouchEnable}>>isInAuto:${this.isInAuto}>>inGame:${this.inGame}`)
        if (!this._startBtnVisible) return;
        if (BonusGameManager.instance.doingBonusGame) return;

        if (!this.spinTouchEnable && !this.isInAuto) {
            return;
        }
        if (!this.inGame) {
            // 按下旋转按钮时，没有正在进行游戏
            this._onClickSingleStartBtnNotInGame();
        }
        else {
            this._onClickSingleStartBtnInGame();
        }

    }

    /**
     * 非游戏状态下按下开始按钮
     * 此时只是简单的开始一次单次旋转
     */
    private _onClickSingleStartBtnNotInGame() {
        if (this._checkSpin()) {
            // 检查
            this._restAutoTimes = 0;
            this.isInAuto = false;

            this._startSpin();
        }
    }

    /**
     * 游戏中按下开始按钮
     */
    private _onClickSingleStartBtnInGame() {
        //  如果滚轴还没有停止，则检查下是否需要显示快速提示界面
        if (this.isInAuto) {
            this._onClickSingleStartBtnInAuto();
        }
        else {
            if (this.isSpinResp) {
                this._onClickSingleStartBtnNotInAuto();
            }

        }
    }

    /**
     * 自动模式下按下了旋转按钮
     * 自动模式下必然是在游戏中
     */
    private _onClickSingleStartBtnInAuto() {
        // 免费游戏急停
        if (this.nowGameType === GameType.FreeGame) {
            if (!this.isSlotMachineStopped) {
                if (!this.isSlotMachineStopped) this._checkAndShowEnableTurboView();
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_STOP_SLOT_MACHINE_IMMEDIATELY);
            }
            else {
                this._onSlotMachineCompleted(null, true);
            }
        }
        // 非免费转
        else {
            // 停止整个自动旋转
            this._restAutoTimes = 0;

            // 如果滚轴已经停止了则游戏结束直接结束
            if (this.isSlotMachineStopped) {
                if (!this.isSlotMahcineCompleted) {
                    this._onSlotMachineCompleted(null);
                }
                else {
                    // 已经完成，正在等下一轮,取消所有旋转计划
                    this.inGame = false;
                    this.isInAuto = false;
                    this.nowGameType = GameType.None;
                    //通知菜单栏可点击
                    game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_MENU_INTERACTABLE);
                    this._cancelAllPlan();
                }

                // 通知线展示重置一次（避免线展示完成一轮后，不再轮播线)
                // game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_RESET_LINE_SHOWING, SpinManager.instance)
            }
            else {
                // 如果滚轴未停止,则取消自动转
                this.isInAuto = false;
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_CANCEL_AUTO_GAME);
            }
        }
    }

    /**
     * 非自动模式下，但在游戏中按下旋转按钮
     */
    private _stopImme: boolean = true;
    private _onClickSingleStartBtnNotInAuto() {
        if (!this.isSlotMachineStopped) this._checkAndShowEnableTurboView();
        if (this.stopImme) {
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_STOP_SLOT_MACHINE_IMMEDIATELY);
        }
    }

    public get stopImme(): boolean {
        return this._stopImme;
    }

    public set stopImme(value: boolean) {
        this._stopImme = value;
    }


    /**
     * 点击了滚轴界面
     */
    private _onClickSlotMachineView() {
        // 急停
        if (CustomButton.isOnCooling) return
        CustomButton.isOnCooling = true;
        if (!this.isSlotMachineStopped) this._checkAndShowEnableTurboView();
        if (!this.rollingResult) return;
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_STOP_SLOT_MACHINE_IMMEDIATELY);
    }

    /**
     * 滑动滚轴
     */
    private _onSlideSlotMachine() {

        if (this._hasNewCustomData) {
            this._notifyCustomDataUpdated(GlobalQueueManager.instance.continueHandler);
            if (this._isCustomDataInterActive) {
                return;
            }
        }

        GlobalQueueManager.instance.removeAllTasksByName(globalTaskFlags.GLOBAL_TASK_CANCEL_WHEN_START);

        if (this.hasDumyQueue && GlobalQueueManager.instance.queueLen <= 1) {
            GlobalQueueManager.instance.reset();
        }
        this.hasDumyQueue = false;

        // 检查全局队列中是否有未完事件
        if (GlobalQueueManager.instance.queueLen > 0) {
            // this._waitToResume = true;
            GlobalQueueManager.instance.execute();
            // this.isInAuto = false;
            // this.autoTimes = 0;
            // this.restAutoTimes = 0;
            return;
        }

        if (!this._startBtnVisible) return;
        if (BonusGameManager.instance.doingBonusGame) return;
        // 如果还有自动次数立即通知滚轴完成
        if (this.inGame) {
            if (this.isSlotMachineStopped) this._onSlotMachineCompleted(null, true);
        }
        else {
            // 相当于点击了单次按钮
            if (SpinManager.instance.isSlotMachineStopped) {
                // game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_RECORD, { "type": UserStatisticsManager.click_spin });//行为管理器，后面统一添加
            }
            this._onClickSingleStartBtn();
        }
    }

    private _stopImmediatelyTimes: number = 0;
    private _ignoreClick: boolean = false;
    private _checkAndShowEnableTurboView() {
        // 为负数表示需要忽略
        if (this._stopImmediatelyTimes < 0) return;
        if (FreeGameManager.instance.hasFreeGame || BonusGameManager.instance.hasBonusGame) return this._stopImmediatelyTimes = 0;
        if (this._ignoreClick) return;
        if (this.isInTurbo) return;
        ++this._stopImmediatelyTimes;
        this._ignoreClick = true;
        if (this._stopImmediatelyTimes >= 3) {
            this._stopImmediatelyTimes = 0;
            // UIManager.instance.showEnableTurboView();
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SHOW_FAST_MODE_TIP);
        }
    }

    /**
     * 是否可以旋转
     */
    private _checkSpin(): boolean {
        if (this._isMoneyEnough()) {
            return true;
        }
        else {
            //最后一次是否赢钱
            // if (!this._totalWin) {
            // }
            //game.EventManager.getInstance().raiseEvent(core.GameCoreConst.mess_openRechargeGuide);
            this.isInAuto = false;
            this.inGame = false;
            game.EventManager.getInstance().raiseEvent(GameEventNames.MONEY_NOT_ENOUGH_BREAK);
            return false;
        }
    }

    /**
     * 
     */
    private _isMoneyEnough() {
        // 是否有免费游戏
        if (BonusGameManager.instance.hasBonusGame) return true;
        if (FreeGameManager.instance.hasFreeGame) return true;
        if (this._hasNewCustomData && this._isCustomDataInterActive) return true;
        if (PlayerManager.instance.showCoin < this.minGameMoney * 0.01) return false;
        let total: number = PlayerManager.instance.showCoin;
        return total >= this.betCost;
    }

    private _waitToResume: boolean = false;
    public hasDumyQueue: boolean = false;
    private _startSpin() {
        // if(this._waitToResume) return;
        CustomButton.isOnCooling = true;
        if (this._hasNewCustomData) {
            this._notifyCustomDataUpdated(GlobalQueueManager.instance.continueHandler);
            if (this._isCustomDataInterActive) {
                return;
            }
        }

        GlobalQueueManager.instance.removeAllTasksByName(globalTaskFlags.GLOBAL_TASK_CANCEL_WHEN_START);

        if (this.hasDumyQueue && GlobalQueueManager.instance.queueLen <= 1) {
            GlobalQueueManager.instance.reset();
        }
        this.hasDumyQueue = false;

        // 检查全局队列中是否有未完事件
        if (GlobalQueueManager.instance.queueLen > 0) {
            // this._waitToResume = true;
            console.log("----------wait queue execute-----------------", GlobalQueueManager.instance.queueLen)
            GlobalQueueManager.instance.execute();
            return;
        }
        this._cancelAllPlan();
        this.inGame = true;
        this._ignoreClick = false;
        this._customUpdateData = null;
        this._hasNewCustomData = false;
        this._totalWin = 0;
        this._spinWin = 0;
        // 先检查是否有小游戏需要处理
        if (BonusGameManager.instance.try()) return this._stopImmediatelyTimes < 0 ? null : this._stopImmediatelyTimes = 0;
        if (FreeGameManager.instance.try()) return this._stopImmediatelyTimes < 0 ? null : this._stopImmediatelyTimes = 0;
        // 前端伪扣钱
        PlayerManager.instance.deductMoney(this.betCost);
        this._renderNormalStart();
    }

    /**
     * 多次游戏
     */
    private _onClickedMultiStartBtn(eventName: string, times: number) {

        if (!this.spinTouchEnable) {
            return;
        }

        if (this._hasNewCustomData) {
            this._notifyCustomDataUpdated(GlobalQueueManager.instance.continueHandler);
            if (this._isCustomDataInterActive) {
                return;
            }
        }
        GlobalQueueManager.instance.removeAllTasksByName(globalTaskFlags.GLOBAL_TASK_CANCEL_WHEN_START);

        if (this.hasDumyQueue && GlobalQueueManager.instance.queueLen <= 1) {
            GlobalQueueManager.instance.reset();
        }
        this.hasDumyQueue = false;

        // 检查全局队列中是否有未完事件
        if (GlobalQueueManager.instance.queueLen > 0) {
            // this._waitToResume = true;
            GlobalQueueManager.instance.execute();
            // this.isInAuto = false;
            // this.autoTimes = 0;
            // this.restAutoTimes = 0;
            return;
        }

        // 如果正在进行多次转到，则取消自动转
        if (this._restAutoTimes > 0 || this._restAutoTimes < 0) {
            this.isInAuto = false;
            this._restAutoTimes = 0;
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_CANCEL_AUTO_GAME);
            return;
        }
        if (!this._checkSpin()) return;

        if (0 === this.autoTimes) this.autoTimes = -1//SlotConfigManager.instance.autoTimesList[0];
        this.restAutoTimes = this.autoTimes;

        this._doClickMultiStartBtn();

    }


    /**
     * 自动游戏
     */
    private _doClickMultiStartBtn() {
        this.isInAuto = true;
        // this.inGame = true;
        if (this.inGame == false) {
            this._startSpin();
        }
    }

    private _autoBonusGame() {
        // Laya.timer.clear(this, this._autoBonusGame);
        SlotTimeManager.instance.clear(this, this._autoBonusGame);
        // cc.director.getScheduler().unschedule(this._autoBonusGame, this);
        this._onClickSingleStartBtn();
    }

    private _resetWhenStartSpin() {
        this._rollingResult = null;
        this._totalWin = 0;
        this._spinWin = 0;
        this._totalWinRate = 0;
        this._planedFreeGame = false;
    }

    /**
     * 处理普通的开始游戏：非小游戏
     */
    private _renderNormalStart() {
        // 将游戏类型设置为主游戏
        this.nowGameType = GameType.MainGame;
        this._doSingleSpin();
    }

    public renderNormalStartFreely() {
        // 将游戏类型设置为主游戏
        this.nowGameType = GameType.FreeGame;
        this._doSingleSpinFreely();
    }

    private _doSingleSpinFreely() {
        // 重置一次数据
        this._resetWhenStartSpin();


        this.isSlotMahcineCompleted = false;
        this.isSlotMachineStopped = false;
        this._requestSpinFreely();
    }

    // private _spinned:boolean = false;
    private _doSingleSpin() {
        // 重置一次数据
        this._resetWhenStartSpin();
        this._rollingResult = null;
        this.isSlotMahcineCompleted = false;
        this.isSlotMachineStopped = false;
        // this._spinned = true;
        this._requestSpin();

    }

    private _requestSpinFreely() {
        let data = { req: null };

        SlotProtoManager.getInstance().requestSpinFreely(data);
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_START_ROLLING);

    }

    /**
     * 旋转的额外参数
     */
    private _extra: number[];
    public get extra(): number[] {
        return this._extra;
    }
    public set extra(value: number[]) {
        this._extra = value;
    }

    private _appointRate: number = -1;

    /**
     * 指定倍率
     */
    public get appointRate(): number {
        return this._appointRate;
    }
    public set appointRate(value: number) {
        this._appointRate = value;
    }

    // private _requested:boolean = false;
    private _requestSpin() {
        // TODO 发送单次协议
        let req: protoSlot.spinReq = <protoSlot.spinReq>{};
        let reqType: protoSlot.spinReqType = <protoSlot.spinReqType>{};
        reqType.lines = this.lineNum;
        reqType.cost = this.getLineCostByIndex();
        reqType.rate = this.getRealLineRate();
        reqType.rateModulus = this.rateModulus;
        reqType.assginLine = [];
        reqType.lineMultiple = this.getLinelMutiple();
        if (this._extra != null)
            reqType.extra = this._extra;
        // req.req = reqType;
        let data = { req: reqType };
        req.req = reqType;
        SlotProtoManager.getInstance().requestSpinFreely(data);
        this.isSpinResp = false;
        // 通知滚轴开始滚动
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_START_ROLLING);
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_MENBTS_SETSTATE, { state: false, num: 1 });

        this.betCost = null
        // let data = {req:{lines:SlotConfig.instance.maxLines, bet:SlotConfig.instance.lineValue[SlotManager.instance.betRange], rate:SlotConfig.instance.lineRate}};
        // SlotManager.instance.lastReqCoin = Math.round(SlotConfig.instance.maxLines * SlotConfig.instance.lineValue[SlotManager.instance.betRange] * SlotConfig.instance.lineRate)
        // NetworkManager.instance.send(slot.spinReq, req);
        // NetSlotSpin.getInstance().spinReq(data);
        //用户行为统计
        // game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_RECORD, { "type": UserStatisticsManager.requency });//行为管理后面统一添加
    }

    public isSlotMahcineCompleted: boolean = true;
    /**
     * 滚轴滚动完成了
     */
    private _onSlotMachineCompleted(evt: string, ifImmediatelyStart: boolean = false) {
        // if(this.isSlotMahcineCompleted) return;
        this.isSlotMahcineCompleted = true;
        // 是否自动
        // 自动游戏中
        if (this._restAutoTimes > 0 || this._restAutoTimes < 0) {
            if (ifImmediatelyStart) {
                // 检查钱
                if (!this._checkSpin()) {
                    this._restAutoTimes = 0;
                    this._onSlotMachineCompleted(null);
                    return;
                }
                this._startSpin();
            }
            else if (!this._planedStart && !this._planedAutoGame) {
                this._planToSingleStart(1000);
            }
        }
        else if (0 === this._restAutoTimes) {
            this.isInAuto = false;
            this.inGame = false;
            this.nowGameType = GameType.None;
            //通知菜单栏可点击
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_MENU_INTERACTABLE);
        }
    }

    // 切换提示
    private _switchTipStateInRolling() {
        if (0 === this._restAutoTimes) {
            //if (!BonusGameManager.instance.hasBonusGame) TipsManager.instance.nowTipState = TipState.Rolling;
        }
        else {
            if (this._restAutoTimes < 0) {
                // 直到
            }
            else {
            }
        }
    }

    private onceWin: number = 0;

    /**是否是以历史记录打开界面 */
    public isLastView: boolean = false;
    /**本次翻硬币次数 */
    public throwTimes: number = 0;

    /**
     * 线展示完成了（目前只能免费游戏有用)
     */
    private _onShowLineOver() {
        // 是否有免费游戏
        // console.log("onshowlineover");
        // if (FreeGameManager.instance.treatingTrigger) return;
        // console.log("try free game");

        // if (FreeGameManager.instance.hasFreeGame && !BonusGameManager.instance.hasBonusGame && FreeGameManager.instance.isAutoNextFree) {

        //     if (!this._planedFreeGame) {
        //         // 正在自动免费游戏过程中，立即开始转动
        //         this._cancelAllPlan();
        //         this._onClickSingleStartBtnNotInGame();

        //     }
        // }
    }

    private _planedStart: boolean = false;
    private _planToSingleStart(time: number) {
        this._planedStart = true;
        // Laya.timer.once(time, this, this._checkAndStart);
        // cc.director.getScheduler().schedule(this._checkAndStart, this, time / 1000, 0, 0);
        console.log("_planToSingleStart delayTime", time);
        setTimeout(this._checkAndStart.bind(this), time);
        // SlotTimeManager.instance.once(time, this, this._checkAndStart);
    }
    private _planToClickSingleStart(time: number) {
        // Laya.timer.once(time, this, this._onClickSingleStartBtn);
        // cc.director.getScheduler().schedule(this._onClickSingleStartBtn, this, time / 1000, 0, 0);
        // SlotTimeManager.instance.once(time, this, this._onClickSingleStartBtn);
        setTimeout(this._onClickSingleStartBtn.bind(this), time);
    }

    private _checkAndStart() {
        if (this._planedStart) {
            this._planedStart = false;
            // 检查钱
            if (!this._checkSpin()) {
                this._restAutoTimes = 0;
                this._onSlotMachineCompleted(null);
                return;
            }
            this._startSpin();
        }
    }

    private _cancelSingleStartPlan() {
        this._planedStart = false;
        // Laya.timer.clear(this, this._checkAndStart);
        SlotTimeManager.instance.clear(this, this._checkAndStart);
    }

    private _cancelAllPlan() {
        this._planedStart = false;
        this._planedAutoGame = false;
        // Laya.timer.clearAll(this);
        // cc.director.getScheduler().unscheduleAllForTarget(this);
        SlotTimeManager.instance.clearAll(this);
    }


    //取消自动游戏 这个方法暂只在PG平台调用
    public cancelAutoGame(): void {
        if (this.isSlotMahcineCompleted) {
            SpinManager.instance._cancelAllPlan();
            SpinManager.instance.inGame = false;
        }
        SpinManager.instance.restAutoTimes = 0;
        SpinManager.instance.isInAuto = false;
        //放在下面是派发时间中因为需要isInAuto中的值 处理bug = 1143 自动游戏中，一局旋转结束中奖，点击停止自动游戏不生效，一局旋转结束不中奖，马上停止自动游戏，钱包，投注按钮不可以点击，且数字颜色未恢复到蓝色
        if (this.isSlotMahcineCompleted) {
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_MENU_INTERACTABLE);
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SHOW_LINE_OVER);
            SpinManager.instance.spinTouchEnable = true;
        }
    }

    private _planedAutoGame: boolean = false;
    private _planToAutoGame(time: number) {
        this._planedAutoGame = true;
        // Laya.timer.once(time, this, this._checkAndAutoStart);
        // SlotTimeManager.instance.once(time, this, this._checkAndAutoStart);
        this._checkAndAutoStart();
    }

    /**
     * 免费游戏结束了，延迟1秒开始自动转模式直到免费次数用完
     */
    private _checkAndAutoStart() {
        if (this._planedAutoGame) {
            this._planedAutoGame = false;
            // 检查钱
            if (this._restAutoTimes === 0 || !this._checkSpin()) {
                this._restAutoTimes = 0;
                this._onSlotMachineCompleted(null);
                return;
            }
            if (this._restAutoTimes !== 0) this._doClickMultiStartBtn();
        }
    }

    private _cancelAutoStartPlan() {
        this._planedAutoGame = false;
        // Laya.timer.clear(this, this._checkAndAutoStart);
        SlotTimeManager.instance.clear(this, this._checkAndAutoStart);
    }

    private _onSlotMachineStopped() {
        let freeWin: number = FreeGameManager.instance.freeGameInfo ? FreeGameManager.instance.freeGameInfo.sumCoin : 0;
        let bonusWin: number = BonusGameManager.instance.bonusGameInfo ? BonusGameManager.instance.bonusGameInfo.sumWinCoin : 0;

        PlayerManager.instance.syncShowingCoin();
        this.isSlotMachineStopped = true;
        // 调用免费游戏的相关事件回调
        // 如果触发了游戏事件，

        if (BonusGameManager.instance.hasBonusGame || FreeGameManager.instance.hasFreeGame && this._nowGameType !== GameType.FreeGame && this._nowGameType !== GameType.BonusGame) {
            this.storeAutoGameTimes();
        }

        this.switchTipsWhenSlotMachineStop();

        // 派发事件
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_CUSTOM_DATA_RECEIVED);
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_MENBTS_SETSTATE, { state: true, num: 1 });
    }

    // private _forceCheckFail:boolean = false;
    /**
     * 滚动回复
     */
    private _onRollingResp(eventName: string, resp: protoSlot.spinResp) {
        // 重置一些特殊参数
        this._extra = null;
        this._betCost = null;

        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_BEFORE_RENDER_SPINRESULT);


        if (resp.spinResult) {
            this.setCustomGrids(resp.spinResult.grid, resp.spinResult.gridChanged);
        }

        let getSpinResult = () => { return this._rollingResult };

        this._rollingResult = resp;

        this.lastTimeSpinResult.spinResult = resp.spinResult;
        // game.AutoTest.getInstance().setAutoTestData(SlotAutoTestKey.SLOT_FUNC_GET_SPIN_RESULT, { execFunc: getSpinResult });


        //this.initLineNumAndCost(resp.nextState as protoSlot.stateType);
        this._renderCustomUpdateList();
        if (this._restAutoTimes > 0) {
            if (!this._onRespinTime) {
                --this.restAutoTimes;
            }
        }
        this._renderSpinResp();

        this.roundId = resp.roundId ? (resp.roundId as Long) : Long.fromNumber(0);

        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_OPERATIONSTATE_CHANGE, resp.state);



        // 通知            
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_ROLL_RESULT_RESP);
        // 通知滚轴开始滚动
        //game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_START_ROLLING);



    }

    private _onBuyFreeRollingResp(eventName: string, resp: protoSlot.buyFreeImdResp) {
        console.log("_onBuyFreeRollingResp--->", resp);
        if (resp.nextState) {
            SpinManager.instance.rollingResult.nextState = resp.nextState;
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_CLEAR_LOOP_LINE);
            if (resp.nextState.state == OperationState.Free || resp.nextState.state == OperationState.ReSpin) {
                FreeGameManager.instance.renderResume(resp.nextState, true);
                MultipleGameManager.instance.render(SpinManager.instance.rollingResult);
            } else if (resp.nextState.state == OperationState.BonusGame) {
                BonusGameManager.instance.render(resp.nextState);
            }
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_RERUN_FLOWS);
        }
    }

    private _renderCustomUpdateList(updateList: protoSlot.stateUpdateType[] = null) {
        if (!updateList) {
            if (!this._rollingResult) return;
            if (!this._rollingResult.updateList) return;
            updateList = this._rollingResult.updateList as protoSlot.stateUpdateType[];
        }
        if (updateList.length <= 0) return;
        // 检查是否有编号为６的属性更新，该属性为扩展属性
        let index: number = SlotUtils.findIndexFromArray(updateList, (e, i, arr) => {
            return 6 === e.type;
        })
        if (index < 0) return;
        this._hasNewCustomData = true;
        this._customUpdateData = updateList[index].value.handleState;
    }

    private _renderSpinResp() {
        // 平坦化线结果
        let result: protoSlot.spinResultType = this._rollingResult.spinResult as protoSlot.spinResultType;

        this.doFlattenLineRewardsResult(result);

        if (this._totalWin <= 0) {
            ++this._continuousUnHittedTimes
        }
        else {
            this.resetUnHitTimes();
        }

        MultipleGameManager.instance.render(this._rollingResult);

        // 交给小游戏管理器处理小游戏数据
        BonusGameManager.instance.render(this._rollingResult.nextState as protoSlot.stateType);
        FreeGameManager.instance.render(this._rollingResult);
    }

    /**
     * 平坦化旋转结果
     */
    public doFlattenLineRewardsResult(result: protoSlot.spinResultType) {
        this._spinSlotsData = result.grid;
        this._spinSlotsGridChangedData = result.gridChanged || result.grid;
        // 总共赢取的钱
        this._spinWin = result.spinCoin;
        this._totalWin = (result.lgCoin as Long).toNumber() + (result.spinCoin as Long).toNumber() + ((result.attachCoin && (result.attachCoin as Long).toNumber()) || 0);
        this._totalWinRate = this._totalWin / this.betCost;

        // 将服务端下旋转结果转换成客户的旋转结果，方便使用
        this._flattenLineRewardsResults = [];
        let lineResults: protoSlot.spinResultType.IlineResultType[] = result.lineResult,
            len: number = lineResults.length,
            singleResult: protoSlot.spinResultType.IlineResultType;

        this._isFullLineWin = false;
        for (let i: number = 0; i < len; ++i) {
            singleResult = lineResults[i];
            let temp: RollingResult = new RollingResult();

            temp.lineId = singleResult.lineId;
            temp.lineType = singleResult.lineType;
            temp.lineMode = singleResult.lineMode;
            temp.direction = singleResult.dir;
            temp.winCoin = (singleResult.spinCoin as Long).toNumber();
            temp.bonusGameIds = singleResult.lgList as Long[];
            temp.winPos = singleResult.winPos;

            // 计算该次中了几个元素及主元素
            temp.eleId = singleResult.elementResult.elem;
            let numIndex: number = SlotUtils.findIndexFromArray(singleResult.elementResult.elemList, (e) => e.elem === singleResult.elementResult.elem);
            temp.eleNum = singleResult.elementResult.elemList[numIndex].elemNum;
            temp.eleList = [];
            for (let j: number = 0; j < singleResult.elementResult.elemList.length; ++j) {
                temp.eleList.push(singleResult.elementResult.elemList[j].elem);
            }

            if (temp.eleNum >= SlotConfigManager.instance.DataGame.getData(SlotConfigManager.instance.gameID).column) this._isFullLineWin = true;
            this._flattenLineRewardsResults.push(temp);
        }

        if (this.totalWin > 0 && this._flattenLineRewardsResults.length <= 0) {
            console.log(`no line hitted but win:${this.totalWin}`);
        }
    }

    private _hasNewCustomData: boolean = false;


    public makeDefaultDataResp(): void {
        let result = new protoSlot.spinResp;
        result.balance = Long.fromNumber(PlayerManager.instance.showCoin);
        let preSpinResult = this.lastTimeSpinResult.spinResult as protoSlot.spinResultType;
        let spinResult = new protoSlot.spinResultType;
        spinResult.spinCoin = Long.fromNumber(0);
        spinResult.lgCoin = Long.fromNumber(0);
        spinResult.attachCoin = Long.fromNumber(0);
        spinResult.grid = [].concat(preSpinResult.grid);
        spinResult.gridChanged = [].concat(preSpinResult.gridChanged);
        spinResult.occupyPosList = [].concat(preSpinResult.occupyPosList);
        spinResult.occupyPosListChanged = [].concat(preSpinResult.occupyPosListChanged);
        spinResult.realGridShape = [].concat(preSpinResult.realGridShape);
        spinResult.realGridShapeChanged = [].concat(preSpinResult.realGridShapeChanged);
        spinResult.lineResult = [];
        //处理bug=5974 提示弹窗关闭后，滚轴停下的图案应该是滚动前的图案，不能是初始配置的图案
        // if (this.spinSlotsGridChangedData && this.spinSlotsGridChangedData.length > 0) {
        //     spinResult.grid = this.spinSlotsGridChangedData.concat([]);
        //     spinResult.gridChanged = this.spinSlotsGridChangedData.concat([]);
        // } else {
        //     let gameConfig: any = SlotConfigManager.instance.DataGame.getData(SlotConfigManager.instance.gameID);
        //     if (gameConfig.gridDetail) {
        //         spinResult.grid = gameConfig.gridDetail.concat([]);
        //         spinResult.gridChanged = gameConfig.gridDetail.concat([]);
        //     } else {
        //         for (let col = 1; col <= gameConfig.column; col++) {
        //             let elments = SlotConfigManager.instance.DataRoller.getColumnElements(col);
        //             for (let row = 0; row < gameConfig.row; row++) {
        //                 spinResult.grid.push(elments[row]);
        //                 spinResult.gridChanged.push(elments[row]);
        //             }
        //         }
        //     }
        // }
        result.spinResult = spinResult;
        this._rollingResult = result;
        this._flattenLineRewardsResults = [];
        this.totalWin = 0;
    }

}







