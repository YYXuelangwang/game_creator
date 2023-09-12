import { GameEventNames } from "../../SlotConfigs/GameEventNames";
import MultipleGameManager from "../../SlotManager/MultipleGameManager";
import JTPerformanceTask from "./JTPerformanceTask";

/**
 * 中奖动画
 */
export default class JTChangeGameTask extends JTPerformanceTask {
    

    public addEventListenner(): void {
    }


    public runningTask(): void {
        if(MultipleGameManager.instance.isChangeGame){
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SKIP_LOOP_LINE_TASK);
            this.addStepTask(GameEventNames.EVENT_CHANGE_GAME_SCROLLER);
        }
        this.nextStep();
    }



}
