import JTTaskContainer from "./JTTaskContainer";
import JTContainerMode from "./JTContainerMode";
import { JTWildTask } from "./JTWildTask";
import JTRuleTaskType from "./JTRuleTaskType";
import FreeGameManager from "../../SlotManager/FreeGameManager";
import { OperationState } from "../../SlotDefinitions/SlotEnum";
import JTTask from "../com/tasks/JTTask";
import JTScrollerGroup from "../com/JTScrollerGroup";
import JTItemSkinLoader from "../com/base/JTItemSkinLoader";
import JTScroller from "../com/JTScroller";

/*
* name;
*/
export default class JTWildTaskContainer extends JTTaskContainer
{
    constructor()
    {   
        super()
    }

    public contact(task:JTTask, type:string):void
    {
           super.contact(task, type);
           this.mode = JTContainerMode.SUPPORT_RESTORE;
    }

   public runningCallTask():boolean
    {
            if (!super.runningCallTask())
            {
                return false;
            }
            let freeGameManager:FreeGameManager = FreeGameManager.instance;
            if (!freeGameManager.freeGameInfo) return;
            let wildTask:JTWildTask = this._target as JTWildTask;
            let scrollerGroup:JTScrollerGroup = wildTask.scrollerGroup;
            JTWildTaskContainer.callWatchWild(scrollerGroup);
            return true;
    }

    public static callWatchWild(scroller:JTScrollerGroup):void
    {
        let items:JTItemSkinLoader[] = scroller.items;
        let wildTask:JTWildTask = scroller.getRuleTask(JTRuleTaskType.WILD_DYNAMIC_TIME_TYPE) as JTWildTask;
        for (let i:number = 0; i < items.length; i++)
        {
             let s:JTScroller = items[i] as JTScroller;
             wildTask.callWatchWild(s);
        }
    }

    public static hideScrollers(scroller:JTScrollerGroup):void
    {
        let freeGameManager:FreeGameManager = FreeGameManager.instance;
        if (!freeGameManager.freeGameInfo || freeGameManager.freeGameInfo.type == OperationState.ReSpin)
        {
            let wildTask:JTWildTask = scroller.getRuleTask(JTRuleTaskType.WILD_DYNAMIC_TIME_TYPE) as JTWildTask;
            scroller.forceUpdate(scroller.changedDataList);
            // scroller.clear();
            // scroller.reset();
            wildTask && wildTask.reset(scroller);
        }
    }
}