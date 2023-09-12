import JTChannelScrollerGroup from "../Scroller/extensions/JTChannelScrollerGroup";
import JTScroller from '../Scroller/com/JTScroller';
import SpinManager from '../SlotManager/SpinManager';
import { DrawLineType, WinType, SlotOrientation } from '../SlotDefinitions/SlotEnum';
import FreeGameManager from '../SlotManager/FreeGameManager';
import GlobalQueueManager from '../SlotManager/GlobalQueueManager';
import { Handler } from '../SlotUtils/Handle';
import SlotConfigManager from '../SlotManager/SlotConfigManager';
import JTScrollerSettings from '../Scroller/com/JTScrollerSettings';
import { GameEventNames } from '../SlotConfigs/GameEventNames';
import JTContainer from '../Scroller/com/base/JTContainer';
import PlayerManager from '../SlotManager/PlayerManager';
import { SoundMger } from '../../../sound/script/SoundMger';
import { SOUND_NAME } from '../../../common/enum/CommonEnum';
import JTScrollerGroup from '../Scroller/com/JTScrollerGroup';
import JTLineScrollerGroup from "../Scroller/extensions/JTLineScrollerGroup";
import { SDictionary } from "../SlotData/SDictionary";
import MultipleGameManager from "../SlotManager/MultipleGameManager";
import JTEffectContainer from "../Scroller/extensions/JTEffectContainer";
import { CommonMainView } from "./CommonMainView";
import JTRuleTaskType from "../Scroller/rules/JTRuleTaskType";
import JTScatterTask from "../Scroller/rules/JTScatterTask";
import CustomButton from "../../../common/component/CustomButton";
/**
* SlotMachineView
* 常用接口：
* itemRender:单元格生成器，用于为第个单元格生成视图，默认为:BaseSpinSlotView.creatInstance, 用户也可以定义自己的生成器
* itemRenderHandler:生成渲染单元格时的回调函数,一般用于用户设置（填充）单元格
* gridWidth:单元格的宽度
* gridHeight:单元格的高度
* gridRepeatX:横向单元格数量
* gridRepeatY:纵向单元格数量
* array:数据源数组,类似:SpinSlotData[][]
* 
* eg:
*      slotMachine.array = array;
*      slotMachine.itemRenderHandler = Handler.create(this, this._onSpinSlotRender, null, false);
*      slotMachine.gridWidth = 176;
*      slotMachine.gridHeight = 152;
*      slotMachine.gridRepeatX = 5;
*      slotMachine.gridRepeatY = 3;
*/
const { ccclass, property } = cc._decorator;
/**老虎机滚轴类 */
@ccclass
export default class SlotMachineView extends cc.Component {

    @property(cc.Node)
    scrollContain: cc.Node = null;

    maskLayer: cc.Node = null;

    private _isContext: boolean = false;

    public isSetMask: boolean = false;

    public get scroller(): JTChannelScrollerGroup {
        return this._scroller;
    }
    protected _scroller: JTChannelScrollerGroup = null;

    /**
     * 是否注册鼠标及键盘事件
     */
    protected isRegisterControl: boolean = true;

    public static get instance(): SlotMachineView {
        return SlotMachineView._instance;
    }
    public static _instance: SlotMachineView;

    private scrollerMap: SDictionary = null;

    private _gameLayer: CommonMainView = null;

    onLoad() {
        SlotMachineView._instance = this;
        this._addEventListener();
        // 创建滚轴
        //this.createScrollers();
        console.log("slotmachine onload");

    }

    private createScroller(): JTChannelScrollerGroup {
        return this.gameLayer.createScoller();
    }

    public createScrollers(): void {
        if (SlotConfigManager.instance.isMultipleGame) {
            this.scrollerMap = new SDictionary();
            for (let gameID of SlotConfigManager.instance.gameIDs) {
                let scroller = this.createScroller();
                this.scrollerMap.set(gameID, scroller);
                scroller.gameID = gameID;
                scroller.bind(null, this);
            }
            this._scroller = this.scrollerMap.get(SlotConfigManager.instance.gameID);
        } else {
            this._scroller = this.createScroller();
            this._scroller.gameID = SlotConfigManager.instance.gameID;
            this._scroller.bind(null, this);
        }
    }



