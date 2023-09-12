import JTControlScrollerGroup from "./JTControlScrollerGroup";
import JTLogger from "../JTLogger";
import JTLayerFactory from "../com/factorys/JTLayerFactory";
import JTChildFactory from "../com/factorys/JTChildFactory";
import JTScatterGridRender from "../lines/JTScatterGridRender";
import JTItemRender from "../com/base/JTItemRender";
import JTContainer from "../com/base/JTContainer";
import JTFactory from "../com/factorys/JTFactory";
import JTMask from "../com/base/JTMask";
import JTItemSkinLoader from "../com/base/JTItemSkinLoader";
import JTTaskPipeline from "../com/tasks/JTTaskPipeline";
import JTLineRender from "../lines/JTLineRender";
import JTChannelPipeline from "../com/plugins/JTChannelPipeline";
import JTScrollerLineParser from "../lines/JTScrollerLineParser";
import JTBlackBackGround from "../renders/JTBlackBackGround";
import JTEffectContainer from "./JTEffectContainer";
import JTLayerSortContainer from "../layerSort/JTLayerSortContainer";
import JTBaseLogicFactroy from "../com/factorys/JTBaseLogicFactroy";
import JTScrollerGroupMask from "../masks/JTScrollerGroupMask";
import { GData } from "../../../../common/utils/GData";

/*
* name;//带线滚轴组
*/
export default class JTLineScrollerGroup extends JTControlScrollerGroup {
    protected _lineCount: number = 0;//线的数量
    protected _lineContainer: JTContainer = null;//线容器
    protected _flashLineContainer: JTContainer;

    protected _gridContainer: JTContainer = null;//中奖格子容器
    protected _frameContainer: JTContainer = null;//滚轴前框容器
    protected _interval: number = 0;//线轮播间隔时间
    protected _showTime: number = 0;//点击数字按钮线停留时间
    protected _lineParser: JTScrollerLineParser = null;//线的解析类
    protected _lineMask: JTMask = null;//线遮罩
    protected _effectBelowContainer: JTContainer = null;
    protected _effectAboveContainer: JTContainer = null;
    protected _buttonsComponent: cc.Node = null;//数字按钮容器
    protected _onClickLineCall: Function = null;//点击数字按钮回调函数
    protected _lineTime: cc.ActionInterval = null;//点击数字按钮的lineTime
    protected _lineConfig: any = null;//游戏滚轴配置
    protected _factoryLogic: JTFactory = null;//逻辑工厂
    protected _taskPipeline: JTTaskPipeline = null;//结束过后的任务通道
    protected _scatterRender: JTScatterGridRender = null;
    protected _onceWildContainer: JTContainer = null; //一次百搭扩展容器
    protected _dynamicWildContainer: JTContainer = null;//动态次数百搭扩展容器
    protected _extensionItems: JTItemSkinLoader[] = null;//未实现
    protected _lineNumContainer: JTContainer = null;
    protected _scatterblackBackGround: JTBlackBackGround = null;//


    protected _blackBackGround: JTBlackBackGround = null;//


    protected _showImageInterval: number = 0;//显示原来图片间隔时间

    protected _playRenderInterval: number = 0;

    constructor() {
        super();
    }

    /**
     * 
     * @param layer 层级工厂
     * @param child 子级工厂
     * @param logic 逻辑工厂
     * @param model 数据工厂
     */
    public setupFactory(layer: JTFactory, child?: JTFactory, logic?: JTFactory, model?: JTFactory): JTChannelPipeline {
        super.setupFactory(layer, child);
        if (!logic) logic = new JTBaseLogicFactroy();
        this._factoryLogic = logic;
        this.factoryLogic.bind(this, this.caller);
        return this._channelPipeline;
    }

