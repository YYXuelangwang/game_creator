import JTGroup from "./base/JTGroup";
import JTTaskContainer from "../rules/JTTaskContainer";
import JTItemRender from "./base/JTItemRender";
import JTItemSkinLoader from "./base/JTItemSkinLoader";
import JTRuleTask from "../rules/JTRuleTask";
import JTGLoader from "../renders/JTGLoader";
import BaseSpinSlotView from "../../MainView/BaseSpinSlotView";
import SlotUtils from "../../SlotUtils/SlotUtils";
import JTContainer from "./base/JTContainer";
import JTLineScrollerGroup from "../extensions/JTLineScrollerGroup";
import JTTask from "./tasks/JTTask";
import JTElementArrayList from "./datas/JTElementArrayList";
import JTScrollerGroup from "./JTScrollerGroup";
import JTFuturePipeline from "./plugins/JTFuturePipeline";
import { SlotOrientation } from "../../SlotDefinitions/SlotEnum";
import JTScheduledPipeline from "./plugins/JTScheduledPipeline";
import SlotConfigManager from "../../SlotManager/SlotConfigManager";
import SpinManager from "../../SlotManager/SpinManager";
import JTDefaultItemRender from "../renders/JTDefaultItemRender";
/*
* name;//单列滚轴
*/
export default class JTScroller extends JTGroup {
        /**
         * 滚轴的索引值
         */
        private _index: number = 0;
        /**
         * 假滚轴数据的索引值
         */
        private _imageIndex: number = 0;

        private delayRate: number = 0;
        /**
         * 结合假滚轴的更换真实数据的次数
         */
        private _changedTimes: number = 0;
        /**
         * 索引列表
         */
        private _indexs: number[] = null;
        /**
         * 对应的插件通道
         */
        protected _pipeline: JTFuturePipeline = null;

        constructor() {
                super();
                this._indexs = [];
        }

        /**
         * 设置滚轴皮肤
         * @param x 皮肤X坐标
         * @param y y坐标
         * @param parent 皮肤的父容器
         * @param isScale 皮肤是否自动填充
         */
        public setupSkinLoader(x: number, y: number, parent: JTContainer, isScale: boolean = true): JTGLoader {
                //     let loader:fairygui.GLoader = super.setupSkinLoader(x, y, parent, isScale);
                //     let o:JTIScrollerGroup = this.owner as JTIScrollerGroup;
                //     let index:number = o.skinLoaders.indexOf(loader);
                //     if (index == -1)
                //     {
                //          o.skinLoaders.push(loader);
                //     }   
                let o: JTLineScrollerGroup = this.owner as JTLineScrollerGroup;
                let rules: JTTask[] = o.taskContainers;
                let loader: JTGLoader = null;
                for (let i: number = 0; i < rules.length; i++) {
                        let taskContainer: JTTaskContainer = rules[i] as JTTaskContainer;
                        let task: JTRuleTask = taskContainer.task as JTRuleTask;
                        //     let layer:JTContainer = null;
                        //     if (task instanceof JTWildTask)
                        //     {   
                        //             layer = o.wildContainer ? o.wildContainer : o;
                        //     }
                        //     else if (task instanceof JTScatterTask)
                        //     {
                        //             layer = o.skinLoaderContainer ? o.skinLoaderContainer : o;
                        //     }
                        loader = super.setupSkinLoader(x, y, o.skinLoaderContainer ? o.skinLoaderContainer : o, isScale);
                        task.skinLoaders.push(loader);
                        let index: number = o.skinLoaders.indexOf(loader);
                        if (index == -1) {
                                o.skinLoaders.push(loader);
                                loader.name = o.skinLoaders.length.toString();
                        }
                }
                return loader;
        }

        /**
         * 开始加载游戏
         * @param speed 速度
         * @param delay 延迟
         * @param time 时间
         * @param distance 距离
         * @param beginTime 回弹时间/开始的回弹时间
         */
        public start(speed: number, delay: number, time: number, distance: number, beginTime: number, endDelay: number, endDistance: number, endTime: number): void {
                this._isRunning = true;
                this._isManualStop = false;
                super.start(speed, delay, time, distance, beginTime, endDelay, endDistance, endTime);
                //this.adjustSkinRenders(true);
                this._pipeline.start();
        }

