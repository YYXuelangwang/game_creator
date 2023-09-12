import JTContainer from "../com/base/JTContainer";
import JTGComponent from "../com/base/JTGComponent";
import JTLineRenderUtils from "./JTLineRenderUtils";
import { SDictionary } from "../../SlotData/SDictionary";
import JTItemRender from "../com/base/JTItemRender";
import JTSkinnableLineButtonRender from "./skinnables/JTSkinnableLineButtonRender";
import JTOddsUtils from "../JTOddsUtils";
import JTDynamicWildTask from "../rules/JTDynamicWildTask";
import JTRuleTaskType from "../rules/JTRuleTaskType";
import JTOnceWildTask from "../rules/JTOnceWildTask";
import JTLineMask from "../masks/JTLineMask";
import JTLineRender from "./JTLineRender";
import JTItemSkinLoader from "../com/base/JTItemSkinLoader";
import JTElementIdType from "./JTElementIdType";
import RollingResult from "../../SlotData/RollingResult";
import { Handler } from "../../SlotUtils/Handle";
import JTDefaultItemRender from "../renders/JTDefaultItemRender";
import SlotConfigManager from "../../SlotManager/SlotConfigManager";
import JTLayerFactory from "../com/factorys/JTLayerFactory";
import JTChildFactory from "../com/factorys/JTChildFactory";
import JTLineScrollerGroup from "../extensions/JTLineScrollerGroup";
import JTSkinnable from "./skinnables/base/JTSkinnable";
import JTLineType from "./JTLineType";
import SlotMachineView from "../../MainView/SlotMachineView";
/*
* name;
*/
export default class JTScrollerLineParser extends JTContainer {
        /**
         * 线渲染器工具 
         */
        private _renderUtils: JTLineRenderUtils = null;
        /**
         * 滚轴组视图
         */
        private _scroller: JTLineScrollerGroup = null;
        /**
         * 线和格子框渲染器map数组
         */
        protected _lineMap: SDictionary = null;
        /**
         * 播放线完成函数
         */
        private _lineComplete: Function = null;
        /**
         * 
         */
        private _ifStopWhenComplete: boolean = true;
        /**
         * 中奖的线结果
         */
        public _linesResult: any[] = null;
        /**
         * 一个公共的计时器，用于logic里面的流程需要用到timer,便于管理
         */
        private _timer: number = null;
        /**
         * 播放线的Map数组
         */
        private _playLineMap: SDictionary = null;
        /**
         * 特殊百搭ID
         */
        private _wildId: number[] = [];

        /**
         * 动态百搭ID
         */
        private _dynamicWildId: number[] = [];
        /**
         * 特殊分散ID
         */
        private _scatterId: number = 0;
        /**
         * bounds ID
         */
        private _boundsId: number = 0;
        private _singleLineComplete: Handler = null;
        //     public isCreateBuffer:boolean = false;

        /**
         * 本轮是否轮播线
         */
        private _isLoopWinInThisRound: boolean = true;

        /**
         * 
         */
        private _isInitiative: boolean = true;

        /**
         * 轮播种是否总展示
         */
        private _isLoopGlobalLines: boolean = true;


        /**上一次显示lineid */
        public showPreLineId: number = -1;

        constructor() {
                super();
        }

        /**
         * 初始化
         */
        public initialize(): void {
                this._lineMap = new SDictionary();
                this._scroller = this._owner as JTLineScrollerGroup;
                this._renderUtils = new JTLineRenderUtils();
                this._renderUtils.createLines(this._scroller, this._lineMap);
        }

        /**
         * 解析线结果
         * @param lines 中奖线列表
         * @param complete 播放完成回调（如果传回调则只会播放一遍，不传则会循环播放）
         * @param ifStopWhenComplete 
         */
        public parse(lines: any[], complete?: Function, ifStopWhenComplete: boolean = true, isLoopWinInThisRound: boolean = true, isLoopGlobalLines: boolean = false): void {
                this._linesResult = lines;
                this.lineComplete = complete;
                this._ifStopWhenComplete = ifStopWhenComplete;
                this._isLoopWinInThisRound = isLoopWinInThisRound;
                this._isLoopGlobalLines = isLoopGlobalLines;
                this.autoParse();
        }