    public changeScrollerByGameID(gameID: number): void {
        SlotConfigManager.instance.changeGameID(gameID);
        for (let id of SlotConfigManager.instance.gameIDs) {
            let scroller = this.scrollerMap.get(id) as JTChannelScrollerGroup;
            if (gameID == id) {
                scroller.active = true;
                scroller.enabled = true;
                this._scroller = scroller;
                this._scroller.clear();
                this._scroller.reRender(MultipleGameManager.instance.nextGrid, MultipleGameManager.instance.nextGridChanged);
                this._scroller.updateRenders();
                this._scroller.resetLayerSort();
                this._scroller.updateChangedChildsLayer([], true);
                this.gameLayer.onChangeScrollerComplte(gameID, scroller);
                this.gameLayer.changeMaskPointByGameID(gameID);
            } else {
                scroller.active = false;
                scroller.enabled = false;
                scroller.clear();
                scroller.reset();
            }
        }

        if (!FreeGameManager.instance.hasFreeGame) {
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_UPDATE_WINSCORE, 0, false);
        }

    }

    public getScrollerByGameID(gameID: number): JTChannelScrollerGroup {
        let scroller = this.scrollerMap.get(gameID);
        return scroller;
    }

    public set gameLayer(value: CommonMainView) {
        this._gameLayer = value;
    }

    public get gameLayer(): CommonMainView {
        return this._gameLayer;
    }

    public set isContext(value: boolean) {
        console.log("SlotMachineView.isContext has been expired");
        this._isContext = value;
    }

    public get isContext(): boolean {
        console.log("SlotMachineView.isContext has been expired");
        return this._isContext;
    }

    public beginScrolling(s: JTScroller): void {
        this._spinStartHandler && this._spinStartHandler.runWith([s.index]);
    }

    public getScroller(): JTLineScrollerGroup {
        return this._scroller as JTLineScrollerGroup;
    }

    /**
     * 是否激活滚轴遮罩(滚轴停止后去掉遮罩，显示完整的元素)
     * @param boo 
     */
    public isEnabledMask(boo: boolean): void {
        if (!this.isSetMask) return;
        let mask = this.node.parent.getComponent(cc.Mask);
        mask.enabled = boo;
    }

    public scrollingComplete(): void {
        this._spinCompleteHandler && this._spinCompleteHandler.run();
        this._allStopped();
        this.isEnabledMask(false);
        !this.isRunCusParseOverHandler && game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SLOT_MACHINE_STOPPED);
        PlayerManager.instance.syncShowingCoin();

        this._isRolling = false;
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SLOT_RUN_STOPPED);

        let isLoopWinInThisRound = FreeGameManager.instance.hasFreeGame && !FreeGameManager.instance.isTreateFreeOver ? false : true;
        this._scroller.parse(SpinManager.instance.flattenLineRewardsResults, () => {
            this.onParseTaskOver();
        }, false, isLoopWinInThisRound, true, this.isLoopGlobalLines);
    }

    /**
     * 单个滚轴停止完成的回调
     */
    private _spinStopHandler: Handler = null;

    /**
     * 单个滚轴开始时的回调
     */
    private _spinStartHandler: Handler = null;

    /**
     * 所有滚轴开始滚动的回调
     */
    private _spinBeginHandler: Handler = null;

    /**
     * 所有滚轴停止时的回调
     */
    private _spinCompleteHandler: Handler = null;

    public scrollingProgress(s: JTScroller): void {
        let isManual: boolean = (s.owner as JTScrollerGroup).isManualStop;
        let column: number = SlotConfigManager.instance.DataGame.getData(SlotConfigManager.instance.gameID).column;
        this._stopCompleted([s.index, this, isManual]);
    }

    dispose() {
        if (this._scroller) {
            this._scroller.destroy();
        }
        this._removeEventListener();
        SlotMachineView._instance = null;
        this._spinStopHandler && this._spinStopHandler.clear();
        this._spinStopHandler = null;
        this._spinStartHandler && this._spinStartHandler.clear();
        this._spinStartHandler = null;
        this._spinBeginHandler && this._spinBeginHandler.clear();
        this._spinBeginHandler = null;
        this._spinCompleteHandler && this._spinCompleteHandler.clear();
        this._spinCompleteHandler = null;
        this._itemRenderHandler && this._itemRenderHandler.clear();
        this._itemRenderHandler = null;
        //this._animationCompleteHandler && this._animationCompleteHandler.clear();
        //this._animationCompleteHandler = null;
        this._continuousNotWinHandler && this._continuousNotWinHandler.clear();
        this._continuousNotWinHandler = null;
        this._greatRewardsAnimationHandler && this._greatRewardsAnimationHandler.clear();
        this._greatRewardsAnimationHandler = null;
        this._middleRewardsAnimationHandler && this._middleRewardsAnimationHandler.clear();
        this._middleRewardsAnimationHandler = null;
        this._smallRewardsAnimationHandler && this._smallRewardsAnimationHandler.clear();
        this._smallRewardsAnimationHandler = null;
        this._fullLineAnimationHandler && this._fullLineAnimationHandler.clear();
        this._fullLineAnimationHandler = null;
        this._afterRender && this._afterRender.clear();
        this._afterRender = null;
        this._defaultNormalRewardsAnimationHandler && this._defaultNormalRewardsAnimationHandler.clear();
        this._defaultNormalRewardsAnimationHandler = null;
    }

    /**
 * 画线的类型（原生画或者图片)
 */
    public get drawLineType(): DrawLineType {
        return this._drawLineType;
    }
    public set drawLineType(v: DrawLineType) {
        this._drawLineType = v;
    }

    private _lineIdComponent: cc.Node = null;
    /**
     * 线id容器 节点
     */
    public get lineIdComponent(): cc.Node {
        return this._lineIdComponent;
    }
    public set lineIdComponent(v: cc.Node) {
        this._lineIdComponent = v;
    }

    private _isAutoFreeGame: boolean = true;
    /**
     * 是否自动下一局免费游戏
     */
    public get isAutoFreeGame(): boolean {
        return this._isAutoFreeGame;
    }
    public set isAutoFreeGame(v: boolean) {
        this._isAutoFreeGame = v;
    }


    private _isResetRewardAni: boolean = true;
    /**
     * 是否重置总展示的中奖动画（PT轮播时不切换动画）
     */
    public get isResetRewardAni(): boolean {
        return this._isResetRewardAni;
    }
    public set isResetRewardAni(v: boolean) {
        this._isResetRewardAni = v;
    }

    /** PT 是否是 免费中 再中了免费 */
    private _isFreeGameAgain: boolean = false;
    public get isFreeGameAgain(): boolean {
        return this._isFreeGameAgain;
    }
    public set isFreeGameAgain(v: boolean) {
        this._isFreeGameAgain = v;
    }

    private _isLoopGlobalLines: boolean = false;
    /**
     * 轮播中是否总展示
     */
    public get isLoopGlobalLines(): boolean {
        return this._isLoopGlobalLines;
    }
    public set isLoopGlobalLines(v: boolean) {
        this._isLoopGlobalLines = v;
    }
    private _drawLineType: DrawLineType = DrawLineType.Draw;

    /**
     * 画框的类型（原生画或使用图片)
     */
    public get drawPaneType(): DrawLineType {
        return this._drawPaneType;
    }
    private _drawPaneType: DrawLineType = DrawLineType.Draw;


    /**
     * 横屏下的遮罩宽
     */
    public get maskWidthLandscape(): number {
        return this._maskWidthLandscape;
    }
    public set maskWidthLandscape(v: number) {
        this._maskWidthLandscape = v;
    }
    private _maskWidthLandscape: number = 0;

    /**
    * 横屏下的遮罩高
    */
    public get maskHeightLandscape(): number {
        return this._maskHeightLandscape;
    }
    public set maskHeightLandscape(v: number) {
        this._maskHeightLandscape = v;
    }
    private _maskHeightLandscape: number = 0;

    /**
     * 竖屏下的遮罩高
     */
    public get maskHeightPortrait(): number {
        return this._maskHeightPortrait;
    }
    public set maskHeightPortrait(v: number) {
        this._maskHeightPortrait = v;
    }
    private _maskHeightPortrait: number = 0;
    /**
     * 竖屏下的遮罩宽
     */
    public get maskWidthPortrait(): number {
        return this._maskWidthPortrait;
    }
    public set maskWidthPortrait(v: number) {
        this._maskWidthPortrait = v;
    }
    private _maskWidthPortrait: number = 0;

    /**
    * spin的间隔
     */
    public get spaceX(): number {
        return this._spaceX;
    }
    public set spaceX(v: number) {
        this._spaceX = v;
    }
    private _spaceX: number = 0;

    /**
* spin的间隔
 */
    public get spaceY(): number {
        return this._spaceY;
    }
    public set spaceY(v: number) {
        this._spaceY = v;
    }
    private _spaceY: number = 0;

    /**
   * 横屏下格子的X间隔
   */
    public get spaceXLandscape(): number {
        return this._spaceXLandscape !== undefined ? this._spaceXLandscape : this.spaceX;
    }
    public set spaceXLandscape(v: number) {
        this._spaceXLandscape = v;
    }
    private _spaceXLandscape: number;



    /**
     * 横屏下格子的Y间隔
     */
    public get spaceYLandscape(): number {
        return this._spaceYLandscape !== undefined ? this._spaceYLandscape : this.spaceY;
    }
    public set spaceYLandscape(v: number) {
        this._spaceYLandscape = v;
    }
    private _spaceYLandscape: number;

    /**
     * 竖屏下格子的X间隔
     */
    public get spaceXPortrait(): number {
        return this._spaceXPortrait !== undefined ? this._spaceXPortrait : this.spaceX;
    }
    public set spaceXPortrait(v: number) {
        this._spaceXPortrait = v;
    }
    private _spaceXPortrait: number;

    /**
     * 竖屏下格子的Y间隔
     */
    public get spaceYPortrait(): number {
        return this._spaceYPortrait !== undefined ? this._spaceYPortrait : this.spaceY;
    }
    public set spaceYPortrait(v: number) {
        this._spaceYPortrait = v;
    }
    private _spaceYPortrait: number;

    /**
     * X轴的格子数量
     */
    public get gridRepeatX(): number {
        return this._gridRepeatX;
    }
    public set gridRepeatX(v: number) {
        this._gridRepeatX = v;
        // this._setSpinClipSize();
        // this.lateAdjustClip();
    }
    private _gridRepeatX = 5;

    /**
     * Y轴的格子数量
     */
    public get gridRepeatY(): number {
        return this._gridRepeatY;
    }
    public set gridRepeatY(v: number) {
        this._gridRepeatY = v;
        // this._setSpinClipSize();
        // this.lateAdjustClip();
    }
    private _gridRepeatY: number = 3;

    /**
     * 格子宽度
     */
    public get gridWidth(): number {
        return this._gridWidth;
    }
    public set gridWidth(v: number) {
        this._gridWidth = v;
        // this._setSpinClipSize();
        // this.lateAdjustClip();
    }
    private _gridWidth: number = 140;

    /**
     * 格子高度
     */
    public get gridHeight(): number {
        return this._gridHeight;
    }
    public set gridHeight(v: number) {
        this._gridHeight = v;
        // this._setSpinClipSize();
        // this.lateAdjustClip();
    }
    private _gridHeight: number = 140;

    // this._showLineInterval, this._showImageInterval
    /**
     * 轮播线的间隔(如果游戏需要轮播过程中展示静态图标，则此时间也包含了展示静态图标的时间)
     */
    public get showLineInterval(): number {
        return this._showLineInterval;
    }
    public set showLineInterval(v: number) {
        this._showLineInterval = v;
    }
    private _showLineInterval: number = 1500;

    /**
     * 中奖时同一条线的播放元素间隔时间，以毫秒为单位
     */
    public get playRenderInterval(): number {
        return this._playRenderInterval;
    }
    public set playRenderInterval(v: number) {
        this._playRenderInterval = v;
    }
    private _playRenderInterval: number = 0;

    /**
     * 轮播线后多少毫秒展示元素图标，此值应该等于０（表示不起效),且小于等于showLineInterval
     */
    public get showImageInterval(): number {
        return this._showImageInterval;
    }
    public set showImageInterval(t: number) {
        this._showImageInterval = t;
    }
    private _showImageInterval: number = 100;


    /**
     * 滚轴是否需要格子遮罩
     */
    public get needSlotMask(): boolean {
        return this._needSlotMask;
    }
    public set needSlotMask(need: boolean) {
        this._needSlotMask = need;
    }
    private _needSlotMask: boolean = true;

    /**
     * 整个滚动轴的方向
     */
    public get orientation(): SlotOrientation {
        return this._orientation;
    }
    public set orientation(direction: SlotOrientation) {
        this._orientation = direction;
    }
    private _orientation: SlotOrientation = SlotOrientation.Portrait;

    public get array(): number[] {
        return this._array;
    }
    public set array(array: number[]) {
        this._array = array;
        this.lateRender();
    }
    private _array: number[] = [];


    /**
     * 单元格渲染回调,当滚轴创建单元格时会进行回调
     */
    public get itemRenderHandler(): Handler {
        return this._itemRenderHandler;
    }
    public set itemRenderHandler(handler: Handler) {
        this._itemRenderHandler = handler;
    }
    private _itemRenderHandler: Handler;


    /**
    * 是否在自动模式下正常轮播一次中奖线 
    */
    public get showLineOnceInAutoTime(): boolean {
        return this._showLineOnceInAutoTime;
    }
    public set showLineOnceInAutoTime(t: boolean) {
        this._showLineOnceInAutoTime = t;
    }
    private _showLineOnceInAutoTime: boolean = false;


    /**当局滚轴是否会有加速*/
    public get hasScrollOnSpeedRunning(): boolean {
        if (this.scroller && this.scroller.getRuleTask) {
            let scatterRule = this.scroller.getRuleTask(JTRuleTaskType.SCATTER) as JTScatterTask;
            if (scatterRule && scatterRule.isRunning) {
                return true;
            }
        }
        return false
    }

    /**滚轴是否正在加速中*/
    public get isScrollOnSpeedRunning(): boolean {
        if (this.scroller && this.scroller.getRuleTask) {
            let scatterRule = this.scroller.getRuleTask(JTRuleTaskType.SCATTER) as JTScatterTask;
            if (scatterRule && scatterRule.onSpeedScrolling) {
                return true;
            }
        }
        return false
    }


    /**
    * 程序画线中奖线是否需要动画显示(默认显示动画)
    */
    public get isGraphicsLineShowAni(): boolean {
        return this._isGraphicsLineShowAni;
    }
    public set isGraphicsLineShowAni(need: boolean) {
        this._isGraphicsLineShowAni = need;
    }
    private _isGraphicsLineShowAni: boolean = true;



    /**
    * 轮播中是否只轮播总展示
    */
    private _isJustLoopGlobalLines: boolean = false;


    /**轮播中是否只轮播总展示 */
    public get isJustLoopGlobalLines(): boolean {
        return this._isJustLoopGlobalLines;
    }

    public set isJustLoopGlobalLines(value: boolean) {
        this._isJustLoopGlobalLines = value;
    }


    /**
    * 支付线轮播中是否隐藏线
    */
    private _hideLinesOnLoop: boolean = false;

    /**支付线轮播中是否隐藏线 */
    public get hideLinesOnLoop(): boolean {
        return this._hideLinesOnLoop;
    }

    public set hideLinesOnLoop(value: boolean) {
        this._hideLinesOnLoop = value;
    }


    /**是否正在播放总展示中奖线 */
    private _onShowGlobalLine: boolean = false;
    /**是否正在播放总展示中奖线 */
    public set onShowGlobalLine(value: boolean) {
        this._onShowGlobalLine = value;
    }
    public get onShowGlobalLine(): boolean {
        return this._onShowGlobalLine;
    }



    /**
     * 持续未中奖动画回调
     */
    private _continuousNotWinHandler: Handler;

    /**
     * 播放总奖励时的动画回调
     */
    private _normalRewardsAnimationHandler: Handler = null;

    /**
     * 大奖动画播放回调
     */
    private _greatRewardsAnimationHandler: Handler = null;

    /**
     * 播放中奖的回调
     */
    private _middleRewardsAnimationHandler: Handler = null;

    /**
     * 播放小奖的回调 
     */
    private _smallRewardsAnimationHandler: Handler = null;

    /**
     * 线上元素全部命中时的动画回调
     */
    private _fullLineAnimationHandler: Handler = null;


    private _settings: JTScrollerSettings = null;

    get settings(): JTScrollerSettings {
        return this._settings;
    }
    /**
     * 开始旋转滚轴
     */
    public startRolling() {
        console.log("startrolling");
        // 清除一些缓动
        this._cancelDelayHideLine();
        if (!this._settings) this._settings = new JTScrollerSettings();
        this._settings.updateMode(!SpinManager.instance.isInTurbo || FreeGameManager.instance.hasFreeGame);

        this.gameLayer.beforeScrollerStartRolling();

        let dynamicItemIds: any[] = this.scroller.openItemIds;
        let isOpenItems: boolean = this.scroller.isOpenItems;
        let sequence = this._settings.getRunSequence();
        if (isOpenItems && dynamicItemIds && dynamicItemIds.length > 0) {
            this.scroller.launchItems(dynamicItemIds, this._settings);
        } else if (sequence && sequence.length > 0) {
            this._scroller.launchItemsBySequence(this._settings);
        } else {
            this._scroller.launch(this._settings);
        }
        this._spinBeginHandler && this._spinBeginHandler.run();

        this._stopPlaying();
    }

    public rollingResultResp(): void {
        let spinResult = SpinManager.instance.rollingResult.spinResult;
        this._scroller.onUpdate(spinResult.grid, spinResult.gridChanged, spinResult.realGridShape, spinResult.realGridShapeChanged, spinResult.occupyPosList, spinResult.occupyPosListChanged);
        this._scroller.runningRuleTasks();
        this._scroller.rendersDataReady();
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_GET_ROLLING_RESULT_RESP);
    }

    public resetScroller() {
        this._scroller.reset();
        this._scroller.clear();
        this.gameLayer.onResetScroller();
    }

    public setupScrollerSettings(settings: JTScrollerSettings): void {
        this._settings = settings;
    }

    /**
    * 运行后增加额外运行时间,滚轴转到后调用，仅生效一次
    * @param time 单位 毫秒
    */
    public addExtralRunningTime(time: number): void {
        this.scroller.addRunningTime(time);
    }

    /**
     * 滚轴停止(单个)
     * @param {any} thisObj 方法调用的对象
     * @param {Function} func 回调函数
     * @param {any} [args=null] 回调参数, 同时，回调时会将当前停止的滚轴的索引（从0开始）附加到自定参数列表之后
     */
    public onSpinStop(thisObj: any, func: Function, args?: any[]) {
        this._spinStopHandler = Handler.create(thisObj, func, args, false);
    }

    /**
     * 滚轴开始滚动(单个)
     * @param {any} thisObj 方法调用的对象
     * @param {Function} func 回调函数
     * @param {any} [args=null] 回调参数, 同时，回调时会将当前开始滚动的滚轴的索引（从0开始）附加到自定参数列表之后
     */
    public onSpinStart(thisObj: any, func: Function, args?: any[]) {
        this._spinStartHandler = Handler.create(thisObj, func, args, false);
    }

    /**
     * 滚轴开始滚动或掉落(所有)
     * @param {any} thisObj 方法调用的对象
     * @param {Function} func 回调函数
     * @param {any} [args=null] 回调参数, 同时，回调时会将当前开始滚动的滚轴的索引（从0开始）附加到自定参数列表之后
     */
    public onSpinBegin(thisObj: any, func: Function, args?: any[]) {
        this._spinBeginHandler = Handler.create(thisObj, func, args, false);
    }

    /**
     * 滚轴结束滚动或掉落(所有)
     * @param {any} thisObj 方法调用的对象
     * @param {Function} func 回调函数
     * @param {any} [args=null] 回调参数, 同时，回调时会将当前开始滚动的滚轴的索引（从0开始）附加到自定参数列表之后
     */
    public onSpinComplete(thisObj: any, func: Function, args?: any[]) {
        this._spinCompleteHandler = Handler.create(thisObj, func, args, false);
    }

    /**
    * 当玩家连续多次未中奖时需要播放的动画
    * @method onContinuousNotWinAnimation
    * @param {any} thisObj 方法调用的对象
    * @param {Function} func 回调函数
    * @param {any[]} [args=null] 回调参数
    * @example 回调示例：_onContinuousNotWinAnimation(winCoin:number, cb:Handler):void
    */
    public onContinuousNotWinAnimation(thisObj: any, func: Function, args?: any[]) {
        this._continuousNotWinHandler = Handler.create(this, (arg: number, complete: Handler) => {
            SpinManager.instance.resetUnHitTimes();

            // 生成参数列表
            let realArgs: any[] = [];
            if (args) realArgs = realArgs.concat(args);
            realArgs.push(arg);
            realArgs.push(complete);

            func.apply(thisObj, realArgs);
        }, null, false);
    }

    /**
     * 添加播放总奖励动画时的回调
     * @method onNormalRewardsAnimation
     * @param {any} thisObj 方法调用的对象
     * @param {Function} func 回调函数
     * @param {any[]} [args=null] 回调参数
     * @example 回调示例：_onNormalRewardsAnimation(winCoin:number, cb:Handler):void
     */
    public onNormalRewardsAnimation(thisObj: any, func: Function, args?: any[]) {
        this._normalRewardsAnimationHandler = Handler.create(this, (win: number, complete) => {
            // 生成参数列表
            let realArgs: any[] = [];
            if (args) realArgs = realArgs.concat(args);
            realArgs.push(win);
            realArgs.push(complete);
            func.apply(thisObj, realArgs);
        }, null, false);
    }

    /**
     * 播放中奖线N个元素全中的动画(某一条线上所有元素全部命中了)
     * @method onFullLineAnimation
     * @param {any} thisObj 方法调用的对象
     * @param {Function} func 回调函数
     * @param {any[]} [args=null] 回调参数
     * @example 回调示例：_onFullLineAnimation(winCoin:number, cb:Handler):void
     */
    public onFullLineAnimation(thisObj: any, func: Function, args: any[] = []) {
        this._fullLineAnimationHandler = Handler.create(this, (win: number) => {
            // //SlotSoundManager.instance.PlayEffect(SoundAssetsConfig.PRIZE_5);
            // 生成参数列表
            let realArgs: any[] = [];
            if (args) realArgs = realArgs.concat(args);
            realArgs.push(win);

            func.apply(thisObj, realArgs);
        }, null, false);
    }

    /**
     * 播放大奖的奖励动画
     * @method onGreatRewardsAnimation
     * @param {any} thisObj 方法调用的对象
     * @param {Function} func 回调函数
     * @param {any[]} [args=null] 回调参数
     * @example 回调示例：_onGreatRewardsAnimation(winCoin:number, cb:Handler):void
     */
    public onGreatRewardsAnimation(thisObj: any, func: Function, args?: any[]) {
        this._greatRewardsAnimationHandler = Handler.create(this, (win: number, complete: Handler) => {
            // //SlotSoundManager.instance.PlayEffect(SoundAssetsConfig.PRIZE_BIG);
            // 生成参数列表
            let realArgs: any[] = [];
            if (args) realArgs = realArgs.concat(args);
            realArgs.push(win);
            realArgs.push(complete);

            func.apply(thisObj, realArgs);
        }, null, false);
    }

    /**
     * 播放中等奖的奖励动画
     * @method onMiddleRewardsAnimation
     * @param {any} thisObj 方法调用的对象
     * @param {Function} func 回调函数
     * @param {any[]} [args=null] 回调参数
     * @example 回调示例：_onMiddleRewardsAnimation(winCoin:number, cb:Handler):void
     */
    public onMiddleRewardsAnimation(thisObj: any, func: Function, args?: any[]) {
        this._middleRewardsAnimationHandler = Handler.create(this, (win: number, complete: Handler) => {
            // //SlotSoundManager.instance.PlayEffect(SoundAssetsConfig.PRIZE_MID);
            // 生成参数列表
            let realArgs: any[] = [];
            if (args) realArgs = realArgs.concat(args);
            realArgs.push(win);
            realArgs.push(complete);

            func.apply(thisObj, realArgs);
        }, null, false);
    }


    /**
     * 播放小奖的奖励动画
     * @method onSmallRewardsAnimation
     * @param {any} thisObj 方法调用的对象
     * @param {Function} func 回调函数
     * @param {any[]} [args=null] 回调参数
     * @example 回调示例：_onSmallRewardsAnimation(winCoin:number, cb:Handler):void
     */
    public onSmallRewardsAnimation(thisObj: any, func: Function, args?: any[]) {
        this._smallRewardsAnimationHandler = Handler.create(this, (win: number, complete: Handler) => {
            // //SlotSoundManager.instance.PlayEffect(SoundAssetsConfig.PRIZE_LITTLE);
            // 生成参数列表
            let realArgs: any[] = [];
            if (args) realArgs = realArgs.concat(args);
            realArgs.push(win);
            realArgs.push(complete);
            func.apply(thisObj, realArgs);
        }, null, false);
    }


    /**
     *是否播放中奖动画中
     */
    public onPlayerRewardAni: boolean = false;
    private onRewardAnimation(event: string, winCoin: number, winType, complete: Handler): void {
        console.log("onRewardAnimation", event, winCoin, winType, complete);
        let setDisableSate: boolean = false;
        let _comCb = () => {
            complete && complete.run();
            this.onPlayerRewardAni = false;
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_MENBTS_SETSTATE, { state: true, num: 1 });
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_AUTOBTN_SETSTATE, true);
            this.gameLayer.showNormalRewardTip(winCoin);
        }
        let cb = Handler.create(this, _comCb);
        switch (winType) {
            case WinType.Great:
                setDisableSate = true;
                this._greatRewardsAnimationHandler && this._greatRewardsAnimationHandler.runWith([winCoin, cb]);
                break;
            case WinType.Middle:
                setDisableSate = true;
                this._middleRewardsAnimationHandler && this._middleRewardsAnimationHandler.runWith([winCoin, cb]);
                break;
            case WinType.Small:
                setDisableSate = true;
                this._smallRewardsAnimationHandler && this._smallRewardsAnimationHandler.runWith([winCoin, cb]);
                break;
            case WinType.Normal:
                setDisableSate = true;
                if (this._normalRewardsAnimationHandler) {
                    this._normalRewardsAnimationHandler.runWith([winCoin, cb]);
                } else {
                    this.gameLayer.showNormalRewardTip(winCoin);
                }
                break;
            case WinType.ContinusUnHitted:
                this._continuousNotWinHandler && this._continuousNotWinHandler.runWith([winCoin, complete]);
                break;
            default:
                complete && complete.run();
        }
        //触发大奖设置状态（暂时用于按钮状态变化 大奖有的按钮需要置灰）
        if (setDisableSate) {
            this.onPlayerRewardAni = true;
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_MENBTS_SETSTATE, { state: false, num: 1 });
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_AUTOBTN_SETSTATE, false);
        } else {
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_MENBTS_SETSTATE, { state: true, num: 1 });
        }
    }

    /**
     * 渲染滚轴时的回调
     * 此接口已经废弃
     * @method onItemRender
     * @param {any} thisObj 方法调用的对象
     * @param {Function} func 回调函数
     * @param {any} [args=null] 回调参数
     */
    public onItemRender(thisObj: any, func: Function, args?: any[]) {
        console.log("SlotMachineView.onItemRender has expired");
        // this._itemRenderHandler = Handler.create(thisObj, func, args, false);
    }

    /**
     * 滚轴滚轴初始化处理完成后的回调，只会回调一次
     * @param thisObj 
     * @param func 
     * @param args 
     */
    public afterRender(thisObj: any, func: Function, args?: any[]) {
        this._afterRender = Handler.create(thisObj, func, args);
    }
    /**
     * 滚轴初始化完成后的回调
     */
    private _afterRender: Handler;

    /**
     * 通过元素在滚轴中的索引获取其在滚轴上的位置
     * @public
     * @for SlotMachineView
     * @method indexInSlotMachine
     * @param {number} indexInSlotMachine 元素在滚轴上的索引，播放动画时，回调函数会传入此索引
     * @return {Laya.Point} 位置信息
     */
    public getPosByIndex(indexInSlotMachine: number): cc.Vec2 {
        return this._scroller.getRenderPoint(indexInSlotMachine);
    }

    /**
     * 通过索引获取滚轴位置
     * @param {number} index 滚轴在滚轴上的索引 
     */
    public getSpinPosByIndex(index: number): cc.Vec2 {
        let s: JTScroller = this._scroller.getItem(index) as JTScroller;
        return new cc.Vec2(s.sourceX, s.sourceY);
    }

    /**
     * 给滚轴添加特效
     * @method addEffect
     * @param {fairygui.GObject} effect 要添加的特效
     * @param {number} index 要添加到位置索引，一般可以相关接口传递
     * @param {number} isAbove 是否添加在元素上层，默认为true
     * @param offset 加在特效层后自定义的偏移量，默认(0,0)
     */
    public addEffect(effect: cc.Node, index: number, isAbove: boolean = true, offset: cc.Vec2 = cc.v2(0, 0)): cc.Node {
        let effectUponContainer: JTContainer = this._scroller.effectAboveContainer as JTContainer;
        let effectBelowContainer: JTContainer = this._scroller.effectBelowContainer as JTContainer;

        if (!effect) {
            return
        }
        if (effect.parent) {
            effect.removeFromParent();
        }
        let effectContainer = isAbove ? effectUponContainer : effectBelowContainer;
        if (effectContainer) {
            if (effectContainer instanceof JTEffectContainer) {
                let p1 = this.scroller.getRenderPointLandscape(index);
                let p2 = this.scroller.getRenderPointPortrait(index);
                effectContainer.setupChild(effect, p1.x + offset.x, p1.y - this.gridHeight / 2 + offset.y, p2.x + offset.x, p2.y - this.gridHeight / 2 + offset.y);
            } else {
                effectContainer.addChild(effect);
                let point: cc.Vec2 = this.getPosByIndex(index);
                effect.x = point.x + offset.x;//- (effect.width - this._gridWidth) * 0.5;
                effect.y = point.y - this.gridHeight / 2 + offset.y;// - (effect.height - this._gridHeight) * 0.5;
            }
        }

        return effect;
    }

    /**
     * 延迟渲染滚轴的单元格
     */
    public lateRender() {
        //cc.director.getScheduler().schedule(this.render, this, 0, 0, 0);
        this.render();
    }


    private _defaultNormalRewardsAnimationHandler: Handler;


    /**
     * 渲染滚轴界面
     */
    public render() {
        console.log("rener");
        //cc.director.getScheduler().unschedule(this.render, this);
        if (SlotConfigManager.instance.isMultipleGame) {
            let curGameID = MultipleGameManager.instance.curGameID;
            for (let gameID of SlotConfigManager.instance.gameIDs) {
                let scroller = this.getScrollerByGameID(gameID);
                SlotConfigManager.instance.changeGameID(gameID);
                let grid = [].concat(SpinManager.instance.lastTimeSpinResult.spinResult.grid);
                let gridChanged = [].concat(SpinManager.instance.lastTimeSpinResult.spinResult.gridChanged);

                let gridRenderConfig = scroller.gridRenderConfig;
                let count = scroller.config.row * scroller.config.col;
                if (gridRenderConfig) {
                    count = 0;
                    for (let col = 0; col < gridRenderConfig.length; col++) {
                        for (let row = 0; row < gridRenderConfig[col].length; row++) {
                            let d = gridRenderConfig[col][row];
                            if (d == 1) {
                                count++;
                            }
                        }
                    }
                }
                let diff = count - grid.length;
                if (diff > 0) {
                    for (let i = 0; i < diff; i++) {
                        grid.push(scroller.getRondomId());
                        gridChanged.push(scroller.getRondomId());
                    }
                } else if (diff < 0) {
                    for (let i = 0; i < -diff; i++) {
                        grid.pop();
                        gridChanged.pop();
                    }
                }

                scroller.onUpdate(grid, gridChanged);
                if (gameID == curGameID) {
                    this._scroller = scroller;
                    this._scroller.enabled = true;
                } else {
                    scroller.active = false;
                    scroller.enabled = false;
                }

                let config: any = SlotConfigManager.instance.DataPayLine;
                let lineCount: number = SlotConfigManager.instance.maxLineNum;
                let size = this.maskLayer.getContentSize();
                let contentSize = cc.size(size.width, size.height);
                scroller.setupLines(config, this._showLineInterval, this.lineIdComponent, lineCount, this._showImageInterval, this.onSelectedLineHandler, this._showImageInterval, contentSize, this._playRenderInterval);
                scroller.registerControl(this._stopActionCB, this._startSpin, this.scrollContain);
                this.node.addChild(scroller);
                this.gameLayer.onScrollerInitComplete(gameID, scroller);
            }

            SlotConfigManager.instance.changeGameID(curGameID);
            this.gameLayer.changeMaskPointByGameID(curGameID);
            this.gameLayer.onMutipleScrollerInit(curGameID);
            this._afterRender && this._afterRender.runWith([this]);
            SpinManager.instance.spinTouchEnable = false;

        } else {
            this.node.addChild(this._scroller as any);
            let spinResult = SpinManager.instance.rollingResult.spinResult;
            this._scroller.onUpdate(spinResult.grid, spinResult.gridChanged, spinResult.realGridShape, spinResult.realGridShapeChanged, spinResult.occupyPosList, spinResult.occupyPosListChanged);

            let config: any = SlotConfigManager.instance.DataPayLine;
            let lineCount: number = SlotConfigManager.instance.maxLineNum;
            let size = this.maskLayer.getContentSize();
            let contentSize = cc.size(size.width, size.height);
            this._scroller.setupLines(config, this._showLineInterval, this.lineIdComponent, lineCount, this._showImageInterval, this.onSelectedLineHandler, this._showImageInterval, contentSize, this._playRenderInterval);
            this._scroller.registerControl(this._stopActionCB, this._startSpin, this.scrollContain);

            // 滚轴初始化设置完成后回调
            this._afterRender && this._afterRender.runWith([this]);
            SpinManager.instance.spinTouchEnable = false;

            let point = this.scroller.maskPolygon;
            point.length > 0 && this.gameLayer.drawMask(point);

        }
        //加异步执行是因为游戏刚开始的时候（例：寻龙探宝）在refreshRoom()因先于RESTORERESP事件监听回调被调用，导致refreshRoom()中未获取到重连数据导致报错。
        //(导致问题原因分析，是因为改了 优先加载配置之后再创建roller预制，导致SlotGameManager类中的方法 loadSigleComplete 中由于缺少配置加载的时间延时导致比之前更早的回调_callback导致)
        setTimeout(() => {
            this.gameLayer.refreshRoom();
        });

    }

    public resetRender(): void {
        this.resetScroller();
        this._scroller.reRender(SpinManager.instance.lastTimeSpinResult.spinResult.grid, SpinManager.instance.lastTimeSpinResult.spinResult.gridChanged);
    }

    private onSelectedLineHandler(): void {

    }

    /**
     * 
     */
    public onSpinPreStop() {
        // this._playReelStopSound();在其他地方处理了
    }

    public makeSureFreeGameOverQueueCorrect(cb: Handler) {
        // if (GlobalQueueManager.instance.getNextTaskName() !== globalTaskFlags.GLOBAL_TASK_FREE_GAME_OVER || this._shownDelayedLineOver) 
        cb.run();
    }


    protected _addEventListener() {
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_START_ROLLING, this._onStartRolling, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_STOP_SLOT_MACHINE_IMMEDIATELY, this._stopImmediatly, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_SHOW_LINESETING_VIEW, this._onshowLineHandler, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_CLOSE_LINESETING_VIEW, this._onCloseLineHandler, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_RESET_LINE_SHOWING, this._resetLineShowing, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_RESET_SCROLLER, this.resetScroller, this);
        //game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_RERENDER_SLOTMACHINE, this._reRender, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_PLAY_REWARD_ANI, this.onRewardAnimation, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_ROLL_RESULT_RESP, this.rollingResultResp, this);
    }

    protected _removeEventListener() {
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_START_ROLLING, this._onStartRolling, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_STOP_SLOT_MACHINE_IMMEDIATELY, this._stopImmediatly, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_SHOW_LINESETING_VIEW, this._onshowLineHandler, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_CLOSE_LINESETING_VIEW, this._onCloseLineHandler, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_RESET_LINE_SHOWING, this._resetLineShowing, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_RESET_SCROLLER, this.resetScroller, this);
        //game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_RERENDER_SLOTMACHINE, this._reRender, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_PLAY_REWARD_ANI, this.onRewardAnimation, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_ROLL_RESULT_RESP, this.rollingResultResp, this);

    }


    private _stopActionCB() {
        this._onMouseDown(null);
    }

    /**
     * 滑动滚轴时通知开始旋转
     */
    private _startSpin() {
        /**
         * 模拟点击单次按钮
         */
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_PLAYER_SLID_SLOTMACHINE);
    }

    /**
     * 通知滚轴的处理完成了（停止并完成了各种表现，主要通知主界面可以恢复交互界面了)
     * @param ifImmediately 
     */
    public _notifySlotMachineComplete(ifImmediately: boolean = false) {
        // if (SpinManager.instance.isSlotMahcineCompleted) return;

        //console.log("_notifySlotMachineComplete",SpinManager.instance.isSlotMahcineCompleted)
        if (SpinManager.instance.isSlotMahcineCompleted || SpinManager.instance.isSlotMachineStopped == false)
            return;
        SpinManager.instance.isSlotMahcineCompleted = true;

        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SLOT_MACHINE_COMPLETED, ifImmediately);
    }
    /**
     * 立即停止
     */
    protected _stopImmediatly() {
        let hasPlay = SoundMger.instance.playEffect(SOUND_NAME.Click_Reel_Stop, false);
        if (!hasPlay) {
            SoundMger.instance.playEffect(SOUND_NAME.Reel_Stop, false);
        }
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FORCE_UPDATE_SPIN_BUTTON, false);
        this._scroller.stopAll();
    }



    protected _isAllAnimationCompleted: boolean = true;


    /**
     * 滚轴完成走的自定义函数，如定义了以及isRunCusParseOver为true时 代替默认的开始尝试旋转新的请求操作
     */
    public cusParseTaskOverHandler: Handler = null;

    private _isRunCusParseOverHandler: boolean = false;
    public set isRunCusParseOverHandler(v: boolean) {
        this._isRunCusParseOverHandler = v;
    }

    /**
     * 是否走自定义的滚轴完成后函数，子项目可根据逻辑在spin结果后修改此值
     */
    public get isRunCusParseOverHandler() {
        return this._isRunCusParseOverHandler;
    }
    /**
     * 解析任务执行完
     */
    public onParseTaskOver() {
        console.log("parseover");
        if (this.isRunCusParseOverHandler && this.cusParseTaskOverHandler) {
            this.cusParseTaskOverHandler.run();
        } else {
            GlobalQueueManager.instance.execute();
            this.scroller.changeDataMode(FreeGameManager.instance.hasFreeGame);
            this.gameLayer.onScrollerFlowComplete();
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FORCE_UPDATE_ALL_SCORE);
            //派发自动游戏状态改变事件
            //this._notifySlotMachineComplete();
            //SpinManager.instance.onFreeOrBonusGameOver();//

            //MG系列1 免费游戏第一次需要点击旋转按钮触发自动转（9罐黄金）
            let isAuto = false;
            if (FreeGameManager.instance.hasFreeGame && (!this.isAutoFreeGame || this.isFreeGameAgain)) {
                this.isAutoFreeGame = true;
                this.isFreeGameAgain = false;
                isAuto = false;
                console.log("onFreeGame>")
            } else {
                isAuto = true;
            }
            SpinManager.instance.onShowLineOver(isAuto);
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SHOW_LINE_OVER);
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SPIN_BUTTON_OPEN, true);
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_AUTO_STATE_CHANGED);
        }

    }

    /**
     * 单个滚轴停止完成
     */
    private _stopCompleted(args) {
        if (this._spinStopHandler) this._spinStopHandler.runWith(args);
    }

    /**
     * 全部滚轴停止了
     */
    private _allStopped() {
        this._stopStartSound();
    }

    /**
     * 重置线展示，主要用于自动转时，在线展示阶段，玩家手动停止了自动流程，此时需要重新按普通转的方式展示线，防止展示完一轮后，既不自动开始下次转，也不再展示线的问题
     */
    private _resetLineShowing() {
        this._scroller.parse(SpinManager.instance.flattenLineRewardsResults);
    }


    public isFreeGameOver: boolean = false;


    /**
     * 如果不在自动游戏中，则通知滚轴完成
     */
    public notifySlotMachineCompleteWhenNotInAuto() {
        if (SpinManager.instance.restAutoTimes === 0 && !FreeGameManager.instance.hasFreeGame) this._notifySlotMachineComplete();
    }


    public get isRolling(): boolean {
        return this._isRolling;
    }
    private _isRolling: boolean = false;
    private _onStartRolling() {
        if (this._isRolling) {
            console.log("error:request to roll when is rolling");
        }
        this.isEnabledMask(true);
        GlobalQueueManager.instance.reset();
        this._isRolling = true;
        this.startRolling();
        this._playStartSound();

    }

    /**
     * 滚轴开始的声音
     */
    private _playStartSound() {
        this._stopStartSound();
        SoundMger.instance.playEffect(SOUND_NAME.Reel_Spin, true);
    }

    private _stopStartSound() {
        SoundMger.instance.stopEffect(SOUND_NAME.Reel_Spin);
    }

    /**
     * 滚轴停止的声音
     */
    private _playReelStopSound() {
        SoundMger.instance.playEffect(SOUND_NAME.Reel_Stop);
    }

    // 初始坐标 记录按下的位置
    private initialVec: cc.Vec2;
    private _onMouseDown(event: cc.Touch) {

        // console.log("mouse down");
        // 如果正在旋转，则停止
        this.initialVec = null;
        if (this._isRolling) {
            // TODO 添加点击滚轴声音
            this._playReelStopSound();
            return game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_PLAYER_CLICKED_SLOTMACHINE, this);
        }
        event && (this.initialVec = event.getLocation());
    }

    private _stopPlaying() {
        // 清除所有的计时器
        // cc.director.getScheduler().unscheduleAllForTarget(this);
    }

    public showAllLine: boolean = true;
    protected _onshowLineHandler() {
        this._cancelDelayHideLine();

        // 显示线时，变为IDLE
        // 恢复图标
        //if ((this._scroller.lineContainer as any).parent)
        //    (this._scroller.lineContainer as any).parent.addChild(this._scroller.lineContainer);
        (this.scroller.lineContainer as any).opacity = 255;
        this._scroller.reset();
        this._scroller.clear();
        SpinManager.instance.checkGlobalQueue();
        if (this.showAllLine == false) {
            return;
        }
        this._scroller.showLines(SpinManager.instance.lineNum);
    }

    private _onCloseLineHandler() {
        this._delayHideLine(0.8);
    }

    private _delayHideLine(time: number) {
        this.scheduleOnce(
            this._doHideLine
            , time)
        //cc.director.getScheduler().schedule(this._doHideLine, this, ms * 0.001)
    }

    private _cancelDelayHideLine() {
        this.unschedule(this._doHideLine);
        //cc.director.getScheduler().unschedule(this._doHideLine, this);
    }

    private _doHideLine() {
        // this._scroller.lineTime.to(this._scroller.lineContainer, { alpha: 0 }, 1000, null, Handler.create(this._scroller, this._scroller.clear));
        var self = this;
        let lineContainer = this._scroller.lineContainer as JTContainer;

        cc.tween(lineContainer)
            .to(1, { opacity: 0 })
            .call(() => {
                self._scroller.clear()
            })
            .start();
    }


    public layoutLandscape(): void {
        this.scroller && this.scroller.layoutLandscape();
        if (this.maskLayer && this.maskHeightLandscape > 0 && this.maskWidthPortrait > 0) {
            this.maskLayer.setContentSize(this.maskWidthLandscape, this.maskHeightLandscape)
        }
    }


    public layoutPortrait(): void {
        this.scroller && this.scroller.layoutPortrait();
        if (this.maskLayer && this.maskWidthPortrait > 0 && this.maskHeightPortrait > 0) {
            this.maskLayer.setContentSize(this.maskWidthPortrait, this.maskHeightPortrait)
        }
    }


    /**
     * 展示中奖线时回调
     * @param lineList 多条线数据
     * @param isShowMoreLine 是否显示多条线
     * @returns true会播放原来的切线音效 false不播放
     */
    public onShowMoreWinLineCb(lineList: any[], isShowMoreLine: boolean): boolean {
        return true;
    }



}