    /**
     * 线滚轴的配置参数
     * @param config 配置
     * @param interval 轮播线的时间间隔
     * @param component //线按钮容器
     * @param lineCount //线数
     * @param showTime //线按钮点击过后线的显示间隔时间
     * @param onClickLineCall //单击线按钮回调
     */
    public setupLines(config: any, interval: number, component: cc.Node, lineCount: number, showTime: number = 1500, onClickLineCall?: Function, showImageInterval: number = 0, maskSize?: cc.Size, playRenderInterval: number = 0): void {

        if (showImageInterval > interval || showImageInterval < 0 || interval < 0) {
            JTLogger.error("Invalid `interval` or `showImageInterval`, please check out!");
        }
        this._lineTime = new cc.ActionInterval();
        this._lineConfig = config;
        this._lineCount = lineCount;

        this._interval = interval;
        this._showTime = showTime;
        this._onClickLineCall = onClickLineCall;
        this._showImageInterval = showImageInterval;

        this._playRenderInterval = playRenderInterval

        this._lineParser = this.factoryLogic.produce(JTBaseLogicFactroy.SCROLLER_LINE_PARSE, this) as JTScrollerLineParser;

        //this._lineMask = this._factoryLayer.produce(JTLayerFactory.LINE_MASK_TYPE, this) as JTIMask;
        this._lineContainer = this._factoryLayer.produce(JTLayerFactory.LINE_CONTAINER, this,"lineContainer") as JTContainer;
        this._flashLineContainer = this._factoryLayer.produce(JTLayerFactory.FLASH_LINE_CONTAINER, this, "flashLineContainer") as JTContainer;
        this._frameContainer = this._factoryLayer.produce(JTLayerFactory.FRONT_FRAME_CONTAINER, this ,"frameContainer") as JTContainer;
        this._gridContainer = this._factoryLayer.produce(JTLayerFactory.GIRD_CONTAINER, this, "gridContainer") as JTContainer;
        this._effectAboveContainer = this.factoryLayer.produce(JTLayerFactory.EFFECT_ABOVE_CONTAINER, this, "effectAboveContainer") as JTContainer;
        this._effectBelowContainer = this.factoryLayer.produce(JTLayerFactory.EFFECT_BELOW_CONTAINER, this, "effectBelowContainer") as JTContainer;

        this._scrollerGroupMask = this.factoryLayer.produce(JTLayerFactory.SCROLLER_MASK_CONTAINER, this) as JTScrollerGroupMask;

        this._layerSortPlayContainer = this.factoryLayer.produce(JTLayerFactory.LAYER_SORT_PLAY_RENDER, this, "layerSortPlayContainer") as JTLayerSortContainer;
        this._layerSortStopContainer = this.factoryLayer.produce(JTLayerFactory.LAYER_SORT_STOP_RENDER, this ,"layerSortStopContainer") as JTLayerSortContainer;
        this._onceWildContainer = this.factoryLayer.produce(JTLayerFactory.WILD_FIEXD_TYPE, this) as JTContainer;
        this._dynamicWildContainer = this.factoryLayer.produce(JTLayerFactory.WILD_RONDOM_TYPE, this) as JTContainer;
        this._blackBackGround = this.factoryLayer.produce(JTLayerFactory.SCOLLER_GROUP_BLACK_BACK_GROUND, this) as JTBlackBackGround;

        this._layerSortScatterPlayContainer = this.factoryLayer.produce(JTLayerFactory.LAYER_SORT_SCATTER_PLAY_CONTAINER, this, "layerSortScatterPlayContainer") as JTLayerSortContainer;

        this._layerSortScatterStopContainer = this.factoryLayer.produce(JTLayerFactory.LAYER_SORT_SCATTER_STOP_CONTAINER, this,"layerSortScatterStopContainer") as JTLayerSortContainer;
        this._scatterblackBackGround = this.factoryLayer.produce(JTLayerFactory.SCATTER_BLACK_BACK_GROUND, this) as JTBlackBackGround;

        this._lineNumContainer = this.factoryLayer.produce(JTLayerFactory.LINE_NUMBER_CONTAINER, this) as JTBlackBackGround;

        this._taskPipeline = this.factoryLogic.produce(JTBaseLogicFactroy.TASK_PIPELINE_LOGIC, this) as JTTaskPipeline;
        this._scatterRender = this.factoryChild.produce(JTChildFactory.SCATTER_TYPE, this,"scatterRender") as JTScatterGridRender;
        (this._taskPipeline as JTTaskPipeline).bind(this, this);
        this._buttonsComponent = component;
        this._scatterRender && (this._scatterRender as JTScatterGridRender).initialize();
        this._lineParser && this._lineParser.initialize();
        this.initializeLayer();
        let logic: JTBaseLogicFactroy = this.factoryLogic as JTBaseLogicFactroy;
        logic.registerFlowOptions();
        logic.adjustFlowOptions();
        this.setupOptions(this._taskPipeline, logic.getOptions());
        this._lineMask && this._lineMask.launch(this);

        if (this._lineContainer) {
            let c = this.config;
            let width = c.gapWidth * c.col;
            let node = new cc.Node("LineMaskContainer");
            node.addComponent(cc.Mask);
            node.setContentSize(2.5 * width, 2.5 * c.gapHeight * c.row);
            this._lineContainer.addChild(node);
        }

        this.afterInitializeLayer();

        let lineAniCofig = GData.getParameter("lineAniConfig");
        if (lineAniCofig && lineAniCofig.lineAttrConfig && lineAniCofig.lineAttrConfig.isShowAllLine) {
            this.isShowAllLine = true;
        }

    }

