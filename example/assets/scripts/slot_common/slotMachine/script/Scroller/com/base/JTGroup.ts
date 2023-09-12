/*
* name;
*/
import JTItemSkinLoader from "./JTItemSkinLoader";
import JTConfigGroup from "../JTConfigGroup";
import JTDataInfo from "../datas/JTDataInfo";
import JTCollection from "../datas/JTCollection";
import JTElementArrayList from "../datas/JTElementArrayList";
export default abstract class JTGroup extends JTItemSkinLoader {
    protected _time: number = 0;
    protected _speed: number = 0;
    protected _delay: number = 0;
    protected _frameRate: number = 0;
    protected _runningTime: number = 0;
    protected _frameRateTime: number = 0;
    protected _defaultFrameRate: number = 0;
    protected _defaultFrameRateTime: number = 0;
    protected _distance: number = 0;
    protected _direction: string = null;
    protected _beginTime: number = 0;
    protected _endTime: number = 0;
    protected _endDistance: number = 0;
    protected _endDelay: number = 0;

    protected _isRunning: boolean = false
    protected _isManualStop: boolean = false;
    protected _isLock: boolean = false;

    protected _config: JTConfigGroup = null;
    protected _sources: any[] = null;
    protected _renders: JTItemSkinLoader[] = null;
    protected _items: JTItemSkinLoader[] = null;
    protected _dataProvider: JTCollection<JTDataInfo> = null;


    protected _complete: Function = null;
    protected _nextHandler: Function = null;
    protected _beginRunning: Function = null;

    protected _isLandscape:boolean = false;

    static SCROLLINGUP: string = "scrolling_up";
    static SCROLLINGDOWN: string = "scrolling_down";
    static SCROLLINGLEFT: string = "scrolling_left";
    static SCROLLINGRIGHT: string = "scrolling_right";

    constructor() {
        super();
        this._renders = [];
        this._config = new JTConfigGroup();
    }

    /**
     * 开始
     * @param speed 速度
     * @param delay 延迟
     * @param time 运行时间
     * @param distance 结束或者启动的回拉距离
     * @param beginTime 将要开始的时间
     */
    public start(speed: number, delay: number, time: number, distance: number, beginTime: number,endDelay:number,endDistance:number,endTime:number): void {
        this._isRunning = true;
        this._speed = speed;
        this._delay = delay;
        this._time = time;
        this._distance = distance;
        this._beginTime = beginTime;
        this._endDelay = endDelay;
        this._endDistance = endDistance;
        this._endTime = endTime;
    }

    public setupIsOpenItems(isLock: boolean, ids: any): void {
        (this.owner as JTGroup).setupIsOpenItems(isLock, ids);
    }



    /**
     * 更新层级
     * @param group 需要更新层级的对象
     */
    public updateLayer(group?: JTGroup): void {
        for (var i: number = 0; i < this._items.length; i++) {
            var r: JTItemSkinLoader = this._items[i] as JTItemSkinLoader;
            //this.setChildIndex(r, i);//cocos
            r.zIndex = i;
        }
    }

    /**
     * 强制更新视图
     * @param dataList 数据列表
     */
    public abstract forceUpdate(dataList: any[]): void;

    /**
     * 激活某个状态（帧）
     * @param frame 帧数（状态）
     */
    public abstract enableds(frame: number): void;

    /**
     * 重置
     */
    public reset(): void {
        if (!this._items) return;
        for (let i: number = 0; i < this._items.length; i++) {
            let item: JTItemSkinLoader = this._items[i];
            item.reset();
        }
    }

    /**
     * 执行完成函数
     */
    public scrollingComplete(): void {
        this.clear();
        this.updateLayer();
        this.layerSort();
    }

    /**
     * 层级排序
     */
    public layerSort(): void {

    }

    /**
     * 完成传入的回调函数
     */
    public set complete(value: Function) {
        if (this._complete) return;
        this._complete = value;
    }

    public get complete(): Function {
        return this._complete;
    }

    /**
     * 下一个需要执行的传入回调函数
     */
    public set nextHandler(value: Function) {
        this._nextHandler = value;
    }

    public get nextHandler(): Function {
        return this._nextHandler;
    }

    /**
     * 将要开始的回调函数
     */
    public set beginRunning(value: Function) {
        this._beginRunning = value;
    }

    public get beginRunning(): Function {
        return this._beginRunning;
    }

    /**
     * 回弹的距离
     */
    public get distance(): number {
        return this._distance;
    }

    public set distance(value: number) {
        this._distance = value;
    }

        /**
     * 回弹的距离
     */
    public get endDistance(): number {
        return this._endDistance;
    }

    public set endDistance(value: number) {
        this._endDistance = value;
    }

