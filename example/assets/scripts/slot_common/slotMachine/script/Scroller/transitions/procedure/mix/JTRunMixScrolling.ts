import JTRunning from "../../../com/plugins/procedure/JTRunning";
import JTScroller from "../../../com/JTScroller";
import JTScatterTask from "../../../rules/JTScatterTask";
import JTItemSkinLoader from "../../../com/base/JTItemSkinLoader";
import { SlotOrientation } from "../../../../SlotDefinitions/SlotEnum";
import JTChangeSpeedTask from "../../../rules/JTChangeSpeedTask";
import JTScrollingPipeline from "../scrolling/JTScrollingPipeline";
import BaseSpinSlotView from "../../../../MainView/BaseSpinSlotView";
import JTScrollingMixPipeline from "./JTScrollingMixPipeline";
import JTItemRender from "../../../com/base/JTItemRender";

/*
* name;
*/
export default class JTRunMixScrolling extends JTRunning {
    private timer: cc.Scheduler = cc.director.getScheduler();

    private isChangedTime: boolean = false;
    constructor() {
        super();
        this.timer = cc.director.getScheduler();
    }

    public running(): void {
        this._scroller.isRunning = true;
        //this.scroller.adjustSkinRenders(true);

         let p = this.owner as JTScrollingMixPipeline;
         p.plugin.running(this.scroller.index)
    }

    public continue():void{
        let p = this.owner as JTScrollingMixPipeline;
        p.plugin.continue(this.scroller.index);
    }

    public dataStandby():void{
        
    }



    public clear(): void {
        
    }


}