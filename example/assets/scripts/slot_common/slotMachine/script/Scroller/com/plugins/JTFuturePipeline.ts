import JTOptionTransition from "./procedure/JTOptionTransition";
import JTScroller from "../JTScroller";
import JTItemRender from "../base/JTItemRender";
import JTConfigGroup from "../JTConfigGroup";
import { JTTaskInfo } from "./procedure/JTPipelineTemplate";
import { SDictionary } from "../../../SlotData/SDictionary";
import { Handler } from "../../../SlotUtils/Handle";
import JTItemSkinLoader from "../base/JTItemSkinLoader";
import JTGroup from "../base/JTGroup";
import JTTask from "../tasks/JTTask";
import { SlotOrientation } from "../../../SlotDefinitions/SlotEnum";
import JTLayoutPoint from "../../extensions/JTLayoutPoint";

/*
* name;
*/
export default abstract class JTFuturePipeline extends JTOptionTransition {
        /**
         * 索引计算器
         */
        protected _indexCounter: number = 0;
        /**
         * 循环回调handler
         */
        protected _loop: Handler = null;
        /**
         * 子级选项集
         */
        protected _options: SDictionary = null;
        /**
         * 初始化的x点
         */
        protected _sourceXLandscape: number = 0;
        /**
         * 初始化的y点
         */
        protected _sourceYLandscape: number = 0;
        /**
         * 初始化的x点
         */
        protected _sourceXPortrait: number = 0;
         /**
          * 初始化的y点
          */
        protected _sourceYPortrait: number = 0;
        /**
         * 渲染器列表
         */
        protected _items: JTItemSkinLoader[] = null;
        /**
         * 索引集
         */
        protected _indexs: any[] = null;

        constructor() {
                super();
                this._items = [];
                this._options = new SDictionary();
                this._indexs = [];
        }

        /**
         * 开始
         */
        public abstract start(): void;

        /**
         * 运行任务
         */
        public abstract runningTask(): void;

        /**
         * 创建
         */
        public abstract create(): void;

        /**
         * 设置滚轴x、y的坐标
         * @param x 
         * @param y 
         */
        public setScrollerXY(sourceXLandscape: number , sourceYLandscape: number ,sourceXPortrait: number , sourceYPortrait: number): void {
                let s: JTScroller = this._scroller as JTScroller;
                s.x = s.config.isLandscape?sourceXLandscape:sourceXPortrait;
                s.y = s.config.isLandscape?sourceYLandscape:sourceYPortrait;
                this._sourceXLandscape = sourceXLandscape;
                this._sourceYLandscape = sourceYLandscape;
                this._sourceXPortrait = sourceXPortrait;
                this._sourceYPortrait = sourceYPortrait;
        }

        /**
         * 设置滚轴x、y的坐标
         * @param x 
         * @param y 
         */
         public resetScrollerPosition(isRunning:boolean): void {
                let s: JTScroller = this._scroller as JTScroller;
                let c:JTConfigGroup = s.config;
                if(isRunning){
                     if(c.orientation==SlotOrientation.Portrait){
                        s.x = c.isLandscape?this.sourceXLandscape:this.sourceXPortrait;
                     }else{
                        s.y = c.isLandscape?this.sourceYLandscape:this.sourceYPortrait;
                     }
                }else{
                     s.x = c.isLandscape?this.sourceXLandscape:this.sourceXPortrait;
                     s.y = c.isLandscape?this.sourceYLandscape:this.sourceYPortrait;
                }
        }

        /**
         * 开始之前要执行的函数
         * 这个函数是在转换数据之前调用
         */
        public beforeStart(): void {

        }

        /**
         * 设置真实有效的渲染器
         * @param render 渲染器 
         */
        public setupRender(render: JTItemRender,p:JTLayoutPoint): void {
                let s: JTScroller = this._scroller as JTScroller;
                let r: JTItemRender = render as JTItemRender;
                let c: JTConfigGroup = s.config;
                let index: number = this.getCounterIndex();
                let centerPointLandscape: cc.Vec2 = new cc.Vec2();
                let globalPointLandscape: cc.Vec2 = new cc.Vec2(p.landscapeX+s.pipeline.sourceXLandscape, p.landscapeY+s.pipeline.sourceYLandscape);
                let centerPointPortrait: cc.Vec2 = new cc.Vec2();
                let globalPointPortrait: cc.Vec2 = new cc.Vec2(p.portraitX+s.pipeline.sourceXPortrait, p.portraitY+s.pipeline.sourceYPortrait);
    
                this._scrollerGroup.pointMapLandscape[index] = globalPointLandscape;
                centerPointLandscape.x = globalPointLandscape.x + r.width / 2;
                centerPointLandscape.y = globalPointLandscape.y + r.height / 2;
                this._scrollerGroup.centerMapLandscape[index.toString()] = centerPointLandscape;

                this._scrollerGroup.pointMapPortrait[index] = globalPointPortrait;
                centerPointPortrait.x = globalPointPortrait.x + r.width / 2;
                centerPointPortrait.y = globalPointPortrait.y + r.height / 2;
                this._scrollerGroup.centerMapPortrait[index.toString()] = centerPointPortrait;

                this._scrollerGroup.staticCenterMapLandscape[index] = centerPointLandscape.clone();
                this._scrollerGroup.staticCenterMapPortrait[index] = centerPointPortrait.clone();

                this._scroller.renders.push(r);
                this._scroller.indexs.push(index);
                r.index = index;
                r.name = "render_" + index;
        }