        public autoParse(): void {
                this.clear();
                this.onPlayLines();
        }

        public onPlayLines(): void {
                // this._scroller.resetLayoutScrollerLayer();
                // var lines:RollingResult[] = this._linesResult;
                // if (lines.length == 0) return;
                // this._scroller.enableds();
                // for (var i:number = 0; i < lines.length; i++)
                // {
                //     var lineInfo:RollingResult = lines[i];
                //     let rs:JTItemRender[] = null;
                //     let lineKey:string = lineInfo.lineId + "dir" + lineInfo.direction;
                //     if (lineInfo.lineMode == 2) // 线的模式是免费模式
                //     {
                //                 rs =  this._scroller.getSomesById(lineInfo.eleId);
                //                 this._rendersMap[lineKey] = this.converToRenderInfo(rs, lineInfo);
                //                 continue;
                //     }
                //     this.showLine(lineInfo.lineId, true);
                //     rs = JTOddsUtils.getLineRenders(lineInfo, this._scroller);
                //     let lineRender:JTLineRender = this._lineMap.get(lineInfo.lineId);
                //     if (lineRender.lineItemRender) (lineRender.lineItemRender.skinContainer as any).mask = null;
                //     this._rendersMap[lineKey] = rs;
                // //     playRenders(rs);
                // }


                // this.timer.once(this._scroller.interval, this, this.onPlayStepEffect, [playInfos]);
        }

        /**
         * 转换成线格子渲染器数据
         * @param renders 格子列表 
         * @param line 线结果
         */
        public converToRenderInfo(renders: JTItemRender[], line: RollingResult, unRewardRenders: JTItemRender[] = []): JTLineInfo {
                let lineInfo: JTLineInfo = new JTLineInfo();
                lineInfo.line = line;
                lineInfo.renders = renders;
                lineInfo.unRewardRenders = unRewardRenders;
                return lineInfo
        }

        /**
         * 播放渲染器列表
         * @param lineInfo 线数据
         */
        public playItemRenders(lineInfo: JTLineInfo, isUpdateChilds: boolean = true): void {
                let rs: JTItemRender[] = lineInfo.renders;
                let interval = this._scroller.playRenderInterval;
                let urs = lineInfo.unRewardRenders;
                for (let j: number = 0; j < rs.length; j++) {
                        let r: JTDefaultItemRender = rs[j] as JTDefaultItemRender;
                        cc.tween(this).delay(interval * j / 1000).call(() => {
                                r.play(lineInfo.line, j, null);
                        }).start();
                }
                // let l = rs.length+1;
                // for (let i: number = 0; i < urs.length; i++) {
                //         let r: JTDefaultItemRender = urs[i] as JTDefaultItemRender;
                //         cc.tween(this).delay(interval*(i+l)/1000).call(()=>{
                //                 r.playLineCall(lineInfo.line,null);
                //         }).start();
                // }
                isUpdateChilds && this._scroller.updateChangedChildsLayer(rs, false);
                this.showBlackBackGround(rs.length > 0);
        }

        /**
         * 通过数值显示多少个线数字按钮
         * @param lineCount 个数，数值类型 
         */
        public showLineButtonGroup(lineCount: number): void {
                for (var i: number = 0; i < this._lineMap.keys.length; i++) {
                        let lineId: number = i + 1;
                        var lineRender: JTLineRender = this._lineMap.get(lineId) as JTLineRender;
                        if (i > lineCount - 1) {
                                this.showLineButton(lineId, false)
                                continue;
                        }
                        this.showLineButton(lineId, true)
                }
        }

        /**
         * 显示某个数字按钮
         * @param lineId 对应的数字ID跟线ID是一样的
         * @param isVisible 是否显示
         */
        public showLineButton(lineId: number, isVisible: boolean): void {
                let lineRender: JTLineRender = this._lineMap.get(lineId);
                if (!lineRender || !lineRender.lineButtonRender) {
                        return;
                }
                let linebutton: JTSkinnableLineButtonRender = lineRender.lineButtonRender as JTSkinnableLineButtonRender;
                // let buttons: any[] = linebutton.buttons;
                // for (let i: number = 0; i < buttons.length; i++) {
                //         let btn_number: any = buttons[i];
                //         btn_number.c1.selectedIndex = isVisible ? 1 : 0;
                // }

                //线id号
                let imgNode: any[] = linebutton.imgNodes;
                for (let i: number = 0; i < imgNode.length; i++) {
                        let img_number: cc.Node = imgNode[i];
                        img_number.active = isVisible;
                        img_number.children[0].active = true;//显示静止状态
                        img_number.children[1].active = false;
                }
        }

