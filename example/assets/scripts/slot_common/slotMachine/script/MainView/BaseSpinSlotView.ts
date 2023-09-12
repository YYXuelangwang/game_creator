import JTDefaultItemRender from "../Scroller/renders/JTDefaultItemRender";
import RollingResult from "../SlotData/RollingResult";
import SlotUtils from '../SlotUtils/SlotUtils';
import BonusGameManager from '../SlotManager/BonusGameManager';
import SlotMachineView from './SlotMachineView';
import SlotGameManager from "../SlotManager/SlotGameManager";
import SlotConfigManager from "../SlotManager/SlotConfigManager";
import JTScroller from "../Scroller/com/JTScroller";
import JTGLoader, { JTGLoaderAssetType, JTGLoaderClipParam, JTGLoaderDragonBonesParam, JTGLoaderParam, JTGLoaderSkeletonParam } from "../Scroller/renders/JTGLoader";
import SpinElementManager from "./SpinElementManager";
import { GData } from "../../../common/utils/GData";

export class SpinSlotData {
    index: number;
    element: number;
    packageName: string;
}

/**
*不完全展示时的元素隐藏的部分位置
*/
export enum SpinSlotHiddenSection {
    None,
    Top,
    Bottom
}

/**
 * 滚动格子的动画类型
 */
export enum SpinSlotAniType {
    /**
     * 骨骼动画
     */
    Ani = 1,

    /**
     * 组件
     */
    Component = 2,

    /**
     * 帧动画
     */
    FrameAni = 3
}
/**
* BaseSpinSlotView
*/
export default class BaseSpinSlotView extends JTDefaultItemRender {

    // private gridLoader:fairygui.GLoader = null;
    protected aboveLoader: JTGLoader = null;
    protected belowLoader: JTGLoader = null;

    protected _realData: number;
    constructor() {
        super();
        // this.gridLoader = new fairygui.GLoader();
        this.isFade = true;
        this.isBlur = false;

        this.isUseDefaultFont = true;

        this.isPlayFullLineAni = true;

        this.aboveLoader = new JTGLoader();
        this.belowLoader = new JTGLoader();

        this.addChild(this.aboveLoader);
        this.addChild(this.belowLoader, -1);
    }

    /**
     * 不完全展示时的元素隐藏的部分位置
     */
    public hiddenSection: SpinSlotHiddenSection = SpinSlotHiddenSection.None;

    /**
     * 混合元素可视行数
     */
    public visibleRow: number = 1;

    /**
     * 混合元素包含的列数
     */
    public mixColumn: number = 1;
    /**
     * 混合元素包含的行数
     */
    public mixRow: number = 1;

    /**
     * 混合元素包含的索引
     */
    public mixIndexs: number[] = [];

    /**
     * 是否使用默认中奖飘字字体
     */
    protected isUseDefaultFont: boolean = false;

    /**
     * 轮播中奖线时是否播放五连动画
     */
    protected isPlayFullLineAni: boolean = false;

    /**
     * 是否在滚动中
     */
    protected isInRolling: boolean = false;

    /**
     * 滚动时是否模糊化
     */
    protected isBlur: boolean = false;

    /**
     * 图标是否要居中
     */
    protected needCenter: boolean = true;

    /**
     * 图标URL
     */
    private _iconName: string = null;

    private _isPoolComponent: boolean = true;

    protected get iconComponent(): cc.Component {
        return this._iconComponent;
    }
    /**
     * 图标组件
     */
    private _iconComponent: cc.Component = null;

    /**
     * 实际数据，realData一般与data相同，特殊需求时比如非固定长度元素时data只是展示的数据
     */
    public get realData(): number {
        return this._realData || this.data;
    }

    public set realData(v: number) {
        this._realData = v;
    }


    /**
     * 是否是可见的渲染器
     * @returns 
     */
    public isVisibleRender(): boolean {
        let scroller = this.owner as JTScroller;
        if (scroller && scroller.renders) {
            return scroller.renders.indexOf(this) > -1;
        } else {
            return false;
        }
    }