        /**
         * 激活某个状态
         * @param frame 帧数/状态 
         */
        public enableds(frame: number = JTItemRender.STATE_OVER): void {
                for (var i: number = 0; i < this._items.length; i++) {
                        var r: JTItemRender = this._items[i] as JTItemRender;
                        r.gotoAndStop(frame);
                }
        }

        /**
         * 判断单个滚轴中是否有分散元素
         */
        public isScatter(): boolean {
                let grids: JTElementArrayList = this._dataProvider.grids as JTElementArrayList;
                let gridRenderConfig = (this.owner as JTLineScrollerGroup).gridRenderConfig;
                let rc = gridRenderConfig ? gridRenderConfig[this.index] : null;
                for (var i = 0; i < grids.dataList.length; i++) {
                        if (rc && rc[i] == 0) {
                                continue;
                        }
                        if (SlotUtils.isScatter(grids.dataList[i])) {
                                return true;
                        }
                }
                return false;
        }

        /**
         * 设置注册函数
         * @param complete 完成回调
         * @param callNext 下一个回调
         * @param beginRunning 将要运行的回调
         */
        public setupRegister(complete: Function, callNext?: Function, beginRunning?: Function): void {
                this._complete = complete;
                this._nextHandler = callNext;
                this._beginRunning = beginRunning;
        }

        /**
         * 
         */
        public rendersDataReady(): void {
                let pipeline = this.pipeline as JTScheduledPipeline;
                pipeline.dataStandby();
        }

        /**
         * 重置坐标点
         */
        public resetLocaltion(): void {
                for (let i: number = 0; i < this._items.length; i++) {
                        let rd: JTItemRender = this._items[i] as JTItemRender;
                        rd.y = (this.config.gapHeight) * (i - 1);
                }
        }

        /**
         * 添加有效渲染器
         * @param render 渲染器
         * @param isAutoSize 
         */
        public addChildItem(render: JTItemRender, isAutoSize: boolean = true): void {
                var temp: any = render;
                var r: JTItemRender = temp as JTItemRender;//cocos interface
                r.bind(this, this.caller);
                this.addChild(r);
                this._items.push(r);
        }


        /**
         * 清理
         */
        public clear(): void {
                this._isRunning = false;
                this._runningTime = 0;
                this._changedTimes = 0;
                this._pipeline.clear();
        }

        // /**
        //  * 设置滚轴x坐标和y坐标
        //  * @param sourceX x坐标
        //  * @param sourceY y坐标
        //  */
        // public setSourceXY(sourceX: number, sourceY: number): void {
        //         this._pipeline.sourceX = sourceX;
        //         this._pipeline.sourceY = sourceY;
        // }

        /**
         * 安装插件
         * @param pipeline 
         */
        public setupPipeline(pipeline: JTFuturePipeline): void {
                this._indexs = this._items = this._renders = null;
                this._pipeline = pipeline;
                this._renders = [];
                this._items = this._pipeline.items;
                this._indexs = this._pipeline.indexs;
                this._pipeline.bind(this, this.caller);
                this._pipeline.contact(this as JTGroup);
        }

        /**
         * 强制更新数据列表
         * @param dataList 数据列表
         */
        public forceUpdate(dataList: any[]): void {
                (this._dataProvider.grids as JTElementArrayList).dataList = dataList;
                for (var i: number = 0; i < this._items.length; i++) {
                        let r: JTItemRender = this._items[i] as JTItemRender;
                        r.data = dataList[i];
                }
        }

        //     public get changedDataList():any[]
        //     {
        //             return this._changedDataList;
        //     }

