import JTGroup from "./base/JTGroup";
import JTGComponent from "./base/JTGComponent";
import JTConfigGroup from "./JTConfigGroup";
import JTRuleTaskManager from "../rules/JTRuleTaskManager";
import JTModelFactory from "./factorys/JTModelFactory";
import JTChannelPipeline from "./plugins/JTChannelPipeline";
import JTScroller from "./JTScroller";
import JTArrayCollection from "./datas/JTArrayCollection";
import JTScrollerSettings from "./JTScrollerSettings";
import JTItemRender from "./base/JTItemRender";
import JTLayerFactory from "./factorys/JTLayerFactory";
import JTChildFactory from "./factorys/JTChildFactory";
import { SDictionary } from "../../SlotData/SDictionary";
import JTGLoader from "../renders/JTGLoader";
import JTGraphics from "./base/JTGraphics";
import JTFactory from "./factorys/JTFactory";
import JTDataInfo from "./datas/JTDataInfo";
import JTCollection from "./datas/JTCollection";
import JTTask from "./tasks/JTTask";
import JTContainer from "./base/JTContainer";
import JTItemSkinLoader from "./base/JTItemSkinLoader";
import { JTPipelineTemplate, JTTaskInfo } from "./plugins/procedure/JTPipelineTemplate";
import JTLayerSortContainer from "../layerSort/JTLayerSortContainer";
import JTTaskContainer from "../rules/JTTaskContainer";
import JTFuturePipeline from "./plugins/JTFuturePipeline";
import JTElementArrayList from "./datas/JTElementArrayList";
import JTTaskPipeline from "./tasks/JTTaskPipeline";
import { Handler } from "../../SlotUtils/Handle";
import { SlotOrientation } from "../../SlotDefinitions/SlotEnum";
import JTScheduledPipeline from "./plugins/JTScheduledPipeline";
import BaseSpinSlotView from "../../MainView/BaseSpinSlotView";
import JTRollerData from "./datas/JTRollerData";
import JTScrollerGroupMask from "../masks/JTScrollerGroupMask";
import JTMixItemConfig from "../extensions/JTMixItemConfig";
import JTUnfixedLengthItemConfig,{ JTExpandScrollerInfo } from "../extensions/JTUnfixedLengthItemConfig";

/*
* name;滚轴组
*/
export default class JTScrollerGroup extends JTGroup {
        /**
         * 背景的空白区域支持鼠标滑动
         */
        protected _background: JTGraphics = null;
        /**
         * 空闲状态的滚轴列表
         */
        protected _freeList: JTItemSkinLoader[] = null;
        /**
         * 当前正在运行的滚轴列表
         */
        protected _runnings: JTItemSkinLoader[] = null;

        protected _isContext: boolean = false;
        /**
         * slot游戏默认ID列表
         */
        protected _defualtImageIds: any[] = null;
        /**
         * 每列滚轴滚动完成函数
         */
        protected _progress: Function = null;
        /**
         * 是否支持空白区域鼠标点击
         */
        protected _isBackgroundFill: boolean = false;
        /**
         * 滚轴容器
         */
        protected _sContainer: JTGComponent = null;
        /**
         * 层级工厂
         */
        protected _factoryLayer: JTFactory = null;
        /**
         * 子级工厂
         */
        protected _factoryChild: JTFactory = null;
        /**
         * 数据模型工厂
         */
        protected _factoryModel: JTFactory = null;
        /**
         * 规则任务管理器
         */
        protected _ruleTaskManager: JTRuleTaskManager = null;
        /**
         * 通道管道
         */
        protected _channelPipeline: JTChannelPipeline = null;
        /**
         * 皮肤列表
         */
        protected _skinLoaders: JTGLoader[] = null;
        /**
         * 默认皮肤容器
         */
        protected _skinLoaderContainer: JTGComponent = null;
        /**
         * 中奖格子的层级排序
         */
        protected _layerSortPlayContainer: JTLayerSortContainer = null;
        /**
         * 未中奖的格子层级排序
         */
        protected _layerSortStopContainer: JTLayerSortContainer = null;

        protected _layerSortScatterPlayContainer: JTLayerSortContainer = null;
        protected _layerSortScatterStopContainer: JTLayerSortContainer = null;

        protected _scrollerGroupMask: JTScrollerGroupMask = null;

        protected _pContainer:JTGComponent = null;;
        public static USE_CONVERT_MROE_LIST: number = 1;
        public static USE_CONVERT_TO_LIST: number = 2;

        /**
         * 是否一次性开启单位滚轴滚动
         */
        protected _isOnceOpenItems: boolean = true;

        /**
         * 是否开启元素单位滚轴滚动
         */
        protected _isOpenItems: boolean = false;
        /**
         * 开启元素单位滚轴滚动的id列表
         */
        protected _openItemIds: any[] = null;

        protected _customSourceHandler: Handler;

        protected _itemContainers:JTGComponent[] = null;

        protected _gameID:number;

        protected _gridRenderConfig:number[][];

        protected _enabled:boolean = true;

        protected _freeSources:any[] = null;

        protected _defaultSources:any[] = null;

        protected _itemOffsets:cc.Vec2[] = [];

        protected _isPending:boolean = false;

        protected _isSkipChangeTask:boolean = false;

        protected _inclineDegrees:number[] = []; 

        protected _isIncline:boolean = false; 


        protected _curveDegrees:number[] = []; 

        protected _isCurve:boolean = false; 

        protected _expandScrollerInfo:JTExpandScrollerInfo[] = []; 


        constructor() {
                super();
                this._freeList = [];
                this._runnings = [];
                this._skinLoaders = [];
                this._openItemIds = [];
                this._itemContainers = [];
                this._config = new JTConfigGroup();
                this._skinLoader = new JTGLoader();
                this._ruleTaskManager = new JTRuleTaskManager();
                this.direction = JTScrollerGroup.SCROLLINGDOWN;
        }

        /**
         * 安装工厂
         * @param layer 层级工厂
         * @param child 子级工厂
         * @param logic 逻辑工厂
         * @param model 数据工厂
         */
        public setupFactory(layer: JTFactory, child?: JTFactory, logic?: JTFactory, model?: JTFactory): JTChannelPipeline {
                this._factoryLayer = layer;
                this._factoryChild = child;
                this._factoryChild.bind(this, this.caller);
                this.factoryLayer.bind(this, this.caller);
                if (!model) model = new JTModelFactory();
                this._factoryModel = model;
                this._factoryModel.bind(this, this.caller);
                return this._channelPipeline;
        }

        /**
         * 设置是否开启指定列滚轴滚动
         * @param isOnceOpenItems 是否一次性的开启指定列滚动
         * @param ids 开启指定列滚轴滚动的列索引列表,索引从从1开始
         */
        public setupIsOpenItems(isOnceOpenItems: boolean, ids: any[]): void {
                this._isOnceOpenItems = isOnceOpenItems;
                this._isOpenItems = true;
                this._openItemIds = [];
                this._openItemIds = this._openItemIds.concat(ids);
        }
        
