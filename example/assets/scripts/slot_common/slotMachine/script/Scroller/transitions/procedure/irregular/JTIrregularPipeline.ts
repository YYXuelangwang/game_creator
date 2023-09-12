import JTScatterTask from "../../../rules/JTScatterTask";
import JTDynamicWildTask from "../../../rules/JTDynamicWildTask";
import JTOnceWildTask from "../../../rules/JTOnceWildTask";
import JTScroller from "../../../com/JTScroller";
import JTItemRender from "../../../com/base/JTItemRender";
import JTScrollerGroup from "../../../com/JTScrollerGroup";
import { SlotOrientation } from "../../../../SlotDefinitions/SlotEnum";
import JTCombineTask from "../../../rules/JTCombineTask";
import { JTRetainWildTask } from "../../../rules/JTRetainWildTask";
import JTDynamicCombineTask from "../../../rules/JTDynamicCombineTask";
import JTScrollingPipeline from "../scrolling/JTScrollingPipeline";
import SlotConfigManager from "../../../../SlotManager/SlotConfigManager";

/*
* name;
*/
export default class JTIrregularPipeline extends JTScrollingPipeline {
    public lineTime: cc.Tween = null;
    public scatterRule: JTScatterTask = null;
    public dynamicWild: JTDynamicWildTask = null;
    public onceWild: JTOnceWildTask = null;

    public combineRule:JTCombineTask = null;

    public retainWild:JTRetainWildTask = null;

    public dynamicCombine:JTDynamicCombineTask = null;


    constructor() {
        super();
    }



    public lineTimeComplete(useChangeData:boolean=false): void {
        let s: JTScroller = this._scroller;

        let c = this.getConfig();
        let gapHeight = c.gapHeight;
        let girdHeight = c.girdHeight;

        let o: JTScrollerGroup = s.owner as JTScrollerGroup;

        let index: number = 0;
        s.renders.length = 0;


        for (let i: number = 0; i < s.items.length; i++) {
            let r: JTItemRender = s.items[i] as JTItemRender;
            if (i != 0 && i != s.items.length - 1){
                this.isRender(index)&&s.renders.push(r);
                r.index = s.indexs[index];
                index++;
            }
            r.data = useChangeData?s.changedDataList[i]:s.dataList[i];
            r.changedData = s.changedDataList[i];
            if(s.config.orientation==SlotOrientation.Portrait){
                r.y = -(gapHeight) * (i - 1)-girdHeight/2;
                r.x = s.config.girdWidth/2;
            }else{
                r.y = -s.config.girdHeight/2;
                r.x = (s.config.gapWidth) * i-o.config.girdWidth/2;
            }

        }
        this.resetRenderPoints();
        s.adjustSkinRenders(false);
    }

    private isRender(index:number):boolean{
        let o: JTScrollerGroup = this.scroller.owner as JTScrollerGroup;
        let gridRenderConfig = o.gridRenderConfig;
        if(!gridRenderConfig){
            return true;
        }else{
            return gridRenderConfig[this.scroller.index][index]==1;
        }
    }


}