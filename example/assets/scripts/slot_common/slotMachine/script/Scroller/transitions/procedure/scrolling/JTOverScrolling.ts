import JTOverRunning from "../../../com/plugins/procedure/JTOverRunning";
import JTScroller from "../../../com/JTScroller";
import JTScrollingPipeline from "./JTScrollingPipeline";
import JTScatterTask from "../../../rules/JTScatterTask";
import { GData } from "../../../../../../common/utils/GData";
import { SOUND_NAME } from "../../../../../../common/enum/CommonEnum";
import { SoundMger } from "../../../../../../sound/script/SoundMger";
import { SlotOrientation } from "../../../../SlotDefinitions/SlotEnum";

/*
* 滚完后的结束任务
*/
export default class JTOverScrolling extends JTOverRunning {
    constructor() {
        super();
    }

    public overRunning(): void {

        let s: JTScroller = this._scroller as JTScroller;
        let pipeline: JTScrollingPipeline = this.owner as JTScrollingPipeline;
        SoundMger.instance.stopEffect(SOUND_NAME.Reel_Quick);
        if (s.isScatter() && GData.getParameter('sound')[SOUND_NAME.Sctter]&&(pipeline.scatterRule&&pipeline.scatterRule.isTreatScatterEvent())) {
            SoundMger.instance.playEffect(SOUND_NAME.Sctter + "_0" + (s.index + 1));
        } else {
            if (s.index == s.config.col - 1) {
                SoundMger.instance.stopEffect(SOUND_NAME.Reel_Spin);
            }
            SoundMger.instance.playEffect(SOUND_NAME.Reel_Stop);
        }

        if (s == null || s.parent == null) {
            pipeline.clear();
            return;
        }

        if (s.dataList.length == 0) return;

        pipeline.lineTimeComplete();
        
        if (s.config.orientation == SlotOrientation.Portrait) {
            let y = s.speed > 0 ? this.scroller.endDistance : -this.scroller.endDistance;
            pipeline.lineTime = new cc.Tween();
            pipeline.lineTime.target(s);
            pipeline.lineTime.by(0.5 * s.endTime / 1000, { y: y })
                .to(0.5 * s.endTime / 1000, { y: 0 }, { easing: "backOut" })
                .call(() => {
                    s.onStopRoll();
                    this.scrollComplete();
                })
                .start();
        } else {
            let x = s.speed > 0 ? this.scroller.endDistance : -this.scroller.endDistance;
            pipeline.lineTime = new cc.Tween();
            pipeline.lineTime.target(s);
            pipeline.lineTime.by(0.5 * s.endTime / 1000, { x: x })
                .to(0.5 * s.endTime / 1000, { x: 0 }, { easing: "backOut" })
                .call(() => {
                    s.onStopRoll();
                    this.scrollComplete();
                })
                .start();
        }
    }

    /**
     * 滚动完成
     */
    public scrollComplete(): void {
        let s: JTScroller = this._scroller as JTScroller;
        let pipeline: JTScrollingPipeline = this._owner as JTScrollingPipeline;
        pipeline.onceWild && pipeline.onceWild.callWatchWild(s);
        if (pipeline.scatterRule) {
            pipeline.scatterRule.callScatterComplete(s);
            pipeline.scatterRule.callWatchScatter(s);
        }

        this.complete();

    }

}