        /**
         * 添加混合元素配置
         * @param id 元素id
         * @param row 元素占行数
         * @param column 元素占列数
         */
        public addMixItemConfig(id:number,row:number,column:number):void{
              let c = new JTMixItemConfig();
              c.id = id;
              c.row = row;
              c.column = column;
              this.config.mixConfig.push(c);
        }

        /**
         * 添加额外的列信息
         * @param index 该列的索引，以0为开始
         * @param row 该列包含多少行
         * @param position 该列的位置
         * @param direction 该列的方向
         * @param maskContainerType 遮罩节点
         * @param gap 间距
         * @param curveDegree 弧形角度
         */
        public addExpandScrollerInfo(index:number,row:number,position:cc.Vec2,direction:SlotOrientation,maskContainerType:number,gap:number = 0,curveDegree:number=0):void{
               let e = new JTExpandScrollerInfo();
               e.index = index;
               e.row = row;
               e.position = position;
               e.direction = direction;
               e.curveDegree = curveDegree;
               e.maskContainerType = maskContainerType;
               e.gap = gap;
               this._expandScrollerInfo.push(e);
        }
          
        /**
         * 
         * @param sourceId 
         * @param mapId 
         * @param column
         * @param row 
         */
        public addUnfixedLengthItemConfig(sourceId:number,mapId:number,column:number,row:number):void{
                let e = new JTUnfixedLengthItemConfig();
                e.sourceId = sourceId;
                e.row = row;
                e.column = column;
                e.mapId = mapId;
                this.config.unfixedItemConfig.push(e);
         }
           


        /**
        * 是否启用
        */
        public get enabled(): boolean {
                return this._enabled;
        }

        /**
         * 是否启用
         */
        public set enabled(v:boolean) {
                this._enabled = v;
        }

        /**
         * 是否开启元素单位滚轴滚动
         */
        public get isOpenItems(): boolean {
                return this._isOpenItems;
        }

        /**
         * 开启元素单位滚轴滚动的id列表
         */
        public get openItemIds(): any[] {
                return this._openItemIds;
        }

        /**
         * 是否开启元素单位滚轴滚动
         */
        public get isOnceOpenItems(): boolean {
                return this._isOnceOpenItems;
        }

        /**
         * 安装默认的元素列表
         * @param sourceList 默认假滚动列表
         * @param defaultList 默认ID列表
         * @param isContext 
         * @param freeSourceList 免费模式的假滚动列表
         */
        public setupDefaultItemList(sourceList: any[] | Function, defaultList: any[], isContext: boolean = true, freeSourceList: any[] | Function=null): void {
                this._defualtImageIds = defaultList;
                //this.sources = sourceList instanceof Function ? sourceList(this) : sourceList;
                if (isContext) {
                        this._isContext = isContext;
                }
                this._defaultSources = sourceList instanceof Function ? sourceList(this) : sourceList;

                if(freeSourceList){
                    this._freeSources = freeSourceList instanceof Function ? freeSourceList(this) : freeSourceList;
                }
                this.sources = [];
                for(let i=0;i<this.defaultSources.length;i++){
                        let s = this.defaultSources[i] as JTRollerData;
                        this.sources.push(s.elements.concat([]));
                }
        }

        /**
         * 安装格子配置
         * @param width 宽
         * @param height 高
         * @param row 行数
         * @param col 列数
         * @param gapX X间距
         * @param gapY Y间距
         * @param isBackgroundFill 是否支持空白区域鼠标点击
         */
        public setupGridConfig(width: number, height: number, row: number, col: number, gapXLandscape: number = 0, gapYLandscape: number = 0, gapXPortrait: number = 0, gapYPortrait: number = 0,isBackgroundFill: boolean = false,orientation:SlotOrientation = SlotOrientation.Portrait): void {
                this._config.col = col;
                this._config.row = row;
                this._config.girdWidth = width;
                this._config.girdHeight = height;
                this._config.gapXLandscape = gapXLandscape;
                this._config.gapYLandscape = gapYLandscape;
                this._config.gapXPortrait = gapXPortrait;
                this._config.gapYPortrait = gapYPortrait;
                // this._config.count = count;
                this.config.orientation = orientation;
                this._isBackgroundFill = isBackgroundFill;
        }

        /**
         * 安装函数
         * @param progress 每列滚轴滚动完成函数
         * @param complete 所有列滚轴滚动完成函数
         * @param nextHandler 下一列滚轴滚动函数
         * @param beginRunning 将要开始滚动函数
         */
        public setupRegister(progress?: Function, complete?: Function, nextHandler?: Function, beginRunning?: Function): void {
                this._progress = progress;
                this._complete = complete;
                this._nextHandler = nextHandler;
                this._beginRunning = beginRunning;
        }

        /**
         * 标记管道通道
         * @param id 管道通道ID 
         */
        public mark(id: number): JTChannelPipeline {
                this._channelPipeline = JTChannelPipeline.mark(id);
                return this._channelPipeline;
        }

        /**
         * 改变管道通道
         * @param id 要改变的ID
         */
        public changeChannelPipeline(id: number): JTChannelPipeline {
                if (this._channelPipeline) {
                        if (this._channelPipeline.id == id) return this._channelPipeline;
                        if (this._items && this._items.length > 0) {
                                this.reset();
                                this.clear();
                                this._channelPipeline.reset();
                                this._channelPipeline = JTChannelPipeline.mark(id);
                                if(!this._channelPipeline.isEgoClone){
                                   this._channelPipeline.egoClone();
                                }
                                (this._dataProvider as JTArrayCollection).convertDataList((this._dataProvider.grids as JTElementArrayList).dataList);
                                for (let i: number = 0; i < this._items.length; i++) {
                                        let s: JTScroller = this._items[i] as JTScroller;
                                        this.setupScrollerPipeline(s as JTScroller, i);
                                }
                                this.updateRenders();
                        }
                        else {
                                this._channelPipeline = JTChannelPipeline.mark(id);
                        }
                }
                else {
                        this._channelPipeline = JTChannelPipeline.mark(id);
                }
                return this._channelPipeline;
        }
        
        /**
         * 切换假滚轴，分免费非免费的滚轴
         * @param isFree 是否使用免费模式的滚轴，如果没有免费假滚轴配置则默认用普通的假滚轴
         * @param rollerId 使用第几套假滚轴，默认为第一套
         */
        public changeDataMode(isFree:boolean,rollerId:number = 1,colIndexs:number[]=[]):void{
                if (!this._dataProvider) {
                        this._dataProvider = this._factoryModel.produce(JTModelFactory.SCROLLERGROUP_DATA_MODEL, this) as JTArrayCollection;
                        (this._dataProvider as JTArrayCollection).initialize();
                }

                (this._dataProvider as JTArrayCollection).setDataMode(isFree?JTArrayCollection.FREE_MODE:JTArrayCollection.NORMAL_MODE,rollerId,colIndexs);

        }