    /**
     * 图片加载器地址
     */
    public get iconUrl(): string {
        return this.skinLoader.url;
    }

    /**
     * 填充数据
     * @public
     * @method setData
     * @param {SpinSlotData} [data = null] 格子的数据源
     */
    public setData(data?: SpinSlotData) {
        this._data = data || this._data;
        this.setIcon();
        // this.m_iconLoader.playing = true;

    }

    public play(line: RollingResult, indexLine: number, slotMachine: SlotMachineView): void {
        super.play(line, indexLine, SlotMachineView.instance);
    }

    private fixRenderProperty(oldValue: number, curValue: number): void {
        let scroller = this.owner as JTScroller;
        let c = scroller.config;
        let oldMixConfig = c.getMixElementConfig(oldValue);
        let curMixConfig = c.getMixElementConfig(curValue);

        if (oldMixConfig || curMixConfig) {
            let row = curMixConfig ? curMixConfig.row : 1;
            let column = curMixConfig ? curMixConfig.column : 1;
            this.mixRow = row;
            this.mixColumn = column;
            this.width = c.girdWidth * column + c.gapX * (column - 1);
            this.height = c.girdHeight * row + c.gapY * (row - 1);
        }
        let isUnfixedPropertyChange = false;
        if (c.isUnfixedLengthItem(curValue)) {
            isUnfixedPropertyChange = true;
        }
        if (isUnfixedPropertyChange) {
            let u = c.getUnfixedLengthItemConfigByMapId(curValue);
            let row = u ? u.row : 1;
            let column = u ? u.column : 1;
            this.mixRow = row;
            this.mixColumn = column;
            this.width = c.girdWidth * column + c.gapX * (column - 1);
            this.height = c.girdHeight * row + c.gapY * (row - 1);
        }
        if (this.visibleRow > this.mixRow) {
            this.visibleRow = this.mixRow;
        }
    }

    public set data(value: any) {
        if (value == null) return;
        if (this._data == value && value) {
            this.reset();
            this.gotoAndStop(0);
            return;
        }
        this.fixRenderProperty(this._data, value);
        this._data = value;

        if (this._data == 0) {
            this.skinLoader.url = null;
            this.reset();
            this.currentFrame = 0;
            return;
        }

        this.reset();
        this.currentFrame = 0;
    }

    public get data(): any {
        return this._data;
    }

    public gotoAndStop(frame: number) {
        // 根据当前状态及下一个状态判断是否需要播放动画
        //this.isPlaying 在此处变为false了
        this.stopAnimation();
        super.gotoAndStop(frame);
    }

    /**
     * 开始滚动时的回调
     */
    public onStartRoll() {
        this.isInRolling = true;
        this.setIcon();
    }

    /**
     * 停止滚动时的回调
     */
    public onStopRoll() {
        this.isInRolling = false;
        this.setIcon();
    }

    // 正在播放动画
    private _inAni: boolean = false;
    /**
     * 当slot中奖状态时要播放的动画
     * @param {RollingResult} [lineResult=null] 该中奖线的结果
     * @param {number} [indexInLine=null] 元素在线F中的索引
     * @param {number} [indexInSlotMachine=null] 元素滚轴中的索引
     * @param {ISlotMachine} slotMachine 所在的滚轴
     */
    public playAnimation(lineResult?: RollingResult, indexInLine?: number, indexInSlotMachine?: number, slotMachine?: SlotMachineView) {
        if (this._inAni) return;
        this.onPlayAnimation && this.onPlayAnimation(lineResult, indexInLine, indexInSlotMachine, slotMachine);
        this._inAni = true;
        // 是否是百搭
        if (this.isWild()) this.playWildAnimation(lineResult, indexInLine, indexInSlotMachine, slotMachine);
        // 分散
        if (this.isScatter()) this.playScatterAnimation(lineResult, indexInLine, indexInSlotMachine, slotMachine);

    }

