import { SDictionary } from "../../../../SlotData/SDictionary";
import JTTaskFlow from "../../tasks/JTTaskFlow";

/*
* name;
*/
export  class JTPipelineTemplate
{
    protected _indexs:any = null;//索引列表
    protected _index:any = null;//当前索引
    protected _type:string = null;//类型
    protected _options:SDictionary = null;//选项数组
    protected _dataListType:number = 0;// 数组类型

    public static OPTION:string = "option";
    protected _taskInfo:JTTaskInfo = null;//任务数据
    constructor()
    {
        this._options = new SDictionary();
    }

    /**
     * 选项map数组
     */
    public get options():SDictionary
    {
            return this._options;
    }

    public set options(value:SDictionary)
    {
            this._options = value;
    }

    /**
     * 类型
     */
    public get type():string
    {
            return this._type;
    }

    public set type(value:string)
    {
            this._type = value;
    }

    /**
     * 索引列表
     */
    public get indexs():any
    {
            return this._indexs;
    }

    public set indexs(value:any)
    {
            this._indexs = value;
    }

    /**
     * 数据类型
     */
    public get dataListType():number
    {
            return this._dataListType;
    }

    public set dataListType(value:number)
    {
            this._dataListType = value;
    }

    /**
     * 索引
     */
    public get index():any
    {
            return this._index;
    }

    public set index(value:any)
    {
            this._index = value;
    }

    /**
     * 装载选项
     * @param cls 选项cls类 
     * @param index 选项索引
     * @param complete 选项执行函数
     */
    public setupOption(cls:any, index:any, complete:Function):void
    {
            this.index = index;
            this._taskInfo  = new JTTaskInfo();
            this._taskInfo.cls = cls;
            this._taskInfo.handler = complete;
    }

    /**
     * 获取任务Class类
     */
    public getTaskClass():any
    {
            return this._taskInfo._cls;
    }

    /**
     * 子级选项
     * @param cls 选项cls类 
     * @param priority 优先级
     * @param complete 选项执行函数
     */
    public childOption(cls:any, priority:any, complete?:Function):any
    {
           let p:JTTaskInfo = new JTTaskInfo();
           p.cls = cls;
           p.handler = complete;
           this._options.set(priority, p);
           return p;
    }

    /**
     * 创建
     */
    public create():void
    {

    }
    /**
     * 选项数组
     */
    public getOptions():any
    {
            return this._options.values;
    }

    /**
     * 任务数据
     */
    public getTaskInfo():JTTaskInfo
    {
            return this._taskInfo;
    }

    /**
     * 通过优先级获取子级选项
     * @param priority 优先级
     */
    public getChildOption(priority:any):JTTaskInfo
    {
         return  this._options.get(priority);
    }
}

export  class JTTaskInfo 
{
        public _cls:any = null;
        public _pipeline:JTTaskFlow = null;
        public _handler:Function = null;

        public set cls(value:any)
        {
                this._cls = value;
        }

        public get cls():any
        {
                return this._cls;
        }

        public get pipeline():JTTaskFlow
        {
                return this._pipeline;
        }

        public get handler():Function
        {
                return this._handler;
        }

        public set pipeline(value:JTTaskFlow)
        {
                this._pipeline = value;
        }

        public set handler(value:Function)
        {
                this._handler = value;
        }

        public create():JTTaskFlow
        {
                this.pipeline = new this.cls();
                this.pipeline.handler = this.handler;
                return this.pipeline;
        }
}