        /** 中奖线显示 线id 按钮的状态 */
        public showWinLineButtonGroup(lineCount: number): void {
                for (var i: number = 0; i < this._lineMap.keys.length; i++) {
                        let lineId: number = i + 1;
                        var lineRender: JTLineRender = this._lineMap.get(lineId) as JTLineRender;
                        if (i > lineCount - 1) {
                                this.showWinLineButton(lineId, false)
                                continue;
                        }
                        this.showWinLineButton(lineId, true);
                }
        }
        /** 中奖线显示 线id 按钮的状态 */
        public showWinLineButton(lineId: number, isVisible: boolean): void {
                let lineRender: JTLineRender = this._lineMap.get(lineId);
                if (!lineRender || !lineRender.lineButtonRender) {
                        return;
                }
                let linebutton: JTSkinnableLineButtonRender = lineRender.lineButtonRender as JTSkinnableLineButtonRender;

                //线id号
                let imgNode: any[] = linebutton.imgNodes;
                for (let i: number = 0; i < imgNode.length; i++) {
                        let img_number: cc.Node = imgNode[i];
                        img_number.children[0].active = !isVisible;
                        img_number.children[1].active = isVisible;//显示中奖状态
                }
        }

        private onPlayStepEffect(playInfos: Object): void {
                // this.timer.clearAll(this);
                // let lineIndex:number = 0;
                // this._scroller.enableds();
                // var lines:RollingResult[] = this._linesResult;
                // showWinLine.apply(this, [null]);
                // this.timer.loop(this._scroller.interval, this, showWinLine);
                // function showWinLine():void
                // {
                //         this.showLines(0);//移除上次显示的中奖线
                //         if (lineIndex >= lines.length)
                //         {
                //                 lineIndex = 0;
                //                 if (this.lineComplete) 
                //                 {
                //                         this.lineComplete.apply(this.caller, [this]);
                //                         this.lineComplete = null;        
                //                         if(this.ifStopWhenComplete)
                //                         {
                //                                 this.clear();
                //                                 return;
                //                         }                                
                //                 }
                //         }
                //         this._scroller.resetLayoutScrollerLayer();
                //         var lineInfo:RollingResult = lines[lineIndex];
                //         let lineKey:string = lineInfo.lineId + "dir" + lineInfo.direction;
                //         this.showLine(lineInfo.lineId, true)
                //         var rs:JTItemRender[] = playInfos[lineKey];
                //         let lineRender:JTILineRender = this.lineMap.get(lineInfo.lineId);
                //         if (lineRender)
                //         {
                //                 lineRender.changedSkinnable(lineInfo);
                //                 lineRender.showGrids(rs.length);
                //                 this._scroller.lineMask && this._scroller.lineMask.showAward(rs, this._scroller);
                //                 if (lineRender.lineItemRender)
                //                 {
                //                         (lineRender.lineItemRender.skinContainer as any).mask =  this._scroller.lineMask;
                //                 }
                //         }
                //         else
                //         {
                //         //	this.scatterRender.showGrids(rs);
                //         } 
                //         (this._scroller.factoryLayer as JTILayerSort).updateLayer(this._scroller);
                //         (this._scroller.factoryChild as JTIChildFactory).changedLine(lineRender);
                //         this._scroller.enableds();
                //         for (var i:number = 0; i < rs.length; i++)
                //         {
                //                 let r:JTItemRender = rs[i];
                //                 let rr:JTDefaultItemRender = r as JTDefaultItemRender;
                //                 rr.play(lineInfo, i, null);
                //                 if (i == rs.length - 1 && !this.isGrids && !this.isMask)
                //                 {
                //                               //  this._scroller.layoutLineWithScrollerLayer();

                //                 }
                //         }
                //         if (lineInfo.lineType === LineType.Line)
                //         {
                //                 let renders:JTItemRender[] = JTOddsUtils.getOddsLineRenders(this._scroller, lineInfo.lineId);
                //                 let r:any = renders[2];
                //                 r.playRewardsAnimation(lineInfo, 2, r.index, Common.SlotMachineView.instance);
                //         }
                //         else
                //         {
                //                         let s:JTIScroller = this._scroller.getItem(2) as JTIScroller;
                //                         let r:any = s.renders[2];
                //                         r.playRewardsAnimation(lineInfo, 0, r.index, Common.SlotMachineView.instance);

                //         }
                //         lineIndex += 1;
                // }
        }