    public stopAnimation() {
        if (!this._inAni) {
            this.stopRewardsAnimation();
            return;
        }

        this.aboveLoader.url = null;
        this.belowLoader.url = null;

        this.onStopAnimation && this.onStopAnimation();
        this._inAni = false;

        this.stopWildAnimation();
        this.stopScatterAnimation();
        this.stopRewardsAnimation();

    }

    private _playingRewardsAni: boolean = false;
    /**
     * 当slot中奖状态时要播放的中奖赏额动画，如向上飘中奖赏额等
     * @param {RollingResult} [lineResult=null] 该中奖线的结果
     * @param {number} [indexInLine=null] 元素在线中的索引
     * @param {number} [indexInSlotMachine=null] 元素滚轴中的索引
     * @param {ISlotMachine} slotMachine 所在的滚轴
     */
    public playRewardsAnimation(lineResult?: RollingResult, indexInLine?: number, indexInSlotMachine?: number, slotMachine?: SlotMachineView) {
        // if(this._playingRewardsAni) return;
        if (lineResult.winCoin <= 0) return;
        if (BonusGameManager.instance.bonusGameInfo && BonusGameManager.instance.bonusGameInfo.initlized) return;
        this.onPlayRewardsAnimation && this.onPlayRewardsAnimation(lineResult, indexInLine, indexInSlotMachine, slotMachine);
        this._playingRewardsAni = true;
        this.playWinCoin(lineResult, indexInSlotMachine, slotMachine)
    }

    protected playWinCoin(lineResult?: RollingResult, indexInSlotMachine?: number, slotMachine?: SlotMachineView) {

    }

    public playIdleAnimaition(): void {
        if (this._inAni) {
            this.stopAnimation()
        }
        this.onPlayIdleAnimaition();
    }

    /**播放待机动画 目前轮播时分散百搭会调用*/
    public onPlayIdleAnimaition(): void {

    }


    /**
     * 飘字动画
     */
    private fontTween: cc.Tween = null;
    /**
     * 奖励数字节点
     */
    protected static winLabelNode: cc.Node = null;



    /**
     * 停止播放奖励动画
     */
    public stopRewardsAnimation() {
        if (!this._playingRewardsAni) return;
        if (BaseSpinSlotView.winLabelNode) {
            BaseSpinSlotView.winLabelNode.removeFromParent();
        }
        this.onStopRewardsAnimation && this.onStopRewardsAnimation();
        this._playingRewardsAni = false;
    }

    /**
     * 中奖时播放百搭的动画(元素为百搭，且参与了中奖时)
     * @param {RollingResult} [lineResult=null] 该中奖线的结果
     * @param {number} [indexInLine=null] 元素在线中的索引
     * @param {number} [indexInSlotMachine=null] 元素滚轴中的索引
     * @param {ISlotMachine} slotMachine 所在的滚轴
     */
    public playWildAnimation(lineResult?: RollingResult, indexInLine?: number, indexInSlotMachine?: number, slotMachine?: SlotMachineView) {
        if (this._playingWild) return;
        this._playingWild = true;
        this.onPlayWildAnimation && this.onPlayWildAnimation(lineResult, indexInLine, indexInSlotMachine, slotMachine);
    }

    /**
     * 停止播放百搭的动画
     */
    public stopWildAnimation() {
        if (!this._playingWild) return;
        this.onStopWildAnimation && this.onStopWildAnimation();
        this._playingWild = false;

    }

    /**
     * 中奖时播放分散的动画(元素为分散，且参与了中奖时)
     * @param {RollingResult} [lineResult=null] 该中奖线的结果
     * @param {number} [indexInLine=null] 元素在线中的索引
     * @param {number} [indexInSlotMachine=null] 元素滚轴中的索引
     * @param {ISlotMachine} slotMachine 所在的滚轴
     */
    public playScatterAnimation(lineResult?: RollingResult, indexInLine?: number, indexInSlotMachine?: number, slotMachine?: SlotMachineView) {
        if (this._playingScatter) return;
        this._playingScatter = true;
        this.onPlayScatterAnimation && this.onPlayScatterAnimation(lineResult, indexInLine, indexInSlotMachine, slotMachine);
    }

