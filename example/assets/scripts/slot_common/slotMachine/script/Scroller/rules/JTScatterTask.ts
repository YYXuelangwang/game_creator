import JTRuleTask from "./JTRuleTask";
import JTScroller from "../com/JTScroller";
import JTScrollerGroup from "../com/JTScrollerGroup";
import { SDictionary } from "../../SlotData/SDictionary";
import JTGLoader from "../renders/JTGLoader";
import { GameEventNames } from "../../SlotConfigs/GameEventNames";
import { OperationState } from "../../SlotDefinitions/SlotEnum";
import BaseSpinSlotView from "../../MainView/BaseSpinSlotView";
import SlotMachineView from "../../MainView/SlotMachineView";
import JTOddsUtils from "../JTOddsUtils";
import JTChannelPipeline from "../com/plugins/JTChannelPipeline";
import { JTPipelineTemplate } from "../com/plugins/procedure/JTPipelineTemplate";
import SlotUtils from "../../SlotUtils/SlotUtils";

/*
* name;
*/
export default class JTScatterTask extends JTRuleTask {
        protected _scatterCount: number = 0;
        public indexs: number[] = null;
        public lastIndex: number = 0;

        public rangeMin: number = 0;
        public rangeMax: number = 0;
        public rangeValue: number = 0;

        static SLOW_VELOCITY: number = 2;
        static FAST_VELOCITY: number = 1;
        static DEFAULT_VELOCITY: number = 0;

        private _scatterMap: SDictionary = null;
        private _lastScrollerTime: number = 0;

        public static COUNT_MODE = 1;
        public static INDEX_MODE = 2;
        public static ITEM_COUNT_MODE = 3;
        public static APPOINT_MODE = 4;
        public static FULL_CONTINUE_MODE = 5;
        public static MULTIPLE_ITEM_COUNT_MODE = 6;
        public static APPOINT_MULTIPLE_ITEM_COUNT_MODE = 7;
        public static LINE_MODE = 8;
        public static APPOINT_COUNT_MODE = 9;


        private configs: JTScatterConfig[] = null;
        private _currentConfig: JTScatterConfig = null;

        private operationState: OperationState = OperationState.Normal;

        private requireIndexs: number[] = [];
        private callIndexs: number[] = [];

        private tempCallIndexs: number[] = [];

        /**是否正在加速中 */
        public onSpeedScrolling: boolean = false;
        
        /**
         * 加速期待的点亮的格子索引，目前线类型
         */
        private expectItemIndexs:number[] = [];

        constructor() {
                super();
                game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_OPERATIONSTATE_CHANGE, this.operationStateChange, this);