        /**
         * 显示线
         * @param lineId 线ID
         * @param isVisible 是否隐藏
         */
        public showLine(lineId: number, isVisible: boolean, singleLineComplete?: Handler, winCount?: number, direction?: number, lineInfo?: JTLineInfo, winCoinNum?: number): JTLineRender {
                let lineRender: JTLineRender = this._lineMap.get(lineId);
                // let blackBackGround = (this._scroller as JTLineScrollerGroup).blackBackGround;
                // if (blackBackGround) {
                //         blackBackGround.active = isVisible;
                // }
                if (!lineRender) return;
                let lineItemRender: JTSkinnable = lineRender.lineItemRender;
                if (lineItemRender) {
                        //  lineItemRender.mask = null;
                        isVisible ? lineItemRender.show(this._singleLineComplete, winCount > 0, winCount, direction, lineInfo, winCoinNum) : lineItemRender.hide();
                }
                let flashLineItemRender = lineRender.flashLineItemRender;
                if (flashLineItemRender) {
                        isVisible ? flashLineItemRender.show(this._singleLineComplete, winCount > 0, winCount, direction, lineInfo, winCoinNum) : flashLineItemRender.hide();
                }

                lineRender.showGrids(0);
                this._scroller.scatterRender && this._scroller.scatterRender.showGrids(0);
                return lineRender;
        }

        public showBlackBackGround(isVisible: boolean): void {
                let blackBackGround = (this._scroller as JTLineScrollerGroup).blackBackGround;
                if (blackBackGround) {
                        blackBackGround.active = isVisible;
                }
        }

        /**
         * 清除
         */
        public clear(): void {
                this.hideGrids();
                // this._timer.unschedule(this);
                this.showLines(0);
                this.showWinLineButtonGroup(0);//重置上次中奖的线号状态
                this._playLineMap = null;
                this.ifStopWhenComplete = true;
                this.isLoopWinInThisRound = true;
                this._dynamicWildId = [];
                this._scroller.lineContainer && ((this._scroller.lineContainer as JTGComponent).opacity = 255);

                cc.Tween.stopAllByTarget(this);
        }

        /**
         * 显示一条带遮罩的线和线上的格子框，不播放元素动画
         * @param lineResult 
         */
        public showLineAndGrid(lineResult: RollingResult): JTLineRender {
                let key: string = JTOddsUtils.getLineKey(lineResult);
                if (!this._playLineMap) return;
                let line: JTLineInfo = this._playLineMap.get(key);
                let lineInfo: RollingResult = line.line;
                var rs: JTItemRender[] = line.renders;
                let lineRender: JTLineRender = this.lineMap.get(lineInfo.lineId);
                this.showLine(lineInfo.lineId, true, this.singleLineComplete, rs.length, lineInfo.direction, line, lineInfo.winCoin)
                let wildTask: JTDynamicWildTask = this._scroller.getRuleTask(JTRuleTaskType.WILD_DYNAMIC_TIME_TYPE) as JTDynamicWildTask;
                let onceWild: JTOnceWildTask = this._scroller.getRuleTask(JTRuleTaskType.WILD_ONCE_TIME_TYPE) as JTOnceWildTask;
                if (lineRender)//如果有这个对像说明是连线模式
                {
                        lineRender.changedSkinnable(line);
                        lineRender.showGrid(lineInfo, rs);
                        wildTask && wildTask.changedLineGrids(lineRender);
                        onceWild && onceWild.changedLineGrids(lineRender);
                        this._scroller.lineMask && (this._scroller.lineMask as any as JTLineMask).showAward(rs, this._scroller);
                        let lineItemRender: JTSkinnable = lineRender.lineItemRender;
                        if (lineItemRender) {
                                //lineItemRender.mask = this._scroller.lineMask;
                        }
                }
                else {
                        this._scroller.scatterRender && this._scroller.scatterRender.showGrid(lineInfo, rs);
                }
                this._scroller.resetLayerSort();
                this._scroller.updateChangedChildsLayer(line.renders, true);

                (this._scroller.factoryChild as JTChildFactory).changedLine(lineRender, line);

                this.showBlackBackGround(rs.length > 0);
                return lineRender;
        }

