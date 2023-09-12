import JTRuleTask from "./JTRuleTask";
import JTGroup from "../com/base/JTGroup";
import JTScroller from "../com/JTScroller";
import { JTLineInfo } from "../lines/JTScrollerLineParser";
import JTLineRender from "../lines/JTLineRender";
import JTItemSkinLoader from "../com/base/JTItemSkinLoader";
import JTScrollerGroup from "../com/JTScrollerGroup";

/*
* name
*/
export  class JTWildTask extends JTRuleTask
{
    private _progress:Function = null;
    public static WILD_SKIN_3X3_INDEX = 500;
    public static WILD_SKIN_2X3_INDEX = 400;
    
    public currentTasks:JTWildConfig[] = null;
    public configs:JTWildConfig[] = null;

    public static WILD_FIXATION:number = 100;
    public static WILD_RANDOM:number = 200;
    public static currentTask:JTWildConfig = null;

    constructor()
    {
        super();
        this.configs = [];
        this.currentTasks = [];
    }

    public runningTask():boolean
    {
       super.runningTask();
       this.currentTasks.length = 0;
       for (let i:number = 0; i < this.configs.length; i++)
       {
                let config:JTWildConfig = this.configs[i];
                if (this.runningStepCall(config))
                {
                        this.currentTasks.push(config);
                }
       }
       this.currentTasks.sort(this.onUpdateSort);
       this._isRunning = this.currentTasks.length > 0;
       return this._isRunning;
    }

    public onUpdateSort(a:JTWildConfig, b:JTWildConfig):number
    {
                if (a.priority > b.priority)
                {
                        return 1;
                }
                else if (a.priority == b.priority)
                {
                        return 0;
                }
                return -1;
    }

    public dispose():void
    {
        this.currentTasks = [];
        this.configs = [];
    }

    private runningStepCall(config:JTWildConfig):boolean
    {
        config.tasks.length = 0;
        config.isRunning = false;
        let conditions:any[] = config.condition;
        let isContainWild:boolean = false;
        let isWildGroup:boolean = false;
        for (let i:number = 0; i < conditions.length; i++)
        {
                let wildInfo:JTWildInfo = conditions[i] as JTWildInfo;
                let skinIndex:number = wildInfo.skinIndex;
                let indexs:any[] = wildInfo.indexs;
                let indexItem:any = wildInfo.indexs[0];
                let itemList:any[] = null;
                if (indexItem instanceof JTWildInfo)
                {
                        isWildGroup = true;
                        for (let i:number = 0; i < wildInfo.indexs.length; i++)
                        {
                                let wild:JTWildInfo = wildInfo.indexs[i] as JTWildInfo;
                                itemList = this.changedDataList[wild.skinIndex];
                                if (!this.isContainId(wild.skinIndex, itemList, config.id))  break;
                                config.tasks.push(wildInfo);
                        }
                }
                else
                {
                    itemList = this.changedDataList[skinIndex];
                    if (!this.isContainId(skinIndex, itemList, config.id)) break;
                    config.tasks.push(wildInfo);
                }
        }
        if (isWildGroup)
        {
               config.isRunning = config.tasks.length == conditions[0].indexs.length && conditions.length > 0;
        }
        else
        {
              config.isRunning = config.tasks.length == conditions.length && conditions.length > 0;
        }   
        return config.isRunning;
    }

