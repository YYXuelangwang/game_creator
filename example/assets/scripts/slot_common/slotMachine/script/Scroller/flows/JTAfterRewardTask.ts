import { GameEventNames } from "../../SlotConfigs/GameEventNames";
import PlayerManager from "../../SlotManager/PlayerManager";
import JTScheduledTaskPipeline from "../com/tasks/JTScheduledTaskPipeline";
import JTPerformanceTask from "./JTPerformanceTask";

/*
* 每局结束时额外的任务
*/
export default class JTAfterRewardTask extends JTPerformanceTask {


    constructor() {
        super();
    }

    public addEventListenner(): void {
        game.EventManager.getInstance().addEventListener(core.GameCoreConst.mess_netexchangeGuidePush, this.exchangeGuidePush, this);
        game.EventManager.getInstance().addEventListener(core.GameCoreConst.mess_netupdateUserInfoPush, this.updateUserInfoPush, this);
    }

    /**
     * 运行任务
     */
    public runningTask(): void {
        this.nextStep();
    }

    private updateUserInfoPush(mess: string, data: protoCommon.updateUserInfoPush): void {
        
        let scroller = this.getScrollerGroup();
        if(!scroller.enabled){
            return
        }
        if (Number(core.CommonProto.getInstance().userinfo.userId) == Number(data.userInfo.userId)) {
            let score = data.userInfo.scores.toNumber();
            let t = scroller.taskPipeline as JTScheduledTaskPipeline;
            let c = t.getCurrentTask();
            if (scroller.isRunning || c.priority < this.priority) {
                PlayerManager.instance.updateRealCoin(score);
            } else {
                PlayerManager.instance.updateRealCoin(score);
                PlayerManager.instance.syncShowingCoin();
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_PUB_CHIPS_PUSH);
            }

        }

    }

    private exchangeGuidePush(): void {
        let scroller = this.getScrollerGroup();
        if(!scroller.enabled){
            return
        }
        let t = scroller.taskPipeline as JTScheduledTaskPipeline;
        let c = t.getCurrentTask();
        if (scroller.isRunning || c.priority < this.priority) {
            this.addStepTask(GameEventNames.EVENT_SHOW_EXCHANGE_GUIDE);
        } else {
            game.EventManager.getInstance().raiseEvent(core.GameCoreConst.mess_openExchangeGuide, null, null);
        }
    }


}