        /**
         * 更新列表数据
         * @param grids 未改变的GRID列表
         * @param gridChangeds 改变的GRID列表
         */
        public onUpdate(grids: any[], gridChangeds: any[],gridShapes:any[]=[],gridShapesChanged:any[]=[],occupyPosList:any[]=[],occupyPosListChanged:any[]=[]): void {
                if (!this._dataProvider) {
                        this._dataProvider = this._factoryModel.produce(JTModelFactory.SCROLLERGROUP_DATA_MODEL, this) as JTArrayCollection;
                        (this._dataProvider as JTArrayCollection).initialize();
                }

                if (this._customSourceHandler) {
                        let dataList = this._customSourceHandler.run();
                        if (dataList && dataList.length > 0) {
                                (this._dataProvider as JTArrayCollection).forceUpdateDefaultDataList(dataList);
                        }
                }
                (this._dataProvider as JTArrayCollection).update(grids, gridChangeds,gridShapes,gridShapesChanged,occupyPosList,occupyPosListChanged);
        }

        /**
         * 更新列表数据
         * @param grids 未改变的GRID列表
         * @param gridChangeds 改变的GRID列表
         */
        public reRender(grids: any[], gridChangeds: any[]): void {
                (this._dataProvider as JTArrayCollection).update(grids, gridChangeds);
                for (let i = 0; i < this._items.length; i++) {
                        let s = this._items[i] as JTScroller;
                        (s.pipeline as JTScheduledPipeline).lineTimeComplete(true);

                        s.sortItemszIndex();
                }
        }

        /**
         * 随机改变管道通道
         */
        public randomChanged(): JTChannelPipeline {
                let ids: any[] = JTChannelPipeline.channelIds();
                let total: number = ids.length;
                let rondomIndex: number = Math.floor((Math.random() * total));
                let rondomId: number = ids[rondomIndex];
                return this.changeChannelPipeline(rondomId);
        }

        /**
         * 子级选项
         * @param cls 子级选项Class类
         * @param priority 子级选项优先级
         * @param indexs 索引列表
         * @param complete 执行函数
         */
        public childOption(cls: any, priority: number, indexs?: any, complete?: Function) {
                return this._channelPipeline.childOption(cls, priority, indexs, complete);
        }

        /**
         * 选项索引列表
         * @param cls 子级选项Class类
         * @param dataListType 子级选项数据类型
         * @param indexs 索引列表
         * @param complete 执行函数
         */
        public optionIndexs(cls: any, dataListType: number, indexs: any, complete?: Function) {
                if (complete != null) this._complete = complete;
                let pipeline: JTPipelineTemplate = this._channelPipeline.option(cls, indexs[0], dataListType, complete) as JTPipelineTemplate;
                pipeline.indexs = indexs;
                return pipeline;
        }

        /**
         * 单个选项
         * @param cls 子级选项Class类
         * @param dataListType 子级选项数据类型
         * @param complete 执行函数
         */
        public option(cls: any, dataListType: number, complete?: Function) {
                return this.optionIndexs(cls, dataListType, [0], complete)
        }

        /**
         * 选项集
         * @param cls 子级选项Class类
         * @param dataListType 子级选项数据类型
         * @param count 子级选项的个数
         * @param complete 执行函数
         */
        public options(cls: any, dataListType: number, count: number, complete?: Function) {
                let indexs: number[] = [];
                for (let i: number = 0; i < count; i++) {
                        indexs.push(i);
                }
                return this.optionIndexs(cls, dataListType, indexs, complete);
        }

        /**
         * 启动
         * @param settings 启动的设置
         */
        public launch(settings?: JTScrollerSettings): void {
                this.start(settings.getSpeed(), settings.getDelayTime(), settings.getTime(), settings.getDistance(), settings.getBeginTime(),settings.getEndDelayTime(),settings.getEndDistance(),settings.getEndTime());
        }

        /**
         * 启动元素单位
         * @param value 索引值
         * @param index 
         * @param count 总个数
         */
        public launchItem(value: number, index: number, count: number): void {
                let s: JTScroller = this.getItem(value) as JTScroller;
                this.clear();
                this.reset();
                this._isRunning = true;
                s.start(this._speed, this._delay, this._time, this._distance, this._beginTime,this._endDelay,this._endDistance,this._endTime);
        }
        
        /**
         * 
         * @param settings 
         */
        public launchItemsBySequence(settings: JTScrollerSettings):void{
                let sequence = settings.getRunSequence();
                let ids = [];
                for(let i=0;i<sequence.length;i++){
                    ids[i] = sequence[i]+1;
                }
                this.launchItems(ids,settings);
        }

        /**
         * 启动元素单位列表
         * @param ids  id列表 
         */
        public launchItems(ids: any[], settings: JTScrollerSettings): void {
                if (this._isRunning) return;
                let speed = settings.getSpeed();
                let delay = settings.getDelayTime();
                let time = settings.getTime();
                let distance = settings.getDistance();
                let beginTime = settings.getBeginTime();
                let endDistance = settings.getEndDistance();
                let endTime = settings.getEndTime();
                let endDelay = settings.getEndDelayTime();
                //this._ruleTaskManager.runningRuleTasks();
                this.clear();
                super.start(speed, delay, time, distance, beginTime,endDelay,endDistance,endTime);
                this._isRunning = true;
                this._isManualStop = false;
                this._isSkipChangeTask = false;
                this.beginTime = beginTime;
                this._freeList.length = this._runnings.length = 0;
                this.reset();
                if (this.direction != "") {
                        if (this.config.orientation == SlotOrientation.Portrait) {
                                speed = this.direction == JTGroup.SCROLLINGDOWN ? Math.abs(speed) : -Math.abs(speed);
                        } else {
                                speed = this.direction == JTGroup.SCROLLINGLEFT ? Math.abs(speed) : -Math.abs(speed);
                        }
                }
                for (let i: number = 0; i < ids.length; i++) {
                        let index = ids[i] - 1;
                        let s: JTScroller = this.getItem(index) as JTScroller;
                        s.beginTime = beginTime;
                        s.start(speed, delay > 0 ? (delay * (i + 1)) : delay, time, distance, beginTime,endDelay* (i + 1),endDistance,endTime);
                        this._isPending&&(s.pipeline as JTScheduledPipeline).setTaskPending();
                        this._runnings.push(s);
                }
        }

