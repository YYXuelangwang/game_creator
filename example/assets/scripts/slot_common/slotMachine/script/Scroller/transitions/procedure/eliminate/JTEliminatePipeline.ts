import JTItemRender from "../../../com/base/JTItemRender";
import JTScroller from "../../../com/JTScroller";
import JTOverRunning from "../../../com/plugins/procedure/JTOverRunning";
import JTTask from "../../../com/tasks/JTTask";
import JTOptionType from "../../JTOptionType";
import JTBeginScrolling from "../scrolling/JTBeginScrolling";
import JTRunScrolling from "../scrolling/JTRunScrolling";
import JTScrollingPipeline from "../scrolling/JTScrollingPipeline";

/*
* name;
*/
export default class JTEliminatePipeline extends JTScrollingPipeline {


  public updateRenderData(): void {
    let s: JTScroller = this._scroller;
    
    for (let i: number = 0; i < s.changedDataList.length; i++) {
      let r: JTItemRender = s.items[i] as JTItemRender;
      r.changedData = s.changedDataList[i];
    }
  }

  
  public  jumpToOverRunning(): void {
         let currentTask = this.getCurrentTask();

         if(currentTask instanceof JTRunScrolling){
            currentTask.complete();
         }else if(currentTask  instanceof JTOverRunning){

         }else if(currentTask instanceof JTBeginScrolling){
              this.clear();
              let overRunning: JTTask = this.getOption(JTOptionType.OPTION_OVER_RUNNING) as JTOverRunning;
              overRunning.runningTask();
         }
         this.isImmediatlyJumpToOver = true;
  }



}