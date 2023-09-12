import JTTaskPipeline from "./JTTaskPipeline";
import { JTTaskInfo } from "../plugins/procedure/JTPipelineTemplate";
import { SDictionary } from "../../../SlotData/SDictionary";

import JTTask from "./JTTask";
import JTTaskContainer from "../../rules/JTTaskContainer";
import JTScroller from "../JTScroller";
import JTRuleTaskManager from "../../rules/JTRuleTaskManager";
import JTContainer from "../base/JTContainer";
import JTScrollerGroup from "../JTScrollerGroup";
import JTGroup from "../base/JTGroup";
import JTItemSkinLoader from "../base/JTItemSkinLoader";
import JTItemRender from "../base/JTItemRender";

/*
* name; 计划任务通道
*/
export default class JTScheduledTaskPipeline extends JTTaskPipeline
{
        scroller: JTScroller;
        ruleTaskManager: JTRuleTaskManager;
        getObject(type: number, caller: JTContainer): JTContainer {
                return null;
        }
        scrollerGroup: JTScrollerGroup;
        contact(s: JTGroup): void {
                throw new Error("Method not implemented.");
        }
        getRuleContainer(type: string): JTTask {
                throw new Error("Method not implemented.");
        }
        hasOwnRunning(container: JTTask): boolean {
                throw new Error("Method not implemented.");
        }
        getRuleTask(type: string): JTTask {
                throw new Error("Method not implemented.");
        }
        registerTask(type: string, task: JTTask, container?: JTTask): JTRuleTaskManager {
                throw new Error("Method not implemented.");
        }
        removeRuleTask(type: string): void {
                throw new Error("Method not implemented.");
        }
        runningRuleTasks(): void {
                throw new Error("Method not implemented.");
        }
        runningCallTask(): void {
                throw new Error("Method not implemented.");
        }
        histroys: JTTask[];
        ruleMap: SDictionary;
        taskContainers: JTTaskContainer[];
    /**
     * 任务列表
     */
    protected tasks:JTTask[] = null;
    /**
     * 工作线列表
     */
    protected workLines:JTTask[] = null;
    /**
     * 当前任务
     */
    protected currentTask:JTTask = null;


    /**
         * 渲染器列表
         */
        renders:JTItemSkinLoader[];

        /**
         * point Map数组
         */
        pointMap:Object;

        /**
         * 中心点 数组
         */
        centerMap:Object;

        /**
         * 索引列表
         */
        indexs:any[];

        /**
         * 是否创建
         */
        isCreate:boolean;

//         /**
//        * 循环任务函数
//        */
//         loop:Handler;

//         /**
//          * 选项集
//          */
//         options:SDictionary;

        /**
         * 滚轴的原始X坐标
         */
        sourceX:number;

        /**
         * 滚轴的原始Y坐标
         */
        sourceY:number;

        /**
         * 滚轴里的渲染器列表
         */
        items:JTItemSkinLoader[];
    
        constructor()
        {
                super();
        }

        //更新渲染器
       public  updateRenders():void
       {

       }

        public getCounterIndex():number//所引计数器
        {
            return  0;    
        }

        /**
         * 装载真实有效的渲染器
         */
        public  setupRender(render:JTItemRender):void
        {
                return null ;
        }

        /**
         * 设置滚轴的X和Y坐标
         * x 滚轴的x坐标
         * y 滚轴的y坐标
         */
        public  setScrollerXY(x?:number, y?:number):void
        {

        }

        /**
         * 转换数据之前的回调函数
         */
       public  beforeStart():void
       {

       }

//       /**
//        * 注册循环任务函数监听
//        */
//       public addLoopListener(loop:Handler):void
//       {

//       }

//       /**
//        * 移除循环任务函数监听
//        */
//      public  removeLoopListener():void
//      {

//      }

     

//         /**
//          * 通过优先级获取选项
//          */
//        public  getOption(priority:number):JTTask
//        {
//                return null ;
//        }

//         /**
//          * 检测是否拥有选项
//          */
//        public  hasOwnOption(priority:number):boolean
//        {
//                return false ; 
//        }

    /**
     * 运行任务
     */
    public runningTask():void
    {
        if (this.workLines.length == 0)
        {
                this.complete();
        }
        else
        {
                this.currentTask = this.workLines.shift();
                this.currentTask.runningTask();
                this._loop && this._loop.run();
        }
    }

    /**
     * 子级选项
     * @param task 任务
     * @param priority 优先级
     * @param complete 执行函数
     */
    public childOption(task:any, priority:number, complete?:Function):void
    {
            let plugin:JTTask = (task as JTTaskInfo).create() as JTTask;
            plugin.handler = complete;
            plugin.priority = priority;
            plugin.bind(this,this.owner.caller);
            this._options.set(priority, plugin);
    }
    
    /**
     * 当前任务
     */
    public getCurrentTask():JTTask
    {
            return this.currentTask;
    }

    /**
     * 当前任务优先级
     */
    public getCurrentPriority():any
    {
            return this.currentTask.priority;
    }

    /**
     * 开始
     */
    public start():void
    {
        this.workLines = [].concat(this.getTasks());
        this.runningTask();
    }

    /**
     * 获取任务列表
     */
    public getTasks():JTTask[]
    {
            if (!this.tasks)
            {
                // 2018.1.28 change by lmb
                this.tasks = [];
                let keys:any[] = [];  

                for(var i = 0; i < this._options.keys.length;i++)
                {
                        //console.log("this._options.keys["+i+"]"+this._options.keys[i])
                        keys.push(this._options.keys[i]);
                }
                keys.sort(this.sortOn);
                for (let j:number = 0; j < keys.length; j++)
                {
                        let k:any = keys[j];
                        let t:JTTask = this.getOption(k) as JTTask;
                        //t.bind(this, this._owner.caller);
                        this.tasks.push(t);
                }
            }
            return this.tasks;
    }

    protected sortOn(a:number, b:number):number
    {
            if (a > b)
            {
                    return 1;
            }
            else if (a == b)
            {
                    return 0;
            }
            return -1;
    }

    /**
     * 完成时调度
     */
    public complete():void
    {
        this.clear();
        this._handler && this._handler.apply(this._caller, [this]);
    }
}