    /**
     * 
     * @param indexs 
     * @param id 
     * @param speed 
     * @param time 
     * @param priority 
     * @param skinURL 
     * @param progress 
     */
    public forceShowIndexs(indexs:any, id:any, speed:any, time:number, priority:number, skinURL?:string, progress?:Function):void
    {
                let wildTemplates:any[] = [
                        new JTWildInfo([0, 1, 2], 0),new JTWildInfo([3, 4, 5], 1),new JTWildInfo([6, 7, 8], 2),new JTWildInfo([9, 10, 11], 3),new JTWildInfo([12, 13, 14], 4)
                ];
                for (let i:number = 0; i < indexs.length; i++)
                {
                        let index:any = indexs[i]
                        let c:JTWildConfig = new JTWildConfig();
                        c.condition = [];
                        c.condition.push(wildTemplates[index]);
                        c.speed = speed;
                        c.skinURL = skinURL;
                        c.progress = progress;
                        c.time = time;
                        c.id = id;
                        c.tasks = [];
                        c.tasks.push(wildTemplates[index]);
                        c.isRunning = true;
                        this.currentTasks.push(c)
                }
                this._isRunning = true;
                this._isLock = true;
                for (let i:number = 0; i < this._scrollerGroup.items.length; i++)
                {
                        let s:JTScroller = this._scrollerGroup.items[i] as JTScroller;
                        this.callWatchWild(s);
                }
                // this.callWatchWild()
    }


    /**
     * 
     * @param lineRender 
     */
    public changedLineGrids(lineRender:JTLineRender):void
    {
        if (this.currentTasks.length == 0)return;
        if (this.isRunning && this._isLock)
        {
                let lineInfo:JTLineInfo = lineRender.lineResult as JTLineInfo;
                let eleId:number = lineInfo.line.eleId;
                for (let i:number = 0; i < this.currentTasks.length; i++)
                {
                        let c:JTWildConfig = this.currentTasks[i];
                        let wt:JTWildInfo[] = c.condition;
                        for (let j:number = 0; j < wt.length; j++)
                        {
                                let w:JTWildInfo = c.condition[j] as JTWildInfo;
                                if (w.skinIndex == JTWildTask.WILD_SKIN_3X3_INDEX) 
                                {
                                        let s:JTItemSkinLoader = this._scrollerGroup.getItem(w.indexs[0].skinIndex) as JTItemSkinLoader
                                        for (let i:number = 0; i < w.indexs.length; i++)
                                        {
                                                let wildInfo:JTWildInfo = w.indexs[i] as JTWildInfo;
                                                if (i != 1)//当前是支持1个3X3的格子
                                                {
                                                        lineRender.hideGrid(wildInfo.skinIndex);
                                                        continue;
                                                }
                                                //lineRender.changedGrids(wildInfo.skinIndex, s.x, 0, this._scrollerGroup.config.gapWidth * 3 - this._scrollerGroup.config.gapX, this._scrollerGroup.config.getHeight(), new cc.Rect(20, 20, 20, 20) );
                                                s.active = false;
                                         }
                                }
                                else
                                {
                                        let g:JTGroup = this._scrollerGroup.getItem(w.skinIndex) as JTGroup;
                                        g.active = false;
                                        //lineRender.changedGrids(w.skinIndex, g.x, g.y, g.config.girdWidth, g.config.getHeight() - g.config.gapY);
                                }
                        }
                }
        }
    }

//     public getWildInfoById(id:number, count:number, lineRender:JTILineRender):JTWildConfig[]
//     {
                
//     }
    /**
     * 配置百搭条件
     * @param id 百搭Id
     * @param condition 条件
     * @param speed 速度
     * @param time 时间
     * @param priority  优先级 
     * @param skinURL 百搭扩展皮肤URL地址
     * @param progress 百搭扩展回调
     * @param endCall 
     */
    public config(id:any, condition:any, speed:any, time:number, priority:number, skinURL?:string, progress?:Function, endCall?:Function):void
    {
            let taskInfo:JTWildConfig = new JTWildConfig();
            taskInfo.id = id;
            taskInfo.speed = speed;
            taskInfo.time = time;
            taskInfo.priority = priority;
            taskInfo.endCall = endCall;
            taskInfo.condition = condition;
            taskInfo.skinURL = skinURL;
            taskInfo.progress = progress;
            taskInfo.tasks = [];
            taskInfo.cols = [];
        //     taskInfo.cols.push()
            this.configs.push(taskInfo);
            
            this._id = id;
            this._speed = speed;
            this._time = time;
            this._priority = priority;
            this._endCall = endCall;
            this._condition = condition;
            this._skinURL = skinURL;
            this._progress = progress;
    }