    /**
     * 单击数字按钮所触发的回调
     * @param e 
     */
    private onSelectLineButtonHandler(e: cc.Event.EventTouch): void {
        let target: cc.Object = e.target["$owner"] as cc.Object;//cocosevent
        let targetName: string = target.name;
        let count: number = parseInt(targetName.replace(/[^0-9]/ig, ""));
        if (!isNaN(count) && targetName.indexOf("img_") != -1) {
            let isCan: boolean = this._onClickLineCall.apply(this.caller, [count]);
            if (!isCan) return;
            this.clear();
            this._lineTime = cc.sequence(cc.fadeOut(this._showTime / 1000), cc.callFunc(this.clear, this));
            (this.lineContainer as JTContainer).runAction(this._lineTime);//cocos

            // cc.tween(this.lineContainer)
            //     .to(this._showTime / 1000, {alpha: 0})
            //     .call(Handler.create(this, this.clear))
            //     .start()

            // this._lineTime.to(this.lineContainer, {alpha: 0}, this._showTime, null, Laya.Handler.create(this, this.clear));
            this.showLines(count);
            this.showLineButtonGroup(count);
        }
    }

    /**
     * 重写ui视图创建
     */
    public create(): void {
        this._items = [];
        this.createScrollers();
        this._isBackgroundFill && this.backgroundFill();
    }

    /**
     * 
     * @param lineCount 
     */
    public showLineButtonGroup(lineCount: number): void {
        this._lineParser && this._lineParser.showLineButtonGroup(lineCount);
    }

    /**
     * 
     * @param lineId 
     * @param isVisible 
     */
    public showLineButton(lineId: number, isVisible: boolean): void {
        this._lineParser && this._lineParser.showLineButton(lineId, isVisible);
    }

    public layoutScrollerLayer(rs: JTItemRender[]): void {
    }

    /**
     * 点击数字按钮需要用到的缓动对像
     */
    public get lineTime(): cc.ActionInterval {
        return this._lineTime;
    }

    /**
     * 显示线
     * @param lineId 线ID
     * @param isVisible 是否隐藏
     */
    public showLine(lineId: number, isVisible: boolean): void {
        this._lineParser && this._lineParser.showLine(lineId, isVisible);
    }

    /**
     * 开始运行滚轴
     * @param speed 滚轴的速度
     * @param delay 每一列滚轴的延迟
     * @param time 滚动时间
     * @param distance 开始、结束 回弹距离 
     * @param beginTime 开、结束回弹时间
     */
    public start(speed: number, delay: number = 20, time: number = 3000, distance: number = 80, beginTime: number = 150, endDelayTime: number = 20, endDistance: number = 80, endTime = 150): void {
        this.clear();
        super.start(speed, delay, time, distance, beginTime, endDelayTime, endDistance, endTime);
    }

