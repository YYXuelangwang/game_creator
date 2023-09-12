import JTFuturePipeline from "./JTFuturePipeline";
import JTOptionType from "../../transitions/JTOptionType";
import JTScroller from "../JTScroller";
import JTTask from "../tasks/JTTask";
import JTProcedure from "./procedure/JTProcedure";

/*
* name;
*/
export default abstract class JTLengthFixedPipeline extends JTFuturePipeline
{
        constructor()
        {
               super();
        }

        /**
         * 开始
         */
        public start():void
        {
            this.runningTask();
        }

        /**
         * 运行任务
         */
        public abstract runningTask():void;

        /**
         * 创建
         */
        public create():void
        {
                let task:JTTask = this.getOption(JTOptionType.OPTION_CREATE) as JTProcedure;
                task.runningTask();
        }      

        /**
         * 运行
         */
        public running():void
        {
                let task:JTTask = this.getOption(JTOptionType.OPTION_RUNNING) as JTProcedure;
                if (!task) task = this.getOption(JTOptionType.OPTION_OVER_RUNNING) as JTProcedure;
                task.runningTask();
        } 

        /**
         * 关联滚轴视图
         * @param s 滚轴视图 
         */
        public contact(s:JTScroller):void
        {
                super.contact(s);
                let keys:any[] = this._options.keys;
                for (let i:number = 0; i < keys.length; i++)
                {
                        let key:number = keys[i];
                        switch(key)
                        {
                                case JTOptionType.OPTION_CREATE:
                                {
                                        this.setupProcedure(JTOptionType.OPTION_CREATE);
                                        break;
                                }
                                case JTOptionType.OPTION_BEGIN_RUNNING:
                                {
                                        this.setupProcedure(JTOptionType.OPTION_BEGIN_RUNNING, s.beginRunning);
                                        break;
                                }
                                case JTOptionType.OPTION_RUNNING:
                                {
                                        this.setupProcedure(JTOptionType.OPTION_RUNNING, s.nextHandler);
                                        break;
                                }
                                case JTOptionType.OPTION_OVER_RUNNING:
                                {
                                        this.setupProcedure(JTOptionType.OPTION_OVER_RUNNING, s.complete);
                                        break;
                                }
                        }
                }
                if (!this.hasOwnOption(JTOptionType.OPTION_OVER_RUNNING))this._handler = s.complete;
                this.create();
        }

        /**
         * 装载过程函数
         * @param priority 优先级
         * @param handler 执行函数
         */
        public setupProcedure(priority:number, handler?:Function):void
        {
                let procedure:JTProcedure = this._options.get(priority);
                if (procedure)
                {
                        procedure.bind(this, this._owner.caller);
                        procedure.ruleTaskManager = this.ruleTaskManager;
                        if (!procedure.handler) procedure.handler = handler;
                }
        }

        /**
         * 将要运行函数
         */
        public beginRunning():void
        {
                let task:JTTask = this.getOption(JTOptionType.OPTION_BEGIN_RUNNING) as JTTask;
                task.runningTask();
        }

        /**
         * 结束运行函数
         */
        public overRunning():void
        {
                let task:JTTask = this.getOption(JTOptionType.OPTION_OVER_RUNNING) as JTTask;
                task.runningTask();
        }

        /**
         * 更新渲染器列表
         */
        public abstract updateRenders():void

        // public clear():void
        // {
        //         this.lines.length = 0;
        //         super.clear();
        // }
}