        /**
         * 设定一次挂起的任务计划， 当要结算挂起继续执行任务时调用continuePendingTask
         */
        public setOncePendingSchedule(): void {
               this._isPending = true;
               if(this._isRunning){
                for (let i: number = 0; i < this._runnings.length; i++) {
                        let s: JTScroller = this._runnings[i] as JTScroller;
                        let p = s.pipeline as JTScheduledPipeline
                        p.setTaskPending();
                }
               }

        }

        public rendersDataReady(): void {
                if (this._items) {
                        for (let i: number = 0; i < this._items.length; i++) {
                                let s: JTScroller = this._items[i] as JTScroller;
                                s.rendersDataReady();
                        }
                }
        }
        
        /**
         * 继续挂起的任务
         */
        public continuePendingTask(): void {
                if (this._items) {
                        for (let i: number = 0; i < this._items.length; i++) {
                                let s: JTScroller = this._items[i] as JTScroller;
                                let p = s.pipeline as JTScheduledPipeline
                                p.continuePendingTask()
                        }
                }
        }

        /**
         * 背景填充
         */
        public backgroundFill(): void {
                let width: number = this._config.col * this._config.gapWidth;
                let height: number = this._config.row * this._config.gapHeight;
                this._background = new JTGraphics();
                this._background.graphics.fillColor = new cc.Color(0xff, 0x66, 0x00);
                this._background.graphics.roundRect(0, 0, width, height);
                this._background.opacity = 0;
                this.addChild(this._background);//cocos
        }

        /**
         * 停止所有
         * @param isTween 
         */
        public stopAll(isTween: boolean = false): void {
                this._isManualStop = true;
                if (this._items) {
                        for (let i: number = 0; i < this._items.length; i++) {
                                this.stop(i, isTween);
                        }
                }
                this._ruleTaskManager.clear();
        }

        /**
         * 清理皮肤加载器列表
         */
        public clearSkinLoaders(): void {
                for (let i: number = 0; i < this._items.length; i++) {
                        let s: JTItemSkinLoader = this._items[i];
                        s.clearSkinLoader();
                }
        }

        /**
         * 清除滚轴所有皮肤
         */
        public clearGroupSkinLoaders(): void {
                this.clearSkinLoader();
                this.clearSkinLoaders();
        }

        /**
         * 单个停止
         * @param index 单个元素的索引
         * @param isTween 
         */
        public stop(index: number, isTween: boolean = false): void {
                if (!this._isRunning) return;
                let s: JTScroller = this._items[index] as JTScroller;
                s.kill(isTween);
        }

        /**
         * 绑定
         * @param owner 绑定的拥有者
         * @param caller 绑定的域
         */
        public bind(owner: JTContainer, caller: any): void {
                super.bind(owner, caller);
                (this._ruleTaskManager as JTContainer).bind(this, caller)
        }

        /**
         * 开始
         * @param speed 速度
         * @param delay 延迟
         * @param time 运行时间
         * @param distance 回弹距离
         * @param beginTime 回弹时间
         */
        public start(speed: number, delay: number = 20, time: number = 3000, distance: number = 80, beginTime: number = 150,endDelayTime:number = 20,endDistance:number=80,endTime = 150): void {
                if (this._isRunning) return;
                //this._ruleTaskManager.runningRuleTasks();
                if (this.direction != "") {
                        if (this.config.orientation == SlotOrientation.Portrait) {
                                speed = this.direction == JTGroup.SCROLLINGDOWN ? Math.abs(speed) : -Math.abs(speed);
                        } else {
                                speed = this.direction == JTGroup.SCROLLINGLEFT ? Math.abs(speed) : -Math.abs(speed);
                        }
                }
                super.start(speed, delay, time, distance, beginTime,endDelayTime,endDistance,endTime);
                // this.isLockSingle(true);
                this._isRunning = true;
                this._isManualStop = false;
                this.beginTime = beginTime;
                this._isSkipChangeTask = false;
                this._freeList.length = this._runnings.length = 0;
                this.reset();

                for (let i: number = 0; i < this._items.length; i++) {
                        let s: JTScroller = this._items[i] as JTScroller;
                        s.beginTime = beginTime;
                        this._runnings.push(s);
                        s.start(speed, delay > 0 ? (delay * (i + 1)) : delay, time, distance, beginTime,endDelayTime* (i + 1),endDistance,endTime);
                        this._isPending&&(s.pipeline as JTScheduledPipeline).setTaskPending();

                }
        }
        
        /**
         * 运行后增加额外运行时间,仅本次生效
         * @param time 单位 毫秒
         */
        public addRunningTime(time:number):void{
                for (let i: number = 0; i < this._items.length; i++) {
                    let s: JTScroller = this._items[i] as JTScroller;
                    s.time += time;
                }
        }

        /**
         * 重置
         */
        public reset(): void {
                super.reset();
                this.resetLayerSort();
        }

        /**
         * 获取转换列表（一维数组转换成二维数组）
         * @param values 列表
         * @param count 单个（以多少为单位进行转换）
         */
        public getConvertToList(values: any[], count: number): any[] {
                let list: any[] = [];
                for (let i: number = 0; i < count; i++) {
                        list.push(values.shift());
                }
                return list;
        }

        /**
         * 通过索引获取渲染器,index从1开始
         * @param index 渲染器索引
         */
        public getRenderByIndex(index: number): JTItemRender {
                var pos: number = 0;
                for (let j: number = 0; j < this._items.length; j++) {
                        let scroller: JTScroller = this._items[j] as any;
                        var rs: BaseSpinSlotView[] = scroller.renders as BaseSpinSlotView[];
                        for (let i: number = 0; i < rs.length; i++) {
                                if(rs[i].index+1==index||rs[i].mixIndexs.includes(index-1)){
                                        return rs[i];
                                }
                        }
                }
                return null;
        }

        /**
         * 通过索引获取渲染器,index从0开始
         * @param index 渲染器索引
         */
        public getRenderByPos(index: number): JTItemRender {
                for (let j: number = 0; j < this._items.length; j++) {
                        let scroller: JTScroller = this._items[j] as any;
                        var rs  = scroller.renders as BaseSpinSlotView[];
                        for (let i: number = 0; i < rs.length; i++) {
                                if(rs[i].index==index||rs[i].mixIndexs.includes(index)){
                                   return rs[i];
                                }
                        }
                }
                return null;
        }

        /**
         * 通过ID获取一样的itemRender列表
         * @param id 渲染器ID
         */
        public getSomesById(id: number): JTItemRender[] {
                var list: JTItemRender[] = [];
                for (let i: number = 0; i < this._items.length; i++) {
                        let s: JTScroller = this._items[i] as JTScroller;
                        list = list.concat(s.getSomeById(id));
                }
                return list;
        }

        /**
         * 通过ID获取改变过后一样的渲染器列表
         * @param id 渲染器ID
         */
        public getSomeChangedById(id: number): JTItemRender[] {
                var list: JTItemRender[] = [];
                for (let i: number = 0; i < this._items.length; i++) {
                        let scroller: JTScroller = this._items[i] as JTScroller;
                        list = list.concat(scroller.getSomeChangedById(id));
                }
                return list;
        }

