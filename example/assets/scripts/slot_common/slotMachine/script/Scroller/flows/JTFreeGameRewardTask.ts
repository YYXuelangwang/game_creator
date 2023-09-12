import { GameEventNames } from "../../SlotConfigs/GameEventNames";
import FreeGameInfo from "../../SlotDefinitions/FreeGameInfo";
import SpinManager from "../../SlotManager/SpinManager";
import JTPerformanceTask from "./JTPerformanceTask";

/**
 * 免费游戏中的部分表现，目前包含在大奖前表现的倍数加成奖励
 */
export default class JTFreeGameRewardTask extends JTPerformanceTask {


    public addEventListenner(): void {
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_FREE_GAME_REWARD_TASK, this.caculateRatioReward, this);

        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_FREE_GAME_INFO_UPDATED_BEFORE_REWARD_TASK, this.addUpdateGameInfoTask, this);
    }

    public runningTask(): void {
        this.nextStep();
    }
    
    private addUpdateGameInfoTask(event:string,freeGameInfo:FreeGameInfo):void{
        this.addStepTask(GameEventNames.EVENT_FREE_GAME_INFO_UPDATED,freeGameInfo);

    }

    private caculateRatioReward(event: string, freeGameInfo: FreeGameInfo): void {
        let ratio = freeGameInfo.ratio;
        let total = SpinManager.instance.totalWin;
        let base = total / ratio;
        console.log("caculateRatioReward", ratio, total, base);
        if (total > 0) {
            this.addStepTask(GameEventNames.EVENT_FREE_GAME_RATIO_REWARD, ratio, total, base);
        }
    }

}