        /**
         * 刷新渲染器列表
         * @param  r 渲染器
         * @param  isSkipEmptySource 是否跳过空元素
         */
        public refreshRenders(r: JTItemRender, isSkipEmptySource: boolean = false): void {
                let dataListType = (this.owner as JTScrollerGroup).channelPipeline.getTemplate(this.index).dataListType;
                if (this.runningTime >= this.time) {
                        if (this.speed >= 0) {
                                this.imageIndex += 1;
                                if (this.imageIndex > this.sources.length - 1) {
                                        this.imageIndex = 0;
                                }
                                if (this.changedTimes == 0) {
                                        if (dataListType == JTScrollerGroup.USE_CONVERT_MROE_LIST) {
                                                this.imageIndex = this.sources.length - (this.config.row + 2);
                                        } else {
                                                this.imageIndex = this.sources.length - this.config.row;
                                        }
                                }
                                this.checkLineNoZero();
                        }
                        else {
                                this.imageIndex -= 1;
                                if (this.imageIndex < 0) {
                                        this.imageIndex = this.sources.length - 1;
                                }
                                if (this.changedTimes == 0) {
                                        this.imageIndex = this.sources.length - 1;
                                }
                        }

                        r.data = this.sources[this.imageIndex];
                        let isRender = (this.pipeline as JTScheduledPipeline).setRenderBeforeComplete(r);
                        isRender && (r as BaseSpinSlotView).beforeRollComplete();
                        if (this.imageIndex > this.sources.length - 1) {
                                this.imageIndex = 0;
                        }
                        this.changedTimes += 1;
                }
                else {
                        this.imageIndex += 1;
                        if (this.imageIndex > this.sources.length - 1) {
                                this.imageIndex = 0;
                        }

                        this.checkLineNoZero();
                        if (isSkipEmptySource) {
                                this.skipEmptySource(true)
                        }
                        r.data = this.sources[this.imageIndex];
                        r.gotoAndStop(JTItemRender.STATE_ROLLING);
                }
        }

        /**
         * 跳过空元素
         * @param checkForward 在元素中向前检查
         */
        public skipEmptySource(checkForward: boolean): void {
                if (checkForward) {
                        while (this.sources[this.imageIndex] == 0) {
                                this.imageIndex++;
                                if (this.imageIndex > this.sources.length - 1) {
                                        this.imageIndex = 0;
                                }
                        }
                } else {
                        while (this.sources[this.imageIndex] == 0) {
                                this.imageIndex--;
                                if (this.imageIndex < 0) {
                                        this.imageIndex = this.sources.length - 1;
                                }
                        }
                }

        }


        /**
         * 检查数据是否会非0数据连着(如果有0元素的话就需要出现两个非0元素之间必须夹着一个0元素 以免出现元素高度设置很小的两个元素出现堆叠情况 参考bug = 9579)
         * @param r 
         * @returns 
         */
        public checkLineNoZero() {
                if (this.sources.includes(0)) {
                        for (let i = 0; i < this.items.length; i++) {
                                let item = this.items[i] as BaseSpinSlotView;
                                if (i == 1) {
                                        if (this.sources[this.imageIndex] != 0 && item.data != 0) {
                                                //如果是非0假滚轴下标设置下一个
                                                let runTimes: number = 0;
                                                while (this.sources[this.imageIndex] != 0) {
                                                        if (this.imageIndex > this.sources.length - 1) {
                                                                this.imageIndex = 0;
                                                        }
                                                        this.imageIndex++;
                                                        runTimes++;
                                                        //5次循环还没有合适的数据直接跳出 防止数据出错导致死循环
                                                        if (runTimes > 5) return
                                                }
                                        }
                                        break;
                                }
                        }

                }
        }

        //      private updateSources():void
        //      {
        //                 let list:any[] = this._dataList;
        //                 for (let i:number = this._dataList.length - 1; i >= 0; i--)
        //                 {
        //                          this._sources.push(this._dataList[i]);
        //                 }
        //      }

        /**
         * 获取滚轴相同id渲染器列表
         * @param id 渲染器ID
         */
        public getSomeById(id: number): JTItemRender[] {
                var list: JTItemRender[] = [];
                for (let i: number = 0; i < this.renders.length; i++) {
                        this.setRenders(list, this.renders[i] as JTItemRender, id);
                }
                return list;
        }

        public getSomeById2(ids: number[]): JTItemRender[] {
                var list: JTItemRender[] = [];
                for (let i: number = 0; i < this.renders.length; i++) {
                        this.setRenders2(list, this.renders[i] as JTItemRender, ids);
                }
                return list;
        }