        /**
         * 激活某个状态（帧）
         * @param frame 状态（帧）
         */
        public enableds(frame: number = JTItemRender.STATE_OVER): void {
                var length: number = this._items.length;
                for (var i: number = 0; i < length; i++) {
                        var s: JTGroup = this._items[i] as JTGroup;
                        s.enableds(frame);
                }
        }

        /**
         * 强制刷新数据
         * 调用此方法，必须是滚轴完全初始化完成，并且在停止状态使用
         * @param dataList 数据列表
         */
        public forceUpdate(dataList: any[]): void {
                (this._dataProvider.grids as JTElementArrayList).dataList = dataList;
                for (var i: number = 0; i < this._items.length; i++) {
                        var g: JTGroup = this._items[i] as JTGroup;
                        g.forceUpdate(dataList[i]);
                }
        }
        /**
         * 获取随机ID
         */
        public getRondomId(): number {
                var index: number = Math.floor(Math.random() * this._defualtImageIds.length);
                return this._defualtImageIds[index];
        }

        /**
         * 创建
         */
        public create(): void {
                this._items = [];
                this.initializeLayer();
                this.createScrollers();
                this._isBackgroundFill && this.backgroundFill();
        }

        /**
         * 创建滚轴列表
         */
        protected createScrollers(): void {
                let factoryLayer: JTLayerFactory = this._factoryLayer as JTLayerFactory;
                this._sContainer = factoryLayer.produce(JTLayerFactory.SCROLLER_CONTAINER, this) as JTGComponent;
                this._skinLoaderContainer = factoryLayer.produce(JTLayerFactory.SKIN_LOADER_CONTAINER) as JTGComponent;

                let count: number = this._channelPipeline.getCount();
                this._pContainer = new JTGComponent();
                this._sContainer.addChild(this._pContainer);
                for (let i: number = 0; i < count; i++) {
                        let s: JTScroller = this.factoryChild.produce(JTChildFactory.SCROLLER_TYPE, this._sContainer) as JTScroller;
                        let collection: JTCollection<JTDataInfo> = this._dataProvider.elements[i] as JTCollection<JTDataInfo>
                        collection.scroller = s;
                        s.dataProvider = collection as JTCollection<JTDataInfo>;
                        let container = new JTGComponent();
                        this._itemContainers.push(container);
                        container.addChild(s);
                        this._sContainer.addChild(container);
                        this.setupScrollerPipeline(s, i);
                        this._items.push(s);
                }
  
                this.updateRenders();
        }

        /**
         * 创建滚轴通道
         * @param  s  滚轴 
         * @param i  滚轴索引
         */
        protected setupScrollerPipeline(s: JTScroller, i: number): JTFuturePipeline {
                let template: JTPipelineTemplate = this._channelPipeline.getTemplate(i) as JTPipelineTemplate;
                let plugin: JTTaskInfo = template.getTaskInfo();
                let options: SDictionary = template.options;
                let keys: any[] = options.keys;
                let pipeline: JTFuturePipeline = plugin.pipeline ? plugin.pipeline as JTFuturePipeline : plugin.create() as JTFuturePipeline;
                if (keys.length > 0) {
                        this.setupOptions(pipeline as any, options);
                }
                s.config = this._config;
                s.index = i;
                s.name = "scroller_" + i;
                s.sources = this.sources[i];
                s.bind(this, this.caller);
                pipeline.dataProvider = s.dataProvider;
                pipeline.ruleTaskManager = this._ruleTaskManager;
                s.setupRegister(this._progress, this._nextHandler, this._beginRunning);
                s.setupPipeline(pipeline);
                return pipeline;
        }

        /**
         * 初始化层级
         */
        protected initializeLayer(): void {
                this.setupSkinLoader(0, 0, this.skinLoaderContainer);
                (this.factoryLayer as JTLayerFactory).produces();
                (this.factoryLayer as JTLayerFactory).initialize(this);
        }

        protected afterInitializeLayer():void{
                
        }

        /**
         * 安装选项集
         * @param pipeline 通道
         * @param options 选项数组
         */
        protected setupOptions(pipeline: JTTaskPipeline, options: SDictionary): void {
                let keys: number[] = options.keys;
                let count: number = keys.length;
                for (let i: number = 0; i < count; i++) {
                        let priority: number = keys[i];
                        let child: JTTask = options.get(priority);
                        pipeline.childOption(child, priority, child.handler);
                }
        }

        /**
         * 父级的滚动完成函数
         */
        public superScrollerComplete(): void {
                super.scrollingComplete();
        }

        /**
         * 滚动完成函数
         */
        public scrollingComplete(): void {
                this._freeList.push(this._runnings.shift());
                if (this._runnings.length == 0) {
                        this.updateRenders();
                        super.scrollingComplete();
                        this._isRunning = false;
                        if(this._isOnceOpenItems){
                            this._openItemIds = [];
                            this._isOpenItems = false;
                        }
                        //     this.reset();
                        this._ruleTaskManager.clear();
                        this._complete && this._complete.apply(this.caller, [this]);
                        this._freeList.length = 0;
                        this._isPending = false;
                }
        }

        public removeRunnings(s: JTScroller): void {
                let index = this._runnings.indexOf(s);
                if (index > -1) {
                        this._runnings.splice(index, 1);
                        this._freeList.push(s);
                        s.clear();
                }
        }

        //     public updateLayer():void
        //     {
        //                 for (var i:number = 0; i < this._items.length; i++)
        //                 {
        //                         var r:fairygui.GComponent = this._items[i] as any;
        //                         this._sContainer.setChildIndex(r, i);
        //                 }
        //     }
        /**
         * 通过规则任务类型 获取规则任务壳
         * @param type 规则任务类型 
         */
        public getRuleContainer(type: string): JTTask {
                return this._ruleTaskManager.getRuleContainer(type);
        }

        /**
         * 当前规则任务是否正在运行
         * @param apt 规则任务 
         */
        public hasOwnRunning(apt: JTTask): boolean {
                return this._ruleTaskManager.hasOwnRunning(apt);
        }

        /**
        * 通过规则任务类型获取规则任务
        * @param type 规则任务类型 
        */
        public getRuleTask(type: string): JTTask {
                return this._ruleTaskManager.getRuleTask(type);
        }

        /**
         * 注册规则任务
         * @param type 规则任务类型 
         * @param task 规则任务对象
         * @param container 规则任务壳
         */
        public registerTask(type: string, task: JTTask, container?: JTTask): JTRuleTaskManager {
                return this._ruleTaskManager.registerTask(type, task, container as JTTaskContainer);
        }

        /**
         * 运行一些需要初始化的操作（比如百搭重转，1*3的时候，未转完的时候下次登陆需要继续回到1*3的状态）
         */
        public runningCallTask(): void {
                this._ruleTaskManager.runningCallTask();
        }