                this._scatterMap = new SDictionary();
                this.configs = [];
        }

        private operationStateChange(event: string, state: OperationState): void {
                this.operationState = state;
        }

        public isTreatScatterEvent(): boolean {
                for (let c of this.configs) {
                        if (!c.isTreatInFree && (this.operationState == OperationState.Free || this.operationState == OperationState.ReSpin)) {
                                return false;
                        }
                }
                return true;
        }



        /**
         * 
         * @param id 指定的元素 指定模式下不判断此参数 
         *          多种元素计数模式及多种元素的计数模式并指定列模式参数填写 id数组 
         *          满列连续模式参数填 形式如[{id:9,count:3},{id:10,count:1}] id为元素，count为一列包含多少个
         * @param condition 列计数模式及元素技术模式下必须为数字，列计数模式为多少列含有指定元素时触发，元素计数模式为有多少相应元素时触发，索引模式为数组，即指定索引的滚轴含有指定元素时触发
         *                  指定模式下参数形式为如[{index:0,id:12},{index:1,id:13}]，index为索引，id为元素，即指定的列包含元素才触发
         *                  满列连续模式 参数如 [0,1]即 第1和2列全为指定元素，后续的列根据会根据前一列是否全为指定元素触发加速
         *                  多种元素计数模式 多种元素加起来达到设定数量触发加速
         *                  多种元素的计数模式并指定列模式 参数形式为{count:2,indexs:[1,2]}即指定2和3列的元素达到2个是触发
         *                  连线模式根据线的位置的元素达到数量后加速，后面的列如果还能连线会继续加速
         *                  指定列的元素级数量和模式 参数[{index:0,id:[12,13],count:1},{index:1,id:[12,13],count:1}]，index为索引，id为元素，count为该列数量，参数意思是第一和二列12和13元素加起来数量都为1才能触发
         * @param speed 字符串格式，如'30-50-1' 30为最小速度，50为最大速度，1为加速度 ，单位为像素/帧
         * @param time 
         * @param priority 优先级，越大越先触发
         * @param skinURL 触发时该列滚轴显示的图片或动画
         * @param isTogether 无用参数
         * @param activateCall 
         * @param progress 触发指定元素时该列滚轴要加速的回调
         * @param type  默认列计数模式
         *              JTScatterTask.INDEX_MODE 索引模式 
         *              JTScatterTask.COUNT_MODE 列计数模式  
         *              JTScatterTask.ITEM_COUNT_MODE 元素计数模式  
         *              JTScatterTask.APPOINT_MODE 指定模式
         *              JTScatterTask.FULL_CONTINUE_MODE 满列连续模式 
         *              JTScatterTask.MULTIPLE_ITEM_COUNT_MODE 多种元素的计数模式
         *              JTScatterTask.APPOINT_MULTIPLE_ITEM_COUNT_MODE 多种元素的计数模式并指定列模式
         *              JTScatterTask.LINE_MODE 连线模式
         *              JTScatterTask.APPOINT_COUNT_MODE 指定列的元素及其数量和模式
         * @param scatterIndexList 触发时加速的滚轴列表索引，默认为空，即后续的滚轴全加速
         * @param isTreatInFree 免费中是否触发加速，默认为true
         * @param isTreatInTurbo 急速模式中是否触发加速，默认为true
         * @param onlyTreatInFree 只在免费中触发加速，默认为false，当isTreatInFree为false时此参数无效
         */
        public config(id: any, condition: number | number[] | any, speed: string, time: number, priority: number, skinURL?: string, isTogether: boolean = true, activateCall?: Function, progress?: Function, type: number = JTScatterTask.COUNT_MODE, scatterIndexList: Array<number> = null, isTreatInFree: boolean = true, isTreatInTurbo: boolean = true, onlyTreatInFree: boolean = false): void {
                let st: JTScatterConfig = new JTScatterConfig();
                if (type == JTScatterTask.INDEX_MODE) {
                        (condition as number[]).sort((a, b) => {
                                return a - b;
                        });
                }
                st.condition = condition;
                st.id = id;
                st.type = type;
                st.speed = speed;
                st.isTogether = isTogether;
                st.time = time;
                st.skinURL = skinURL;
                st.priority = priority;
                st.progress = progress;
                st.scatterIndexList = scatterIndexList;
                st.isTreatInFree = isTreatInFree;
                st.isTreatInTurbo = isTreatInTurbo;
                st.onlyTreatInFree = onlyTreatInFree;
                this.configs.push(st);
                this.configs.sort((a, b) => {
                        return b.priority - a.priority;
                })

                this._skinURL = skinURL;
        }

        public runningTask(): boolean {
                super.runningTask();
                this._currentConfig = null;
                this.requireIndexs = [];
                this.callIndexs = [];
                this.tempCallIndexs = [];
                for (let i: number = 0; i < this.configs.length; i++) {
                        let sc: JTScatterConfig = this.configs[i];
                        let c = this.runningLoopTask(sc);
                        if (c) {
                                //this._currentConfig = c;
                                //this.requireIndexs = [].concat(this.indexs);
                                if (c.type == JTScatterTask.FULL_CONTINUE_MODE || c.type == JTScatterTask.LINE_MODE) {//scatterIndexList无效

                                } else if (c.scatterIndexList) {
                                        for (let index of c.scatterIndexList) {
                                                if (!this.indexs.includes(index) && index > this.lastIndex) {
                                                        this.tempCallIndexs.push(index);
                                                }
                                        }
                                } else {
                                        for (let j = this.lastIndex + 1; j < this.dataList.length; j++) {
                                                this.tempCallIndexs.push(j);
                                        }
                                }
                                if (!this._currentConfig) {
                                        this._currentConfig = c;
                                        this.requireIndexs = [].concat(this.indexs);
                                        this.callIndexs = [].concat(this.tempCallIndexs);
                                } else {
                                        let targetFirstIndex = this.callIndexs[0];
                                        let curFirstIndex = this.tempCallIndexs[0];

                                        if (curFirstIndex < targetFirstIndex) {
                                                this.callIndexs = [].concat(this.tempCallIndexs);
                                                this.requireIndexs = [].concat(this.indexs);
                                                this._currentConfig = c;
                                        } else if (curFirstIndex == targetFirstIndex) {
                                                if (c.priority > this._currentConfig.priority) {
                                                        this.callIndexs = [].concat(this.tempCallIndexs);
                                                        this.requireIndexs = [].concat(this.indexs);
                                                        this._currentConfig = c;
                                                }
                                        }
                                }
                                // if(this.callIndexs.length==0){
                                //         this._isRunning = false;
                                // }

                        }
                        //if (this._isRunning) break;
                }
                if (this.requireIndexs.length > 0) {
                        this.lastIndex = this.requireIndexs[this.requireIndexs.length - 1]
                }
                return this._isRunning;
        }

        private runningLoopTask(st: JTScatterConfig): JTScatterConfig {

                this.lastIndex = 0;
                this.indexs = [];
                this._scatterCount = 0;
                let currentC: JTScatterConfig = null;
                this.tempCallIndexs = [];
                this.expectItemIndexs = [];

                if (!st.isTreatInFree && (this.operationState == OperationState.Free || this.operationState == OperationState.ReSpin)) {
                        return;
                }
                if (st.onlyTreatInFree && this.operationState == OperationState.Normal) {
                        return;
                }
                let setting = (this.scrollerGroup.caller as SlotMachineView).settings;
                if (!st.isTreatInTurbo && !setting.isNormalMode()) {
                        return;
                }

                if (st.type == JTScatterTask.INDEX_MODE) {
                        for (let i: number = 0; i < st.condition.length; i++) {
                                let index: number = st.condition[i];
                                let items: any[] = this.dataList[index];

                                let ignoreIndexs = this.getIgnoreIndexs(index);
                                if (!this.isContainId(index, items, st.id, ignoreIndexs)) continue;
                                this.indexs.push(index);
                                if (this.indexs.length == st.condition.length) {
                                        this.lastIndex = index;
                                        currentC = st;
                                        break;
                                }
                        }
                        this._scatterCount = this.indexs.length;
                        if (this._scatterCount == st.condition.length) this._isRunning = true;
                        if (currentC && currentC.scatterIndexList != null) {
                                let c = [];
                                for (let i: number = 0; i < st.condition.length; i++) {
                                        let index: number = st.condition[i];
                                        if (currentC.scatterIndexList.indexOf(index) == -1) {
                                                c.push(index);
                                        }
                                }
                                if (c.length > 0) {
                                        this.lastIndex = c[c.length - 1];
                                }
                        }
                } else if (st.type == JTScatterTask.ITEM_COUNT_MODE || st.type == JTScatterTask.MULTIPLE_ITEM_COUNT_MODE) {
                        let count = 0;
                        for (let i: number = 0; i < this.dataList.length; i++) {
                                let items: any[] = this.dataList[i];
                                let ignoreIndexs = this.getIgnoreIndexs(i);
                                let n = this.containIdCount(i, items, st.id, ignoreIndexs);
                                if (n == 0) continue;
                                count += n;
                                this.indexs.push(i);
                                if (count >= st.condition) {
                                        this.lastIndex = i;
                                        currentC = st;
                                        break;
                                }
                        }
                        this._scatterCount = count;
                        if (this._scatterCount >= st.condition && this.lastIndex != this.dataList.length - 1) this._isRunning = true;

                } else if (st.type == JTScatterTask.APPOINT_MODE) {
                        let flag = true;
                        for (let i = 0; i < st.condition.length; i++) {
                                let id = st.condition[i].id;
                                let index = st.condition[i].index;
                                let items: any[] = this.dataList[index];
                                let ignoreIndexs = this.getIgnoreIndexs(index);
                                if (!this.isContainId(index, items, id, ignoreIndexs)) {
                                        flag = false;
                                        break;
                                }
                                this.indexs.push(index);
                                this.lastIndex = index;
                        }
                        if (flag) {
                                currentC = st;
                        }

                        if (flag && this.lastIndex != this.dataList.length - 1) this._isRunning = true;

                } else if (st.type == JTScatterTask.FULL_CONTINUE_MODE) {
                        let flag = true;
                        for (let i = 0; i < st.condition.length; i++) {
                                let index = st.condition[i];
                                let items: any[] = this.dataList[index];
                                let ignoreIndexs = this.getIgnoreIndexs(index);
                                let isContain = false;
                                for (let d of st.id) {
                                        let count = d.count;
                                        let id = d.id;
                                        let n = this.containIdCount(index, items, id, ignoreIndexs);
                                        if (n >= count) {
                                                isContain = true;
                                                break
                                        }
                                }
                                if (!isContain) {
                                        flag = false;
                                }

                                this.indexs.push(index);
                                this.lastIndex = index;
                        }
                        if (flag) {
                                currentC = st;
                                this._isRunning = true;
                                if (this.lastIndex + 1 < this.dataList.length) {
                                        this.tempCallIndexs.push(this.lastIndex + 1);
                                }
                                for (let i = this.lastIndex + 1; i < this.dataList.length; i++) {
                                        let items: any[] = this.dataList[i];
                                        let ignoreIndexs = this.getIgnoreIndexs(i);
                                        let isContain = false;
                                        for (let d of st.id) {
                                                let count = d.count;
                                                let id = d.id;
                                                let n = this.containIdCount(i, items, id, ignoreIndexs);
                                                if (n >= count) {
                                                        isContain = true;
                                                        break
                                                }
                                        }
                                        if (!isContain) {
                                                break;
                                        }
                                        if (i + 1 < this.dataList.length) {
                                                this.tempCallIndexs.push(i + 1);
                                        }
                                }
                        }
                } else if (st.type == JTScatterTask.APPOINT_MULTIPLE_ITEM_COUNT_MODE) {
                        let conditionCount = st.condition.count;
                        let indexs = st.condition.indexs;
                        let count = 0;
                        for (let i: number = 0; i < indexs.length; i++) {
                                let index = indexs[i];
                                let items: any[] = this.dataList[index];
                                let ignoreIndexs = this.getIgnoreIndexs(index);
                                let n = this.containIdCount(index, items, st.id, ignoreIndexs);
                                if (n == 0) continue;
                                count += n;
                                this.indexs.push(index);
                                if (count >= conditionCount) {
                                        this.lastIndex = index;
                                        currentC = st;
                                        break;
                                }
                        }
                        this._scatterCount = count;
                        if (this._scatterCount >= conditionCount && this.lastIndex != this.dataList.length - 1) this._isRunning = true;

                } else if (st.type == JTScatterTask.LINE_MODE) {
                        let id = st.id;
                        let num = st.condition;
                        let lines = this.getAllLineIndexs();
                        let config = this.scrollerGroup.config;
                        let indexs = [];
                        let curLine = null;
                        for (let line of lines) {
                                let curIndexs = [];
                                for (let col = 0; col < line.length; col++) {
                                        let ignoreIndexs = this.getIgnoreIndexs(col);
                                        let index = line[col] - 1;
                                        let row = index % config.row;

                                        if (!this.isEqualId(row, col, id, ignoreIndexs)&&!SlotUtils.isWild(id)) {
                                                break;
                                        }
                                        curIndexs.push(col);
                                }
                                if (curIndexs.length >= num && curIndexs.length > indexs.length) {
                                        indexs = curIndexs;
                                        curLine = line;
                                }
                        }
                        if (indexs.length >= num) {
                                for (let i = 0; i < indexs.length; i++) {
                                        if (i < num) {
                                                this.indexs.push(indexs[i]);
                                        } else {
                                                this.tempCallIndexs.push(indexs[i]);
                                        }
                                }
                                this.lastIndex = this.indexs[this.indexs.length - 1];
                                if (indexs[indexs.length - 1] < this.dataList.length - 1) {
                                        this.tempCallIndexs.push(indexs[indexs.length - 1] + 1);
                                };
                                currentC = st;
                                for (let col = 0; col < curLine.length; col++) {
                                        let index = curLine[col] - 1;
                                        this.expectItemIndexs.push(index);
                                }

                        }
                        if (this.indexs.length >= num) this._isRunning = true;

                }else if(st.type == JTScatterTask.APPOINT_COUNT_MODE){
                        let flag = true;
                        for (let i = 0; i < st.condition.length; i++) {
                                let id = st.condition[i].id;
                                let index = st.condition[i].index;
                                let count = st.condition[i].count;
                                let items: any[] = this.dataList[index];
                                let ignoreIndexs = this.getIgnoreIndexs(index);
                                let n = this.containIdCount(index, items, id, ignoreIndexs);
                                if (n<count) {
                                        flag = false;
                                        break;
                                }
                                this.indexs.push(index);
                                this.lastIndex = index;
                        }
                        if (flag) {
                                currentC = st;
                        }

                        if (flag && this.lastIndex != this.dataList.length - 1) this._isRunning = true;
                }
                else {
                        if (this.hasOwnContinueId(st)) {
                                currentC = st;
                        }
                        this._scatterCount = this.indexs.length;
                        if (this._scatterCount == st.condition && this.lastIndex != this.dataList.length - 1) this._isRunning = true;
                }
                return currentC;
        }

        private isEqualId(row: number, col: number, id: number, ignoreIndexs: number[] = []): boolean {
                let channelPipeline: JTChannelPipeline = this._scrollerGroup.channelPipeline;
                let templete: JTPipelineTemplate = channelPipeline.getTemplate(col);
                let items = this.dataList[col];
                if (templete.dataListType == JTScrollerGroup.USE_CONVERT_MROE_LIST) {
                        if (ignoreIndexs.indexOf(row - 1) > -1) {
                                return false;
                        }
                        return items[row + 1] == id;
                }
                else {
                        if (ignoreIndexs.indexOf(row) > -1) {
                                return false;
                        }
                        return items[row] == id;

                }

        }

        /**
         * 返回忽略计算的行索引
         * @param index 列索引
         * @returns 
         */
        public getIgnoreIndexs(index: number): number[] {
                let gridConfig = this.scrollerGroup.gridRenderConfig ? this.scrollerGroup.gridRenderConfig[index] : [];

                let indexs = [];
                for (let i = 0; i < gridConfig.length; i++) {
                        if (gridConfig[i] == 0) {
                                indexs.push(i);
                        }
                }

                return indexs;
        }

        private getAllLineIndexs(): number[][] {
                let lineCount: number = this.scrollerGroup.lineCount;
                let lines = [];
                for (let i: number = 1; i < lineCount + 1; i++) {
                        let indexs = JTOddsUtils.getOddsLineIndexs(this.scrollerGroup, i, 1, 1);
                        lines.push(indexs);
                }
                return lines;
        }

        private hasOwnContinueId(st: JTScatterConfig): boolean {
                let isFlag: boolean = false;
                for (let i: number = 0; i < this.dataList.length; i++) {
                        let items: any[] = this.dataList[i];
                        let ignoreIndexs = this.getIgnoreIndexs(i);
                        if (!this.isContainId(i, items, st.id, ignoreIndexs)) continue;
                        this.indexs.push(i);
                        if (this.indexs.length == st.condition) {
                                this.lastIndex = i;
                                isFlag = true;
                                break;
                        }
                }
                return isFlag;
        }

        private getPlayItemIndexs(itemIndex:number, items:any[], id:number = null,ignoreIndexs:number[]=[]):number[]{
                if (id == null) id = this._id;
                let channelPipeline:JTChannelPipeline = this._scrollerGroup.channelPipeline;
                let templete:JTPipelineTemplate = channelPipeline.getTemplate(itemIndex);
                let scroller = this.scrollerGroup.items[itemIndex] as JTScroller;
                let indexs = [];
                for(let i=0;i<items.length;i++){
                    let data = items[i];
                    if(data!=id){
                        continue;
                    }
                    if (templete.dataListType == JTScrollerGroup.USE_CONVERT_MROE_LIST){
                        if(i==0||i==items.length-1||ignoreIndexs.includes(i-1)){
                                continue;
                        }
                        indexs.push(scroller.indexs[i-1]);
                    }else if(templete.dataListType == JTScrollerGroup.USE_CONVERT_TO_LIST){
                        if(ignoreIndexs.includes(i)){
                                continue;
                        }   
                        indexs.push(scroller.indexs[i]);
                    }
                }
                return indexs;
        }

        public setupScatterTime(s: JTScroller): void {
                let o: JTScrollerGroup = s.owner as JTScrollerGroup;
                let hasPreCaller = false;
                for (let i = 0; i < o.runnings.length; i++) {
                        let t = o.runnings[i] as JTScroller;
                        if (t.index < s.index) {
                                hasPreCaller = true;
                        }
                }

                if (!hasPreCaller) {
                        return;
                }

                if (this.callIndexs.indexOf(s.index) > -1 && this._isRunning) {
                        var isIndex: boolean = true;//this._currentConfig.scatterIndexList == null || (this._currentConfig.scatterIndexList != null && this._currentConfig.scatterIndexList.indexOf(s.index) != -1);
                        let multiple: number = 1 //s.index - this.lastIndex;
                        if (this._currentConfig && this._currentConfig.scatterIndexList) {
                                for (let i = this.lastIndex + 1; i <= s.index; i++) {
                                        if (this._currentConfig.scatterIndexList.indexOf(i) != -1) {
                                                multiple++;
                                        }
                                }
                        } else {
                                multiple = s.index - this.lastIndex;
                        }

                        if (!s.isRunning) return;
                        if (this._currentConfig.speed.indexOf("-") != -1) {
                                let speed: string = this._currentConfig.speed;
                                let lines: any[] = speed.split("-");
                                let scatterInfo: JTScatterRunningInfo = new JTScatterRunningInfo();
                                scatterInfo.velocity = {};
                                let min: number = parseFloat(lines[0]);
                                let max: number = parseFloat(lines[1]);
                                let value: number = parseFloat(lines[2]);
                                scatterInfo.step = Math.ceil((max - min) / value);
                                scatterInfo.step = scatterInfo.step == 0 ? 1 : scatterInfo.step;
                                scatterInfo.currentStep = 0;
                                if (isIndex) {
                                        let extraTime = ((scatterInfo.step * s.defaultFrameRateTime) * 2 + this.time) * multiple + multiple * (multiple + 1) * 300;
                                        s.time += extraTime;
                                        this._scatterMap.set(s.index, scatterInfo);

                                        this.adjustNextScrollerTime(s, s.time);
                                }
                                else {
                                        s.time += this._lastScrollerTime;
                                }
                                this._lastScrollerTime = s.time;
                                this.skinLoaders[s.index].active = (s as JTScroller).active;//加速框会根据scroller是否隐藏而隐藏
                        }
                        else {
                                s.time += this.time;
                        }
                }
        }

        /**
         * 增加余下的不在加速列表的滚轴的滚动时间
         * @param s 
         * @param time 
         */
        private adjustNextScrollerTime(s: JTScroller, time: number): void {
                let o: JTScrollerGroup = s.owner as JTScrollerGroup;
                let scrollers: any[] = o.items;
                for (let i = s.index + 1; i < scrollers.length; i++) {
                        let next = scrollers[i] as JTScroller;
                        if (!next.isRunning) {
                                continue;
                        }
                        if (this.callIndexs.indexOf(i) == -1) {
                                next.time += time;
                        } else {
                                break;
                        }
                }
        }

        public updateScatterTime(s: JTScroller): boolean {
                let scatter: JTScatterRunningInfo = this._scatterMap.get(s.index);
                if (scatter) {
                        if (scatter.velocity["cadence"] == JTScatterTask.FAST_VELOCITY) {
                                scatter.runningTime += s.defaultFrameRateTime;
                                if (scatter.runningTime < this._currentConfig.time) return false;
                        }
                        else if (scatter.runningTime == 0) {
                                //  JTLogger.info(s.index,  "                  runningTime:         " + scatter.runningTime)
                                return false;
                        }
                }
                return true;
        }

        public onRunningSpeedUp(s: JTScroller): boolean {
                let scatter: JTScatterRunningInfo = this._scatterMap.get(s.index);
                if (scatter && scatter.velocity["cadence"] == JTScatterTask.SLOW_VELOCITY) {
                        if (!scatter.velocity["init"]) {
                                s.speed = this.rangeMin;
                                scatter.velocity["init"] = true;
                        }
                        if (scatter.currentStep == scatter.step) {
                                scatter.velocity["cadence"] = JTScatterTask.FAST_VELOCITY;
                                scatter.currentStep = 0;
                                return true;
                        }
                        s.speed += s.speed > this.rangeMax ? -Math.abs(this.rangeValue) : this.rangeValue;
                        scatter.currentStep += 1;
                }
                return false;
        }

        public getScatterInfo(index: number): JTScatterRunningInfo {
                return this._scatterMap.get(index);
        }

        public onRunningSlowdown(s: JTScroller): boolean {
                let scatter: JTScatterRunningInfo = this._scatterMap.get(s.index);
                if (scatter && scatter.velocity["cadence"] == JTScatterTask.FAST_VELOCITY) {
                        if (scatter.currentStep == scatter.step) {
                                scatter.velocity["cadence"] = JTScatterTask.DEFAULT_VELOCITY;
                                scatter.currentStep = 0;
                                return true;
                        }
                        s.speed += s.speed > this.rangeMin ? -Math.abs(this.rangeValue) : this.rangeValue;
                        scatter.currentStep += 1;
                        return true;
                }
                return false;
        }

        public callWatchScatter(s: JTScroller): void {
                let o: JTScrollerGroup = s.owner as JTScrollerGroup;
                if (!this._currentConfig) return;
                let scrollers = o.items as JTScroller[];
                let nextIndex: number = s.index + 1;
                if (nextIndex >= scrollers.length) return;
                let n = scrollers[nextIndex];
                if (this.requireIndexs.includes(nextIndex) && n.isRunning) return;

                if (nextIndex < this.lastIndex && n.isRunning) return;

                for (let i = nextIndex; i < scrollers.length; i++) {
                        let next = scrollers[i];
                        if (!next.isRunning) {
                                continue;
                        }
                        if (this.callIndexs.indexOf(i) == -1) {
                                break;
                        }
                        this.launchWatch(i, o);
                        break;
                }

        }

        public launchWatch(index: number, o: JTScrollerGroup): void {

                if (!this._currentConfig) return;
                // var isIndex = this._currentConfig.scatterIndexList == null || (this._currentConfig.scatterIndexList != null && this._currentConfig.scatterIndexList.indexOf(index) != -1);
                // if (!isIndex) {
                //         // s.speed = 
                //         return;
                // }
                let s: JTScroller = o.getItem(index) as JTScroller;
                if (!s.isRunning) return;
                if (this._currentConfig.speed.indexOf("-") == -1) {
                        s.speed = o.direction == JTScrollerGroup.SCROLLINGDOWN ? Math.abs(parseInt(this._currentConfig.speed)) : -Math.abs(parseInt(this._currentConfig.speed));
                }
                else {
                        let lines: any[] = this._currentConfig.speed.split("-");
                        let min: number = parseInt(lines[0]);
                        let max: number = parseInt(lines[1]);
                        let value: number = parseFloat(lines[2]);
                        let scatter: JTScatterRunningInfo = this._scatterMap.get(index);
                        this.setupVelocity(s, scatter, min, max, value);
                }
                s.skinLoader = this.skinLoaders[s.index];
                this._skinURL = s.skinLoader.url = this._currentConfig.skinURL;
                this._currentConfig.progress && this._currentConfig.progress.apply(this.caller, [s]);
                this.onSpeedScrolling = true;

                this.playRenders(index);
     
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SCROLLER_ONSPEED_RUNNING_START);
        }
        
        /**
         * 线类型分散加速时获取期待加速时连成线的位置索引
         * @param col 列索引
         * @returns 
         */
        public getCurrentExpectItemIndex(col:number):number{
              if(this.isRunning&&this.expectItemIndexs&&this.expectItemIndexs.length>0){
                  return this.expectItemIndexs[col];
              }
        }

        public setupVelocity(s: JTScroller, scatter: JTScatterRunningInfo, min: number, max: number, value: number = 2): void {
                this.rangeMax = (s.owner as JTScrollerGroup).direction == JTScrollerGroup.SCROLLINGDOWN ? max : -max;
                this.rangeMin = (s.owner as JTScrollerGroup).direction == JTScrollerGroup.SCROLLINGDOWN ? min : -min;
                this.rangeValue = value;
                if (scatter && scatter.velocity)
                        scatter.velocity["cadence"] = JTScatterTask.SLOW_VELOCITY;
        }

        public getCurrentTask(): JTScatterConfig {
                return this._currentConfig;
        }

        public isIgnoreItem(render: BaseSpinSlotView): boolean {
                let o = this.scrollerGroup;
                let c = o.config;
                let col = Math.floor(render.index/c.row);
                let row = render.index%c.row;
                let rows = this.getIgnoreIndexs(col);
                return rows.includes(row);
        }

        /**
         * 调用列的分散任务结束，此为公共库调用，子项目重写onScatterComplte
         * @param s 
         * @returns 
         */
        public callScatterComplete(s: JTScroller): void {
                if (!s.isRunning || !this._currentConfig || this._currentConfig.progress == null || !this._isRunning) return;
                
                this.onScatterComplte(s);

                let lastCallIndex = this.callIndexs[this.callIndexs.length - 1];
                if (s.index >= lastCallIndex) {
                     this.scrollerGroup.scatterblackBackGround && (this.scrollerGroup.scatterblackBackGround.active = false);
                     this.scrollerGroup.layerSortScatterPlayContainer && this.scrollerGroup.layerSortScatterPlayContainer.resetLayerSort()
                     this.scrollerGroup.layerSortScatterStopContainer && this.scrollerGroup.layerSortScatterStopContainer.resetLayerSort();
                }
                if (s.index < this.lastIndex) return;
                let loader: JTGLoader = this._skinLoaders[s.index] as JTGLoader;
                loader.url = null;
        }

        private playRenders(col:number):void{
                let st = this._currentConfig;
                let playRenders:BaseSpinSlotView[] = [];
                let stopRenders:BaseSpinSlotView[] = [];
                let renders:BaseSpinSlotView[] = [];
                let o = this.scrollerGroup;
                for(let i=0;i<col;i++){
                    let scroller = o.items[i] as JTScroller;
                    renders = renders.concat(scroller.renders as BaseSpinSlotView[]);
                }
                if (st.type == JTScatterTask.APPOINT_MODE||st.type==JTScatterTask.APPOINT_COUNT_MODE) {
                        for (let i = 0; i < st.condition.length; i++) {
                                let id = st.condition[i].id;
                                let index = st.condition[i].index;
                                if (col < index) {
                                        continue;
                                }
                                for (let r of renders) {
                                        if (((st.id instanceof Array&&st.id.includes(id))||r.data == id) && !this.isIgnoreItem(r)) {
                                                playRenders.push(r);
                                        } else {
                                                stopRenders.push(r);
                                        }
                                }
                        }
                }else if(st.type==JTScatterTask.LINE_MODE){
                        let i = this.expectItemIndexs[col];
                        for (let r of renders) {
                                if (r.index==i) {
                                        playRenders.push(r);
                                } else {
                                        stopRenders.push(r);
                                }
                        }

                } else {
                        for (let r of renders) {
                                let isScatter = false;
                                if ((st.id instanceof Array)) {
                                        if (st.id.length > 0) {
                                                if (typeof (st.id[0]) == "object") {
                                                        isScatter = st.id.findIndex((v) => {
                                                                return v.id == r.data;
                                                        }) > -1;
                                                } else if (st.id.includes(r.data)) {
                                                        isScatter = true;
                                                }
                                        }
                                } else if (r.data == st.id) {
                                        isScatter = true;
                                }
                                if (isScatter && !this.isIgnoreItem(r)) {
                                        playRenders.push(r);
                                } else {
                                        stopRenders.push(r);
                                }
                        }
                }

                for(let r of playRenders){
                        r.onScattterTaskCall();
                }
                this.scrollerGroup.scatterblackBackGround && (this.scrollerGroup.scatterblackBackGround.active = true);
                this.scrollerGroup.layerSortScatterStopContainer && this.scrollerGroup.layerSortScatterStopContainer.updateChangedChildsLayer(stopRenders, true);
                this.scrollerGroup.layerSortScatterPlayContainer && this.scrollerGroup.layerSortScatterPlayContainer.updateChangedChildsLayer(playRenders, true);
        
        }

        public removeIndexs(indexs: number[]): void {
                for (let index of indexs) {
                        let i = this.callIndexs.indexOf(index);
                        if (i != -1) {
                                this.callIndexs.splice(i, 1);
                                this._scatterMap.remove(index)
                        }
                }
        }

        /**
         * 列分散任务完成
         * @param s 
         */
        public onScatterComplte(s: JTScroller): void {

        }

        private isClick: boolean = true;
        public clear(): void {
                if (!this.isClick) {
                        this.isClick = true;
                        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_GAMECONTROL_ALL_BTN_CLICK, true);
                }
                super.clear();
                this._scatterMap.clear();
                this._lastScrollerTime = 0;
                this._isRunning = false;
                this.lastIndex = 0;
                this._currentConfig = null;
                this.requireIndexs = [];
                this.callIndexs = [];
                // this.isTreatFreeAgain = false;
                this.scrollerGroup.scatterblackBackGround && (this.scrollerGroup.scatterblackBackGround.active = false);

                this.scrollerGroup.layerSortScatterPlayContainer && this.scrollerGroup.layerSortScatterPlayContainer.resetLayerSort()
                this.scrollerGroup.layerSortScatterStopContainer && this.scrollerGroup.layerSortScatterStopContainer.resetLayerSort();
                this.clearSkinLoaders();
                this.onSpeedScrolling = false;
        }

}

class JTScatterRunningInfo {
        public velocity: Object = {};
        public runningTime: number = 0;
        public step: number = 0;
        public currentStep: number = 0;
}

class JTScatterConfig {
        public condition: any = null;
        public type: number = 0;
        public id: any = null;
        public speed: any = null;
        public isTogether: boolean = false;
        public time: number = 0;
        public priority: number = 0;
        public skinURL: string = null;
        public progress: Function = null;
        public scatterIndexList: Array<number> = null;
        public isTreatInFree: boolean = true;
        public isTreatInTurbo: boolean = true;
        public onlyTreatInFree: boolean = false;
}