    /**
     * 百搭配置组
     * @param id  id 
     * @param indexs 索引列表
     * @param count 列数
     * @param speed 速度
     * @param time 时间
     * @param priority  优先级 
     * @param skinURL 皮肤地址
     * @param progress 触发的回调函数
     * @param endCall 
     */
    public configGroup(id:any, indexs:any[], count:any, speed:any, time:number, priority:number, skinURL?:string, progress?:Function, endCall?:Function):void
    {
                let total:number = indexs.length / count;
                for (let i:number = 0; i < count; i++)
                {
                        let wilds:any[] = indexs.splice(0, total);
                        this.config(id, [new JTWildInfo(wilds, i)], speed, time, priority, skinURL, progress, endCall);
                }
    }

    /**
     * 激活观察的百搭
     * @param s 某一列的scroller视图 
     */
    public callWatchWild(s:JTScroller):void
    {
        if (this.currentTasks.length == 0) return;
        let config:JTWildConfig = this.getMatchWildTask(s.index);
        if (!config)  return;
        if (config.isRunning)
        {
                let wildInfo:JTWildInfo = this.getWildInfo(s.index, config);
                if (!wildInfo) return;
                this.hideScrollers(config, s.owner as JTScrollerGroup);
                let sss:JTScroller = null;
                this._skinURL = config.skinURL;
                if (wildInfo.skinIndex == JTWildTask.WILD_SKIN_3X3_INDEX)
                {
                        let ss:JTScroller = this.scrollerGroup.getItem(1) as JTScroller;
                        ss.skinLoader = this._skinLoaders[1];
                        ss.skinLoader.url = this._skinURL;
                        sss = ss;
                        // ss.skinLoader.width = this._scrollerGroup.config.gapWidth * 3;
                        // ss.skinLoader.height = this._scrollerGroup.config.getHeight();
                        // (s.owner as JTItemSkinLoader).skinLoader.url = this._skinURL;
                        // this.skinLoaders.push(s.owner as JTItemSkinLoader);//逻辑重写一下。
                }
                else
                {
                        s.skinLoader = this._skinLoaders[s.index];
                        s.skinLoader.url = this._skinURL;
                        sss = s;
                }
                this._isLock = true;
                config.progress && config.progress.apply(this._caller, [sss]);
        }
        else
        {
                this.clearSkinLoaders();
        }
    }

    protected getMatchWildTask(index:number):JTWildConfig
    {
                for (let i:number = 0; i < this.currentTasks.length; i++)
                {
                        let config:JTWildConfig = this.currentTasks[i];
                        for (let k:number = 0; k < config.condition.length; k++)
                        {
                                let wildInfo:JTWildInfo =  config.condition[k];
                                if (wildInfo.indexs[0] instanceof JTWildInfo)
                                {
                                        for (let j:number = 0; j < wildInfo.indexs.length; j++)
                                        {
                                                let w:JTWildInfo = wildInfo.indexs[j] as JTWildInfo;
                                                if (w.skinIndex != index) continue;//这个检测是是否包含该索引
                                                return config;
                                        }
                                }
                                else
                                {
                                        if (wildInfo.skinIndex != index)continue;//有可能出现一个1X3加一个3X3，所以用的continue;
                                        return config;
                                }
                        }
                }
                return null;
    }

    public hasOwnIndex(index:number):boolean
    {
           let isFlag:boolean = false;
           for (let i:number = 0; i < this._condition.length; i++)
           {
                let wildInfo:JTWildInfo = this._condition[i];
                if (wildInfo.indexs[0] instanceof JTWildInfo)
                {
                        for (let j:number = 0; j < wildInfo.indexs.length; j++)
                        { 
                                let wild:JTWildInfo = wildInfo.indexs[j] as JTWildInfo;
                                if (wild.skinIndex != index) continue;
                                isFlag = true;
                                break;
                        }
                }
                else
                {
                        if (index == wildInfo.skinIndex)
                        {
                                isFlag = true;
                                break;
                        }
                }
           }
           return isFlag;
    }

