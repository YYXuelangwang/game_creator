import { GameEventNames } from "../../SlotConfigs/GameEventNames";
import FreeGameInfo from "../../SlotDefinitions/FreeGameInfo";
import FreeGameManager from "../../SlotManager/FreeGameManager";
import JTPerformanceTask from "./JTPerformanceTask";

/**
 * 免费游戏触发
 */
export default class JTNewFreeGameTask extends JTPerformanceTask {


    public addEventListenner(): void {
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_NEW_FREE_GAME_TRIGGERED_TASK, this.addFreeGameTrigger, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_NEW_FREE_GAME_TRIGGERED_AGAIN_TASK, this.addFreeGameTriggerAgain, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_FREE_GAME_INFO_UPDATED_TASK, this.addFreeGameInfoUpdate, this);

    }


    public runningTask():void{
        if(!FreeGameManager.instance.hasFreeGame){
            this.complete();
            return;
        }
        this.nextStep();
    }
    
    /**
     *
     */
    private addFreeGameTrigger(event:string):void{
        this.addStepTask(GameEventNames.EVENT_PLAY_FREE_GAME_ANI,FreeGameManager.instance.freeGameInfo);
        this.addStepTask(GameEventNames.EVENT_FREE_GAME_TRIGGERED);
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SKIP_LOOP_LINE_TASK);
    }

    private addFreeGameTriggerAgain(event:string,freeGameInfo: FreeGameInfo):void{
        this.addStepTask(GameEventNames.EVENT_PLAY_FREE_GAME_ADMISSION_ANI,freeGameInfo);
        this.addStepTask(GameEventNames.EVENT_NEW_FREE_GAME_TRIGGERED_AGAIN,freeGameInfo);
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SKIP_LOOP_LINE_TASK);

    }

    private addFreeGameInfoUpdate(event:string,freeGameInfo: FreeGameInfo):void{
        this.addStepTask(GameEventNames.EVENT_FREE_GAME_INFO_UPDATED,freeGameInfo);
    }


    public complete():void{
        super.complete();
    }


}
