import SimpleManagerTemplate from "./SimpleManagerTemplate";
import SpinManager from "./SpinManager";
import FreeGameInfo from "../SlotDefinitions/FreeGameInfo";
import BonusGameInfo from "../SlotDefinitions/BonusGameInfo";
import { GameEventNames } from '../SlotConfigs/GameEventNames';
import { OperationState } from "../SlotDefinitions/SlotEnum";

/**
 * FreeGameManager
 */
export default class FreeGameManager implements SimpleManagerTemplate {
    /**
     * 单例
     */
    public static get instance(): FreeGameManager {
        if (!this._instance) this._instance = new FreeGameManager();
        return this._instance;
    }
    private static _instance: FreeGameManager = null;
    /**
     * 是否有免费游戏(包括重转)
     */
    public get hasFreeGame(): boolean {
        return this._freeGameInfo!==null && this._freeGameInfo.times >= 0 && !this.isNotFreeType;
    }

    /**
     * 本局是否是免费游戏(包括重转)所触发的
     */
    public get isTreateFromFreeGame(): boolean {
        return !this.isTreateNewFree && (this.hasFreeGame || this.isTreateFreeOver);
    }
    
    /**
     * 是否是非免费类型，即不是免费游戏，但玩家不能换押分，仅配合服务器用免费数据这些字段，用id=19来区分
     */
    public get isNotFreeType():boolean{
        return this.freeGameInfo&&this.freeGameInfo.id == 19;
    }


