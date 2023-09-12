import SimpleManagerTemplate from "./SimpleManagerTemplate";
import BonusGameInfo from "../SlotDefinitions/BonusGameInfo";
import SlotUtils from "../SlotUtils/SlotUtils";
import SpinManager, { GameType } from "./SpinManager";
import { Handler } from "../SlotUtils/Handle";
import FreeGameManager from "./FreeGameManager";
import GlobalQueueManager from "./GlobalQueueManager";
import { OperationState } from "../SlotDefinitions/SlotEnum";
import { GameEventNames } from '../SlotConfigs/GameEventNames';
import PlayerManager from "./PlayerManager";
import NetSlotConst from "../../../network/NetSlotConst";
import SlotProtoManager from "../../../network/SlotProtoManager";
import { GData } from "../../../common/utils/GData";
import { LayerManage } from "../../../common/layer/LayerManage";

/**
 * BonusGameManager
 */
export default class BonusGameManager implements SimpleManagerTemplate {
    /**
     * 单例
     */
    public autoEnterBonusGame: boolean = true;
    public static get instance(): BonusGameManager {
        if (!this._instance) this._instance = new BonusGameManager();
        return this._instance;
    }
    private static _instance: BonusGameManager = null;


    private static BUNUSGAME_UI_ID = 400;

    /**
     * 当前的小游戏信息
     */
    public get bonusGameInfo(): BonusGameInfo {
        return this._bonusGameInfo;
    }
    private _bonusGameInfo: BonusGameInfo;

    /**
     * 本次小游戏玩家所有的操作结果
     */
    // public get actionResults():protocol.LgResultType[]
    // {
    //     return this._actionResults;
    // }
    // private _actionResults:protocol.LgResultType[] = [];

    /**
     * 上次小游戏操作的奖励
     */
    public get lastActionResult(): protoSlot.lgResultType {
        return this._lastActionResult;
    }
    private _lastActionResult: protoSlot.lgResultType = null;

    private bonusGameLayer: cc.Node = null;

    private bonusGameUIID: number = 0;

    /**
     *本局是否触发了小游戏
     */
    public get isTreateNewBonus(): boolean {
        return this._isTreateNewBonus;
    }
    public set isTreateNewBonus(v: boolean) {
        this._isTreateNewBonus = v;
    }
    private _isTreateNewBonus: boolean = false;

    /**
     * 初始化接口
     */
    init() {
        this._addProtocolListener();
        let c: { [key: number]: game.IUIConf } = {};
        let bonusGamePrefabConfig = GData.getParameter("slotMachine").bonusGamePrefab;
        if (typeof bonusGamePrefabConfig == "string") {
            c[BonusGameManager.BUNUSGAME_UI_ID] = { bundleName: GData.bundleName, path: bonusGamePrefabConfig, preventKeyboard: true, preventTouch: true, cache: false, showType: game.UIShowTypes.UI_FULLSCREEN, openAni: game.UIDefAni.UI_NONE, closeAni: game.UIDefAni.UI_NONE, zOrder: LayerManage.popup, preventTouchOpacity: 0 };
        } else if (typeof bonusGamePrefabConfig == "object") {
            let index = 0;
            this.uidMap = [];
            for (let key in bonusGamePrefabConfig) {
                let path = bonusGamePrefabConfig[key];
                let uuid = BonusGameManager.BUNUSGAME_UI_ID + index;
                index++;
                this.uidMap.push({ uuidStr: key, uuid: uuid });
                c[uuid] = { bundleName: GData.bundleName, path: path, preventKeyboard: true, preventTouch: true, cache: false, showType: game.UIShowTypes.UI_FULLSCREEN, openAni: game.UIDefAni.UI_NONE, closeAni: game.UIDefAni.UI_NONE, zOrder: LayerManage.popup, preventTouchOpacity: 0 };
            }
        }

        game.BaseUIConf.getInstance().mergeUIConf(c);
        let uiconf = game.BaseUIConf.getInstance().getUICF();
        game.UIManager.getInstance().initUIConf(uiconf);
    }

    private uidMap: { uuidStr: string, uuid: number }[] = [];