        /**
         * 通过规则任务类型移除规则任务
         * @param type 规则任务类型
         */
        public removeRuleTask(type: string): void {
                this._ruleTaskManager.removeRuleTask(type);
        }

        /**
         * 运行规则任务
         * 在开始的时候会把所有注册规则任务执行一下遍
         * 调用任务的runningTask（）方法
         */
        public runningRuleTasks(): void {
                this._ruleTaskManager.runningRuleTasks();
        }

        /**
         * 规则任务历史记录
         */
        public get histroys(): JTTask[] {
                return this._ruleTaskManager.histroys;
        }

        /**
         * 规则任务管理器
         */
        public get ruleTaskManager(): JTRuleTaskManager {
                return this._ruleTaskManager;
        }

        /**
         * 重新更新有效渲染器列表
         */
        public updateRenders(): JTItemSkinLoader[] {
                this._renders.length = 0;
                for (let i: number = 0; i < this._items.length; i++) {
                        let s: JTScroller = this._items[i] as JTScroller;
                        this._renders = this._renders.concat(s.renders);
                }
                return this._renders;
        }

        /**
         * 用changeData刷新滚轴
         */
        public refreshScrollers(): void {
                this.reset();
                //this.clear();
                for (let i = 0; i < this._items.length; i++) {
                        let s = this._items[i] as JTScroller;
                        (s.pipeline as JTScheduledPipeline).lineTimeComplete(true);
                        s.sortItemszIndex();
                }
        }

        /**
         * 空闲运行列表
         */
        public get freeList(): JTItemSkinLoader[] {
                return this._freeList;
        }
        /**
         * 空闲运行列表
         */
        public set freeList(value: JTItemSkinLoader[]) {
                this._freeList = value;
        }

        /**
         * 正在运行列表
         */
        public get runnings(): JTItemSkinLoader[] {
                return this._runnings;
        }

        /**
         * 正在运行列表
         */
        public set runnings(value: JTItemSkinLoader[]) {
                this._runnings = value;
        }

        /**
         * 有效渲染器中心坐标Map数组
         */
        public get centerMapLandscape(): Object {
              return this._channelPipeline.centerMapLandscape;
        }

        /**
         * 有效渲染器中心坐标Map数组
         */
         public get centerMapPortrait(): Object {
                return this._channelPipeline.centerMapPortrait;
          }        

        /**
         * 有效渲染器初始化坐标Map数组
         */
        public get pointMapLandscape(): Object {
                return this._channelPipeline.pointMapLandscape;
        }

        /**
         * 有效渲染器初始化坐标Map数组
         */
         public get pointMapPortrait(): Object {
                return this._channelPipeline.pointMapPortrait;
        }   
        
        
        /**
         * 静态有效渲染器中心坐标Map数组
         */
        public get staticCenterMapLandscape(): Object {
               return this._channelPipeline.staticCenterMapLandscape;
        }

        /**
         * 静态有效渲染器中心坐标Map数组
         */
        public get staticCenterMapPortrait(): Object {
                return this._channelPipeline.staticCenterMapPortrait;
        }   
        /**
         * 通过渲染器ID，匹配ID和指定渲染器个数 获取匹配连续渲染器列表
         * @param id 渲染器ID
         * @param matchId 匹配ID
         * @param count 指定渲染器个数
         */
        public getMatchingContinueByIds(id: number, matchId: number[], count: number): JTItemRender[] {
                let list: JTItemRender[] = [];
                for (let i: number = 0; i < this._items.length; i++) {
                        if (i >= count) break;
                        let s: JTScroller = this._items[i] as JTScroller;
                        let itemList: JTItemRender[] = s.getSomeById(id);
                        if (matchId.length == 1) {
                                itemList = itemList.concat(s.getSomeById(matchId[0]));
                        } else {
                                itemList = itemList.concat(s.getSomeById2(matchId));
                        }
                        console.log(i,itemList.length,id,count)
                        if (itemList.length == 0) break;
                        list = list.concat(itemList);
                }
                return list;
        }

        /**
         * 通过渲染器id获取连续的渲染器列表
         * @param id 渲染器id
         * @param count 渲染器个数
         */
        public getContinueByIds(id: number, count: number): JTItemRender[] {
                let list: JTItemRender[] = [];
                for (let i: number = 0; i < this._items.length; i++) {
                        if (i >= count) break;
                        let s: JTScroller = this._items[i] as JTScroller;
                        let itemList: JTItemRender[] = s.getSomeById(id);
                        if (itemList.length == 0) continue;
                        list = list.concat(itemList);
                }
                return list;
        }

        /**
         * 通过渲染器索引获取渲染器中心点坐标
         * @param index 渲染器索引
         */
        public getRenderCenterPoint(index: number): cc.Vec2 {
                return this.isLandscape?this._channelPipeline.getRenderCenterPointLandscape(index):this._channelPipeline.getRenderCenterPointPortrait(index);
        }

        /**
         * 通过渲染器索引获取渲染器中心点坐标
         * @param index 渲染器索引
         */
         public getRenderCenterPointLandscape(index: number): cc.Vec2 {
                return this._channelPipeline.getRenderCenterPointLandscape(index);
        }
        /**
         * 通过渲染器索引获取渲染器中心点坐标
         * @param index 渲染器索引
         */
         public getRenderCenterPointPortrait(index: number): cc.Vec2 {
                return this._channelPipeline.getRenderCenterPointPortrait(index);
        }   

        /**
         * 通过渲染器索引获取渲染器坐标
         * @param index 渲染器索引
         */
        public getRenderPoint(index: number): cc.Vec2 {
                return this.isLandscape?this._channelPipeline.getRenderPointLandscape(index):this._channelPipeline.getRenderPointPortrait(index);
        }

        /**
         * 通过渲染器索引获取渲染器坐标
         * @param index 渲染器索引
         */
         public getRenderPointLandscape(index: number): cc.Vec2 {
                return this._channelPipeline.getRenderPointLandscape(index);
        }

        /**
         * 通过渲染器索引获取渲染器坐标
         * @param index 渲染器索引
         */
         public getRenderPointPortrait(index: number): cc.Vec2 {
                return this._channelPipeline.getRenderPointPortrait(index);
        }

        /**
         * 通过渲染器索引获取渲染器中心点坐标
         * @param index 渲染器索引
         */
        public getRenderStaticCenterPointLandscape(index: number): cc.Vec2 {
                return this._channelPipeline.getRenderStaticCenterPointLandscape(index);
        }

        /**
         * 通过渲染器索引获取渲染器中心点坐标
         * @param index 渲染器索引
         */
        public getRenderStaticCenterPointPortrait(index: number): cc.Vec2 {
                return this._channelPipeline.getRenderStaticCenterPointPortrait(index);
        }