    /**
     * 免费游戏是否结算过了
     */
    public get isFreeGameBalanced(): boolean {
        return this._isFreeGameBalanced;
    }
    public set isFreeGameBalanced(v: boolean) {
        if (v !== this._isFreeGameBalanced) {
            this._isFreeGameBalanced = v;
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_GAME_TYPE_CHANGED);
        }
    }
    private _isFreeGameBalanced: boolean = true;

    /**
     * 是否有新触发的免费游戏
     * 1.触发时为true
     * 2.当旋转一次后，置为false
     */
    public get hasNewFreeGame(): boolean {
        return this._hasNewFreeGame;
    }
    public set hasNewFreeGame(v: boolean) {
        this._hasNewFreeGame = v;
    }
    private _hasNewFreeGame: boolean = false;

    /**
     * 需要延迟派发的事件(延迟至滚轴完成)
     */
    private _delayEvent: { eventName: string, args: any }[] = [];

    public treatingTrigger: boolean = false;

    /**
     * 初始化接口
     */
    init() {
        this._addEventListener();
    }

    /**
     * 释放
     */
    dispose() {
        this._removeEventListener();
        FreeGameManager._instance = null;
    }

    /**
     * 拥有的免费游戏信息
     */
    public get freeGameInfo(): FreeGameInfo {
        return this._freeGameInfo;
    }
    public set freeGameInfo(info: FreeGameInfo) {
        this._freeGameInfo = info;
    }

    private _freeGameInfo: FreeGameInfo = null;

    /**
     * 是否会处理再次触发免费游戏的事件
     */
    public get willHandleTriggerAgain(): boolean {
        return this._willHandleTriggerAgain;
    }
    public set willHandleTriggerAgain(v: boolean) {
        this._willHandleTriggerAgain = v;
    }
    private _willHandleTriggerAgain: boolean = true;

    /**
     * 
     */
    public get triggeredAgain(): boolean {
        return this._triggeredAgain;
    }
    public set triggeredAgain(v: boolean) {
        this._triggeredAgain = v;
    }
    private _triggeredAgain: boolean = false;

    /**
     * 是否触发免费游戏结束
     */
    public get isTreateFreeOver(): boolean {
        return this._isTreateFreeOver;
    }
    public set isTreateFreeOver(v: boolean) {
        this._isTreateFreeOver = v;
    }
    private _isTreateFreeOver: boolean = false;

    /**
     *本局是否触发了免费游戏，免费中触发免费不算
     */
    public get isTreateNewFree(): boolean {
        return this._isTreateNewFree;
    }
    public set isTreateNewFree(v: boolean) {
        this._isTreateNewFree = v;
    }
    private _isTreateNewFree: boolean = false;


    /**
     * 上一次的免费游戏信息，只有当免费游戏结束后且在结算前才有数据
     */
    public get lastFreeGameInfo(): FreeGameInfo {
        return this._lastFreeGameInfo;
    }
    public set lastFreeGameInfo(info: FreeGameInfo) {
        this._lastFreeGameInfo = info;
    }
    private _lastFreeGameInfo: FreeGameInfo;

    /**
     * 是否自动触发下一句免费,默认为true，必要时修改此值
     */
     public get isAutoNextFree(): boolean {
        return this._isAutoNextFree;
    }
    public set isAutoNextFree(value: boolean) {
        this._isAutoNextFree = value;
    }
    private _isAutoNextFree: boolean = true;

    public renderResume(state: protoSlot.stateType,needEvent:boolean=false) {
        if (!state) return;
        this._renderByNextState(state, needEvent);
        this.isTreateNewFree = false;
    }

    public renderBonusResume(resp: protoSlot.lgActionResp, bonusGameInfo?: BonusGameInfo) {
        this.isTreateFreeOver = false;
        this.isTreateNewFree = false;
        if (!resp) return;
        if (this._freeGameInfo) {
            this._freeGameInfo.sumLgCoin += bonusGameInfo.sumWinCoin;
        }

        if (OperationState.Free !== resp.state.state && OperationState.ReSpin !== resp.state.state) {
            // this._freeGameInfo.sumLgCoin = spinResp.state.normalData;
            this._freeGameInfo.updateCommonInfo(resp.state.normalData as protoSlot.normalStateType);
            this.isTreateFreeOver = true;
            this._lastFreeGameInfo = this._freeGameInfo;
            //this._delayEvent.push({ eventName: GameEventNames.EVENT_FREE_GAME_OVER, args: this._freeGameInfo });
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FREE_GAME_OVER_TASK, this._freeGameInfo);

            this._freeGameInfo = null;
            return;
        }
        let needEvent = true;
        if (this._freeGameInfo && this._freeGameInfo.id === resp.state.freeData.id)
            needEvent = false;
        this._renderByNextState(resp.state as protoSlot.stateType, needEvent);
    }
    /**
     * 上次免费游戏ID,只在免费游戏被打断时才会记录
     */
    // public get lastFreeGameId
    // private _lastFreeGameId:number;
    /**
     * 处理免费游戏数据
     * 1.当有新的免费转触发时state.freeData将填充数据
     * 2.如果没有新的触发，只是更新当前的免费游戏数据，则通过
     */
    public render(spinResp: protoSlot.spinResp, bonusGameInfo?: BonusGameInfo) {
        this.isTreateFreeOver = false;
        this.isTreateNewFree = false;
        if (!spinResp) return;
        if (spinResp.state === OperationState.Normal) {
            if (!spinResp.nextState) return;
            if (!spinResp.nextState.freeData) return;
        }

        let oldFreeGameInfo = this._freeGameInfo == null ? null : this._freeGameInfo.clone();
        // 触发了新的
        if (spinResp.nextState && (OperationState.Free === spinResp.nextState.state || OperationState.ReSpin === spinResp.nextState.state)) {
            if(this._freeGameInfo&&!this.isNotFreeType){
                 if(oldFreeGameInfo.isAuthoritiesRate){
                    oldFreeGameInfo.updateList(spinResp.updateList);
                    game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FREE_GAME_INFO_UPDATED_BEFORE_REWARD_TASK, oldFreeGameInfo);
                    game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FREE_GAME_REWARD_TASK, oldFreeGameInfo);
                }else{
                    game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FREE_GAME_INFO_UPDATED_TASK, oldFreeGameInfo);
                    game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FREE_GAME_REWARD_TASK, oldFreeGameInfo);
                }

            }
            return this._renderByNextState(spinResp.nextState as protoSlot.stateType, true);
        }

        if (!spinResp.updateList) return;
        if (spinResp.updateList.length <= 0) return;

        // 只是更新
        let oldTimes: number = this._freeGameInfo.times;
        let oldSumTimes: number = this._freeGameInfo.sumTimes;
        let ifTriggered: boolean = this._freeGameInfo.updateList(spinResp.updateList as protoSlot.stateUpdateType[]);
        if ((OperationState.Free === spinResp.state || OperationState.ReSpin === spinResp.state)&&!this.isNotFreeType) {
            if (ifTriggered) {
                // 存储要派发的事件名
                this._hasNewFreeGame = true;
                // 更新免费游戏次数
                //if (oldTimes !== this._freeGameInfo.times) 
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FREE_GAME_TIMES_UPDATED, [oldTimes - 1, oldSumTimes]);
                // 构造一个假的免费游戏数据结构
                let commonType: protoSlot.stateCommonType = <protoSlot.stateCommonType>{};
                commonType.id = this._freeGameInfo.id;
                let tempTimes: number = this._freeGameInfo.times - oldTimes + 1;
                commonType.times = tempTimes;
                commonType.sumTimes = tempTimes;
                commonType.ratio = this._freeGameInfo.ratio;
                commonType.wild = this._freeGameInfo.wild;
                commonType.scatter = this._freeGameInfo.scatter;
                commonType.elemFixPos = this._freeGameInfo.elemFixPos;
                commonType.eachSumSpinCoin=this._freeGameInfo.eachSumSpinCoin;
                commonType.type = this._freeGameInfo.type;
                commonType.isAuthoritiesRate = this._freeGameInfo.isAuthoritiesRate;
                commonType.elemExpand = [].concat(this.freeGameInfo.elemExpand||[]);
                commonType.sumSpinCoin = 0;
                commonType.sumLgCoin = 0;
                let temp: FreeGameInfo = new FreeGameInfo(spinResp.state, commonType);
                this._triggeredAgain = true;
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_NEW_FREE_GAME_TRIGGERED_AGAIN_TASK, temp);

            }
            else {
                // 延迟更新免费游戏信息
                // 更新免费游戏次数
                if (oldTimes !== this._freeGameInfo.times) game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FREE_GAME_TIMES_UPDATED, [this._freeGameInfo.times, this._freeGameInfo.sumTimes]);

            }
            if(this.freeGameInfo.isAuthoritiesRate){
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FREE_GAME_INFO_UPDATED_BEFORE_REWARD_TASK, this._freeGameInfo);
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FREE_GAME_REWARD_TASK, this._freeGameInfo);
            }else{
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FREE_GAME_REWARD_TASK, oldFreeGameInfo);
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FREE_GAME_INFO_UPDATED_TASK, this._freeGameInfo);
            }
        }

        if (!spinResp.nextState) return;
        // 结束了
        if ((OperationState.Free === spinResp.state || OperationState.ReSpin === spinResp.state)
            && OperationState.Normal === spinResp.nextState.state) {
            // 状态改变了，但有可能是触发了其它状态，而并不是结束
            this._freeGameInfo.updateCommonInfo(spinResp.nextState.normalData as protoSlot.normalStateType);
            this._lastFreeGameInfo = this._freeGameInfo;
            if(this.isNotFreeType){
                this._freeGameInfo = null;
                return;
            }
            this.isTreateFreeOver = true;
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FREE_GAME_OVER_TASK, this._freeGameInfo);
        }
    }

    public onResumeFreeGameHandler(ifImmediately: boolean = false) {
        if (ifImmediately) {
            SpinManager.instance.autoFreeGame();
        }
        else {
            SpinManager.instance.onFreeGameTrigger();
        }
    }


    /**
     * 滚轴转动完成了,此时需要触发延迟派发的事件
     */
    public onSlotMachineStopped(): void {
        if (!this._delayEvent) return;
        if (this._delayEvent.length <= 0) return;
        for (var i: number = 0, len: number = this._delayEvent.length; i < len; ++i) {
            game.EventManager.getInstance().raiseEvent(this._delayEvent[i].eventName, this._delayEvent[i].args);
        }

        this._delayEvent = [];
    }

    /**
     * 尝试进行免费游戏流程，如果成功，则返回true,此时其它模块应该将控制权交给FreeGameManager
     */
    public try(): boolean {
        if (this.hasFreeGame) {
            this._doFreeGame();
            return true;
        }

        return false;
    }

    /**
     * 进行一次免费游戏
     */
    private _doFreeGame(): void {
        this._hasNewFreeGame = false;
        this._triggeredAgain = false;
        SpinManager.instance.renderNormalStartFreely();
    }

    /**
     * 
     * @param state 
     */
    private _renderByNextState(state: protoSlot.stateType, needEvent: boolean = true) {
        if (state.freeData) {
            if (!this._freeGameInfo) {
                this._freeGameInfo = new FreeGameInfo(state.freeData.type, state.freeData as protoSlot.stateCommonType);
                this._hasNewFreeGame = true;
                this.isTreateNewFree = true;
            }
            else {
                if(this.isNotFreeType&&this.freeGameInfo.gameID!=0&&this._freeGameInfo.gameID==state.freeData.gameId){
                    console.log("no raiseEvent EVENT_NEW_FREE_GAME_TRIGGERED_TASK 1")
                    needEvent = false;
                }
                let oldType = this.isNotFreeType;
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FREE_GAME_TIMES_UPDATED, [this.freeGameInfo.times - 1, this.freeGameInfo.sumTimes]);
                if(this.freeGameInfo.type==OperationState.ReSpin&&state.freeData.type==OperationState.Free&&this.freeGameInfo.triggeredTimes==1){
                    this.freeGameInfo.triggeredTimes-- ;
                }
                if(this.freeGameInfo.type==OperationState.ReSpin&&state.freeData.type==OperationState.Free&&this.freeGameInfo.stateHistory.includes(OperationState.Free)){//重转切免费且历史触发过免费不派发新免费事件
                   console.log("no raiseEvent EVENT_NEW_FREE_GAME_TRIGGERED_TASK 2")
                    needEvent = false;
                }
                if(this.freeGameInfo.type==OperationState.Free&&state.freeData.type==OperationState.Free&&this.freeGameInfo.id!=state.freeData.id){//不同的免费游戏切换派发触发免费事件
                    needEvent = true;
                }
                this._freeGameInfo.update(state.freeData as protoSlot.stateCommonType);

                if(oldType&&oldType!=this.isNotFreeType){//特殊的非免费游戏类型变成免费游戏类型
                    needEvent = true;
                    this.isTreateNewFree = true;
                }
            }
            // 存储要派发的事件名
            this._isFreeGameBalanced = false;
            if (needEvent) {
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_NEW_FREE_GAME_TRIGGERED_TASK);
            }


        }
    }

    private _addEventListener() {
        // EventManager.instance.addEventListener(GameEventNames.EVENT_SLOT_MACHINE_COMPLETED, SpinManager.instance, this, this.onSlotMachineCompleted);
    }

    private _removeEventListener() {
        // EventManager.instance.removeEventListener(GameEventNames.EVENT_SLOT_MACHINE_COMPLETED, SpinManager.instance, this, this.onSlotMachineCompleted);

    }

    public doAniDelayCb(cb){
        cb && cb(500);
    }

    constructor() {

    }


}