    /**
     * 释放
     */
    dispose() {
        this._removeProtocolListener();

        if (this.bonusGameUIID != 0) {
            game.UIManager.getInstance().closeByUIID(this.bonusGameUIID);
        }
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_CLOSE_BONUS_LAYER);
        game.ResLoader.getInstance().releaseAsset(this.bonusGamePrefab, this.useKey);
        BonusGameManager._instance = null;
    }

    public get hasBonusGame(): boolean {
        return !SlotUtils.isNullOrUndefined(this._bonusGameInfo);
    }
    /**
     * 处理小游戏数据
     */
    public render(state: protoSlot.stateType, isRestore = false) {
        // this._bonusGameId = null;
        this._bonusGameInfo = null;
        this.isTreateNewBonus = false;
        if (!state) return;
        if (OperationState.BonusGame !== state.state) return;

        // this._bonusGameId = state.lgId;
        this._bonusGameInfo = new BonusGameInfo(state.lgId as Long);

        this.isTreateNewBonus = true;
        if (!isRestore)
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_BONUS_GAME_TASK);

        // 修改提示状态
        // 主界面显示变化
        // EventManager.instance.dispatchEvent(GameEventNames.EVENT_TRIGGERED_BONUS_EVENT, BonusGameManager.instance);
    }

    public get doingBonusGame(): boolean {
        return this._doingBonusGame;
    }
    private _doingBonusGame: boolean = false;
    /**
     * 尝试进行小游戏流程，如果成功，则返回true,此时其它模块应该将控制权交给BonusGameManager
     */
    public try(): boolean {
        if (!this.bonusGameInfo) return false;
        if (this._doingBonusGame) return true;
        this._doingBonusGame = true;

        // 请求小游戏数据
        if (!this._requestBonusGameInfo()) {
            // 如果不需要请求数据则直接呼出小游戏界面开始进行小游戏
            this._startBonusGame(this.bonusGameInfo.bonusGameId);
        }

        return true;
    }

    /**
     * 滚轴停止了
     */
    public onSlotMachineStopped() {
        if (this.hasBonusGame) game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_BONUS_GAME_TASK);
    }

    /**
     * 向服务器请求发起小游戏操作
     * @public
     * @method requestAction
     * @param {number[]} choose
     */
    public requestAction(choose: number[] = []) {
        // let req: slot.lgActionReq = new slot.lgActionReq();
        // req.lgId = this._bonusGameInfo.bonusGameId;
        // req.choose = choose;

        // let temp = slot.lgActionReq.encode(req).finish();
        // slot.lgActionReq.decode(temp);
        SlotProtoManager.getInstance().requestAction(this._bonusGameInfo.bonusGameId, choose);
        // NetworkManager.instance.send(CommandCodes.PPLgActionReq, req);
    }

    /**
     * 小游戏完成了
     */
    public onBonusGameFinished() {
        this._doingBonusGame = false;
        let temp: BonusGameInfo = this._bonusGameInfo;
        this._bonusGameInfo = null;
        if (this.bonusGameLayer) {
            this.bonusGameLayer.destroy();
            this.bonusGameLayer = null;
        }

        if (this.bonusGameUIID != 0) {
            game.UIManager.getInstance().closeByUIID(this.bonusGameUIID);
        }

        SpinManager.instance.totalWin = temp.sumWinCoin;
        //PlayerManager.instance.onBalancePush(temp.sumWinCoin);

        //回复小游戏之前的状态
        if (!this._actionResp) {
            // 派发小游戏结束事件           
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_BONUS_GAME_OVER_TASK, temp);
            return;
        }

        if (temp.nextState.state === OperationState.BonusGame) {
            return this._treateNextBonusGame(temp);
        }

        this._treateNextFreeGame(temp);
    }

    /**
     * 处理下一个小游戏
     * @param oldBonusGameInfo 
     */
    private _treateNextBonusGame(oldBonusGameInfo: BonusGameInfo) {
        this.render(this._actionResp.state as protoSlot.stateType);
        // 检查下一个是不是小游戏
        // 派发小游戏结束事件 
        if (!this.isTreateNewBonus) {
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_BONUS_GAME_OVER_TASK, oldBonusGameInfo);
        } else {
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_TREATE_NEXT_BONUSGAME, oldBonusGameInfo);
        }
    }

    /**
     * 处理下一个免费游戏
     * @param oldBonusGameInfo 
     */
    private _treateNextFreeGame(oldBonusGameInfo: BonusGameInfo) {
        let needTreateFreeGame: boolean = false;
        if (this._actionResp.state.state !== OperationState.Free && this._actionResp.state.state !== OperationState.ReSpin) {
            // 检查此时是否有免费游戏
            if (!FreeGameManager.instance.freeGameInfo) {

                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_BONUS_GAME_OVER_TASK, oldBonusGameInfo);
                return;
            }
            needTreateFreeGame = true;
        }

        FreeGameManager.instance.renderBonusResume(this._actionResp, oldBonusGameInfo);
        // 回复界面状态
        // SpinManager.instance.onFreeOrBonusGameOver(needTreateFreeGame);   
        if (FreeGameManager.instance.hasNewFreeGame || needTreateFreeGame) {
            FreeGameManager.instance.onSlotMachineStopped();
            // GlobalQueueManager.instance.execute();
            // 派发小游戏结束事件           
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_BONUS_GAME_OVER_TASK, oldBonusGameInfo);
        }
        else {
            //this._planToResumeFreeGame();
            // 派发小游戏结束事件           
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_BONUS_GAME_OVER_TASK, oldBonusGameInfo);

        }
    }

    private _planToResumeFreeGame() {
        GlobalQueueManager.instance.pushToQueue(Handler.create(this, this._makeResumeFreeGameQueue))
    }

    private _makeResumeFreeGameQueue() {
        // 派发事件
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_RESUME_FREE_GAME, Handler.create(FreeGameManager.instance, FreeGameManager.instance.onResumeFreeGameHandler));
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FREE_GAME_INFO_UPDATED_TASK, FreeGameManager.instance.freeGameInfo);
    }

    private _bonusGameOverHandler() {
        if (this.hasBonusGame) {
            this.onSlotMachineStopped();
        }
        GlobalQueueManager.instance.execute();
    }



    /**
     * 请求小游戏数据
     * 如果不需要请求，则返回false，否则返回true
     */
    private _requestBonusGameInfo(): boolean {
        if (this._bonusGameInfo.initlized) return false;

        SlotProtoManager.getInstance().requestBonusGameInfo(this._bonusGameInfo.bonusGameId);

        return true;
    }

    /**
     * 小游戏数据回包
     */
    private _onBonusGameInfoResp(mess, resp: protoSlot.lgDataResp) {
        // this._bonusGameInfo && this._bonusGameInfo.dispose();
        this._bonusGameInfo.init(resp);
        console.log("_onBonusGameInfoResp", resp);
        this._startBonusGame(this._bonusGameInfo.bonusGameId);
    }

    /**
     * 小游戏操作回复
     */
    public get actionResp(): protoSlot.lgActionResp {
        return this._actionResp;
    }
    private _actionResp: protoSlot.lgActionResp;
    /**
     * 收到服务器对于玩家小游戏操作结果的回复
     * @private
     * @method _onActionResp
     * @param {protocol.LgActionResp} resp 服务器回复
     */
    private _onActionResp(mess, resp: protoSlot.lgActionResp) {
        this._actionResp = resp;
        // console.log("action resp");
        //SpinManager.instance.initLineNumAndCost(resp.state as protoSlot.stateType)
        this.bonusGameInfo.quantity = resp.times;

        // 更新场景跳转信息
        this._bonusGameInfo.nextSceneInfo = resp.next as protoSlot.lgNextType;
        this._bonusGameInfo.nextState = resp.state as protoSlot.stateType;
        this._bonusGameInfo.luckyGoldResultList = resp.luckyGoldResultList;
        this._bonusGameInfo.pickCardResult = resp.pickCardResult;

        // 更新奖励
        // if(!this._actionResults) this._actionResults = [];
        // this._actionResults.push(resp.reward);
        this._lastActionResult = resp.reward as protoSlot.lgResultType;
        this.bonusGameInfo.history.push(resp.reward as protoSlot.lgResultType);


        // 事件通知小游戏操作请求回复了
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_BONUS_GAME_ACTION_RESPONSED);

        if (resp.allReward && !(resp.allReward as Long).equals(0)) {
            this.bonusGameInfo.sumWinCoin = Number(resp.allReward);
        }

        if (resp.balance && !(resp.balance as Long).equals(0)) {
            PlayerManager.instance.updateRealCoin(Number(resp.balance));
            PlayerManager.instance.syncShowingCoin();
        }

    }

    /**
     * 开始小游戏
     */
    private _startBonusGame(bonusGameId: Long) {
        console.log("_startBonusGame");
        SpinManager.instance.nowGameType = GameType.BonusGame;
        this._showBonusUI();

    }

    private bonusGamePrefab: cc.Prefab = null;
    private useKey: string = null;
    private _showBonusUI(): void {
        let bonusGamePrefabConfig = GData.getParameter("slotMachine").bonusGamePrefab;
        if (typeof bonusGamePrefabConfig == "string" && bonusGamePrefabConfig) {
            this.bonusGameUIID = BonusGameManager.BUNUSGAME_UI_ID;//UIID.UI_BONUS_GAME;
            game.UIManager.getInstance().open(BonusGameManager.BUNUSGAME_UI_ID);
        } else if (typeof bonusGamePrefabConfig == "object") {
            for (let data of this.uidMap) {
                if (data.uuidStr == this.bonusGameInfo.bonusGameId.toString()) {
                    this.bonusGameUIID = data.uuid;
                    break;
                }
            }
            game.UIManager.getInstance().open(this.bonusGameUIID);
        }

        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_LOAD_SINGLE_ASSET_COMPLETE, "bonus");
        console.log("显示小游戏");
    }

    /**
     * 增加协议监听
     */
    private _addProtocolListener() {
        game.EventManager.getInstance().addEventListener(NetSlotConst.LGDATARESP, this._onBonusGameInfoResp, this);
        game.EventManager.getInstance().addEventListener(NetSlotConst.LGACTIONRESP, this._onActionResp, this);
    }

    /**
     * 移除协议监听
     */
    private _removeProtocolListener() {
        game.EventManager.getInstance().removeEventListener(NetSlotConst.LGDATARESP, this._onBonusGameInfoResp, this);
        game.EventManager.getInstance().removeEventListener(NetSlotConst.LGACTIONRESP, this._onActionResp, this);
    }

    constructor() {

    }

    // private _bonusGameId:number; 

}