        /**
         * 通过渲染器索引获取渲染器中心点坐标
         * @param index 渲染器索引
         */
        public getRenderStaticCenterPoint(index: number): cc.Vec2 {
                return this.isLandscape?this._channelPipeline.getRenderStaticCenterPointLandscape(index):this._channelPipeline.getRenderStaticCenterPointPortrait(index);
        }

        /**
         * 获取滚轴组当前通道管道
         */
        public get channelPipeline(): JTChannelPipeline {
                return this._channelPipeline;
        }

        //     public set time(value:number)
        //     {
        //         this._time = value;
        //         this.changeRenderValue("time", value);
        //     }

        /**
         * 改变单个滚轴的属性的值
         * @param property 属性名
         * @param value 属性名
         */
        public changeRenderValue(property: string, value: any): void {
                for (let i: number = 0; i < this.items.length; i++) {
                        let s: JTScroller = this.items[i] as JTScroller;
                        s[property] = value;
                }
        }

        /**
         * 更新改变子显示对像列表的层级
         * @param childs 子级列表
         * @param isUpdate 是否马上更新层级
         */
        public updateChangedChildsLayer(childs: JTItemSkinLoader[], isUpdate: boolean = false): void {
                if (this._layerSortPlayContainer) {
                        this._layerSortPlayContainer.updateChangedChildsLayer(childs, isUpdate);
                }
                if (this._layerSortStopContainer) {
                        let playChilds = [];
                        if(this._layerSortPlayContainer){
                                playChilds = this._layerSortPlayContainer.getChilds();
                        }
                        let stopChilds = this._layerSortStopContainer.getChilds();
                        let list: any[] = [];
                        for (let i: number = 0; i < this._renders.length; i++) {
                                let child: JTItemRender = this._renders[i] as JTItemRender;
                                if(playChilds.indexOf(child) != -1){
                                        let index = stopChilds.indexOf(child);
                                        stopChilds.splice(index,1);
                                        continue;
                                }
                                if (childs.indexOf(child) != -1) {
                                        continue;
                                }

                                list.push(child);
                        }
                        this._layerSortStopContainer.updateChangedChildsLayer(list, isUpdate);
                }
        }

        /**
         * 更新层
         * @param group 
         */
        public updateLayer(group?: JTGroup): void {
                this._layerSortPlayContainer && this._layerSortPlayContainer.updateLayer();
                this._layerSortStopContainer && this._layerSortStopContainer.updateLayer();
                //   super.updateLayer();
        }

        /**
         * 还原层级排序
         */
        public resetLayerSort(): void {
                this._layerSortPlayContainer && this._layerSortPlayContainer.resetLayerSort();
                this._layerSortStopContainer && this._layerSortStopContainer.resetLayerSort();
        }

        public isRenderInSortLayer(r:JTItemRender):boolean{
                
                if(this._layerSortPlayContainer&&this._layerSortPlayContainer.getChilds().indexOf(r)>-1){
                        return true;
                }

                if(this._layerSortStopContainer&&this._layerSortStopContainer.getChilds().indexOf(r)>-1){
                        return true;
                }

                if(this._layerSortScatterPlayContainer&&this._layerSortScatterPlayContainer.getChilds().indexOf(r)>-1){
                        return true;
                }

                if(this._layerSortScatterStopContainer&&this._layerSortScatterStopContainer.getChilds().indexOf(r)>-1){
                        return true;
                }

                return false;
        }

        //     public get options():Laya.Dictionary
        //     {
        //             return this._options;
        //     }

        //     public getOption(type:number):any
        //     {
        //            return this._options.get(type);
        //     }

        //     public hasOwnOption(type:number):boolean
        //     {
        //             return this._options.indexOf(type) != -1;
        //     }
        
        /**
         * 调整滚轴坐标
         * @param index 滚轴索引
         * @param offset 偏移量
         */
        public adjustScrollerPostion(index:number,offset:cc.Vec2):void{
             let container = this._itemContainers[index];
             if(container){
                   container.x += offset.x;
                   container.y += offset.y;
             }
             this._itemOffsets[index] = offset;
             let scroller = this.items[index] as JTScroller;
             for(let i=0;i<scroller.indexs.length;i++){
                     //let r = scroller.renders[i] as BaseSpinSlotView;
                     let index = scroller.indexs[i]
                     let centerPointLandscape = this.getRenderCenterPointLandscape(index);
                     if(centerPointLandscape){
                        centerPointLandscape.x += offset.x;
                        centerPointLandscape.y += offset.y;
                     }
      
                     let centerPortrait = this.getRenderCenterPointPortrait(index);
                     if(centerPortrait){
                        centerPortrait.x += offset.x;
                        centerPortrait.y += offset.y;
                     }

                     let pointLandscape = this.getRenderPointLandscape(index);
                     if(pointLandscape){
                        pointLandscape.x += offset.x;
                        pointLandscape.y += offset.y;
                     }
                     
                     let pointPortrait = this.getRenderPointPortrait(index);
                     if(pointPortrait){
                        pointPortrait.x += offset.x;
                        pointPortrait.y += offset.y;
                     }

                     let staticCenterPointLandscape = this.getRenderStaticCenterPointLandscape(index);
                     staticCenterPointLandscape.x += offset.x;
                     staticCenterPointLandscape.y += offset.y;

                     let staticCenterPortrait = this.getRenderStaticCenterPointPortrait(index);
                     staticCenterPortrait.x += offset.x;
                     staticCenterPortrait.y += offset.y;
             }
        }
        
        /**
         * 设置滚轴列的倾斜度,为斜边与水平线逆时针的夹角，垂直为90，向右倾小于90，向左倾大于90
         * 如填入参数[87,90,93]则会依次设定1，2，3列的倾斜角度为87,90,93
         * @param inclineDegrees 
         */
        public setupItemInclineDegrees(inclineDegrees:number[]):void{
            this._isIncline = true;
            this._inclineDegrees = inclineDegrees;
        }
        
        /**         
         * 设置滚轴列的弧度角度，指列的上下边缘与滚轴中心形成的夹角的度数，若垂直填0
         * 如填入参数[120,0,-120]则会依次设定1，2，3列的倾斜角度为120,0,-120
         * @param curveDegrees 
         */
        public setupItemCurve(curveDegrees:number[]):void{
            this._isCurve = true;
            this._curveDegrees = curveDegrees;
        }
        
        /**
         * 设置格子矩阵，0代表无元素，1代表有元素
        * 示例
        * [
        *  [0,1,1],[1,1,1],[0,1,1],[1,1,1],[0,1,1]
        * ]
         * @param gridRenderConfig 格子渲染器矩阵配置 
         */
        public setupGridRenderConfig(gridRenderConfig:number[][]):void{
            this._gridRenderConfig = gridRenderConfig;
        }