    public showScroller(s:JTScroller):void
    {
               if (!this._isRunning) 
               {
                       s.active = true;
               }
    }

    public reset(scroller:JTScrollerGroup):void
    {
                this._isLock = false;
                this.clearSkinLoaders();
                for (let i:number = 0; i < scroller.items.length; i++)
                {
                        let s:JTScroller = scroller.getItem(i) as JTScroller;
                        (s as JTScroller).active = true;
                }
    }

    public hideScrollers(config:JTWildConfig, scroller:JTScrollerGroup):void
    {
           if (!config || this.currentTasks.length == 0) return;
           let list:JTWildInfo[] = config.condition;
           for (let i:number = 0; i < list.length; i++)
           {
                let wildInfo:JTWildInfo = list[i];
                if (wildInfo.indexs[0] instanceof JTWildInfo)
                {
                        for (let j:number = 0; j < wildInfo.indexs.length; j++)
                        {
                                let wild:JTWildInfo = wildInfo.indexs[j] as JTWildInfo;
                                let s:JTItemSkinLoader = scroller.getItem(wild.skinIndex) as JTItemSkinLoader;
                                (s as JTItemSkinLoader).active = false;
                        }
                        break;
                }
                else
                {
                        let s:JTItemSkinLoader = scroller.getItem(wildInfo.skinIndex) as JTItemSkinLoader;
                        (s as JTItemSkinLoader).active = false;
                }
           }
    }

    public changedVisibles(scroller:JTScrollerGroup, sVisible:boolean = false, skVisible:boolean = false):void
    {
                for (let i:number = 0; i < this.currentTasks.length; i++)
                {
                        let config:JTWildConfig = this.currentTasks[i];
                        let list:JTWildInfo[] = config.condition;
                        for (let k:number = 0; k < list.length; k++)
                        {
                                let wildInfo:JTWildInfo = list[k];
                                if (wildInfo.indexs[0] instanceof JTWildInfo)
                                {
                                        for (let j:number = 0; j < wildInfo.indexs.length; j++)
                                        {
                                                let wild:JTWildInfo = wildInfo.indexs[j] as JTWildInfo;
                                                let s:JTItemSkinLoader = scroller.getItem(wild.skinIndex) as JTItemSkinLoader;
                                                (s as JTItemSkinLoader).active = sVisible;
                                                this.skinLoaders[wild.skinIndex].active = skVisible;
                                        }
                                        break;
                                }
                                else
                                {
                                        let s:JTItemSkinLoader = scroller.getItem(wildInfo.skinIndex) as JTItemSkinLoader;
                                        (s as JTItemSkinLoader).active = sVisible;
                                        this.skinLoaders[wildInfo.skinIndex].active = skVisible;
                                }
                        }
                }
    }

    public getWildInfo(index:number, config:JTWildConfig):JTWildInfo
    {   
            for(let i:number = 0; i < config.tasks.length; i++)
            {
                    let wildInfo:JTWildInfo = config.tasks[i];
                    if (wildInfo.skinIndex == index)
                    {
                            return wildInfo;
                    }
                    else if (index == this._scrollerGroup.config.col - 2 && wildInfo.skinIndex == JTWildTask.WILD_SKIN_3X3_INDEX)
                    {
                                return wildInfo;
                    }
            }
            return null;
    }
}

export class JTWildInfo
{
     public indexs:any[] = null;
     public skinIndex:number = 0;
     constructor(indexs:any[], skinIndex:number)
     {
        this.indexs = indexs;
        this.skinIndex = skinIndex;
     }
}

export class JTWildConfig
{
        public id:any = null;
        public speed:any = null;
        public time:any = null;
        public priority:number = 0;
        public endCall:Function = null;
        public condition:any = null;
        public skinURL:string = null;
        public progress:Function = null;
        public tasks:JTWildInfo[] = null;
        public isRunning:boolean = false;
        public isLock:boolean = false;
        public cols:any[] = null;
}