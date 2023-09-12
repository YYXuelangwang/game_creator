import { GameEventNames } from "../../SlotConfigs/GameEventNames";
import FreeGameInfo from "../../SlotDefinitions/FreeGameInfo";
import { WinType } from "../../SlotDefinitions/SlotEnum";
import FreeGameManager from "../../SlotManager/FreeGameManager";
import SpinManager from "../../SlotManager/SpinManager";
import SlotUtils from "../../SlotUtils/SlotUtils";
import JTPerformanceTask from "./JTPerformanceTask";

/**
 * 免费游戏结束
 */
export default class JTFreeGameOverTask extends JTPerformanceTask {
    
    /**
     * 免费游戏结束当局是否展示大奖动画
     */
    protected isNeedCaculateReward:boolean = true;

    private freeGameInfo:FreeGameInfo = null;
    
    public addEventListenner(): void {
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_FREE_GAME_OVER_TASK, this.addFreeGameOver, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_UPDATE_FREEGAME_WIN, this.updateSumSpin, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_CLEAR_FREEGAMEOVER_TASK, this.clear, this);

    }

    public runningTask():void{
        this.nextStep();
        this.freeGameInfo = null;
    }
    
    /**
     * 为免费游戏结束那局，更新已存储的免费总结算的金币值
     * @param event 
     * @param coin 
     */
    private updateSumSpin(event:string,coin:number):void{
       if(this.freeGameInfo){
          this.freeGameInfo.sumSpinCoin += coin;
       }
    }

    /**
     *
     */
    private addFreeGameOver(event:string,freeGameInfo: FreeGameInfo):void{

        FreeGameManager.instance.lastFreeGameInfo = null;
        // FreeGameManager.instance.freeGameInfo = null;//免费还没结束这里不能置空
        this.freeGameInfo = freeGameInfo;
        this.addStepTask(GameEventNames.EVENT_FREE_GAME_OVER,freeGameInfo);
        //this.isNeedCaculateReward&&this.caculateFreeGameReward(freeGameInfo);
    }


    protected caculateFreeGameReward(freeGameInfo: FreeGameInfo):void{
        let winType = SlotUtils.getWinType(freeGameInfo.sumCoin,SpinManager.instance.betCost);
        if(winType!=WinType.None){
            this.addStepTask(GameEventNames.EVENT_PLAY_REWARD_ANI,freeGameInfo.sumCoin,winType);
        }
    }

}