        /**
         * 获取当前任务
         */
        public getCurrentTask(): any {
                return null;
        }

        /**
         * 关联滚轴视图
         * @param s 滚轴视图 
         */
        public contact(s: JTGroup): void {
                let keys: any[] = this._options.keys;
                for (let i: number = 0; i < keys.length; i++) {
                        let key: any = keys[i];
                        let p: JTOptionTransition = this._options.get(parseInt(key));
                        p.dataProvider = s.dataProvider;
                        p.bind(this, this._caller);
                        p.contact(s);
                }
                super.contact(s);
                this.beforeStart();
        }

        /**
         * 获取当前优先级
         */
        public getCurrentPriority(): any {
                return 0;
        }

        /**
         * 结束后更新真实有效的渲染器
         */
        public abstract updateRenders(): void

        public abstract updateRenderPosition():void

        public isImmediatlyJumpToOver:boolean = false;
        /**
         * 立即跳到最后的过程
         */
        public jumpToOverRunning?():void

        /**
         * 获取计数器索引
         */
        public getCounterIndex(): number {
                if (this._indexCounter == 0) {
                        this._indexCounter = this._scroller.index * this._scroller.config.row;
                }
                return this._indexCounter++;
        }

        public setCounterIndex(value: number) {
                this._indexCounter = 0;
        }

        /**
         * 通过优先级获取选项任务
         * @param priority 优先级
         */
        public getOption(priority: number): JTTask {
                return this._options.get(priority);
        }

        /**
         * 是否拥有选项
         * @param priority 优先级
         */
        public hasOwnOption(priority: number): boolean {
                return this._options.containsKey(priority);
        }

        /**
         * 获取选项集
         */
        public get options(): SDictionary {
                return this._options;
        }

        /**
         * 子级选项
         * @param pipeline 通道任务
         * @param priority 优先级
         * @param complete 执行函数
         */
        public childOption(pipeline: any, priority: number, complete?: Function): void {
                let task: JTTask = (pipeline as JTTaskInfo).create() as JTTask;
                task.handler = complete;
                task.priority = priority;
                this._options.set(priority, task);
        }

        /**
         * 执行完成调度
         */
        public complete(): void {
                this._handler && this._handler.apply(this._caller, [this._scroller]);
                this._scroller.scrollingComplete();
                this.isImmediatlyJumpToOver = false;
        }

        /**
         * 清理
         */
        public clear(): void {
                this.isImmediatlyJumpToOver = false;

                let keys: any[] = this._options.keys;
                for (let i: number = 0; i < keys.length; i++) {
                        let key: any = keys[i];
                        let p: JTTask = this._options.get(parseInt(key));
                        p.clear();
                }
        }

        /**
         * 获取循环函数
         */
        public get loop(): Handler {
                return this._loop;
        }

        /**
         * 注册循环状态监听函数
         * @param loop 循环监听函数 
         */
        public addLoopListener(loop: Handler): void {
                this._loop = loop;
        }

        /**
         * 移除循环监听函数
         */
        public removeLoopListener(): void {
                this._loop.clear();
                this._loop = null;
        }

        /**
         * 原x坐标
         */
        public get sourceXLandscape(): number {
                return this._sourceXLandscape;
        }

        public set sourceXLandscape(value: number) {
                this._sourceXLandscape = value;
        }

        /**
         * 原y坐标
         */
        public get sourceYLandscape(): number {
                return this._sourceYLandscape;
        }

        public set sourceYLandscape(value: number) {
                this._sourceYLandscape = value;
        }

               /**
         * 原x坐标
         */
        public get sourceXPortrait(): number {
                return this._sourceXPortrait;
        }

        public set sourceXPortrait(value: number) {
                this._sourceXPortrait = value;
        }

        /**
         * 原y坐标
         */
        public get sourceYPortrait(): number {
                return this._sourceYPortrait;
        }

        public set sourceYPortrait(value: number) {
                this._sourceYPortrait = value;
        }

        public get sourceX():number{
               return this.scroller.config.orientation==SlotOrientation.Portrait?this.sourceXPortrait:this.sourceXLandscape;
        }

        public get sourceY():number{
                return this.scroller.config.orientation==SlotOrientation.Portrait?this.sourceYPortrait:this.sourceYLandscape;
         }
        /**
         * 渲染器列表
         */
        public get items(): JTItemSkinLoader[] {
                return this._items;
        }

        public set items(value: JTItemSkinLoader[]) {
                this._items = value;
        }

        /**
         * 渲染器索引列表
         */
        public get indexs(): any[] {
                return this._indexs;
        }

        public set indexs(value: any[]) {
                this.indexs = value;
        }

}