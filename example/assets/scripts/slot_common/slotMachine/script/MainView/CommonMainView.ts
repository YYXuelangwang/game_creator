import SlotUtils from '../SlotUtils/SlotUtils';
import FreeGameManager from '../SlotManager/FreeGameManager';
import SpinManager from '../SlotManager/SpinManager';
import SlotConfigManager from '../SlotManager/SlotConfigManager';
import { OperationState, WinType } from '../SlotDefinitions/SlotEnum';
import { Handler } from '../SlotUtils/Handle';
import JTScatterTask from '../Scroller/rules/JTScatterTask';
import JTLayerFactory from '../Scroller/com/factorys/JTLayerFactory';
import JTChildFactory from '../Scroller/com/factorys/JTChildFactory';
import JTScrollingPipeline from '../Scroller/transitions/procedure/scrolling/JTScrollingPipeline';
import JTScrollerGroup from '../Scroller/com/JTScrollerGroup';
import JTOptionType from '../Scroller/transitions/JTOptionType';
import JTCreateScrolling from '../Scroller/transitions/procedure/scrolling/JTCreateScrolling';
import JTEmptyBeginScrolling from '../Scroller/transitions/procedure/scrolling/JTEmptyBeginScrolling';
import JTRunScrolling from '../Scroller/transitions/procedure/scrolling/JTRunScrolling';
import JTOverScrolling from '../Scroller/transitions/procedure/scrolling/JTOverScrolling';
import JTDefaultItemRender from '../Scroller/renders/JTDefaultItemRender';
import BonusGameInfo from '../SlotDefinitions/BonusGameInfo';
import FreeGameInfo from '../SlotDefinitions/FreeGameInfo';
import GlobalQueueManager from '../SlotManager/GlobalQueueManager';
import BonusGameManager from '../SlotManager/BonusGameManager';
import SlotGameManager from '../SlotManager/SlotGameManager';
import SlotMachineView from './SlotMachineView';
import { GameEventNames } from '../SlotConfigs/GameEventNames';
import JTChannelPipeline from '../Scroller/com/plugins/JTChannelPipeline';
import JTOddsUtils from '../Scroller/JTOddsUtils';
import JTScrollerSettings from '../Scroller/com/JTScrollerSettings';
import JTScroller from '../Scroller/com/JTScroller';
import BaseView from '../../../main/BaseView';
import { SoundMger } from '../../../sound/script/SoundMger';
import { SOUND_NAME, WinAniType } from '../../../common/enum/CommonEnum';
import { FreeGameRatioReward } from './FreeGameRatioReward';
import { SDictionary } from '../SlotData/SDictionary';
import MultipleGameManager from '../SlotManager/MultipleGameManager';
import EliminateEffectUtils from '../Scroller/transitions/procedure/eliminate/EliminateEffectUtils';
import JTChannelScrollerGroup from '../Scroller/extensions/JTChannelScrollerGroup';
import EntranceView from '../../../main/EntranceView';
import { LayerManage } from '../../../common/layer/LayerManage';
import SettlementAni from '../../../settlementAni/script/SettlementAni';
import { GData } from '../../../common/utils/GData';

const { ccclass, property } = cc._decorator;
/** 
 * CommonMainView
 */
@ccclass
export abstract class CommonMainView extends BaseView {

    constructor() {
        super();

    }

    @property(cc.Node)
    public rollerLayer: cc.Node = null;
    /**老虎机滚轴类 */
    public slotMachine: SlotMachineView;

    public isReenter: boolean = false;

    public isSetMask: boolean = false;

    private maskPoints: SDictionary = null;


    onLoad() {
        this.effectNode = EntranceView.instance.getEffectLayer();
        this.rollerLayer.addComponent(SlotMachineView);
        SlotGameManager.instance.start(this.init, this);
    }


    /**
     * 主界面的初始化接口
     * @public
     * @method init
     */
    public init() {
        if (this.slotMachine) {
            return;
        }
        console.log("EVENT_NECESSARY_ASSETS_LOADED");

        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_NECESSARY_ASSETS_LOADED);
        // 父容器
        FreeGameManager.instance.willHandleTriggerAgain = !SlotUtils.isNullOrUndefined(this.onFreeGameTriggerAgain);

        // 初始化声音
        this.initSound && this.initSound();
        // 注册游戏事件
        this.addEventListener();

        this.slotMachine = SlotMachineView.instance;
        this.slotMachine.gameLayer = this;
        this.slotMachine.isSetMask = this.isSetMask;
        let maskNode = this.rollerLayer.parent;
        this.slotMachine.scrollContain = maskNode;//this.touchLayer;
        this.slotMachine.maskLayer = maskNode;
        this.isReenter = false;

        this.slotMachine.createScrollers();
        // 回调用户自己的初始化函数        

        this.maskPoints = new SDictionary();

        this.beforeInitSlotMachine();

        let set: JTScrollerSettings = new JTScrollerSettings();
        this.slotMachine.setupScrollerSettings(set);

        this.onInit();

        SpinManager.instance.spinTouchEnable = false;

        if (SlotConfigManager.instance.isMultipleGame) {
            for (let gameID of SlotConfigManager.instance.gameIDs) {
                let scroller = this.slotMachine.getScrollerByGameID(gameID);
                scroller.mark(gameID);
                SlotConfigManager.instance.changeGameID(gameID);
                this.onSetupScroller(gameID, scroller);
            }
        } else {
            let gameConfig: any = SlotConfigManager.instance.DataGame.getData(SlotConfigManager.instance.gameID);
            this.slotMachine.scroller.mark(1);
            this.slotMachine.scroller.setupGridConfig(this.slotMachine.gridWidth, this.slotMachine.gridHeight, gameConfig.row, gameConfig.column, this.slotMachine.spaceXLandscape, this.slotMachine.spaceYLandscape, this.slotMachine.spaceXPortrait, this.slotMachine.spaceYPortrait, true, this.slotMachine.orientation);
            this.onInitScroller(this.slotMachine);
        }