    /**
     * 通过索引获取某个渲染器(注这里的索引是按数组的排序的索引和 渲染器的index无关系)
     * @param index 索引
     */
    public getItem(index: number): JTItemSkinLoader {
        return this._items[index];
    }

    /**
     * 创建
     */
    protected abstract create(): void

    /**
     * 渲染器列表 
     */
    public get items(): JTItemSkinLoader[] {
        return this._items;
    }

    /**
     * 运行的时间
     */
    public get time(): number {
        return this._time;
    }

    public set time(value: number) {
        this._time = value;
    }

    /**
     * 运行的速度
     */
    public get speed(): number {
        return this._speed;
    }

    public set speed(value: number) {
        this._speed = value;
    }

    /**
     * 默认的帧频
     */
    public get defaultFrameRate(): number {
        // if (this._defaultFrameRate == 0)
        //{
        this._defaultFrameRate = cc.game.getFrameRate();//Laya.stage.frameRate == "fast" ? 60 : 30;
        // }
        return this._defaultFrameRate;
    }

    /**
     * 默认的帧频时间
     */
    public get defaultFrameRateTime(): number {
        // if (this._defaultFrameRateTime == 0)
        // {
        this._defaultFrameRateTime = 1000 / this.defaultFrameRate;
        // }
        return this._defaultFrameRateTime;
    }

    /**
     * 延迟
     */
    public get delay(): number {
        return this._delay;
    }

    public set delay(value: number) {
        this._delay = value;
    }

    /**
     * 延迟
     */
    public get endDelay(): number {
        return this._endDelay;
    }

    public set endDelay(value: number) {
        this._endDelay = value;
    }

    /**
     * 帧数
     */
    public get frameRate(): number {
        this._frameRate = this.defaultFrameRate;//cocos 
        return this._frameRate;
    }

    public set frameRate(value: number) {
        this._frameRate = value;
    }

    /**
     * 已经运行了时间
     */
    public get runningTime(): number {
        return this._runningTime;
    }

    public set runningTime(value: number) {
        this._runningTime = value;
    }

    /**
     * 帧数时间值
     */
    public get frameRateTime(): number {
        this._frameRateTime = 1000 / this.frameRate;
        return this._frameRateTime;
    }

    public set frameRateTime(value: number) {
        this._frameRateTime = value;
    }

    /**
     * 参数配置
     */
    public get config(): JTConfigGroup {
        return this._config;
    }

    public set config(value: JTConfigGroup) {
        this._config = value;
    }

    /**
     * 将要运行的时间
     */
    public set beginTime(value: number) {
        this._beginTime = value;
    }

    public get beginTime(): number {
        return this._beginTime;
    }

        /**
     * 结束时运行的时间
     */
    public set endTime(value: number) {
        this._endTime = value;
    }

    public get endTime(): number {
        return this._endTime;
    }

    /**
     * 是否已经在运行
     */
    public get isRunning(): boolean {
        return this._isRunning;
    }

    /**
    * 是否已经在运行
    */
    public set isRunning(value: boolean) {
        this._isRunning = value;
    }

    /**
     * 是否是手动停止
     */
    public get isManualStop(): boolean {
        return this._isManualStop;
    }

    /**
     * 锁定
     */
    public get isLock(): boolean {
        return this._isLock;
    }

    public set isLock(value: boolean) {
        this._isLock = value;
    }

    /**
     * 方向
     */
    public get direction(): string {
        return this._direction;
    }

    public set direction(value: string) {
        this._direction = value;
    }

    /**
     * 原始渲染器数据列表
     */
    public get dataList(): any[] {
        return (this._dataProvider.grids as JTElementArrayList).changedDataList;
    }

    /**
     * 改变过后渲染器数据列表
     */
    public get changedDataList(): any[] {
        return (this._dataProvider.changedGrids as JTElementArrayList).changedDataList;
    }

    /**
     * 假滚轴数据列表
     */
    public get sources(): any[] {
        return this._sources;
    }

    public set sources(value: any[]) {
        this._sources = value;
    }

    /**
     * 可见的渲染器列表
     */
    public get renders(): JTItemSkinLoader[] {
        return this._renders;
    }

    public set renders(value: JTItemSkinLoader[]) {
        this._renders = value;
    }

    /**
     * 数据提供者
     */
    public get dataProvider(): JTCollection<JTDataInfo> {
        return this._dataProvider;
    }

    public set dataProvider(value: JTCollection<JTDataInfo>) {
        this._dataProvider = value;
    }

    public get isLandscape():boolean{
        return this._isLandscape;
    }

    public set isLandscape(value:boolean){
            this._isLandscape = value;
    }

    public layoutLandscape(): void {
        this._isLandscape = true
    }

    public layoutPortrait(): void {
        this._isLandscape = false
    }
}