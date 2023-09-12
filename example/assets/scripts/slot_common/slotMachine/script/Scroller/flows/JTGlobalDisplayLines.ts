import JTParseTask from "./JTParseTask";
import JTChannelScrollerGroup from "../extensions/JTChannelScrollerGroup";
import { SDictionary } from "../../SlotData/SDictionary";
import { JTLineInfo } from "../lines/JTScrollerLineParser";
import RollingResult from "../../SlotData/RollingResult";
import { GameEventNames } from "../../SlotConfigs/GameEventNames";
import SlotUtils from "../../SlotUtils/SlotUtils";
import SpinManager from "../../SlotManager/SpinManager";
import {WinType } from "../../SlotDefinitions/SlotEnum";
import { SoundMger } from "../../../../sound/script/SoundMger";
import { SOUND_NAME } from "../../../../common/enum/CommonEnum";
import JTRuleTaskType from "../rules/JTRuleTaskType";
import JTCombineTask from "../rules/JTCombineTask";
import { Handler } from "../../SlotUtils/Handle";
import FreeGameManager from "../../SlotManager/FreeGameManager";
import JTDynamicCombineTask from "../rules/JTDynamicCombineTask";

/*
* name;展示全部中奖线
*/
export default class JTGlobalDisplayLines extends JTParseTask {

    constructor() {
        super();
        this.addEventListenner();
    }
    public addEventListenner(): void {
    }


    /**
     * 运行任务
     */
    public runningTask(): void {
        this.lineParser = this.getLineParser();
        let scroller: JTChannelScrollerGroup = this.lineParser.owner as JTChannelScrollerGroup;
        let playLineMap: SDictionary = this.lineParser.playLineMap;
        if(!this.lineParser.isInitiative){
            this.complete();
            return
        }
        if (!playLineMap || !playLineMap.values) {
            console.log("流程 JTGlobalDisplayLines完成1");
            this.complete();
            return;
        }
        let values: any[] = this.lineParser.playLineMap.values;
        if (values.length <= 0) {
            console.log("流程 JTGlobalDisplayLines完成2");
            this.complete();
            return;
        }
        let isUpdateChilds = true;
        let combine: JTCombineTask = scroller.getRuleTask(JTRuleTaskType.COMBINE) as JTCombineTask;
        let dc:JTDynamicCombineTask = scroller.getRuleTask(JTRuleTaskType.DYNAMIC_COMBINE) as JTDynamicCombineTask;
        if(dc&&dc.isEnabled){
            isUpdateChilds = false
        }
        if(combine&&combine.checkCanPlayLine()){
            isUpdateChilds = false
        }

        for (let i: number = 0; i < values.length; i++) {
            let line: JTLineInfo = values[i];
            let lineInfo: RollingResult = line.line;
            this.lineParser.playItemRenders(line,isUpdateChilds);
            this.lineParser.showLine(lineInfo.lineId, true);
        }

        if (values.length > 1) {
            SoundMger.instance.playEffect(SOUND_NAME.Coin_Add);
        }
        scroller.updateLayer();
        //普通奖直接在这里延迟开启
        var winType = SlotUtils.getWinType(SpinManager.instance.totalWin, SpinManager.instance.betCost);
        let interval = scroller.interval;
        //let state = SpinManager.instance.rollingResult ? SpinManager.instance.rollingResult.state : 0;

        let extendTime = 0;
        if(this.runningExtendPerfomance){
            extendTime = this.runningExtendPerfomance()*1000;
        }
        
        if ((FreeGameManager.instance.isTreateFromFreeGame)) {//免费游戏中
            interval = 500;
            this.intervalComplete(interval);
        } else {
            if(extendTime>interval){
                interval = extendTime;
            }
            let delay = 0;
            if(this.getDelayPlayRewardTime){
                delay = this.getDelayPlayRewardTime()*1000;
            }
            if (winType == WinType.Normal) {
                interval = interval - delay>0?interval - delay:200;
                if(delay>0){
                    let handler = Handler.create(this, this.intervalComplete, [interval]);
                    setTimeout(() => {
                        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_PLAYED_NORMAL_REWARD);
                        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_PLAY_REWARD_ANI, SpinManager.instance.totalWin, winType, handler);
                    }, delay);
                }else{
                    if(SpinManager.instance.totalWin>SpinManager.instance.betCost&&interval>1000){
                        interval = interval-1000;
                    }
                    let handler = Handler.create(this, this.intervalComplete, [interval]);
                    game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_PLAYED_NORMAL_REWARD);
                    game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_PLAY_REWARD_ANI, SpinManager.instance.totalWin, winType, handler);
                }
            } else {
                if(delay>interval){
                    interval = delay;
                }
                this.intervalComplete(interval);
            }
        }

    }
    
    /**
     * 在播总展示时同时播其他表现（如无总展示，此函数不执行），返回运行时间,单位为秒
     */
    protected runningExtendPerfomance?():number;

    /**
     * 获取播放总展示时，延时播放大奖和普通奖的时间，返回时间单位为秒
     */
    protected getDelayPlayRewardTime?():number;



    protected intervalComplete(interval: number): void {
        let scroller: JTChannelScrollerGroup = this.lineParser.owner as JTChannelScrollerGroup;
        this.lineParser.timer = setTimeout(() => {
            this.playComplete();
        }, interval);
    }

    /**
     * 清除
     */
    public clear(): void {
        if (this.lineParser && this.lineParser.timer) {

            clearTimeout(this.lineParser.timer);
        }
        super.clear();
    }

    /**
     * 播放完成调度
     */
    protected playComplete(): void {
        let scroller: JTChannelScrollerGroup = this.lineParser.owner as JTChannelScrollerGroup;
        //scroller.resetLayerSort();
        console.log("流程 JTGlobalDisplayLines完成3");
        this.complete();
    }


}