        /**
         * 显示线带遮罩和格子框
         * @param lineResult 线结果
         */
        public showMaskWithGridLine(lineResult: RollingResult, isUpdateChilds: boolean = true, renderlineInfo?: JTLineInfo, bResetLayerSort: boolean = true, showGrids: boolean = true): JTLineRender {
                let key: string = JTOddsUtils.getLineKey(lineResult);
                if (!this._playLineMap) return;
                let line: JTLineInfo = this._playLineMap.get(key);
                let lineInfo: RollingResult = line.line;
                var rs: JTItemRender[] = line.renders;
                let urs = line.unRewardRenders;
                let lineRender: JTLineRender = this.lineMap.get(lineInfo.lineId);
                let _renderlineInfo = renderlineInfo;
                if (!_renderlineInfo) {
                        _renderlineInfo = line;
                }
                if (showGrids) {
                        this.showLine(lineInfo.lineId, true, this.singleLineComplete, rs.length, lineInfo.direction, _renderlineInfo, lineInfo.winCoin)
                } else {
                        this.showLine(lineInfo.lineId, true, this.singleLineComplete, -1, lineInfo.direction, _renderlineInfo, lineInfo.winCoin)
                }
                if (showGrids) {
                        let wildTask: JTDynamicWildTask = this._scroller.getRuleTask(JTRuleTaskType.WILD_DYNAMIC_TIME_TYPE) as JTDynamicWildTask;
                        let onceWild: JTOnceWildTask = this._scroller.getRuleTask(JTRuleTaskType.WILD_ONCE_TIME_TYPE) as JTOnceWildTask;
                        if (lineRender)//如果有这个对像说明是连线模式
                        {
                                lineRender.changedSkinnable(line);
                                lineRender.showGrid(lineInfo, rs);
                                wildTask && wildTask.changedLineGrids(lineRender);
                                onceWild && onceWild.changedLineGrids(lineRender);
                                this._scroller.lineMask && (this._scroller.lineMask as any as JTLineMask).showAward(rs, this._scroller);
                                let lineItemRender: JTSkinnable = lineRender.lineItemRender;
                                if (lineItemRender) {
                                        //lineItemRender.mask = this._scroller.lineMask;
                                }
                        }
                        else {
                                this._scroller.scatterRender && this._scroller.scatterRender.showGrid(lineInfo, rs);
                        }
                }
                if (bResetLayerSort && SlotMachineView.instance.isResetRewardAni) {
                        this._scroller.resetLayerSort();
                        this._scroller.enableds();
                }
                isUpdateChilds && this._scroller.updateChangedChildsLayer(line.renders, true);
                // if (this.showPreLineId != lineResult.lineId) {
                //         this.showPreLineId = lineResult.lineId
                // }
                (this._scroller.factoryLayer as JTLayerFactory).updateLayer(this._scroller);
                (this._scroller.factoryChild as JTChildFactory).changedLine(lineRender, line);
                let interval = this._scroller.playRenderInterval;

                for (var i: number = 0; i < rs.length; i++) {
                        let r: JTDefaultItemRender = rs[i] as JTDefaultItemRender;
                        cc.tween(this).delay(interval * i / 1000).call(() => {
                                r.play(lineInfo, i, null);
                        }).start();
                }
                let l = rs.length + 1;
                for (let i: number = 0; i < urs.length; i++) {
                        let r: JTDefaultItemRender = urs[i] as JTDefaultItemRender;
                        cc.tween(this).delay(interval * (i + l) / 1000).call(() => {
                                r.playLineCall(lineInfo, null);
                        }).start();
                }

                this.showBlackBackGround(rs.length > 0);
                return lineRender;
        }