    /**
    * 中奖时播放分散的动画(元素为分散，且参与了中奖时)
    * 
    */
    public stopScatterAnimation() {
        if (!this._playingScatter) return;
        this.onStopScatterAnimation && this.onStopScatterAnimation();
        this._playingScatter = false;

    }

    /**
     * 中奖时播放Bonus元素的动画
     * @param {RollingResult} [lineResult=null] 该中奖线的结果
     * @param {number} [indexInLine=null] 元素在线中的索引
     * @param {number} [indexInSlotMachine=null] 元素滚轴中的索引
     * @param {ISlotMachine} slotMachine 所在的滚轴
     */
    public playBonusAnimation(lineResult?: RollingResult, indexInLine?: number, indexInSlotMachine?: number, slotMachine?: SlotMachineView) {
        this.onPlayBonusAnimation && this.onPlayBonusAnimation(lineResult, indexInLine, indexInSlotMachine, slotMachine);
    }

    /**
     * 停止播放BONUS元素的动画
     */
    public stopBonusAnimation() {
        this.onStopBonusAnimation && this.onStopBonusAnimation();
    }

    /**
     * 当slot中奖状态时要播放的动画
     * @param {RollingResult} [lineResult=null] 该中奖线的结果
     * @param {number} [indexInLine=null] 元素在线中的索引
     * @param {number} [indexInSlotMachine=null] 元素滚轴中的索引
     * @param {ISlotMachine} slotMachine 所在的滚轴
     */
    protected onPlayAnimation?(lineResult?: RollingResult, indexInLine?: number, indexInSlotMachine?: number, slotMachine?: SlotMachineView): void

    /**
     * 停止动画时的回调
     */
    protected onStopAnimation?(): void

    /**
     * 中奖时播放分散的动画(元素为分散，且参与了中奖时)的回调
     * @param {RollingResult} [lineResult=null] 该中奖线的结果
     * @param {number} [indexInLine=null] 元素在线中的索引
     * @param {number} [indexInSlotMachine=null] 元素滚轴中的索引
     * @param {ISlotMachine} slotMachine 所在的滚轴
     */
    protected onPlayScatterAnimation?(lineResult?: RollingResult, indexInLine?: number, indexInSlotMachine?: number, slotMachine?: SlotMachineView): void

    /**
     * 停止播放分散的动画(元素为分散，且参与了中奖时)的回调
     */
    protected onStopScatterAnimation?(): void

    /**
    * 百搭动画回调(元素为百搭，且参与了中奖时)
    * @param {RollingResult} [lineResult=null] 该中奖线的结果
    * @param {number} [indexInLine=null] 元素在线中的索引
    * @param {number} [indexInSlotMachine=null] 元素滚轴中的索引
    * @param {ISlotMachine} slotMachine 所在的滚轴
    */
    protected onPlayWildAnimation?(lineResult?: RollingResult, indexInLine?: number, indexInSlotMachine?: number, slotMachine?: SlotMachineView): void

    /**
     * 停止百搭动画时的回调
     */
    protected onStopWildAnimation?(): void

    /**
     * Bonus动画回调(元素为Bonus元素，且参与了中奖时)
     * @param {RollingResult} [lineResult=null] 该中奖线的结果
     * @param {number} [indexInLine=null] 元素在线中的索引
     * @param {number} [indexInSlotMachine=null] 元素滚轴中的索引
     * @param {ISlotMachine} slotMachine 所在的滚轴 
     */
    protected onPlayBonusAnimation?(lineResult?: RollingResult, indexInLine?: number, indexInSlotMachine?: number, slotMachine?: SlotMachineView): void

    /**
     * 停止Bonus动画时的回调
     */
    protected onStopBonusAnimation?(): void

