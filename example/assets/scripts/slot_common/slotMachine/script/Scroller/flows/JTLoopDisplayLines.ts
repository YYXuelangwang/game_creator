import JTParseTask from "./JTParseTask";
import JTScrollerLineParser, { JTLineInfo } from "../lines/JTScrollerLineParser";
import JTLineType from "../lines/JTLineType";
import JTLineMode from "../lines/JTLineMode";
import JTLineDirection from "../lines/JTLineDirection";
import JTItemRender from "../com/base/JTItemRender";
import JTOddsUtils from "../JTOddsUtils";
import { SDictionary } from "../../SlotData/SDictionary";
import RollingResult from "../../SlotData/RollingResult";
import JTDefaultItemRender from "../renders/JTDefaultItemRender";
import JTLineScrollerGroup from "../extensions/JTLineScrollerGroup";
import SlotMachineView from "../../MainView/SlotMachineView";
import { SoundMger } from "../../../../sound/script/SoundMger";
import { SOUND_NAME } from "../../../../common/enum/CommonEnum";
import SpinManager from "../../SlotManager/SpinManager";
import JTLayerFactory from "../com/factorys/JTLayerFactory";
import JTLineRender from "../lines/JTLineRender";
import { GameEventNames } from "../../SlotConfigs/GameEventNames";
import JTScroller from "../com/JTScroller";
import JTScrollerGroup from "../com/JTScrollerGroup";
import BaseSpinSlotView from "../../MainView/BaseSpinSlotView";
import JTCombineTask from "../rules/JTCombineTask";
import JTRuleTaskType from "../rules/JTRuleTaskType";
import JTDynamicCombineTask from "../rules/JTDynamicCombineTask";
import FreeGameManager from "../../SlotManager/FreeGameManager";

/*
* name;//循环展示线
*/
export default class JTLoopDisplayLines extends JTParseTask {
        protected _scroller: JTLineScrollerGroup = null;//滚轴视图
        /**
         * 中奖需要轮播的线数组
         */
        protected _playLineMap: SDictionary = null;
        /**
         * 当前播放哪个线
         * 播放点
         */
        protected linePosition: number = 0;
        /**
         * 中奖线列表
         */
        protected lineList: JTLineInfo[] = null;

        /**
         * 中奖一条线时，只播放一次中奖线音效
         */
        private isFristPlaySound: boolean = false;

        private skipTask: boolean = false;

        private interval: number;

