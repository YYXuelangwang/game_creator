import { GameEventNames } from "../../SlotConfigs/GameEventNames";
import FreeGameInfo from "../../SlotDefinitions/FreeGameInfo";
import { Handler } from "../../SlotUtils/Handle";
import JTScrollerLineParser from "../lines/JTScrollerLineParser";
import JTPerformanceTask from "./JTPerformanceTask";

export default class JTEliminateScoreTask extends JTPerformanceTask {

    
    private ratio:number = 1;
    public addEventListenner(): void {
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_FREE_GAME_REWARD_TASK, this.updateFreeRatio, this);
    }

    private updateFreeRatio(event: string, freeGameInfo: FreeGameInfo):void{
        this.ratio = freeGameInfo.ratio;
    }

    public runningTask(): void {
        let lineParser: JTScrollerLineParser = this.getLineParser();

        if(!lineParser.isInitiative){
            this.complete();
            return;
        }
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_UPDATE_SINGLE_ROUND_WIN,Handler.create(this,this.complete),this.ratio);
    }

    public complete(): void {
        this.ratio = 1;
        super.complete();
    }


}