    /**
     * 当slot中奖状态时要播放的中奖赏额动画，如向上飘中奖赏额等
     * @param {RollingResult} [lineResult=null] 该中奖线的结果
     * @param {number} [indexInLine=null] 元素在线中的索引
     * @param {number} [indexInSlotMachine=null] 元素滚轴中的索引
     * @param {ISlotMachine} slotMachine 所在的滚轴
     */
    protected onPlayRewardsAnimation?(lineResult?: RollingResult, indexInLine?: number, indexInSlotMachine?: number, slotMachine?: SlotMachineView);

    /**
     * 停止播放奖赏动画时的回调
     */
    protected onStopRewardsAnimation?();

    /**
     * 设置图标
     * @protected
     * @method setIcon
     * @param {string} [iconName=null] 图标名称,如:2005_01
     * @param {SpinSlotAniType} type 图标类型,如果未指定，则默认为：SpinSlotAniType.Ani
     * @param {string} aniName sk动作名,SpinSlotAniType.Ani才生效
     * @param {boolean} isPool 是否缓存 ,只有当动画类型为:SpinSlotAniType.Component时有意义,如果未指定，则默认为true
     * @param {Function} playTaskCall 自定义播放任务，只有SpinSlotAniType.Ani才生效，返回参数为sp.Skeleton
     */
    protected setIcon(iconName?: string, type: SpinSlotAniType = SpinSlotAniType.Ani, aniName: string = "", isPool: boolean = true, playTaskCall?: Function) {
        iconName = iconName || this._makeIconUrl();
        // if(iconName === this._iconName) return;

        // 检查原来是否存在未回收的图标资源需要释放
        this._releaseOldIconComponent();
        this._isPoolComponent = isPool;
        this._iconName = iconName;

        switch (type) {
            case SpinSlotAniType.Ani:
                this._setCommonIcon("cardAni", aniName, playTaskCall);
                break;
            case SpinSlotAniType.FrameAni:
                this._setCommonIcon("cardFrame");
                break;
            case SpinSlotAniType.Component:
                this._setComponentIcon();
                break;
            default:
                throw ("Invalid SpinSlotAnyType:" + type);
        }
        // if(this._centerIcon) this._centerIcon();
    }

    /**
     * 释放组件类型的动画图标资源
     */
    private _releaseOldIconComponent() {
        if (!this._iconComponent) return;

        // this._iconComponent.removeFromParent();
        this._iconComponent.node.parent.removeChild(this._iconComponent.node);
        if (this._isPoolComponent) {
            // Laya.Pool.recover(this._iconName, this._iconComponent);
        }
        else {
            this._iconComponent.destroy();
        }
        this._iconComponent = null;
    }

    /**
     * 使图标居中
     */
    // private _centerIcon()
    // {
    //     if(this._iconComponent)
    //     {
    //         this._iconComponent.setXY(-(this._iconComponent.width - this.width) / 2, - (this._iconComponent.height - this.height) / 2);
    //     }
    //     else
    //     {
    //         this.m_iconLoader.setXY(-(this.m_iconLoader.width - this.width) / 2, - (this.m_iconLoader.height - this.height) / 2);
    //     }
    //     // console.log("loader w, h:" + this.m_iconLoader.width + ", " + this.m_iconLoader.height);

    // }

    /**
     * 设置普通图标（图片，普通动画)
     */
    private _setCommonIcon(name: string, aniName?: string, playTaskCall?: Function) {

        this.skinLoader.playTaskCall = playTaskCall;
        this.skinLoader.url = SlotUtils.makePackageAssetsUrl(this._iconName, name);
        if (aniName) {
            this.skinLoader.aniName = aniName;
        }

        if (!this.skinLoader.active) {
            this.skinLoader.active = true;
        }
    }

    /**
     * 设置组件类型的图标
     */
    private _setComponentIcon() {
        if (this.skinLoader) this.skinLoader.active = false;
        // this._createComponentIcon.bind(this);
        // cc.NodePool()

        this.skinLoader.url = SlotUtils.makePackageAssetsUrl(this._iconName);

        if (!this.skinLoader.active) {
            this.skinLoader.active = true
        }

        if (!this._iconComponent) {
            return;
        }
        //Laya.Pool.getItemByCreateFun(this._iconName, this._createComponentIcon(Application.instance.mainModuleName, this._iconName));
        this._iconComponent.addComponent(cc.Sprite).spriteFrame = SlotGameManager.instance.getCardByName(this._iconName);
        this.addChild(this._iconComponent.node);
        this._iconComponent.node.zIndex = 0;

    }