        constructor() {
                super();
                game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_SKIP_LOOP_LINE_TASK, this.skipLoopLine, this);
                game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_CLEAR_LOOP_LINE, this.clear, this);
        }

        private skipLoopLine(): void {
                if (!this._owner || !this.owner.owner || !(this.owner.owner as JTScrollerGroup).enabled) {
                        return;
                }
                this.skipTask = true;
        }

        /**
         * 运行任务
         */
        public runningTask(): void {
                this.clear();
                this.lineParser = this.getLineParser();

                this._playLineMap = this.lineParser.playLineMap;
                this._scroller = this.lineParser.owner as JTLineScrollerGroup;

                if (this._scroller == null || (this._scroller as JTLineScrollerGroup).parent == null) {

                        console.log("流程：JTLoopDisplayLines完成 1");
                        this.complete();
                        return;
                }
                if (this.skipTask || !this._playLineMap || !this._playLineMap.values || this._playLineMap.values.length == 0
                        || !this.lineParser.isLoopWinInThisRound || SpinManager.instance.restAutoTimes != 0 || SpinManager.instance.tempAutoTimes != 0) {

                        let dc: JTDynamicCombineTask = this._scroller.getRuleTask(JTRuleTaskType.DYNAMIC_COMBINE) as JTDynamicCombineTask;

                        let isUpdateChilds = true;
                        if (dc && dc.isEnabled) {
                                isUpdateChilds = false
                        }
                        let combine: JTCombineTask = this._scroller.getRuleTask(JTRuleTaskType.COMBINE) as JTCombineTask;

                        if (combine && combine.checkCanPlayLine()) {
                                isUpdateChilds = false
                        }
                        this._scroller.updateRenders();
                        // this._scroller.resetLayerSort();
                        // isUpdateChilds&&this._scroller.updateChangedChildsLayer([], true);
                        if (this.lineParser.lineComplete) {
                                this.lineParser.lineComplete.apply(this.caller, [this]);
                                this.lineParser.lineComplete = null;
                        }
                        console.log("流程：JTLoopDisplayLines完成 2");
                        this.complete();
                        return;
                }

                var time = this._scroller.interval;
                this.isFristPlaySound = false;
                this.lineList = [].concat(this._playLineMap.values);
                this.filterLine();
                this.lineList.sort(this.sortOn);
                (this._scroller.factoryLayer as JTLayerFactory).resetLayer();
                this._scroller.enableds();
                if (this.lineList.length == 1 && SpinManager.instance.spinTouchEnable) {
                        SoundMger.instance.playEffect(SOUND_NAME.Line_Switch);
                }
                this.loopWinLine();
                this.interval = setInterval(() => {
                        this.loopWinLine();
                }, time) as any;


        }
        /**
         * 过滤线 可以扩展
         */
        protected filterLine(): void {

        }

        protected sortOn(a: JTLineInfo, b: JTLineInfo): number {
                if (a.line.lineType == JTLineType.FULL_LINE && b.line.lineType == JTLineType.FULL_LINE) {
                        //满线以金额
                        if (a.line.winCoin < b.line.winCoin) {//金币降序
                                return 1;
                        } else {
                                return -1;
                        }
                } else {
                        //连线以id
                        if (a.line.lineId < b.line.lineId) {//线id升序
                                return -1
                        }
                        return 0;
                }

                // if (a.line.winCoin < b.line.winCoin) {//金币降序
                //         return 1;
                // }
                // else if (a.line.winCoin == b.line.winCoin) {
                //         if (a.line.lineId < b.line.lineId) {//线id升序
                //                 return -1
                //         }
                //         return 0;
                // }
                // return -1;
        }

        public complete(): void {
                this.skipTask = false;
                if (this.lineParser.lineComplete) {
                        this.lineParser.lineComplete.apply(this.caller, [this]);
                        this.lineParser.lineComplete = null;
                }
                super.complete();
        }
        /**
         * 清理轮播
         */
        public clear(): void {
                super.clear();
                this.linePosition = 0;
                if (this.interval) {
                        clearInterval(this.interval);
                        this.interval = 0;
                }

                if (this._scroller) {
                        cc.director.getScheduler().unschedule(this.onChangedImageTimer, this);
                }
        }

        /**
         * 循环赢的线
         */
        protected loopWinLine(): void {
                if (this._scroller == null || (this._scroller as JTLineScrollerGroup).parent == null) {
                        console.log("流程：JTLoopDisplayLines完成");
                        this.clear();
                        return;
                }
                this.lineParser.showLines(0);//移除上次显示的中奖线
                let lineParser: JTScrollerLineParser = this.lineParser;
                if (lineParser.lineComplete) {
                        lineParser.lineComplete.apply(this.caller, [this]);
                        lineParser.lineComplete = null;
                        if (lineParser.ifStopWhenComplete) {
                                this.clear();
                                console.log("流程：JTLoopDisplayLines完成");
                                this.complete();
                                return;
                        }
                }
                let dc: JTDynamicCombineTask = this._scroller.getRuleTask(JTRuleTaskType.DYNAMIC_COMBINE) as JTDynamicCombineTask;
                let isUpdateChilds = true;
                if (dc && dc.isEnabled) {
                        isUpdateChilds = false
                }
                let combine: JTCombineTask = this._scroller.getRuleTask(JTRuleTaskType.COMBINE) as JTCombineTask;

                if (combine && combine.checkCanPlayLine()) {
                        isUpdateChilds = false
                }

                let canPlayEffect = true;

                if (this.linePosition >= this.lineList.length) {
                        this.linePosition = 0;
                        if (lineParser.isLoopGlobalLines) {
                                this._scroller.enableds();
                                for (let i: number = 0; i < this.lineList.length; i++) {
                                        let line: JTLineInfo = this.lineList[i];
                                        let lineInfo: RollingResult = line.line;
                                        this.lineParser.playItemRenders(line, isUpdateChilds);
                                        this.lineParser.showLine(lineInfo.lineId, true);
                                }
                                this._scroller.updateLayer();
                                canPlayEffect = SlotMachineView._instance.onShowMoreWinLineCb(this.lineList, this.lineList.length > 1) == false ? false : true;
                                if (canPlayEffect)
                                        SoundMger.instance.playEffect(SOUND_NAME.Line_Switch);
                                return;
                        }
                }
                canPlayEffect = SlotMachineView._instance.onShowMoreWinLineCb(this.lineList, false) == false ? false : true;
                if (this._scroller.showImageInterval > 0 && this._scroller.showImageInterval <= this._scroller.interval) {
                        //cc.director.getScheduler().schedule(this.onChangedImageTimer, this, this._scroller.showImageInterval);
                }
                let lineInfo: JTLineInfo = this.lineList[this.linePosition];
                let lineResult: RollingResult = lineInfo.line;
                this._scroller.enableds();

                let lineRender: JTLineRender = lineParser.showMaskWithGridLine(lineResult, isUpdateChilds);
                canPlayEffect && SoundMger.instance.playEffect(SOUND_NAME.Line_Switch);


                if (lineResult.lineType === JTLineType.LINE && lineResult.lineType == JTLineMode.MODE_NORMAL) {
                        let txtIndex: number = JTDefaultItemRender.playIndex;
                        let rs: JTItemRender[] = [].concat(lineRender.renders);
                        if (lineResult.direction == JTLineDirection.DIRECTION_RIGHT) {
                                rs = rs.reverse();
                        }
                        let r: any = rs[txtIndex];
                        r.playRewardsAnimation(lineResult, txtIndex, r.index, SlotMachineView.instance);
                }
                else {
                        let renders = lineInfo.renders;
                        if (renders.length > 0) {
                                let rindex = Math.floor((renders.length - 1) * 0.5);
                                if (JTDefaultItemRender.fullTypeIndex != -1) {
                                        for (let i = 0; i < renders.length; i++) {
                                                let render = renders[i];
                                                if (render && render.index >= 0) {
                                                        let scrollerGroup = this.owner && this.owner.owner as JTScrollerGroup
                                                        if (scrollerGroup) {
                                                                let row = scrollerGroup.config.row;
                                                                // 从index中换算获取在第几列数
                                                                if (Math.floor(render.index / row) == JTDefaultItemRender.fullTypeIndex) {
                                                                        rindex = i
                                                                        break;
                                                                }
                                                        }
                                                }
                                        }
                                }
                                let r = renders[rindex] as BaseSpinSlotView;
                                r.playRewardsAnimation(lineResult, 0, r.index, SlotMachineView.instance);
                        }
                }
                this.linePosition += 1;

                if (this.lineParser.isTreatFullLine(lineResult)) {
                        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_TREAT_FULL_LINE_IN_LOOP);
                }
        }



        /**
         * 
         * @param index 切换图片效果
         */
        private onChangedImageTimer(index: number): void {
                index = this.linePosition;
                cc.director.getScheduler().unschedule(this.onChangedImageTimer, this);

                let lineResult: RollingResult = this.lineList[index].line;
                let key: string = JTOddsUtils.getLineKey(lineResult);
                let line: JTLineInfo = this._playLineMap.get(key);
                let rs: JTItemRender[] = [].concat(line.renders);
                console.log("onChangedImageTimer");

                for (var i: number = 0; i < rs.length; i++) {
                        let r: JTItemRender = rs[i];
                        if (r["_inAni"] == false && r["_playingRewardsAni"] == false) {
                                continue;
                        }
                        r.gotoAndStop(JTItemRender.STATE_DEFAULT);
                }
        }

}