        /**
         * 调整渲染格子，在滚轴滚动开始还原可见度，滚轴结束滚动的时候使其隐藏.
         * @param isVisible 
         */
        public adjustSkinRenders(isVisible: boolean): void {
                for (let i: number = 0; i < this._items.length; i++) {
                        let r: JTItemSkinLoader = this._items[i] as JTItemSkinLoader;
                        if (this._renders.indexOf(r) != -1) {
                                continue;
                        }
                        r.active = isVisible;//cocos
                }
        }

        /**
         * 获取改变过后的渲染器ID列表
         * @param id 改变过后渲染器ID
         */
        public getSomeChangedById(id: number): JTItemRender[] {
                var list: JTItemRender[] = [];
                for (let i: number = 0; i < this.renders.length; i++) {
                        let r: JTItemRender = this._renders[i] as JTItemRender;
                        if (r.changedData != id) continue;
                        list.push(r);
                }
                return list;
        }

        /**
         * 一个判断逻辑用过百搭检测
         * @param list 
         * @param r 
         * @param id 
         */
        private setRenders(list: JTItemRender[], r: JTItemRender, id: any): void {
                if (r.changedData != id) return;
                list.push(r);
        }

        private setRenders2(list: JTItemRender[], r: JTItemRender, ids: any[]): void {
                if (ids.indexOf(r.changedData) < 0) return;
                list.push(r);
        }

        //     public get dataList():any[]
        //     {
        //             return this._dataList;
        //     }

        /**
         * 刷新假滚轴数据的渲染器列表
         * @param list 
         */
        public refreshList(list?: any[]): void {
                this._imageIndex = 0;
                for (var i: number = 0; i < this._items.length; i++) {
                        let r: JTItemRender = this._items[i] as JTItemRender;
                        r.data = !list ? this._sources[i] : this.dataList[i];
                        this._imageIndex++;
                }
        }

        /**
         * 滚动完成调度
         */
        public scrollingComplete(): void {
                super.scrollingComplete();
                let o: JTScrollerGroup = <any>this.owner;
                if (this.nextHandler) {
                        let i: number = this.index + 1;
                        if (i <= o.items.length - 1) {
                                this.nextHandler.apply(this.caller, [o.getItem(i)]);
                        }
                }
                // this.adjustSkinRenders(false);
                o.scrollingComplete();
                this.setItemsZindex();

        }

        public setItemsZindex(): void {
                let rollingResult = SpinManager.instance.rollingResult;
                let lineResult = rollingResult ? rollingResult.spinResult.lineResult : null;
                if (lineResult && lineResult.length > 0) {//初始第一条线
                        for (let index = 0; index < lineResult.length; index++) {
                                const element = lineResult[index];
                                let payLine = SlotConfigManager.instance.DataPayLine.getData(element.lineId);
                                let elemId = element.elementResult.elem;
                                if (payLine && payLine.linePos[0] && payLine.linePos[0].elems) {
                                        let elemIndex = payLine.linePos[0].elems[this.index];
                                        this.sortItemszIndex(elemIndex, elemId, element.elementResult.elemList);
                                } else {
                                        if (elemId) {
                                                this.sortItemszIndex(-1, elemId);
                                        } else {
                                                this.sortItemszIndex();
                                        }
                                }
                        }
                } else {
                        this.sortItemszIndex();
                }
        }

        //重新zindex层级，scatter>bonus>wild>其他
        public sortItemszIndex(elemIndex?: number, elemId?: number, elemList?: any): void {
                let items: BaseSpinSlotView[] = this.items as BaseSpinSlotView[];
                let len = items.length;
                let offIndex = this.index * (len - 2);
                if (items && items[1] && items[1].children && !items[1].children[0].active) {
                        elemIndex = -1;//元素被替换成了长条百塔
                }
                let isWild: boolean = false;
                if (elemList) {//这一列中奖元素是否有百搭
                        for (let index = 0; index < elemList.length; index++) {
                                const element = elemList[index];
                                isWild = SlotUtils.isWild(element.elem);
                                if (isWild) break;
                        }
                }

                for (let i = 0; i < len; i++) {
                        let item = items[i];
                        let off = 0;
                        let isRewardElem1 = (elemIndex == i + offIndex || elemIndex == -1) && (item.changedData == elemId || item.isWild());
                        let isRewardElem2 = isWild && item.isWild();//这一列中奖元素有百搭并且当前元素是百搭
                        if (isRewardElem1 || isRewardElem2) {
                                off = 5;
                        }
                        item.zIndex = i + offIndex + (item.getElementType() + off) * 5;
                        // item.scale = 1.3;
                }
        }