    /**
    //  * 创建组件类型的图标
    //  */
    // private _createComponentIcon(packageName: string, iconName: string) {
    //     return () => {
    //         let url: string = fairygui.UIPackage.getItemURL(packageName, iconName);
    //         return fairygui.UIPackage.createObjectFromURL(url);
    //     }

    // }

    /**
     * 播放中奖时的边框动画
     */
    // protected playFrameAni(url?:string)
    // {

    // }

    /**
     * 生成图标的地址
     */
    private _makeIconUrl(): string {
        if (this.isInRolling) {
            if (this.isBlur) {
                return SlotUtils.makeElementBlurIconName(this._data)
            }
        }
        else {
            return SlotUtils.makeElementIconName(this._data);
        }

        return "";
    }

    /**
     * 添加节点在元素的上层或下层
     * @param node 节点
     * @param isAbove 是否在上层
     * @param offsetX 偏移X
     * @param offsetY 偏移Y
     */
    protected addEffectNode(node: cc.Node, isAbove: boolean, offsetX: number = 0, offsetY: number = 0): void {
        if (!node) {
            return;
        }
        if (node.parent) {
            node.removeFromParent();
        }
        if (isAbove) {
            this.aboveLoader.addChild(node);
        } else {
            this.belowLoader.addChild(node);
        }
        node.x = offsetX;
        node.y = offsetY;
    }

    private _playingWild: boolean = false;
    private _playingScatter: boolean = false;
    public isWild(): boolean {
        return SlotUtils.isWild(this._data);
        // return 2 == ConfigDataManager.instance.DataElement.getData(this._data).type
    }

    public isScatter(): boolean {
        return SlotUtils.isScatter(this._data);
    }

    public getElementType(): number {
        if (SlotConfigManager.instance.DataElement.getData(this.data)) {
            return SlotConfigManager.instance.DataElement.getData(this.data).type;
        } else {
            console.error("get element error,please check element:" + this.data + " is in in element table");
            return 0;
        }
    }

    /**
     * 暂时无用了
     */
    private _isBonus(): boolean {
        return false;
    }

    /**
     * 滚轴停止触发的回调
     */
    public onRollEnd(): void {

    }

    /**
    * 元素掉落触发的回调
    */
    public onOldElemDropEnd(): void {

    }

    /**
     * 新元素掉落触发的回调
     */
    public onNewElemDropEnd(): void {

    }
    /**
     * 消除掉落完成触发的回调
     */
    public onDropEnd(): void {

    }

    /**
     * 元素消除时触发回调
     */
    public onEliminate(): void {

    }

    /**
     * 元素在停止滚动前最后渲染结果的回调，子游戏可在此根据index及服务器返回的结果自行添加额外的信息，如倍数符号等
     */
    public beforeRollComplete(): void {

    }

    /**
     * 元素掉落前（启用JTRunEliminateFallByRow才调用）
     * @param indexInSlotMachine 
     */
    public playDropAnimation?(indexInSlotMachine: number);

    /**
     * 元素消失前（启用JTBeginEliminateDisppear才调用)
     * @param indexInSlotMachine 
     */
    public playDisappearAnimation?(indexInSlotMachine: number);

    /**
     * 分散加速触发时
     */
    public onScattterTaskCall():void{

    }


