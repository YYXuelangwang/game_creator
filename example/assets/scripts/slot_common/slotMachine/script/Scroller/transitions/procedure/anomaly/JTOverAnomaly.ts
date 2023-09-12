/*
* name;
*/
import JTOverRunning from "../../../com/plugins/procedure/JTOverRunning";
import JTScroller from "../../../com/JTScroller";
import JTAnomalyPipeline from "./JTAnomalyPipeline";
import JTScatterTask from "../../../rules/JTScatterTask";
import { SlotOrientation } from "../../../../SlotDefinitions/SlotEnum";
import { SOUND_NAME } from "../../../../../../common/enum/CommonEnum";
import { GData } from "../../../../../../common/utils/GData";
import { SoundMger } from "../../../../../../sound/script/SoundMger";

export default class JTOverAnomaly extends JTOverRunning {
    constructor() {
        super();
    }

    public overRunning(): void {
        let s: JTScroller = this._scroller as JTScroller;
        let pipeline: JTAnomalyPipeline = this.owner as JTAnomalyPipeline;
        if (s.isScatter() && GData.getParameter('sound')[SOUND_NAME.Sctter]) {
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
                .call(this.complete.bind(this))
                .start();
        } else {
            let x = s.speed > 0 ? this.scroller.endDistance : -this.scroller.endDistance;
            pipeline.lineTime = new cc.Tween();
            pipeline.lineTime.target(s);
            pipeline.lineTime.by(0.5 * s.endTime / 1000, { x: x })
                .to(0.5 * s.endTime / 1000, {x: 0 }, { easing: "backOut" })
                .call(this.complete.bind(this))
                .start();
        }
        
    }

    public complete(): void {
        let s: JTScroller = this._scroller as JTScroller;
        let pipeline: JTAnomalyPipeline = this._owner as JTAnomalyPipeline;
        pipeline.onceWild && pipeline.onceWild.callWatchWild(s);
        if (pipeline.scatterRule) {

            pipeline.scatterRule.callScatterComplete(s);
            pipeline.scatterRule.callWatchScatter(s);

        }
        super.complete();
    }
}