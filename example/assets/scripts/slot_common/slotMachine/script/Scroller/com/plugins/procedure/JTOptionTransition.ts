import JTOptionTask from "../../tasks/JTOptionTask";
import { SDictionary } from "../../../../SlotData/SDictionary";
import JTScroller from "../../JTScroller";
import JTGroup from "../../base/JTGroup";
import JTScrollerGroup from "../../JTScrollerGroup";
import JTContainer from "../../base/JTContainer";
import JTTask from "../../tasks/JTTask";
import JTRuleTaskManager from "../../../rules/JTRuleTaskManager";
import JTTaskContainer from "../../../rules/JTTaskContainer";

/*
* name;
*/
export default abstract class JTOptionTransition extends JTOptionTask 
{
    protected _scroller:JTScroller = null;//当前scroller
    protected _ruleTaskManager:JTRuleTaskManager = null;//规则任务管理器
    protected _index:number = 0;//当前索引

    /**
     * 获取当前scroller
     */
    public get scroller():JTScroller
    {
        return this._scroller;
    }

    /**
     * 关联当前scroller
     * @param s 
     */
    public contact(s:JTGroup):void
    {
        this._scroller = s as JTScroller;
        this._index = this._scroller.index;
        this._scrollerGroup = s.owner as JTScrollerGroup;
    }

    /**
     * 获取实例化对像
     * @param type 对象类型 
     * @param caller 执行域
     */
    public getObject(type:number, caller:JTContainer):JTContainer
    {
        return this._scrollerGroup.factoryChild.produce(type, caller) as JTContainer;
    }

    /**
     * 获取规则容器
     * @param type 规则类型 
     */
    public getRuleContainer(type:string):JTTask
    {
        return this._ruleTaskManager.getRuleContainer(type);
    }

    /**
     * 判断某规则是否已经触发
     * @param apt 规则
     */
    public hasOwnRunning(apt:JTTask):boolean
    {
        return this._ruleTaskManager.hasOwnRunning(apt);
    }

    /**
     * 获取规则
     * @param type 规则类型
     */
    public getRuleTask(type:string):JTTask
    {
        return this._ruleTaskManager.getRuleTask(type);
    }

    /**
     * 注册规则任务
     * @param type 规则类型 
     * @param target 规则对象
     */
    public registerTask(type:string, target:JTTask):JTRuleTaskManager
    {
       return this._ruleTaskManager.registerTask(type, target);
       //return this;
    }

    /**
     * 规则map数组
     */
    public get ruleMap():SDictionary
    {
        return this._ruleTaskManager.ruleMap;
    }

    /**
     * 任务容器列表
     */
    public get taskContainers():JTTaskContainer[]
    {
        return this._ruleTaskManager.taskContainers;
    }

    /**
     * 移除某个规则
     * @param type 规则类型 
     */
    public removeRuleTask(type:string):void
    {
        this._ruleTaskManager.removeRuleTask(type);
    }

    /**
     * 预先激活规则
     */
    public runningCallTask():void
    {
         this._ruleTaskManager.runningCallTask();
    }

    /**
     * 激活规则
     */
    public runningRuleTasks():void
    {
          this._ruleTaskManager.runningRuleTasks();
    }

    /**
     * 规则运行历史记录
     */
    public get histroys():JTTask[]
    {
        return this._ruleTaskManager.histroys;
    }

    /**
     * 规则任务管理器
     */
    public get ruleTaskManager():JTRuleTaskManager
    {
            return this._ruleTaskManager;
    }

 
    public set ruleTaskManager(value:JTRuleTaskManager)
    {
        this._ruleTaskManager = value;
    }

    /**
     * 销毁
     */
    public destroy():boolean
    {
        super.destroy();
        this._scroller = null;
        this._ruleTaskManager = null;
        return true;
    }
}