    /**
     * 
     * @param type （当值为JTGLoaderAssetType.Skeleton时，建议使用接口：setSkeletonAnimation）
     * @param aniName 
     * @param loop 是否循环，默认循环
     * @param playCallback 播放完成的回调，循环模式不会生效
     * @param clibData { sample: number, speed: number }  可选自定义帧动画的sample和speed值 
     */
    public setAnimation(type: JTGLoaderAssetType, aniName: string, loop: boolean = true, playCallback: Function = null, clibData?: { sample: number, speed: number }): void {
        let config = SpinElementManager.instance.getSpinElementConfig(this.data);
        let param = <JTGLoaderParam>{};
        param.assetType = type;
        switch (type) {
            case JTGLoaderAssetType.Skeleton:
                param.skeleton = <JTGLoaderSkeletonParam>{};
                let url = config.skeletonUrl;
                let lang = GData.curLanguage == "zh" ? "zh" : "en";
                url = url.replace(/&/g, lang);

                //   url = url.replace("&",lang);
                param.skeleton.url = url;
                param.skeleton.premultipliedAlpha = config.premultipliedAlpha || false;
                param.skeleton.defautAniName = aniName;
                param.skeleton.defaultSkinName = config.defaultSkinName;
                param.skeleton.animationCacheMode = config.animationCacheMode;
                break;
            case JTGLoaderAssetType.Clip:
                param.clip = <JTGLoaderClipParam>{};
                let urls: any = config.frameClipUrl;
                let lang_clip = GData.curLanguage == "zh" ? "zh" : "en";
                let url_clip;
                if (urls instanceof Array) {
                    url_clip = [];
                    for (let u of urls) {
                        url_clip.push(u.replace(/&/g, lang_clip));
                    }
                } else
                    url_clip = urls.replace(/&/g, lang_clip);
                let _sample = config.sample;
                let _speed = config.speed;
                if (clibData) {
                    if (clibData.sample) _sample = clibData.sample;
                    if (clibData.speed) _speed = clibData.speed;
                }
                param.clip.SpriteAtlasUrl = url_clip;
                param.clip.sample = _sample;
                param.clip.speed = _speed;
                param.clip.clipName = aniName;
                break;
            case JTGLoaderAssetType.DragonBones:
                param.dragonBones = <JTGLoaderDragonBonesParam>{};
                param.dragonBones.assetUrl = config.dragonAssetUrl;
                param.dragonBones.atlasAssetUrl = config.dragonAssetAtlasUrl;
                param.dragonBones.armature = config.dragonArmature;
                param.dragonBones.premultipliedAlpha = config.premultipliedAlpha || false;
                param.dragonBones.animation = aniName;
                break;
        }
        param.loop = loop;
        param.playCallback = playCallback;
        this.skinLoader.setAsset(param);
    }

    /**
     * 设置播放骨骼动画 
     * @param aniName 动作名
     * @param loop 是否循环，默认循环
     * @param playCallback 播放完成的回调，循环模式不会生效 
     * @param animationCacheMode 渲染模式(0:实时渲染；  1：共享缓存；  2：私有缓存)（null会读取元素配置的默认值）
     * @param premultipliedAlpha 是否开启预乘（null会读取元素配置的默认值）
     * @param skinName 皮肤名称（null会读取元素配置的默认值）
     */
    public setSkeletonAnimation(aniName: string | string[], loop: boolean = true, playCallback: Function = null, animationCacheMode?: number, premultipliedAlpha?: boolean, skinName?: string): void {
        let config = SpinElementManager.instance.getSpinElementConfig(this.data);
        let param = <JTGLoaderParam>{};
        param.assetType = JTGLoaderAssetType.Skeleton;
        param.skeleton = <JTGLoaderSkeletonParam>{};
        let url = config.skeletonUrl;
        let lang = GData.curLanguage == "zh" ? "zh" : "en";
        url = url.replace(/&/g, lang);
        param.skeleton.url = url;
        param.skeleton.premultipliedAlpha = premultipliedAlpha ? premultipliedAlpha : (config.premultipliedAlpha || false);
        param.skeleton.defautAniName = aniName ? aniName : config.normalAniName;;
        param.skeleton.defaultSkinName = skinName ? skinName : config.defaultSkinName;
        param.skeleton.animationCacheMode = null != animationCacheMode ? animationCacheMode : config.animationCacheMode;

        param.loop = loop;
        param.playCallback = playCallback;
        this.skinLoader.setAsset(param);
    }
}