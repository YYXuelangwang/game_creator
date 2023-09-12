import JTTaskFlow from "./JTTaskFlow";
import { SDictionary } from "../../../SlotData/SDictionary";
import { Handler } from "../../../SlotUtils/Handle";
import JTTask from "./JTTask";

/*
* name;任务通道
*/
export default abstract class JTTaskPipeline extends JTTaskFlow
{
    /**
     * 选项集
     */
    protected _options:SDictionary = null;
    /**
     * 循环函数
     */
    protected _loop:Handler = null;
    constructor()
    {
        super();
        this._options = new SDictionary();
    }

    /**
     * 开始
     */
    public abstract start():void;

    /**
     * 运行任务
     */
    public abstract runningTask():any;
 
    /**
     * 通过优先级获取任务
     * @param priority 优先级
     */
    public getOption(priority:number):JTTask
    {
            return this._options.get(priority);
    }

    /**
     * 通过优先级判断是否有XX任务
     * @param priority 优先级
     */
    public hasOwnOption(priority:number):boolean
    {
            return this._options.containsKey(priority);
    }

    /**
     * 选项集
     */
    public get options():SDictionary
    {
            return this.options;
    }

    /**
     * 子级选项
     * @param cls 子级选项Class类
     * @param priority 优先级
     * @param complete 执行函数
     */
    public childOption(cls:any, priority:number, complete?:Function):void
    {
            let task:JTTaskFlow =  new cls() as JTTaskFlow;
            task.handler = complete;
            task.priority = priority;
            this._options.set(priority, task);
    }

    /**
     * 当前任务
     */
    public getCurrentTask():any
    {
            return null;
    }

    /**
     * 当前任务优先级
     */
    public getCurrentPriority():any
    {
            return 0;
    }

    /**
     * 循环任务函数
     */
    public get loop():Handler
    {
            return this._loop;
    }

    /**
     * 清理
     */
    public clear():void
    {
            let keys:any[] = this._options.keys;
            for (let i:number = 0; i < keys.length; i++)
            {
                    let key:any = keys[i];
                    let p:JTTask = this._options.get(parseInt(key));
                    p.clear();
            }
    }

    /**
     * 注册循环监听函数
     * @param loop 
     */
    public addLoopListener(loop:Handler):void
    {   
            this._loop = loop;
    }

    /**
     * 移除循环坚挺函数
     */
    public removeLoopListener():void
    {
            this._loop.clear();
            this._loop = null;
    }
}