        public isTreatFullLine(line: RollingResult): boolean {
                let col = this._scroller.config.col;
                if (line.eleNum >= col && col >= 5 && (line.lineType == JTLineType.LINE || line.lineType == JTLineType.FULL_LINE || line.lineType == JTLineType.APPOINT_LINE || line.lineType == JTLineType.LIGATURE_REPLACE)) {
                        return true;
                }
                return false;
        }

        /**
         * 隐藏所有格子框（包括特殊的格子框）
         */
        public hideGrids(): void {
                for (let i: number = 0; i < this._lineMap.keys.length; i++) {
                        let lineId: number = i + 1;
                        let lineRender: JTLineRender = this._lineMap.get(lineId) as JTLineRender;
                        lineRender.showGrids(0);
                        // if (lineRender.lineItemRender) lineRender.lineItemRender.mask = null;
                }
                this._scroller.scatterRender && this._scroller.scatterRender.showGrids(0);
        }

        /**
         * 按个数显示线数
         * @param lineCount 个数（数值类型）
         */
        public showLines(lineCount: number): void {
                for (var i: number = 0; i < this._lineMap.keys.length; i++) {
                        let lineId: number = i + 1;
                        var lineRender: JTLineRender = this._lineMap.get(lineId) as JTLineRender;
                        if (i > lineCount - 1) {
                                this.showLine(lineId, false, this.singleLineComplete);
                                continue;
                        }
                        this.showLine(lineId, true, this.singleLineComplete);
                }
                this._scroller.scatterRender && this._scroller.scatterRender.showGrids(0);

                this.showBlackBackGround(lineCount > 0);
        }

        /**
         * 自动调整滚轴线层级
         * @param container 
         * @param rs 
         */
        public adjustScrollerLineLayer(container: JTContainer, rs: JTItemRender[]): void {
                let scroller: JTLineScrollerGroup = this._scroller;
                let items: JTItemSkinLoader[] = scroller.items;
                let totalCount: number = items.length;
                let index: number = 0;
                for (let i: number = totalCount - 1; i >= 0; i--) {
                        let s: JTItemSkinLoader = items[i] as JTItemSkinLoader;
                        if ((totalCount - i) == rs.length) {
                                (container as JTGComponent).addChild(scroller.lineContainer as JTGComponent);
                                continue;
                        }
                        (container as JTGComponent).addChild(s);
                }
        }

        /**
         * 线map数组
         */
        public get lineMap(): SDictionary {
                return this._lineMap;
        }

        /**
         * 线结果列表
         */
        public get lineResults(): any[] {
                return this._linesResult;
        }

        /**
         * 线结果列表
         */
        public set lineResults(value: any[]) {
                this._linesResult = value;
        }

        /**
         * 轮播线完成函数
         */
        public get lineComplete(): Function {
                return this._lineComplete;
        }

        /**
         * 轮播线完成函数
         */
        public set lineComplete(value: Function) {
                this._lineComplete = value;
        }

        /**
         * 
         * 
         */
        public get isLoopWinInThisRound(): boolean {
                return this._isLoopWinInThisRound;
        }

        /**
         * 
         * 本轮是否轮播线
         */
        public set isLoopWinInThisRound(value: boolean) {
                this._isLoopWinInThisRound = value;
        }

        /**
 * 
 * 
 */
        public get isLoopGlobalLines(): boolean {
                return this._isLoopGlobalLines;
        }

        /**
         * 
         * 本轮是否轮播线
         */
        public set isLoopGlobalLines(value: boolean) {
                this._isLoopGlobalLines = value;
        }

        /**
         * 
         * 本轮是否轮播线
         */
        public get ifStopWhenComplete(): boolean {
                return this._ifStopWhenComplete;
        }

        /**
         * 不知道是什么东西，
         * 
         */
        public set ifStopWhenComplete(value: boolean) {
                this._ifStopWhenComplete = value;
        }

        /**
         * 是否是主动请求后的执行结果（因为一般重连或刷新进游戏，
         * 会跑一遍任务流程，如某些流程在重连会刷新金游戏无须执行根据此条件可直接完成）
         */
        public get isInitiative(): boolean {
                return this._isInitiative;
        }

