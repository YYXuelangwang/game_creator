import { GameEventNames } from "../../SlotConfigs/GameEventNames";
import { WinType } from "../../SlotDefinitions/SlotEnum";
import SpinManager from "../../SlotManager/SpinManager";
import SlotUtils from "../../SlotUtils/SlotUtils";
import JTScrollerLineParser from "../lines/JTScrollerLineParser";
import JTPerformanceTask from "./JTPerformanceTask";

/**
 * 中奖动画
 */
export default class JTCommonRewardTask extends JTPerformanceTask {
    
    private playedNormalReward:boolean = false;

    public addEventListenner(): void {
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_PLAYED_NORMAL_REWARD, this.hadPlayNormalReward, this);
    }

    public clear():void{
        super.clear();
        this.playedNormalReward = false;
    }

    private hadPlayNormalReward():void{
        this.playedNormalReward = true;
    }

    public runningTask(): void {
        this.caculate();
        this.nextStep();
    }

    public caculate(): void {
        let lineParser: JTScrollerLineParser = this.getLineParser();
        if(!lineParser.isInitiative){
            return;
        }

        let coin = SpinManager.instance.totalWin;
        let winType = SlotUtils.getWinType(coin, SpinManager.instance.betCost);
        if (SpinManager.instance.totalWin <= 0) {
            return;
        }
        if (winType != WinType.None&&winType!=WinType.Normal) {
            this.addStepTask(GameEventNames.EVENT_PLAY_REWARD_ANI, coin, winType);
        }else if(winType==WinType.Normal&&!this.playedNormalReward){//消除类没有总线流程不会播普通奖，所以在这里播放
            //game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_PLAY_REWARD_ANI, coin, winType);
            this.addStepTask(GameEventNames.EVENT_PLAY_REWARD_ANI, coin, winType);
        }
        this.playedNormalReward = false;
    }


}