    public resetLayoutScrollerLayer(): void {

    }

    /**
     * 通过线ID获取线的渲染器
     * @param lineId 线ID 
     */
    public getLineRender(lineId: number): JTLineRender {
        return this._lineParser.lineMap.get(lineId);
    }

    /**
     * 解析中奖结果
     * @param lines 中奖列表
     * @param complete 播放完成调度（如果不传complete函数，表示线会一直循环切换，如果传了complete函数，则会只播放一次自动停止）
     * @param ifStopWhenComplete 
     * @param isLoopWinThisRound 
     * @param isInitiative
     */
    public parse(lines: any[], complete?: Function, ifStopWhenComplete: boolean = false, isLoopWinThisRound: boolean = true, isInitiative: boolean = true, isLoopGlobalLines: boolean = false): void {
        if (this._lineParser) {

            if (lines !== null || !this._lineParser.lineResults) {
                this._lineParser.lineResults = !lines ? [] : lines;
            }
            this._lineParser.lineComplete = complete;
            this._lineParser.ifStopWhenComplete = ifStopWhenComplete;
            this._lineParser.isLoopWinInThisRound = isLoopWinThisRound;
            this._lineParser.isInitiative = isInitiative;
            this._lineParser.isLoopGlobalLines = isLoopGlobalLines;
        }
        if (this._taskPipeline) {
            let t: JTTaskPipeline = this._taskPipeline as JTTaskPipeline;
            t.handler = this.launchParse;
            t.start();
        }
    }

    public launchParse(): void {
        // this.lineParser && this.lineParser.autoParse();
    }

    /**
     * 显示线数
     * @param count 线数
     */
    public showLines(count: number): void {
        this._lineParser && this._lineParser.showLines(count);
    }

    /**
     * 清除（目前只清除以下几种情况）
     * @1、清除点击数字按钮缓动过渡效果
     * @2、滚轴停止切换线的效果
     * @3、线的透明度
     * @4、线解析器的操作
     */
    public clear(): void {
        this._lineTime && (this._lineTime = null);
        if (this._taskPipeline) {
            (this._taskPipeline as JTTaskPipeline).clear();
        }
        if (this.lineContainer) {
            (this.lineContainer as any).opacity = 255;
        }
        if (this._lineParser) {
            this._lineParser && this._lineParser.clear();
        }
    }


    /**
     * 线遮罩
     */
    public get lineMask(): JTMask {
        return this._lineMask;
    }
    /**
     * 前框容器（一些特殊游戏需要用到前框来显示一种效果）
     */
    public get frameContainer(): JTContainer {
        return this._frameContainer;
    }
    /**
     * 前框容器（一些特殊游戏需要用到前框来显示一种效果）
     */
    public set frameContainer(value: JTContainer) {
        this._frameContainer = value;
    }
    /**
     * 线容器
     */
    public get lineContainer(): JTContainer {
        return this._lineContainer;
    }
    /**
     * 线容器
     */
    public set lineContainer(value: JTContainer) {
        this._lineContainer = value;
    }

    /**
     * 线容器
     */
    public get flashLineContainer(): JTContainer {
        return this._flashLineContainer;
    }
    /**
     * 线容器
     */
    public set flashLineContainer(value: JTContainer) {
        this._flashLineContainer = value;
    }

    /**
     * 格子容器
     */
    public get gridContainer(): JTContainer {
        return this._gridContainer;
    }

    /**
     * 格子容器
     */
    public set gridContainer(value: JTContainer) {
        this._gridContainer = value;
    }

    /**
     * 任务通道
     */
    public get taskPipeline(): JTTaskPipeline {
        return this._taskPipeline;
    }

    /**
     * 中奖线切换时间
     */
    public get interval(): number {
        return this._interval;
    }

    /**
    * 中奖线切换时间
    */
    public set interval(value: number) {
        this._interval = value;
    }

