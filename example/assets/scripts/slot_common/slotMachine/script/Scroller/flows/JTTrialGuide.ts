
import JTParseTask from "./JTParseTask";


/*
* name;//解析任务 （可以对此类进行优化 结合数据结构里的ArrayCollection进行操作）
*/
export default class JTTrialGuide extends JTParseTask {

    constructor() {
        super();
    }

    /**
    * 运行任务
    */
    public runningTask(): void {
        // if (core.CommonProto.getInstance().isNormal || !GData.isNormalGuide) {
        //     this.playComplete();
        //     return;
        // }
        // let data: game.CfgTrialGuide = core.BannerInfo.getInstance().getTrialGuideInfo(game.ConfigGroup.GUIDE_FORM_POPUP);
        // let num = Math.round(SpinManager.instance.totalWin / SpinManager.instance.betCost);
        // if (num >= data.conditionMin && num <= data.conditionMax) {
        //     GData.isNormalGuide = false;
        //     game.EventManager.getInstance().raiseEvent(core.GameCoreConst.mess_gameRewardNotice, game.ConfigGroup.GUIDE_FORM_POPUP, [num], this.playComplete.bind(this));
        // } else {
        //     this.playComplete();
        // }

        this.playComplete();

    }

    /**
     * 清除
     */
    public clear(): void {
        super.clear();
    }

    /**
     * 播放完成调度
     */
    protected playComplete(): void {
        console.log("JTTrialGuide流程完成")
        this.complete();
    }


}