import { Handler } from "../../SlotUtils/Handle";
import JTRuleTask from "./JTRuleTask";

/**
 * 滚动前的前置任务
 */
export default class JTAdvanceTask extends JTRuleTask {
    
    private startConditionCall = null;
    private startCall = null;
    
    /**
     * 
     * @param startConditionCall 前置任务的开始条件，子游戏返回true或false，true才执行startCall
     * @param startCall 前置任务的回调 将传入一个handler，子项目执行handler.run才开始滚动
     */
    public config(startConditionCall:Function,startCall:Function): void {
         this.startCall = startCall;
         this.startConditionCall = startConditionCall;

     }

     public checkStart():boolean{
         return this.startConditionCall.apply(this.caller);
     }

     public start(handler:Handler):void{
        this.startCall.apply(this.caller,[handler]);
     }
}