        public get gridRenderConfig():number[][]{
                return this._gridRenderConfig;
        }
        /**
         * 层级工厂
         */
        public get factoryLayer(): JTFactory {
                return this._factoryLayer;
        }
        /**
        * 子级工厂
        */
        public get factoryChild(): JTFactory {
                return this._factoryChild;
        }
        /**
         * 数据模型工厂
         */
        public get factoryModel(): JTFactory {
                return this._factoryModel;
        }

        /**
         * 皮肤列表
         */
        public get skinLoaders(): JTGLoader[] {
                return this._skinLoaders;
        }

        /**
         * 中奖渲染器层级排序容器
         */
        public get layerSortPlayContainer(): JTLayerSortContainer {
                return this._layerSortPlayContainer;
        }
        /**
         * 未中奖渲染器层级排序容器
         */
        public get layerSortStopContainer(): JTLayerSortContainer {
                return this._layerSortStopContainer;
        }

        public get layerSortScatterPlayContainer(): JTLayerSortContainer {
                return this._layerSortScatterPlayContainer;
        }
        
        public get layerSortScatterStopContainer(): JTLayerSortContainer {
             return this._layerSortScatterStopContainer;
        }
        

        /**
         * 皮肤列表
         */
        public set skinLoaders(value: JTGLoader[]) {
                this._skinLoaders = value;
        }

        /**
         * 默认皮肤列表容器
         */
        public get skinLoaderContainer(): JTGComponent {
                return this._skinLoaderContainer;
        }
        /**
         * 默认皮肤列表容器
         */
        public set skinLoaderContainer(value: JTGComponent) {
                this._skinLoaderContainer = value;
        }
        /**
         * 规则任务壳Map数组
         */
        public get ruleMap(): SDictionary {
                return this._ruleTaskManager.ruleMap;
        }
        /**
         * 规则任务壳列表
         */
        public get taskContainers(): JTTaskContainer[] {
                return this.ruleTaskManager.taskContainers;
        }

        //     public set speed(value:number)
        //     {
        //         this._speed = value;
        //         this.changeRenderValue("speed", value);
        //     }

        //     public set delay(value:number)
        //     {
        //         this._delay = value;
        //         this.changeRenderValue("delay", value);
        //     }

        //     public set frameRate(value:number)
        //     {
        //         this._frameRate = value;
        //         this.changeRenderValue("frameRate", value);
        //     }

        //     public set frameRateTime(value:number)
        //     {
        //         this._frameRateTime = value;
        //         this.changeRenderValue("frameRateTime", value);
        //     }
        /**
         * 滚轴容器
         */
        public get scrollerContainer(): JTContainer {
                return this._sContainer;
        }
        /**
         * 默认的ID列表
         */
        public get defaultImageIds(): any[] {
                return this._defualtImageIds;
        }
        
        /**
         * 滚轴的遮罩容器
         */
        public get scrollerGroupMask():JTScrollerGroupMask{
                return this._scrollerGroupMask;
        }

        /**
        * 关联的gameID
        */
        public get gameID(): number {
                return this._gameID;
        }
        /**
         * 关联的gameID
         */
        public set gameID(vaule:number) {
               this._gameID = vaule;
        }

        /**
        * 关联的gameID
        */
        public get freeSources(): any[] {
                return this._freeSources;
        }
        /**
         * 关联的gameID
         */
        public set freeSources(vaule:any[]) {
                this._freeSources = vaule;
        }

                /**
        * 关联的gameID
        */
        public get defaultSources(): any[] {
                return this._defaultSources;
        }
        /**
         * 关联的gameID
         */
        public set defaultSources(vaule:any[]) {
                this._defaultSources = vaule;
        }

        /**
        * 关联的gameID
        */
        public get itemOffsets(): cc.Vec2[] {
                return this._itemOffsets;
        }
        /**
         * 关联的gameID
         */
        public set itemOffsets(vaule:cc.Vec2[]) {
                this._itemOffsets = vaule;
        }

        /**
         * 滚轴容器
         */
        public get pluginContainer(): JTContainer {
                return this._pContainer;
        }

        /**
        * 
        */
        public get isSkipChangeTask(): boolean {
                return this._isSkipChangeTask;
        }
        /**
         * 
         */
        public set isSkipChangeTask(vaule:boolean) {
                this._isSkipChangeTask = vaule;
        }

        /**
        * 
        */
        public get inclineDegrees(): number[] {
                return this._inclineDegrees;
        }
        /**
         * 
         */
        public set inclineDegrees(vaule:number[]) {
                this._inclineDegrees = vaule;
        }

        /**
        *  滚轴列是否倾斜的
        */
        public get isIncline(): boolean {
                return this._isIncline;
        }
        /**
         * 
         */
        public set isIncline(vaule:boolean) {
                this._isIncline = vaule;
        }

        /**
        * 
        */
        public get curveDegrees(): number[] {
                return this._curveDegrees;
        }
        /**
         * 
         */
        public set curveDegrees(vaule:number[]) {
                this._curveDegrees = vaule;
        }

        /**
        *  滚轴列是带弯曲的
        */
        public get isCurve(): boolean {
                return this._isCurve;
        }
        /**
         * 
         */
        public set isCurve(vaule:boolean) {
                this._isCurve = vaule;
        }

        /**
        *  滚轴列是带弯曲的
        */
        public get expandScrollerInfo(): JTExpandScrollerInfo[] {
                return this._expandScrollerInfo;
        }
        /**
         * 
         */
        public set expandScrollerInfo(vaule:JTExpandScrollerInfo[]) {
                this._expandScrollerInfo = vaule;
        }
        

         public get itemContainers(): JTGComponent[] {
                return this._itemContainers;
        }

        public layoutLandscape(): void {
             super.layoutLandscape();
             this.config.isLandscape = true;
             if(this.items){
                for (let i: number = 0; i < this.items.length; i++) {
                        let s: JTScroller = this.items[i] as JTScroller;
                        s.layoutLandscape();
                }
             }
             if(!this.isRunning){
                 this._layerSortPlayContainer&&this._layerSortPlayContainer.layoutLandscape();
                 this._layerSortStopContainer&&this._layerSortStopContainer.layoutLandscape();
             }
        }
        
        public layoutPortrait(): void {
             super.layoutPortrait();
             this.config.isLandscape = false;
             if(this.items){
                for (let i: number = 0; i < this.items.length; i++) {
                        let s: JTScroller = this.items[i] as JTScroller;
                        s.layoutPortrait();
                }
             }
             if(!this.isRunning){
                this._layerSortPlayContainer&&this._layerSortPlayContainer.layoutPortrait()
                this._layerSortStopContainer&&this._layerSortStopContainer.layoutPortrait();
            }
        }
}

class JTChildOption {
        public cls: any = null;
        public progress: Function = null;
        public pipelineCls: any = null;
        public complete: Function = null;
}