        /**
         * 强制性停止
         * @param isTween 
         */
        public kill(isTween: boolean, isUpdateRenders: boolean = true): void {
                this._isManualStop = true;
                if (!this._isRunning) return;
                let pipeline: JTFuturePipeline = this._pipeline;
                if (this._pipeline instanceof JTFuturePipeline) {
                        let grids: JTElementArrayList = this._dataProvider.grids as JTElementArrayList;
                        if (grids.dataList.length == 0) return;
                        if (this.config.orientation == SlotOrientation.Portrait) {
                                this.y = 0;
                        } else {
                                this.x = 0;
                        }
                        if (pipeline.jumpToOverRunning) {
                                if (!pipeline.isImmediatlyJumpToOver) {
                                        pipeline.jumpToOverRunning();
                                }
                        } else {
                                isUpdateRenders && pipeline.updateRenders();
                                this.onStopRoll();
                                this.scrollingComplete();
                        }
                }
                else {

                }
        }

        /**
         * 滚轴插件
         */
        public get pipeline(): JTFuturePipeline {
                return this._pipeline;
        }

        /**
         * 滚轴渲染器的索引列表
         */
        public get indexs(): number[] {
                return this._indexs;
        }

        /**
         * 滚轴索引
         */
        public get index(): number {
                return this._index;
        }

        /**
         * 滚轴索引
         */
        public set index(value: number) {
                this._index = value;
        }

        /**
         * 假滚轴的索引值
         */
        public get imageIndex(): number {
                return this._imageIndex;
        }

        /**
         * 假滚轴的索引值
         */
        public set imageIndex(value: number) {
                this._imageIndex = value;
        }

        /**
         * 假滚轴数的改变的次数
         */
        public get changedTimes(): number {
                return this._changedTimes;
        }

        /**
         * 假滚轴数的改变的次数
         */
        public set changedTimes(value: number) {
                this._changedTimes = value;
        }

        /**
         * 原滚轴X坐标
         */
        public get sourceX(): number {
                return this.isLandscape ? this._pipeline.sourceXLandscape : this._pipeline.sourceXPortrait;
        }

        /**
         * 原滚轴Y坐标
         */
        public get sourceY(): number {
                return this.isLandscape ? this._pipeline.sourceYLandscape : this._pipeline.sourceYPortrait;
        }

        // /**
        //  * 原滚轴X坐标
        //  */
        // public set sourceX(value: number) {
        //         this._pipeline.sourceX = value;
        // }

        // /**
        //  * 原滚轴Y坐标
        //  */
        // public set sourceY(value: number) {
        //         this._pipeline.sourceY = value;
        // }

        /**
         * 创建
         */
        protected create(): void {

        }

        public onStopRoll(): void {
                for (let i: number = 0; i < this._renders.length; i++) {
                        let r: BaseSpinSlotView = this._renders[i] as BaseSpinSlotView;
                        r.onRollEnd();
                }
        }

        public layoutLandscape(): void {
                super.layoutLandscape();
                let pipeline: JTFuturePipeline = this._pipeline;

                if (!this.isRunning) {
                        pipeline.updateRenderPosition();
                }

                pipeline.resetScrollerPosition(this.isRunning);

        }

        public layoutPortrait(): void {
                super.layoutPortrait();
                let pipeline: JTFuturePipeline = this._pipeline;

                if (!this.isRunning) {
                        pipeline.updateRenderPosition();
                }

                pipeline.resetScrollerPosition(this.isRunning);

        }

}