import { GameEventNames } from "../../SlotConfigs/GameEventNames";
import BonusGameInfo from "../../SlotDefinitions/BonusGameInfo";
import { WinType } from "../../SlotDefinitions/SlotEnum";
import BonusGameManager from "../../SlotManager/BonusGameManager";
import FreeGameManager from "../../SlotManager/FreeGameManager";
import SpinManager from "../../SlotManager/SpinManager";
import { Handler } from "../../SlotUtils/Handle";
import SlotUtils from "../../SlotUtils/SlotUtils";
import JTChannelScrollerGroup from "../extensions/JTChannelScrollerGroup";
import JTPerformanceTask from "./JTPerformanceTask";


/**
 * bonusGame任务
 */
export default class JTBonusGameTask extends JTPerformanceTask {

    public addEventListenner(): void {
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_BONUS_GAME_TASK, this.addBonusGameTrigger, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_BONUS_GAME_OVER_TASK, this.addBonusGameOver, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_TREATE_NEXT_BONUSGAME, this.treateNextBonusGame, this);

    }

    public runningTask(): void {
        if (!BonusGameManager.instance.hasBonusGame) {
            this.complete();
            return;
        } else {
            if(!this.pending){
                this.addBonusGameTrigger();
            }
            this.nextStep();
        }
    }

    /**
     * 触发了bonus游戏时，等待小游戏主动完成才能结束此任务
     */
    private addBonusGameTrigger(): void {
        this.pending = true;
        this.addStepTask(GameEventNames.EVENT_BONUS_GAME_TRIGGERED);
    }

    private treateNextBonusGame(event:string,bonusGameInfo:BonusGameInfo): void {
     
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_BONUS_GAME_COMPLETE,bonusGameInfo,Handler.create(this,this.nextStep));
    }

    /**
     * 小游戏完成了，马上触发小游戏结束事件及添加大奖事件
     * @param event 
     * @param bonusGameInfo 
     */
    private addBonusGameOver(event: string, bonusGameInfo: BonusGameInfo): void {
        let currentWinCoin = bonusGameInfo.sumWinCoin;
        this.addStepTask(GameEventNames.EVENT_BONUS_GAME_FINISEH, bonusGameInfo);

        let winType = SlotUtils.getWinType(currentWinCoin, SpinManager.instance.betCost);
        if (winType != WinType.None) {

            if (FreeGameManager.instance.isTreateFromFreeGame) {
                //let  isNextFreeGame = bonusGameInfo.nextState.state == OperationState.Free;
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_UPDATE_WINSCORE, currentWinCoin, true, true, false)
                //this.addStepTask(GameEventNames.EVENT_UPDATE_WINSCORE, currentWinCoin, true, true, false);
            } else {
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_UPDATE_WINSCORE, currentWinCoin, false, false, false);
                //this.addStepTask(GameEventNames.EVENT_UPDATE_WINSCORE, currentWinCoin, false, false, false);
           }
        }
        this.pending = false;
         game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SKIP_LOOP_LINE_TASK);
        this.resetScroller();

        this.nextStep();
    }

    private resetScroller():void{
        this.lineParser = this.getLineParser();
        let scroller: JTChannelScrollerGroup = this.lineParser.owner as JTChannelScrollerGroup;
        this.lineParser.showLines(0);
        scroller.reset();
    }

    public complete(): void {
        super.complete();

    }

    public clear(): void {
        super.clear();
    }


}
