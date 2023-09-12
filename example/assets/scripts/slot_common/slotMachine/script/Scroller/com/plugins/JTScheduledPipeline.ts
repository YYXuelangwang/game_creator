import JTFuturePipeline from "./JTFuturePipeline";
import JTScroller from "../JTScroller";
import JTItemRender from "../base/JTItemRender";
import JTConfigGroup from "../JTConfigGroup";
import JTOptionType from "../../transitions/JTOptionType";
import JTTask from "../tasks/JTTask";
import JTItemSkinLoader from "../base/JTItemSkinLoader";
import JTGroup from "../base/JTGroup";
import JTProcedure from "./procedure/JTProcedure";
import JTLayoutPoint from "../../extensions/JTLayoutPoint";

/*
* name;
*/
export default  abstract class JTScheduledPipeline extends JTFuturePipeline {
        /**
         * 任务列表
         */
        protected tasks: JTTask[] = null;
        /**
         * 工作线列表
         */
        protected workLines: JTTask[] = [];
        /**
         * 当前任务
         */
        protected currentTask: JTTask = null;
        /**
         * 渲染器列表
         */
        protected _renders: JTItemSkinLoader[] = null;

        // /**
        //  * 起始坐标点map数组
        //  */
        // protected _pointMap: Object = null;
        // /**
        //  * 中心坐标点map数组
        //  */
        // protected _centerMap: Object = null;
        /**
         * 是否创建
         */
        protected _isCreate: boolean = false;

        constructor() {
                super();
                this._renders = [];
                // this._pointMap = {};
                // this._centerMap = {};
        }

        /**
         * 开始
         */
        public start(): void {
                this.workLines = [].concat(this.tasks);
                this.runningTask();
        }

        /**
         * 运行任务
         */
        public runningTask(): void {
                if (this.workLines.length == 0) {
                        this.currentTask = null;
                        this._scroller.scrollingComplete();
                }
                else {
                        this.currentTask = this.workLines.shift();
                        this.currentTask.runningTask();
                        this._loop && this._loop.run();
                }
        }

        /**
         * 获取当前任务
         */
        public getCurrentTask(): JTTask {
                return this.currentTask;
        }

        /**
         * 获取当前优先级
         */
        public getCurrentPriority(): any {
                return this.currentTask.priority;
        }

        /**
         * 获取任务列表
         */
        public getTasks(): JTTask[] {
                if (!this.tasks) {
                        this.tasks = [];
                        let keys: any[] = this._options.keys;
                        keys.sort(this.sortOn);
                        for (let i: number = 0; i < keys.length; i++) {
                                let k: any = keys[i];
                                let plugin: JTTask = this.getOption(k) as JTTask;
                                plugin.bind(this, this._owner.caller)
                                if (i == 0) continue;
                                this.tasks.push(plugin);
                        }
                }
                return this.tasks;
        }

        /**
         * 设置有效渲染器
         * @param render 渲染器
         */
        public setupRender(render: JTItemRender,p:JTLayoutPoint): void {
                let s: JTScroller = this._scroller as JTScroller;
                let r: JTItemRender = render as JTItemRender;
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
                r.index = index;
                r.name = "render_" + index;
                this._renders.push(r);
                this._indexs.push(index);
                // this._centerMap[index] = centerPoint;
                // this._pointMap[index] = globalPoint;
        }

        public reSetCounterIndex() {
                this.setCounterIndex(0);
        }


        protected sortOn(a: JTTask, b: JTTask): number {
                if (a.priority > b.priority) {
                        return 1;
                }
                else if (a.priority == b.priority) {
                        return 0;
                }
                return -1;
        }

        /**
         * 关联滚轴视图
         * @param s 滚轴视图 
         */
        public contact(s: JTGroup): void {
                super.contact(s);
                this.create();
        }

        /**
         * 创建
         */
        public create(): void {
                this._isCreate = true;
                this.tasks = this.getTasks();
                let procedure: JTTask = this.getOption(JTOptionType.OPTION_CREATE) as JTTask;
                procedure && procedure.runningTask();
        }

        /**
         * 更新有效渲染器列表
         */
        public updateRenders(): void {

        }

        public updateRenderPosition():void{
                
        }

        public dataStandby():void{

              this.onDataStandBy();
              for(let i=0;i<this.workLines.length;i++){
                      let task = this.workLines[i] as JTProcedure;
                      task.isDataReady = true;
              }
              let currentTask = this.getCurrentTask() as JTProcedure;
              currentTask&&currentTask.dataStandby();
        }

        public onDataStandBy():void{

        }


        public isPending :boolean = false;
        
        public setTaskPending():void{
              this.isPending = true;
        }

        public continuePendingTask():void{
             this.isPending = false;
             let currentTask = this.getCurrentTask() as JTProcedure;
             currentTask&&currentTask.continue();
             
        }

        /**
         * 清除
         */
        public clear(): void {
                for(let i=0;i<this.tasks.length;i++){
                        let task = this.tasks[i] as JTProcedure;
                        task.isDataReady = false;
                }
                this.isPending = false;
                this.workLines.length = 0;
                super.clear();
        }

        /**
         * 销毁
         */
        public destory(): void {
                super.destroy();
                this.currentTask = null;
                this.tasks.length = 0;
                this._indexCounter = 0;
                this.childsCount
                this.tasks = null;
                this.workLines = [];
                this._options.clear();
        }

        /**
         * 渲染器
         */
        public get renders(): JTItemSkinLoader[] {
                return this._renders;
        }

        /**
     * 渲染器
     */
        public set renders(value: JTItemSkinLoader[]) {
                this._renders = value;
        }

        // /**
        //  * 起始坐标点数组
        //  */
        // public get pointMap(): Object {
        //         return this._pointMap;
        // }

        // /**
        //  * 中心坐标点数组
        //  */
        // public get centerMap(): Object {
        //         return this._centerMap;
        // }

        /**
         * 是否创建
         */
        public get isCreate(): boolean {
                return this._isCreate;
        }
        
        /**
         * 
         * @param useChangeData 是否使用changedata来刷新数据
         */
        abstract lineTimeComplete(useChangeData?:boolean)

        abstract resetRenderPoints()
        
        /**
         * 在滚动完成前设置索引
         * @returns 是否是渲染器
         */
        abstract setRenderBeforeComplete(render: JTItemRender):boolean;


}