    /**
     * MG免费游戏中播放总展示时是否需要中奖线
     */
    public get isShowAllLine(): boolean {
        return this._isShowAllLine;
    }
    public set isShowAllLine(v: boolean) {
        this._isShowAllLine = v;
    }
    private _isShowAllLine: boolean = false;

    /**
     * MG播放总展示的时间
     */
    public get showAllLineTimes(): number {
        return this._showAllLineTimes;
    }
    public set showAllLineTimes(v: number) {
        this._showAllLineTimes = v;
    }
    private _showAllLineTimes: number = 500;

    /**
     * 线个数
     */
    public get lineCount(): number {
        return this._lineCount;
    }

    /**
     * 线配置
     */
    public get lineConfig(): any {
        return this._lineConfig;
    }

    /**
     * 线个数
     */
    public set lineCount(value: number) {
        this._lineCount = value;
    }

    /**
     * 线按钮面板
     */
    public get buttonsComponent(): cc.Node {
        return this._buttonsComponent;
    }

    /**
     * 特效容器-目前飘字是添加到此层上面的
     */
    public get effectAboveContainer(): JTContainer {
        return this._effectAboveContainer;
    }

    /**
     * 特效容器-目前飘字是添加到此层上面的
     */
    public get effectBelowContainer(): JTContainer {
        return this._effectBelowContainer;
    }
    /**
     * 线解析器
     */
    public get lineParser(): JTScrollerLineParser {
        return this._lineParser;
    }
    /**
     * 逻辑工厂
     */
    public get factoryLogic(): JTFactory {
        return this._factoryLogic;
    }

    /**
     * 分散和特殊元素容器
     */
    public get scatterRender(): JTScatterGridRender {
        return this._scatterRender;
    }
    /**
     * 分散和特殊元素容器
     */
    public set scatterRender(value: JTScatterGridRender) {
        this._scatterRender = value;
    }
    /**
     * 一次百搭容器
     */
    public get onceWildContainer(): JTContainer {
        return this._onceWildContainer;
    }
    /**
     * 动态百搭容器
     */
    public get dynamicWildContainer(): JTContainer {
        return this._dynamicWildContainer;
    }

    //扩展。。。。 
    public get extensionItems(): JTItemSkinLoader[] {
        return this._extensionItems;
    }

    //扩展。。。。 
    public get lineNumContainer(): JTContainer {
        return this._lineNumContainer;
    }

    public get scatterblackBackGround(): JTBlackBackGround {
        return this._scatterblackBackGround;
    }

    /**
    * 图片间隔时间
    */
    public get showImageInterval(): number {
        return this._showImageInterval;
    }

    /**
    * 滚轴半透明黑背景
    */
    public get blackBackGround(): JTBlackBackGround {
        return this._blackBackGround;
    }

    /**
    * 中奖线时元素的播放间隔
    */
    public get playRenderInterval(): number {
        return this._playRenderInterval;
    }

    layoutLandscape(): void {
        super.layoutLandscape();
        if (this.effectAboveContainer && this.effectAboveContainer instanceof JTEffectContainer) {
            this.effectAboveContainer.resetChildrensPosition();
        }

        if (this.effectBelowContainer && this.effectBelowContainer instanceof JTEffectContainer) {
            this.effectBelowContainer.resetChildrensPosition();
        }
    }

    layoutPortrait(): void {
        super.layoutPortrait();
        if (this.effectAboveContainer && this.effectAboveContainer instanceof JTEffectContainer) {
            this.effectAboveContainer.resetChildrensPosition();
        }
        if (this.effectBelowContainer && this.effectBelowContainer instanceof JTEffectContainer) {
            this.effectBelowContainer.resetChildrensPosition();
        }

    }

    /**
    * 设置程序画线透明度(无间隔画线)
    */
    public get runTimeLineOpacity(): number {
        return this._runTimeLineOpacity;
    }
    public set runTimeLineOpacity(v: number) {
        this._runTimeLineOpacity = v;
    }
    /**程序画线透明度(无间隔画线)*/
    protected _runTimeLineOpacity: number = 255;
}