        /**
         * 
         * 
         */
        public set isInitiative(value: boolean) {
                this._isInitiative = value;
        }

        /**
         * 轮播线Map数组
         */
        public get playLineMap(): SDictionary {
                return this._playLineMap;
        }

        /**
         * 轮播线Map数组
         */
        public set playLineMap(value: SDictionary) {
                this._playLineMap = value;
        }

        /**
         * 一个公共的计时器，用于logic里面的流程需要用到timer,便于管理
         */
        public get timer(): number {
                return this._timer;
        }

        /**
         * 一个公共的计时器，用于logic里面的流程需要用到timer,便于管理
         */
        public set timer(value) {
                this._timer = value;
        }

        public set dynamicWildId(v: number[]) {
                this._dynamicWildId = v;
        }

        public get dynamicWildId(): number[] {
                return this._dynamicWildId;
        }

        /**
         * 特殊bounds ID
         */
        public get boundsId(): number {
                if (this._boundsId == 0) {
                        this._boundsId = this.getIdByType2(JTElementIdType.TYPE_BOUNDS);
                }
                return this._boundsId;
        }

        /**
         * 特殊分散ID
         */
        public get scatterId(): number {
                if (this._scatterId == 0) {
                        this._scatterId = this.getIdByType2(JTElementIdType.TYPE_SCATTER);
                }
                return this._scatterId;
        }

        /**
         * 特殊百搭ID
         */
        public get wildId(): number[] {
                if (this._wildId.length == 0) {
                        this._wildId = this.getIdByType(JTElementIdType.TYPE_WILD);
                }
                return this._wildId;
        }

        /**
         * 添加百搭元素id
         */
        public pushWildIds(ids: number[]) {
                for (let i = 0; i < ids.length; i++) {
                        if (ids[i] <= 0) continue;
                        this._wildId.indexOf(ids[i]) < 0 && this._wildId.push(ids[i]);
                }
        }

        /**
         * 删除百搭元素id
         */
        public delWildIds(ids: number[]) {
                for (let i = 0; i < ids.length; i++) {
                        if (ids[i] <= 0) continue;
                        let index: number = this._wildId.indexOf(ids[i])
                        if (index > -1) {
                                this._wildId.splice(index, 1);
                        }
                }
        }

        /**
         * 检查是否非特殊Id
         * @param id 特殊ID 
         */
        public isSpecialId(id: number): boolean {

                if (this.wildId.indexOf(id) >= 0 || this.scatterId != 0 || this.boundsId != 0) {
                        return false;
                }
                return true;
        }

        /**
         * 通过特殊类型Type 获取 id
         * @param type 特殊类型ID Type
         */
        public getIdByType(type: number): number[] {
                let dataElement: any = SlotConfigManager.instance.DataElement;
                let ids: any[] = dataElement.getIds();
                let wildIds: number[] = [];
                for (let i: number = 0; i < ids.length; i++) {
                        let id: number = ids[i];
                        let idConfig: any = dataElement.getData(id);
                        if (idConfig.type != type) continue;
                        // return id;
                        wildIds.push(Number(id));
                }
                return wildIds;
        }

        public getIdByType2(type: number): number {
                let dataElement: any = SlotConfigManager.instance.DataElement;
                let ids: any[] = dataElement.getIds();
                for (let i: number = 0; i < ids.length; i++) {
                        let id: number = ids[i];
                        let idConfig: any = dataElement.getData(id);
                        if (idConfig.type != type) continue;
                        return Number(id);
                }
                return 0;
        }

        /**
         * 渲染器工具
         */
        public get renderUtils(): JTLineRenderUtils {
                return this._renderUtils;
        }

        /**
         * 渲染器工具
         */
        public set renderUtils(value: JTLineRenderUtils) {
                this._renderUtils = value;
        }
        public get singleLineComplete(): Handler {
                return this._singleLineComplete;
        }

        public set singleLineComplete(value: Handler) {
                this._singleLineComplete = value;
        }
}

export class JTLineInfo {
        /**
         * 中奖线数据
         */
        public line: RollingResult = null;
        /**
         * 中奖元素
         */
        public renders: JTItemRender[] = null;
        /**
         * 同一条线上的非中奖元素
         */
        public unRewardRenders: JTItemRender[] = null;
}