        // 初始化一些关键组件
        this.slotMachine.array = SpinManager.instance.spinSlotsData || [];

        this.schedule(this.checkState, 0.1);

        SoundMger.instance.playMusic(SOUND_NAME.Game_Back_Music);


        console.log("init");
        this.resize();

    }


    protected beforeInitSlotMachine(): void {

    }

    protected initSlotMachineComplete(): void {

    }
    /**
     * 创建滚轴组，可自定义
     * @returns 
     */
    public createScoller(): JTChannelScrollerGroup {
        return new JTChannelScrollerGroup();
    }

    /**
     * 绘制不规则多边形遮罩，特殊形状的滚轴使用，必须在onload时调用
     * @param points 多边形点必须大于等于3个点，且按顺序围成多边形
     */
    public drawMask(points: cc.Vec2[]): void {
        let maskNode = this.rollerLayer.parent;
        let mask = maskNode.getComponent(cc.Mask);
        if (this.slotMachine.scroller.scrollerGroupMask) {
            this.slotMachine.scroller.scrollerGroupMask.drawPolygon();
            return;
        }
        if (!points || points.length < 3 || !mask) {
            return;
        }

        //@ts-ignore
        mask._updateGraphics = () => {
            //@ts-ignore
            let graphics = mask._graphics as cc.Graphics;
            graphics.clear();
            for (let i: number = 0; i < points.length; i++) {
                let p: cc.Vec2 = points[i];
                if (i == 0) {
                    graphics.moveTo(p.x, p.y);
                }
                else {
                    graphics.lineTo(p.x, p.y);
                }
            }
            graphics.close();
            if (cc.game.renderType === cc.game.RENDER_TYPE_CANVAS) {
                graphics.stroke();
            }
            else {
                graphics.fill();
            }
        }

        //@ts-ignore
        mask._updateGraphics();


    }

    /**
     * 
     * @param gameID 滚轴对应的游戏id
     * @param scroller 滚轴
     */
    protected onSetupScroller(gameID: number, scroller: JTScrollerGroup): void {
        // let gameConfig: any = SlotConfigManager.instance.DataGame.getData(SlotConfigManager.instance.gameID);
        // scroller.setupFactory(new JTLayerFactory(), new JTChildFactory());
        // let option = scroller.options(JTScrollingPipeline, JTScrollerGroup.USE_CONVERT_MROE_LIST, gameConfig.column, this.slotMachine.scrollingComplete);
        // option.childOption(JTCreateScrolling, JTOptionType.OPTION_CREATE);
        // option.childOption(JTEmptyBeginScrolling, JTOptionType.OPTION_BEGIN_RUNNING, this.slotMachine.beginScrolling);
        // option.childOption(JTRunScrolling, JTOptionType.OPTION_RUNNING, this.slotMachine.onSpinPreStop);
        // option.childOption(JTOverScrolling, JTOptionType.OPTION_OVER_RUNNING, this.slotMachine.scrollingProgress);

        // scroller.setupDefaultItemList(this.getSourceList, SlotConfigManager.instance.DataElement.getKeys(), false, Handler.create(this, this.getCustomDefaultDataList, [scroller], false)); 
        // let data = [];
        // SlotConfigManager.instance.setDataGrid(gameID,data);
        // this.setMaskPoint(gameID,[]);
    }

    /**
     * 多类滚轴初始化完成的回调，可根据gameID对相应滚轴做列的偏移
     * @param gameID 
     * @param scroller 
     */
    public onScrollerInitComplete(gameID: number, scroller: JTScrollerGroup): void {

    }

    /**
     * 多类滚轴初始化完成时切换的当前游戏ID
     * @param gameID 当前的gameID
     */
    public onMutipleScrollerInit(gameID: number): void {

    }

    /**
     * 变更滚轴完成的回调
     * @param gameID 
     * @param scroller 
     */
    public onChangeScrollerComplte(gameID: number, scroller: JTScrollerGroup): void {

    }

    private changeGameScroller(event: string, cb: Handler): void {
        let nextGameID = MultipleGameManager.instance.curGameID;
        if (this.onChangeScrollerBegin) {
            let handler = Handler.create(this, () => {
                this.slotMachine.changeScrollerByGameID(nextGameID);
                cb.run();
            })
            this.onChangeScrollerBegin(nextGameID, handler);

        } else {
            this.slotMachine.changeScrollerByGameID(nextGameID);
            cb.run();
        }
    }

    /**
     * 开始改变滚轴前的回调，cb调用后开始切换滚轴
     * @param gameID 
     * @param cb 
     */
    protected onChangeScrollerBegin?(gameID: number, cb: Handler): void


    public changeScrollerByGameID(gameID: number): void {
        this.slotMachine.changeScrollerByGameID(gameID);
    }

    /**
     * 根据游戏id设置遮罩
     * @param gameID 
     * @param points 
     */
    public setMaskPoint(gameID: number, points: cc.Vec2[]): void {
        this.maskPoints.set(gameID, points);
    }

    public changeMaskPointByGameID(gameID: number): void {
        //let points = this.maskPoints.get(gameID) as cc.Vec2[];
        let scroller = this.slotMachine.getScrollerByGameID(gameID);
        let points = scroller.maskPolygon;
        if (points) {
            this.drawMask(points);
        }
    }

    //断线重连包括刷新界面和界面重连
    protected reEnterRoom(): void {
        this.isReenter = true;
        this.slotMachine.resetRender();

        if (this.slotMachine.scroller.isRunning) {
            this.slotMachine.scroller.stopAll();
            this.refreshRoom();
        } else {
            this.slotMachine.scroller.parse([], () => {
                this.slotMachine.onParseTaskOver();
                this.refreshRoom();
            }, false, false, false);
        }

    }

    protected changeCostSuccess(): void {

    }

    /**
     * 切换押分时导致滚轴数据改变的回调
     */
    protected onChangeCost?(): void;

    /**
     * 初次进房间、切换房间、重连成功后的滚轴刷新完的回调
     */
    public refreshRoom(): void {

    }

    /**
     * 切换押分时，重置滚轴
     */
    public onResetScroller(): void {

    }

    /**
     * 滚轴线大奖等展示都完成后的回调
     */
    public onScrollerFlowComplete(): void {

    }

    /**
     * 滚动即将开始的回调
     */
    public beforeScrollerStartRolling(): void {

    }

    protected checkState(): void {
        this.unschedule(this.checkState);
        // 初始化免费游戏
        if (FreeGameManager.instance.hasFreeGame) {
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_COMMON_BTN_BYFREE);
            this.onInitFreeGame && this.onInitFreeGame(FreeGameManager.instance.freeGameInfo, Handler.create(this, () => { }));
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_INIT_FREEGAME);
        }

        if (SpinManager.instance.customUpdateData && this.onInitCustomData) {
            this.onInitCustomData && this.onInitCustomData(SpinManager.instance.customUpdateData as protoSlot.handleStateType, Handler.create(this, this._onCustomDataCallBack))
        }


        //这个在SpinManager的  _onLastGameInfoResp  BonusGameManager.instance.render(resp.state as protoSlot.stateType); 所以不需要这里重复添加触发小游戏事件
        // if (BonusGameManager.instance.hasBonusGame) {
        //     game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_BONUS_GAME_TASK);
        // }

        this.slotMachine.isEnabledMask(false);

        this.runFlowsAfterInit();

    }

    protected runFlowsAfterInit(): void {
        this.slotMachine.scroller.parse([], () => {
            this.slotMachine.onParseTaskOver();
            this.initSlotMachineComplete();
        }, false, false, false);
    }


    //      scroller.setupFactory(new JTLayerManager(), new JTChildManager());
    //     let option:JTIChildOption = scroller.options(JTScrollingPipeline, JTScrollerGroup.USE_CONVERT_MROE_LIST, 5, this.scrollingComplete);
    //     option.childOption(JTCreateScrolling, JTOptionType.OPTION_CREATE);
    //     // option.childOption(JTBeginScrolling, JTOptionType.OPTION_BEGIN_RUNNING, this._beginScrolling);
    //     option.childOption(JTRunScrolling, JTOptionType.OPTION_RUNNING);
    //     option.childOption(JTOverScrolling, JTOptionType.OPTION_OVER_RUNNING, this.scrollingProgress);
    //     let gameConfig:any = ConfigDataManager.instance.DataGame.getData(Application.instance.gameId);
    //     this._scroller.setupGridConfig(this.gridWidth, this.gridHeight, gameConfig.row, gameConfig.column, this.spaceX, this.spaceY, true);
    //     this._scroller.setupDefaultItemList(getSourceList, ConfigDataManager.instance.DataElement.getKeys(), false);
    //
    /**
     *  初始化滚轴
     * @param slotMachine 
     */

    public scatterTask: JTScatterTask = null;
    protected onInitScroller(slotMachine: SlotMachineView): void {
        let scroller = slotMachine.scroller;
        let gameConfig: any = SlotConfigManager.instance.DataGame.getData(SlotConfigManager.instance.gameID);
        // this.scatterTask = new JTScatterTask();        
        scroller.setupFactory(new JTLayerFactory(), new JTChildFactory());
        let option = scroller.options(JTScrollingPipeline, JTScrollerGroup.USE_CONVERT_MROE_LIST, gameConfig.column, slotMachine.scrollingComplete);
        option.childOption(JTCreateScrolling, JTOptionType.OPTION_CREATE);
        option.childOption(JTEmptyBeginScrolling, JTOptionType.OPTION_BEGIN_RUNNING, slotMachine.beginScrolling);
        option.childOption(JTRunScrolling, JTOptionType.OPTION_RUNNING, slotMachine.onSpinPreStop);
        option.childOption(JTOverScrolling, JTOptionType.OPTION_OVER_RUNNING, slotMachine.scrollingProgress);

        scroller.setupDefaultItemList(this.getSourceList, SlotConfigManager.instance.DataElement.getKeys(), false, this.getFreeSourceList);
        JTDefaultItemRender.setPlayCoinIndex(2, 7);
    }

    /**
     * 获取假滚轴列表，每次开始滚动时会重新取,此为示例
     * @param scroller 
     */
    public getCustomDefaultDataList(scroller: JTScrollerGroup): any {
        let list: any = [];
        let ignoreList = [];//排除的ID列表
        let columm = SlotConfigManager.instance.DataGame.getData(SlotConfigManager.instance.gameID).column;   //2018.1.8 change by lmb
        for (var i = 0; i < columm; i++) {
            let lines: any[] = [];
            for (let j: number = 0; j < 100; j++) {
                let id = scroller.getRondomId();
                if (ignoreList.indexOf(Number(id)) > -1) {
                    j--;
                    continue;
                }
                lines.push(id)
            }
            list.push(lines);
        }
        return list;
    }

    protected onWatchRunning(s: JTScroller): void {

    }

    /**
     * 释放资源
     */
    public dispose() {

        if (this.slotMachine) {
            this.slotMachine.dispose();
            this.slotMachine = null;
            this.sideLineSetter = null;
        }
        //  移除游戏事件
        this.removeEventListener();
        this.onDispose && this.onDispose();
        SlotGameManager.instance.clear();
        JTChannelPipeline.destroy();
        JTOddsUtils.destroy();
        this.scatterTask && this.scatterTask.destroy()

        GlobalQueueManager.instance.reset();
    }

    public storeAutoGameTimes(needEvent: boolean = false) {
        SpinManager.instance.storeAutoGameTimes(needEvent);
    }

    /**
     * 恢复自动游戏次数
     */
    public recoverAutoGameTimes() {
        SpinManager.instance.recoverAutoGameTimes();
    }

    /**
     * 容器布局前的回调
     */
    public beforeLayout?(): void;

    /** 
     * 容器布局后的回调
     */
    public afterLayout?(): void;

    /**
     * 添加事件监听
     */
    protected addEventListener(): void {

        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_NEW_FREE_GAME_TRIGGERED_AGAIN, this._onFreeGameTriggerAgain, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_BONUS_GAME_TRIGGERED, this._onBonusGameTrigger, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_FREE_GAME_INFO_UPDATED, this._onFreeGameInfoUpdated, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_FREE_GAME_TIMES_UPDATED, this._onFreeGameTimesUpdated, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_FREE_GAME_OVER, this._onFreeGameOver, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_RESUME_FREE_GAME, this._onResumeFreeGame, this);

        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_CUSTOM_DATA_UPDATED, this._onCustomDataUpdate, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_BONUS_GAME_FINISEH, this._onBonusGameOver, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_REENTER_ROOM_SUCCESS, this.reEnterRoom, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_CUSTOM_DATA_RECEIVED, this._onReceiveCustomData, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_FREE_GAME_TRIGGERED, this._onFreeGameTrigger, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_FREE_GAME_RATIO_REWARD, this._onFreeGameRatioRewardTrigger, this);

        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_CHANGE_GAME_SCROLLER, this.changeGameScroller, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_UPDATE_SINGLE_ROUND_WIN, this._onSingleRoundScoreComplte, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_BONUS_GAME_COMPLETE, this._onBonusGameComplete, this);

        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_PLAY_FREE_GAME_ANI, this.addFreeSpinsAni, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_FULL_LINE_HIT, this.playFullLineAni, this);

        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_PLAY_FREE_GAME_ADMISSION_ANI, this.addFreeAdmission, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.USER_UPLEVEL_ANI, this.addUserUpLevelAni, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_CHANGE_COST_SUCCESS, this.changeCostSuccess, this);

        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_ROLL_RESULT_RESP, this.onUserActive, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_JACKPOT_GAME_TRIGGERED_TASK, this._onJackPotGameTrigger, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_SETTLEMENT_ANI_PLAY, this.addsettlementAni, this);
        
    }

    /**
     * 移除事件监听
     */
    protected removeEventListener(): void {

        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_NEW_FREE_GAME_TRIGGERED_AGAIN, this._onFreeGameTriggerAgain, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_BONUS_GAME_TRIGGERED, this._onBonusGameTrigger, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_FREE_GAME_INFO_UPDATED, this._onFreeGameInfoUpdated, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_FREE_GAME_TIMES_UPDATED, this._onFreeGameTimesUpdated, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_FREE_GAME_OVER, this._onFreeGameOver, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_RESUME_FREE_GAME, this._onResumeFreeGame, this);

        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_CUSTOM_DATA_UPDATED, this._onCustomDataUpdate, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_BONUS_GAME_FINISEH, this._onBonusGameOver, this);

        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_CUSTOM_DATA_RECEIVED, this._onReceiveCustomData, this);

        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_REENTER_ROOM_SUCCESS, this.reEnterRoom, this);

        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_FREE_GAME_TRIGGERED, this._onFreeGameTrigger, this);

        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_FREE_GAME_RATIO_REWARD, this._onFreeGameRatioRewardTrigger, this);

        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_CHANGE_GAME_SCROLLER, this.changeGameScroller, this);

        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_UPDATE_SINGLE_ROUND_WIN, this._onSingleRoundScoreComplte, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_BONUS_GAME_COMPLETE, this._onBonusGameComplete, this);

        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_FULL_LINE_HIT, this.playFullLineAni, this);

        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_PLAY_FREE_GAME_ANI, this.addFreeSpinsAni, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_PLAY_FREE_GAME_ADMISSION_ANI, this.addFreeAdmission, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.USER_UPLEVEL_ANI, this.addUserUpLevelAni, this);

        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_CHANGE_COST_SUCCESS, this.changeCostSuccess, this);

        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_ROLL_RESULT_RESP, this.onUserActive, this);

        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_JACKPOT_GAME_TRIGGERED_TASK, this._onJackPotGameTrigger, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_SETTLEMENT_ANI_PLAY, this.addsettlementAni, this);
        
    }

    /**
     * 主界面两侧的线设置按钮容器(可选)
     */
    protected sideLineSetter?: any;

    /**
     * 主界面进行初始化时的回调
     * @param slotMachine 
     * @param videoPlayer 
     * @param sideLineSetter 主界面两侧的线设置器
     */
    protected abstract onInit();

    /**
     * 释放资源时的回调
     */
    protected onDispose?(): void

    /**
     * 小游戏相关事件
     * @param {BonusGameInfo} bonusGameInfo 小游戏信息
     * @param {Handler} completeHandler 处理完成后的回调(如，可能需要在触发小游戏后播放动画，此时则可以在播放完成后，调用此回调通知框架已经处理完成，继续下一步,如继续播放线动画)
     */
    protected onBonusGameTriggered?(bonusGameInfo: BonusGameInfo, completeHandler?: Handler)

    /**
    * 多个小游戏中的小完成，单个小游戏及最后一个小游戏的不触发
    * @param bonusGameInfo 小游戏信息
    * @param completeHandler 用户处理完成的回调句柄
    */
    protected onBonusGameComplete?(bonusGameInfo: BonusGameInfo, completeHandler?: Handler);
    /**
     * 小游戏结束
     * @param bonusGameInfo 小游戏信息
     * @param completeHandler 用户处理完成的回调句柄
     */
    protected onBonusGameOver?(bonusGameInfo: BonusGameInfo, completeHandler?: Handler);

    // 免费游戏相关
    // 以下接口大部分既可用于免费游戏，也可用于重转，请自行判断属于哪种
    // 请自行根据freeGameInfo.id判断是免费游戏还是重转如:OperationType.Free === freeGameInfo.id
    //==============================

    /**
    * 当本接口被回调时，意味着有上次的免费游戏（或重转）等待完成,请在此完成界面的相关显示初始化
    * 请自行根据freeGameInfo.id判断是免费游戏还是重转如:OperationType.Free === freeGameInfo.id
    * @param freeGameInfo 免费游戏信息
    * @param cb 处理完成时的回调句柄
    * 
    */
    protected onInitFreeGame?(freeGameInfo: FreeGameInfo, cb?: Handler);

    /**
     * 再次回到免费游戏
     * @param freeGameInfo 
     * @param cb 
     */
    protected onResumeFreeGame?(freeGameInfo: FreeGameInfo, cb?: Handler);

    /**
     * 触发了免费游戏
     * 请自行根据freeGameInfo.id判断是免费游戏还是重转如:OperationType.Free === freeGameInfo.id
     * @param freeGameInfo 
     * @param {Handler} completeHandler 处理完成后的回调(如，可能需要在触发小游戏后播放动画，此时则可以在播放完成后，调用此回调通知框架已经处理完成，继续下一步,如继续播放线动画)
     */
    protected onFreeGameTriggered?(freeGameInfo: FreeGameInfo, completeHandler?: Handler): void;

    /**
     * 免费游戏中又触发了免费游戏
     * @param freeGameInfo 
     * @param completeHandler 
     */
    protected onFreeGameTriggerAgain?(freeGameInfo: FreeGameInfo, completeHandler?: Handler): void

    /**
     * 免费游戏更新了
     * 请自行根据freeGameInfo.id判断是免费游戏还是重转如:OperationType.Free === freeGameInfo.id
     * @param freeGameInfo 
     */
    protected onFreeGameInfoUpdated?(freeGameInfo: FreeGameInfo): void;

    /**
    * 免费游戏次数更新了
    * 请自行根据freeGameInfo.id判断是免费游戏还是重转如:OperationType.Free === freeGameInfo.id
    * @param nowTimes 
    */
    protected onFreeGameTimesUpdated?(nowTimes: number, totalTimes?: number);

    /**
     * 免费游戏结束了
     * 请自行根据freeGameInfo.id判断是免费游戏还是重转如:OperationType.Free === freeGameInfo.id
     * @param freeGameInfo 
     */
    protected onFreeGameOver?(freeGameInfo: FreeGameInfo, cb: Handler);

    /**
     * 免费游戏中触发了倍数加成奖励
     * @param ratio 倍数
     * @param total 赢得的总分
     * @param base 基础分
     * @param cb 完成后的回调
     */
    protected onFreeGameRatioReward?(ratio: number, total: number, base, cb: Handler);

    //==============================
    // 免费游戏相关

    protected onInitCustomData?(data: protoSlot.handleStateType, cb: Handler): void;





    /**
     * 游戏的自定义数据更新了
     * @param data 
     * @param cb 
     */
    protected onCustomDataUpdate?(data: protoSlot.handleStateType, cb: Handler);


    /**
     * 当屏幕横竖屏发生了变化时调用
     * @public
     * @method
     * @param {ScreenMode} changedScreenMode
     */
    // protected onResize?(changedScreenMode: ScreenMode): void

    /**
     * 界面显示时的回调
     */
    protected onShown?(): void

    /**
     * 界面隐藏时的回调
     */
    protected onHide?(): void

    /**
     * 界面显示时播放动画
     */
    protected showAnimation?();

    /**
     * 触发了jp游戏,子游戏在此弹出jp游戏，jp游戏的数据取slot.JackPotGameManager.instance.jpRewardPush,自己表现完成后调用cb结束
     * @param cb Jp游戏完成后调用
     */
    protected onJackPotGameTrigger?(cb: Handler);

    // protected abstract get subFittingView():fairygui.GObject;

    /**
     * 初始化声音,如果需要初始化自己的声音，请实现此接口
     */
    protected initSound?(): void;

    public getSourceList(scroller: JTScrollerGroup): any[] {
        let list: any = [];
        let columm = SlotConfigManager.instance.DataGame.getData(SlotConfigManager.instance.gameID).column;   //2018.1.8 change by lmb
        for (var i = 1; i <= columm; i++) {
            let data = SlotConfigManager.instance.DataRoller.getColumnData(i);
            list.push(data);
        }
        return list;
    }


    public getFreeSourceList(scroller: JTScrollerGroup): any[] {
        let list: any[] = [];
        let columm = SlotConfigManager.instance.DataGame.getData(SlotConfigManager.instance.gameID).column;
        for (var i = 1; i <= columm; i++) {
            let data = SlotConfigManager.instance.DataFreeRoller.getColumnData(i);
            if (!data) {
                return null;
            }
            list.push(data);
        }
        return list.length == 0 ? null : list;
    }

    /**
     * 小游戏结束了
     * @param bonusGameInfo 
     * @param cb 
     */
    private _onBonusGameOver(evt: string, bonusGameInfo, cb) {
        if (this.onBonusGameOver) {
            let handler = Handler.create(this, () => {
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SHOW_HASH_LABLE, true);//小游戏结束，哈希密文显示
                cb.run();
            });
            this.onBonusGameOver(bonusGameInfo, handler);
        }
        else {
            cb.run();
        }
    }

    /**
     * 
     * @param bonusGameInfo 
     * @param cb 
     */
    private _onBonusGameComplete(evt: string, bonusGameInfo, cb) {
        if (this.onBonusGameComplete) {
            this.onBonusGameComplete(bonusGameInfo, cb);
        }
        else {
            cb.run();
        }
    }

    // //进入免费游戏前记录是否为快速模式状态
    // private isFastModeBeforeFreeGame: boolean = false;
    protected onMgFreeGameTrigger() {

    }
    /** 免费中再中免费 PT用 */
    protected onPTFreeGameTriggerAgain() {

    }

    /**
     * 真正处理免费游戏触发的逻辑
     */
    private _onFreeGameTrigger(event: string, cb: Handler) {
        //this.isFastModeBeforeFreeGame = SpinManager.instance.isInTurbo;
        this.onMgFreeGameTrigger();
        FreeGameManager.instance.hasNewFreeGame = false;
        this.onFreeGameTriggered && (FreeGameManager.instance.treatingTrigger = true) && this.onFreeGameTriggered(FreeGameManager.instance.freeGameInfo, Handler.create(this, this._onFreeGameTriggerOver, [cb]));
    }

    private _onFreeGameTriggerAgain(event: string, freeGameInfo: FreeGameInfo, cb: Handler) {
        this.onPTFreeGameTriggerAgain();
        FreeGameManager.instance.hasNewFreeGame = false;
        if (!this.onFreeGameTriggerAgain) {
            // cb.run();
            this._onFreeGameTriggerOver(cb, true);
        }
        else {
            (FreeGameManager.instance.treatingTrigger = true) && this.onFreeGameTriggerAgain(freeGameInfo, Handler.create(this, this._onFreeGameTriggerOver, [cb]));
        }
        this.onFreeGameTimesUpdated && this.onFreeGameTimesUpdated(FreeGameManager.instance.freeGameInfo.times, FreeGameManager.instance.freeGameInfo.sumTimes)
        this.onFreeGameInfoUpdated && this.onFreeGameInfoUpdated(FreeGameManager.instance.freeGameInfo);
    }

    private _onFreeGameOver(event: string, freeGameInfo: FreeGameInfo, cb: Handler) {
        //SpinManager.instance.isInTurbo = this.isFastModeBeforeFreeGame || JSON.parse(localStorage.getItem('isFastModeBeforeFreeGame'));
        SlotMachineView.instance.isFreeGameOver = true;
        FreeGameManager.instance.freeGameInfo = null;
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SET_WINSCORE_RETAIN, false);
        console.log("onfreegameover", freeGameInfo.sumCoin);
        this.onMGFreeGameOver();//只用于还原免费是否自动转
        let newCb: Handler = Handler.create(this, () => {
            console.log("免费游戏结束回调------");
            cb && cb.runWith(true);
            // if (MainView.instance.buyBtn) MainView.instance.buyBtn.getComponent(BuySpinBtn).btn.getComponent(cc.Button).interactable = true;
        });
        this.onFreeGameOver && this.onFreeGameOver(freeGameInfo, newCb);//Handler.create(this, this._onHandleFreeGameOverComplete, [freeGameInfo, cb]));
    }

    /** 只用于还原免费是否自动转 */
    protected onMGFreeGameOver() {

    }

    private _onBonusGameTrigger(event: string, cb: Handler) {
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SHOW_HASH_LABLE, false);//小游戏开始，哈希密文隐藏
        this.onBonusGameTriggered && this.onBonusGameTriggered(BonusGameManager.instance.bonusGameInfo, Handler.create(this, this._onBonusGameTriggerOver, [cb]));
    }

    private _onFreeGameTriggerOver(cb: Handler, ifImmediately: boolean = false) {
        FreeGameManager.instance.treatingTrigger = false;
        if (cb.run()) return;
        //if (ifImmediately) return SpinManager.instance.autoFreeGame();
        //return SpinManager.instance.onFreeGameTrigger();
    }

    public _onFreeGameRatioRewardTrigger(event: string, ratio: number, total: number, base: number, cb: Handler): void {
        console.log("_onFreeGameRatioRewardTrigger", ratio, base, total, cb, EliminateEffectUtils.eliminateTotalWin);
        let freeGameRatioReward = this.node.getComponent(FreeGameRatioReward);

        if (EliminateEffectUtils.eliminateTotalWin > 0 && ratio == 1) {
            cb.run();
            return;
        }

        if (freeGameRatioReward) {
            freeGameRatioReward.playEff(ratio, total, base, cb);
        } else {
            let winType = SlotUtils.getWinType(total, SpinManager.instance.betCost);
            if (winType == WinType.Normal) {
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_PLAYED_NORMAL_REWARD);
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_PLAY_REWARD_ANI, SpinManager.instance.totalWin, winType, cb);
            } else if (cb) {
                cb.run();
            }
        }

    }

    private _onSingleRoundScoreComplte(event: string, cb: Handler, ratio: number): void {
        let freeGameRatioReward = this.node.getComponent(FreeGameRatioReward);
        if (freeGameRatioReward && EliminateEffectUtils.eliminateTotalWin > 0) {
            let updateScoreHandler = Handler.create(this, () => {
                let winType = SlotUtils.getWinType(SpinManager.instance.totalWin, SpinManager.instance.betCost);

                if (FreeGameManager.instance.isTreateFromFreeGame && winType == WinType.Normal) {
                    game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_PLAYED_NORMAL_REWARD);
                    game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_PLAY_REWARD_ANI, SpinManager.instance.totalWin, winType, cb);
                } else {
                    cb.run();
                }
            });
            if (SpinManager.instance.totalWin > EliminateEffectUtils.eliminateTotalWin) {//总分大于消除分
                if (ratio > 1) {//倍数大于一在下一流程变倍数加分
                    cb.run();
                } else {//有分散加分
                    freeGameRatioReward.playScoreChangeEffect(EliminateEffectUtils.eliminateTotalWin, SpinManager.instance.totalWin);
                    this.scheduleOnce(() => {
                        freeGameRatioReward.hideScoreChangeEffect(updateScoreHandler);
                    }, 1);
                }
            } else {
                freeGameRatioReward.hideScoreChangeEffect(updateScoreHandler);
            }
        } else {
            cb.run();
        }

    }




    private _onBonusGameTriggerOver(cb: Handler, ifImmediately: boolean = false) {
        cb.run();
        //if (ifImmediately) 
        BonusGameManager.instance.try();
    }

    /**
     * 免费游戏信息更新了
     */
    private _onFreeGameInfoUpdated(msg: string, freeGameInfo: FreeGameInfo, cb: Handler) {
        this.onFreeGameInfoUpdated && this.onFreeGameInfoUpdated(freeGameInfo);
        cb.run();
    }


    /**
     * 免费游戏的次数更新了
     */
    private _onFreeGameTimesUpdated(msg: string, [now, sum]) {

        this.onFreeGameTimesUpdated && this.onFreeGameTimesUpdated(now, sum);
    }

    private _onResumeFreeGame(msg: string, cb: Handler) {
        if (this.onResumeFreeGame) return this.onResumeFreeGame(FreeGameManager.instance.freeGameInfo, cb);
        this.onInitFreeGame && this.onInitFreeGame(FreeGameManager.instance.freeGameInfo, cb);
    }

    /**
     * 接受到了服务器发送的customData
     */
    private _onReceiveCustomData() {


        let ret: protoSlot.spinResp = SpinManager.instance.rollingResult;
        if (!ret)
            return;

    }

    /**
     * 自定义数据更新了
     * @param cb 
     */
    private _onCustomDataUpdate(msg, cb: Handler) {
        if (!SpinManager.instance.customUpdateData) {
            cb.run();
            return;
        }

        if (!this.onCustomDataUpdate) cb.run();

        this.onCustomDataUpdate && this.onCustomDataUpdate(SpinManager.instance.customUpdateData as protoSlot.handleStateType, Handler.create(this, () => {
            cb.run();
        }));
    }


    private _onCustomDataCallBack() {

    }

    /**
     * 
     * @param cb 
     */
    private _onJackPotGameTrigger(evt: string, cb) {
        if (this.onJackPotGameTrigger) {
            this.onJackPotGameTrigger(cb);
        } else {
            cb.run();
        }
    }

    /**
     * 展示大奖或普通奖
     * @param winType 大奖类型
     * @param money 金币数
     * @param cb 完成的回调
     * @param isUpdateWinScore 展示大奖完是否更新到赢分
     * @param isSyncAllScore 展示大奖完是否同步玩家金币数
     * @param delayCbTime complete回调延时  isUpdateWinScore为true时有效
     */
    public showWinAniView(winType: WinAniType, money: number, cb: Handler, isUpdateWinScore: boolean = true, isSyncAllScore: boolean = true, delayCbTime: number = 1) {
        let isRetain = FreeGameManager.instance.isTreateFromFreeGame && !FreeGameManager.instance.isTreateFreeOver;
        let isAdd = FreeGameManager.instance.isTreateFromFreeGame;
        let isResetDelay = false;//FreeGameManager.instance.isTreateNewFree || BonusGameManager.instance.isTreateNewBonus;
        if (winType == WinAniType.Normal) {
            if (isUpdateWinScore) {
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_UPDATE_WINSCORE, money, isRetain, isAdd, isResetDelay, cb, isSyncAllScore, delayCbTime);
            } else {
                (!isRetain || isResetDelay) && game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SET_WINSCORE_RETAIN, false);
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FORCE_UPDATE_ALL_SCORE);
                if (cb) cb.run();
            }
        } else {
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_RESET_WIN);
            let handler = Handler.create(this, () => {
                if (isUpdateWinScore) {
                    game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_UPDATE_WINSCORE, money, isRetain, isAdd, isResetDelay, cb, isSyncAllScore);
                } else {
                    game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FORCE_UPDATE_ALL_SCORE);
                    (!isRetain || isResetDelay) && game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SET_WINSCORE_RETAIN, false);
                    if (cb) cb.run();
                }

            })
            // handler.runWith(true);
            this.playWinAni(winType, money, handler);
        }
    }

    public playWinAni(winType: WinAniType, money: number, cb: Handler) {
        cb.run();
    }

    /**
     * 播放五连或六连等
     * @param event 
     * @param col 
     */
    public playFullLineAni(event: string, col: number, cb: Handler) {
        cb.run();
    }

    /**
     * 公共奖励
     * @param event 
     * @param money 
     * @param cb 
     */
    public addSettlementAni(event: string, money: any, cb: Handler) {
        cb.run();
    }

    /**
     * 
     * @param event 
     * @param data 
     * @param cb 
     */
    public addUserUpLevelAni(event: string, data: any, cb: Handler) {
        cb.run();
    }
    /**
     * 
     * @param event 
     * @param freeGameInfo 
     * @param cb 
     */
    public addFreeSpinsAni(event: string, freeGameInfo: FreeGameInfo, cb: Handler) {
        cb.run();
    }

    /**
     * 
     * @param event 
     * @param freeGameInfo 
     * @param cb 
     */
    public addFreeAdmission(event: string, freeGameInfo: FreeGameInfo, cb: Handler) {
        cb.run();
    }


    protected effectNode: cc.Node = null;

    /**
     * 子类重写时必须调用父类的此方法
     */
    public layoutLandscape(): void {
        if (this.slotMachine) {
            this.slotMachine.layoutLandscape();
        }
    }

    /**
     * 子类重写时必须调用父类的此方法
     */
    public layoutPortrait(): void {
        if (this.slotMachine) {
            this.slotMachine.layoutPortrait();
        }
    }

    //#region 玩家超时未操作游戏的提示逻辑
    /**上一次操作游戏的时间戳 */
    protected lastActiveTime: number = 0;
    /**是否打开了超时弹窗界面 */
    protected isShowingPop: boolean = false;

    /**超时的时间 */
    private tatalTimeOut: number = 300 * 1000

    /**开启超时未操作的计时器逻辑 */
    protected addUserActiveCheck(): void {
        this.lastActiveTime = (new Date()).getTime();
        cc.Canvas.instance.node.on(cc.Node.EventType.TOUCH_START, this.onUserActive, this, true);
        window.document.getElementById("GameCanvas").addEventListener('mouseenter', this.onUserActive.bind(this), false);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, (event) => {
            this.onUserActive();
        });
        this.unschedule(this.checkActive);
        this.schedule(this.checkActive, 5);
    }

    private checkActive(): void {
        let curTime = (new Date()).getTime();
        if (SpinManager.instance.restAutoTimes || FreeGameManager.instance.hasFreeGame || SpinManager.instance.inGame) {
            this.lastActiveTime = (new Date()).getTime();
        }
        if (curTime - this.lastActiveTime > this.tatalTimeOut && !this.isShowingPop) {
            this.unschedule(this.checkActive);
            this.isShowingPop = true;
            this.showTimeOutPrompt();
        }
    }
    /**显示超时提示UI窗口 */
    protected showTimeOutPrompt() {
        let args = <core.IDialogArgs>{};
        args.title = game.LanguageManager.getInstance().getDstStr("pg_tips01");
        args.cancelCbSprFrame = game.LanguageManager.getInstance().getDstStr("pg_tips14");
        args.okCbSprFrame = game.LanguageManager.getInstance().getDstStr("pg_tips05");
        args.tips = game.LanguageManager.getInstance().getDstStr("pg_tips06") + '\n' + "(" + game.LanguageManager.getInstance().getDstStr("pg_tips07") + ")";
        args.okCbTarget = <core.IDialogCallBackTarget>{};
        args.cancelCbTarget = <core.IDialogCallBackTarget>{};
        args.cancelCbTarget.callback = () => {
            window.location.reload();//刷新网页
        }
        args.okCbTarget = <core.IDialogCallBackTarget>{};
        args.okCbTarget.callback = () => {
            //退出
            core.CommonProto.getInstance().backPage();
        }
        core.TipsManager.getInstance().showPopupPrompt(args);
    }
    private onUserActive(): void {
        this.lastActiveTime = (new Date()).getTime();
    }


    /**检查是否可播放音效 */
    public checkCanPlayEffect(): boolean {
        return true;
    }

    /**显示普通中奖提示表现(针对不同品牌公共库可以在继承类里重写这个方法,例如PT手机版的普通版的弹框)*/
    public showNormalRewardTip(winCoin,showMoveTime?: number, numberAddTime?: number):void{}

    //#endregion


    //结算界面
    private settlementAni: cc.Node = null;

    public addsettlementAni(event: string, money: any, cb: Handler): void {
        //SoundMger.instance.playEffect(SOUND_NAME.Free_Game_Settlement);
        if (this.settlementAni) {
            (this.settlementAni.getComponent("SettlementAni") as SettlementAni).play(money, this.settlementAniPlayComplete.bind(this, cb));
        } else {
            game.ResLoader.getInstance().loadRes("slot_common/settlementAni/prefab/settlementAni" + this.getSkin(), cc.Prefab, (err: any, pre: cc.Prefab) => {
                if (!err) {
                    this.settlementAni = cc.instantiate(pre);
                    LayerManage.addChildIndex(this.settlementAni, LayerManage.tip);
                    (this.settlementAni.getComponent("SettlementAni") as SettlementAni).play(money, this.settlementAniPlayComplete.bind(this, cb));
                } else {
                    cb.run();

                }
            }, "slot", "AbstractMainView_settlementAni");
        }

    }
    private settlementAniPlayComplete(cb: Handler): void {
        cb.run();
    }

    public getSkin(skinId?: number): string {
        skinId = skinId == undefined ? GData.skinId : skinId;
        switch (skinId) {
            case 1:
                return "";
            case 2:
                return "_skin2";
            case 3:
                return "_skin3";
            default:
                return "";
        }
    }
}