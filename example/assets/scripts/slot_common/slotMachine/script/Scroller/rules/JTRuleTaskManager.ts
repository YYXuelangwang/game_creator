import JTContainer from "../com/base/JTContainer";
import JTRuleTask from "./JTRuleTask";
import { SDictionary } from "../../SlotData/SDictionary";
import JTTask from "../com/tasks/JTTask";
import JTDataInfo from "../com/datas/JTDataInfo";
import JTCollection from "../com/datas/JTCollection";
import JTTaskContainer from "./JTTaskContainer";
import JTScrollerGroup from "../com/JTScrollerGroup";
import JTLineScrollerGroup from "../extensions/JTLineScrollerGroup";

/*
* name;
*/
export default class JTRuleTaskManager extends JTContainer
{
    protected _ruleMap:SDictionary = null;
    protected _historys:JTTask[] = null;

    // public static TYPE_WILD:string = "wild";
    public static TYPE_SCATTER:string = "scatter";
    protected _dataProvider:JTCollection<JTDataInfo> = null;
    constructor()
    {
            super();
            this._historys = [];
            this._ruleMap = new SDictionary();
    }

    public getRuleContainer(type:string):JTTaskContainer
    {
        return this._ruleMap.get(type);
    }

    public hasOwnRunning(apt:JTTask):boolean
    {
        return this._historys.indexOf(apt) != -1
    }

    public getRuleTask(type:string):JTTask
    {
        let apt:JTTaskContainer = this.getRuleContainer(type);
        return apt ? apt.task : null;
    }

    public registerTask(type:string, task:JTTask, container?:JTTaskContainer):JTRuleTaskManager
    {
        let apt:JTTaskContainer = container ? container : new JTTaskContainer();
        apt.contact(task, type);
        (apt as JTContainer).bind(this, this.caller);
        (task as JTRuleTask).scrollerGroup = this._owner as JTLineScrollerGroup;
        (task as JTRuleTask).registerComplete();
        this._ruleMap.set(type, apt);
        return this;
    }

    public get collection():JTCollection<JTDataInfo>
    {
        return this._dataProvider;
    }

    public set collection(value:JTCollection<JTDataInfo>)
    {
        this._dataProvider = value;
    }

    public get ruleMap():SDictionary
    {
        return this._ruleMap;
    }

    public set ruleMap(value:SDictionary)
    {
        this._ruleMap = value;
    }

    public get taskContainers():JTTaskContainer[]
    {
        return [].concat(this._ruleMap.values);
    }

    public runningCallTask():void
    {
            let list:JTTask[] = this._ruleMap.values;
            let tasks:JTTask[] = [];
            for (let i:number = 0; i < list.length; i++)
            {
                    let apt:JTTaskContainer = list[i] as JTTaskContainer;
                    apt.dataProvider = this._dataProvider;
                    if (!apt.runningCallTask())continue;
                    tasks.push(apt);
            }
            this._historys = this._historys.concat(tasks);
    }

    public removeRuleTask(type:string):void
    {
        this._ruleMap.remove(type);
    }

    public clear():void
    {
            let list:JTTask[] = this._ruleMap.values;
            let tasks:JTTask[] = [];
            for (let i:number = 0; i < list.length; i++)
            {
                    let apt:JTTaskContainer = list[i] as JTTaskContainer;
                    apt.task.clear();
            }
    }

    public runningRuleTasks():void
    {
            let list:JTTask[] = this._ruleMap.values;
            let tasks:JTTask[] = [];
            for (let i:number = 0; i < list.length; i++)
            {
                    let apt:JTTask = list[i];
                    apt.dataProvider = this._dataProvider;
                    if (!apt.runningTask())continue;
                    tasks.push(apt);
            }
            this._historys = this._historys.concat(tasks);
    }

    public get histroys():JTTask[]
    {
        return this._historys;
    }
}