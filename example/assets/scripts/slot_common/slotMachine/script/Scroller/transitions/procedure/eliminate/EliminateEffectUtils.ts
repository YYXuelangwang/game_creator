import { CommonEventNames } from "../../../../../../../main/script/CommonConst";
import { SOUND_NAME } from "../../../../../../common/enum/CommonEnum";
import { SoundMger } from "../../../../../../sound/script/SoundMger";
import BaseSpinSlotView from "../../../../MainView/BaseSpinSlotView";
import { GameEventNames } from "../../../../SlotConfigs/GameEventNames";
import { SlotOrientation } from "../../../../SlotDefinitions/SlotEnum";
import SpinManager from "../../../../SlotManager/SpinManager";
import { Handler } from "../../../../SlotUtils/Handle";
import JTItemRender from "../../../com/base/JTItemRender";
import JTItemSkinLoader from "../../../com/base/JTItemSkinLoader";
import JTArrayCollection from "../../../com/datas/JTArrayCollection";
import JTElementArrayList from "../../../com/datas/JTElementArrayList";
import JTElementCollection from "../../../com/datas/JTElementCollection";
import JTScroller from "../../../com/JTScroller";
import JTScrollerGroup from "../../../com/JTScrollerGroup";
import JTRuleTaskType from "../../../rules/JTRuleTaskType";
import JTScatterTask from "../../../rules/JTScatterTask";
import JTUnfixedLengthPipeline from "../unfixedLength/JTUnfixedLengthPipeline";
import EliminateDisappearUtils from "./EliminateDisappearUtils";
import JTEliminatePipeline from "./JTEliminatePipeline";


export interface IEliminateResult {
    /**
     * 当前属于第几次消除，从0开始
     */
    index: number;
    /**
     * 本次消除的金币
     */
    curSpinCoin: number;
    /**
     * 消除后的总的消除金币
     */
    totalSpinCoin: number;
    /**
     * 消除前的总金币
     */
    preSumSpinCoin: number;
    /**
     * 消除后的倍率
     */
    crushRate: number;
    /**
     * 是否最后一次消除
     */
    isLast: boolean;

    /**
     * 中奖线
     */
    lineResult: protoSlot.spinResultType.lineResultType[];

    /**
     * 消除后余额
     */
    balance: number;

    /**
     * 本次消除倍率
     */
    curRate: number;



}

export default class EliminateEffectUtils {
    /**
     * 速度 秒
     */
    public static _speed: number = 1500;
    /**
     * 记录列索引
     */
    public static lineIndex: number = 0;
    /**
     * 每个格子缩放的时间
     */
    public static _scaleTime: number = 0.12;
    /**
     * 每个格子缩放的偏移基值
     */
    public static _scaleTimeGap: number = 0.08;

    /**
    * 每个格子掉落回弹时间参数，太小看不到效果
    */
    public static _boundTime: number = 0.5;
    /**
     * 消除后格子掉落时间
     */
    public static _fallTime: number = 0.8;

    /**
     * 消除后格子出现时间
    */
    public static _appearTime: number = 0.1;

    /**
     * 间隔掉落时间
    */
    public static _delayDropTime: number = 0.05;

    /**
     * 间隔掉落时间
    */
    public static _scatterDopGapTime: number = 0;

    /**
 * 间隔掉落时间
*/
    public static _scatterWaitDropTime: number = 0;


    public static initComplete: boolean = false;

    /**是否从左往右掉落*/
    private static _isLeftRightFallDown: boolean = false;

    /**
     * 消除时的回调
     * @param items 消除的元素
     * @param callBack 消除完的回调
     * @param isLastTimeElinate 是否本局的最后一次消除
     */
    public static elePlayAni: Handler;

    public static timer: any = null;

    private static _eliminateTotalWin: number = 0;

    private static _scatterWin: number = 0;


    public static get eliminateTotalWin(): number {
        return this._eliminateTotalWin;
    }

    public static get scatterWin(): number {
        return this._scatterWin;
    }


    constructor() {

    }

    public static get speed(): number {
        return SpinManager.instance.isInTurbo ? this._speed * 2 : this._speed;
    }

    public static set speed(value: number) {
        this._speed = value;
    }

    public static get scaleTime(): number {
        return SpinManager.instance.isInTurbo ? this._scaleTime / 2 : this._scaleTime;
    }

    public static set scaleTime(value: number) {
        this._scaleTime = value;
    }

    public static get scaleTimeGap(): number {
        return SpinManager.instance.isInTurbo ? this._scaleTimeGap / 2 : this._scaleTimeGap;
    }

    public static set scaleTimeGap(value: number) {
        this._scaleTimeGap = value;
    }

    public static get boundTime(): number {
        return SpinManager.instance.isInTurbo ? this._boundTime / 2 : this._boundTime;
    }

    public static set boundTime(value: number) {
        this._boundTime = value;
    }

    public static get appearTime(): number {
        return SpinManager.instance.isInTurbo ? this._appearTime / 2 : this._appearTime;
    }

    public static set appearTime(value: number) {
        this._appearTime = value;
    }

    public static get fallTime(): number {
        //return SpinManager.instance.isInTurbo ? this._fallTime / 2 : this._fallTime;
        return this._fallTime;
    }

    public static set fallTime(value: number) {
        this._fallTime = value;
    }

    public static get delayDropTime(): number {
        return SpinManager.instance.isInTurbo ? this._delayDropTime / 2 : this._delayDropTime;
    }

    public static set delayDropTime(value: number) {
        this._delayDropTime = value;
    }

    public static get scatterDopGapTime(): number {
        return SpinManager.instance.isInTurbo ? this._scatterDopGapTime / 2 : this._scatterDopGapTime;
    }

    public static set scatterDopGapTime(value: number) {
        this._scatterDopGapTime = value;
    }

    public static get scatterWaitDropTime(): number {
        return SpinManager.instance.isInTurbo ? this._scatterWaitDropTime / 2 : this._scatterWaitDropTime;
    }

    public static set scatterWaitDropTime(value: number) {
        this._scatterWaitDropTime = value;
    }

    /**是否从左往右掉落*/
    public static get isLeftRightFallDown(): boolean {
        return this._isLeftRightFallDown;
    }

    public static set isLeftRightFallDown(val: boolean) {
        this._isLeftRightFallDown = val;
    }

    /**
     * 消除玩法设置参数，单位时间为秒
     * @param speed 速度 单位 像素/秒
     * @param scaleTime 格子的缩放出现的时间
     * @param scaleTimeGap 格子之间缩放的间隔时间
     * @param boundTime 回弹时间
     * @param appearTime 消除后的出现时间
     * @param fallTime 消除后格子掉落时间
     * @param disappearTime 消失时的渐隐时间
     * @param disappreaDelayTime 格子之间消失间隔时间
     * @param delayDropTime 格子之间掉落间隔时间
     * @param scatterDopGapTime 加速后掉落的间隔时间
     * @param scatterWaitDropTime 加速后掉落等待时间
     */
    public static setup(speed: number, scaleTime: number, scaleTimeGap: number, boundTime: number, appearTime: number, fallTime: number, disappearTime: number = 0.15, disappreaDelayTime: number = 0.1, delayDropTime: number = 0.05, scatterDopGapTime: number = 0, scatterWaitDropTime = 0): void {
        this.speed = speed;
        this.scaleTime = scaleTime;
        this.scaleTimeGap = scaleTimeGap;
        this.boundTime = boundTime;
        this.appearTime = appearTime;
        this.fallTime = fallTime;
        this.delayDropTime = delayDropTime;
        this.scatterDopGapTime = scatterDopGapTime;
        this.scatterWaitDropTime = scatterWaitDropTime;
        EliminateDisappearUtils.disappearTime = disappearTime;
        EliminateDisappearUtils.disappreaDelayTime = disappreaDelayTime;
    }
    /**
     *  初始化，游戏开始效果 第一次进游戏的，时候掉落处理，跟游戏中消除掉落分开
     */
    public static startEffect(scrollers: JTScrollerGroup, callBack: Handler, time?: number): void {

        if (scrollers.isRunning == false || (scrollers.isRunning == true && SpinManager.instance.isInAuto == false)) {

        }
        this.initComplete = false;
        this.processStartEffect(scrollers, callBack, time);
    }
    /**
     * 第一次进游戏的 处理一排显示掉落
     * @param scrollers 
     * @param callBack 
     * @param time 
     */
    private static processStartEffect(scrollers: JTScrollerGroup, callBack: Handler, time?: number): void {
        this.lineIndex = scrollers.config.row - 1;
        if (time) {
            this.timer = setInterval(() => {
                this.processScrollerPerLineShow(scrollers, callBack);
            }, time) as any;
        }
        else {
            this.timer = setInterval(() => {
                this.processScrollerPerLineShow(scrollers, callBack);
            }, 800);
        }

    }
    /**
     * 第一次进游戏的,每一行掉落缩放显示
     * @param scrollers 
     * @param callBack 
     */
    private static processScrollerPerLineShow(scrollers: JTScrollerGroup, callBack: Handler): void {

        SoundMger.instance.playEffect(SOUND_NAME.Appear_Wheel, false);

        let items: JTItemSkinLoader[] = scrollers.items;
        for (let col: number = 0; col < items.length; col++) {
            let s: JTScroller = items[col] as JTScroller;
            let r: BaseSpinSlotView = s.renders[this.lineIndex] as BaseSpinSlotView;
            let offY: number = r.y;
            r.y = -scrollers.config.girdHeight / 2;
            r.scale = 0;
            r.active = true;
            r.opacity = 0;
            let index = r.index - r.index % s.config.row;
            if (col == items.length - 1 && this.lineIndex == 0) //第一行的最后一个
            {
                cc.tween(r).delay(this.scaleTimeGap * col)
                    .call(() => {
                        r.playDropAnimation && r.playDropAnimation(index);
                    })
                    .to(this.scaleTime, { scale: 1, opacity: 255 })
                    .call(() => { this.scrollerRenderItemFall(r, offY, callBack); })
                    .start();
            }
            else {
                cc.tween(r).delay(this.scaleTimeGap * col)
                    .call(() => {
                        r.playDropAnimation && r.playDropAnimation(index);
                    })
                    .to(this.scaleTime, { scale: 1, opacity: 255 })
                    .call(() => { this.scrollerRenderItemFall(r, offY, null); })
                    .start();
            }
        }
        if (this.lineIndex == 0) {
            clearInterval(this.timer);
            if (scrollers.isRunning == false) {
                this.initComplete = true;
            }
        }

        else {
            this.lineIndex--;
        }

    }
    /**
     * 第一次进游戏的,每一行掉落缩放后，掉落item
     * @param r 
     */
    private static scrollerRenderItemFall(r: BaseSpinSlotView, offy: number, callBack?: Handler): void {
        let distance: number = Math.abs(offy - r.y);
        let totalTime: number = distance / this.speed + this.boundTime;
        let gridHeight = r.height;
        cc.tween(r)//.to(time1, { y: cy }, { easing: 'cubicIn' })
            //.to(totalTime, { y: offy }, { easing: 'bounceOut' })
            .to(totalTime * 0.6, { y: offy })
            .by(totalTime * 0.2, { y: gridHeight * 0.4 })
            .by(totalTime * 0.2, { y: -gridHeight * 0.4 })
            .delay(0.1)
            .call(() => {
                this.allFallEnd(r, callBack);
            })
            .start();

    }



    /**
     * 第一次进游戏的,所有行-掉落完成结束
     * @param r y
     * @param callBack 
     */
    private static allFallEnd(r: JTItemRender, callBack?: Handler): void {

        if (callBack) {
            callBack.run();
        }

        (r as BaseSpinSlotView).onDropEnd();

    }

    /**
     * 单轮消除赢分汇总
     * @returns 
     */
    private static getTotalWin(): { eliminate, scatter } {
        let rollingResult = SpinManager.instance.rollingResult;
        if (!rollingResult) {
            return { eliminate: 0, scatter: 0 };
        }
        let resultList = SpinManager.instance.getCustomResult() as any[];
        if (resultList && resultList.length > 0) {

            let sum = 0;
            let scatter = 0;
            for (let i = 0; i < resultList.length; i++) {
                let r = resultList[i];
                if (r.removePos && r.removePos.length > 0) {
                    sum += r.spinResult.spinCoin.toNumber();
                } else {
                    scatter += r.spinResult.spinCoin.toNumber();;
                }
            }

            return { eliminate: sum, scatter: scatter };
        }
        return { eliminate: 0, scatter: 0 };
    }

    /** 每局第一次消除前的掉落完成 */
    public static resetElimate(): void {
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FORCE_UPDATE_SPIN_BUTTON, false);
        this.curEliminateResultType = null;
        this.resultIndex = 0;
        let data = this.getTotalWin();
        this._eliminateTotalWin = data.eliminate;
        this._scatterWin = data.scatter;
        //每局第一次消除前的掉落完成事件
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FIRST_DROP_END);
    }

    /**
     * 游戏中，每一列消除函数,先判断是否有中断处理
     * @param scrollers 
     * @param callBack 
     * @param isNextFallByRow 消除完的下一步是否是一行一行掉落出现
     */
    public static processEliminateEffect(scrollers: JTScrollerGroup, callBack: Handler, isNextFallByRow: boolean): void {
        let result = this.getElinateAttr();
        let items = [];
        let config = scrollers.config;
        let eliminateEle = null;
        let throughGrid = [];
        let isMiddleTask = false;
        let eliminateResult;
        let isLastTimeElinate = false;
        if (result) {
            eliminateEle = result.eliminateEle;
            throughGrid = result.throughGrid;
            isMiddleTask = result.isMiddleTask;
            eliminateResult = result.eliminateResult;
            isLastTimeElinate = eliminateResult.isLast;

        }
        if (eliminateEle && eliminateEle.length > 0) {
            let len: number = eliminateEle.length;
            for (let i: number = 0; i < len; i++) {
                let index = eliminateEle[i];
                let col: number = Math.floor(index / config.row);
                let scroller = scrollers.items[col] as JTScroller;
                let row = index % config.row;
                let item = scroller.renders[row] as BaseSpinSlotView;
                items.push(item);
            }

            if (this.elePlayAni) {
                this.elePlayAni.runWith([items, Handler.create(this, this.eliminateEffectRow, [eliminateEle, throughGrid, scrollers, callBack, isNextFallByRow]), isLastTimeElinate, eliminateResult]);
            } else {
                this.eliminateEffectRow(eliminateEle, throughGrid, scrollers, callBack, isNextFallByRow);
            }
        } else if (isMiddleTask) {
            cc.tween(this).delay(0.2).call(() => {
                if (this.elePlayAni) {
                    this.elePlayAni.runWith([items, Handler.create(this, this.processEliminateEffect, [scrollers, callBack, isNextFallByRow]), isLastTimeElinate, eliminateResult]);
                } else {
                    this.processEliminateEffect(scrollers, callBack, isNextFallByRow);
                }
            }).start();
        } else {
            callBack.run();
        }
    }

    /**
     * 消除有很多阶段，记录当前阶段
     */
    private static curEliminateResultType: any;

    private static resultIndex: number = 0;
    /**
     * 获取需要消除的元素
     */
    private static getElinateAttr(): { eliminateEle: number[], throughGrid: number[], eliminateResult: IEliminateResult, isMiddleTask: boolean } {
        let rollingResult = SpinManager.instance.rollingResult;
        if (!rollingResult) {
            return null;
        }
        let stateUpdateType = rollingResult.updateList[0];
        let resultList = SpinManager.instance.getCustomResult() as any[];
        let isLastTimeElinate = true;
        if (stateUpdateType && resultList && resultList.length > 0) {

            let sum = 0;
            for (let i = 0; i < resultList.length; i++) {
                let r = resultList[i];
                if (i > this.resultIndex) {
                    break;
                }
                sum += r.spinResult.spinCoin.toNumber();
            }

            this.curEliminateResultType = resultList[this.resultIndex];
            this.resultIndex++;
            let nextEliminateResultType = resultList[this.resultIndex];
            let throughGrid = [];
            if (this.curEliminateResultType && this.curEliminateResultType.removePos) {
                for (let i: number = 0; i < this.curEliminateResultType.removePos.length; i++) {
                    this.curEliminateResultType.removePos[i] -= 1;
                    //removePos[i] = this.curEliminateResultType.removePos[i] - 1;
                    //发现数据中存在负数导致报错
                    if (this.curEliminateResultType.removePos[i] < 0) {
                        return null;
                    }

                }

                let result = <IEliminateResult>{};
                result.totalSpinCoin = sum;
                result.index = this.resultIndex - 1;
                result.curSpinCoin = this.curEliminateResultType.spinResult.spinCoin.toNumber();
                result.preSumSpinCoin = sum - result.curSpinCoin;
                result.crushRate = this.curEliminateResultType.crushRate;
                result.lineResult = this.curEliminateResultType.spinResult.lineResult;
                result.balance = this.curEliminateResultType.balance.toNumber();
                result.curRate = this.curEliminateResultType.rate;

                if (nextEliminateResultType && nextEliminateResultType.removePos && nextEliminateResultType.removePos.length > 0) {
                    isLastTimeElinate = false;
                }
                result.isLast = isLastTimeElinate;

                if (this.curEliminateResultType.throughGrid.length > 0) {
                    for (let i: number = 0; i < this.curEliminateResultType.throughGrid.length; i++) {
                        throughGrid[i] = this.curEliminateResultType.throughGrid[i].pos - 1;
                    }
                }

                let isMiddleTask = this.curEliminateResultType.removePos.length == 0 && result.index < resultList.length - 1;

                return { eliminateEle: this.curEliminateResultType.removePos, throughGrid: throughGrid, eliminateResult: result, isMiddleTask: isMiddleTask };
            }
            else {
                return null;
            }

        }
        else {
            return null;
        }

    }


    /**
     * 游戏中，每一列消除函数
     */
    public static eliminateEffectRow(eliminateEle: number[], throughGrid: number[], scrollers: JTScrollerGroup, callBack: Handler, isNextFallByRow: boolean): void {
        let scroller: JTScroller;
        let ellimateDatasDict: any = {};
        let throughDataDict: any = {};
        let len: number;
        if (eliminateEle == null) {
            callBack.run();
            return;
        }
        len = eliminateEle.length;

        for (let index: number = 0; index < scrollers.items.length; index++) {
            scroller = scrollers.items[index] as JTScroller;
            let ellimateDatas = [];
            let throughData = [];
            this.setEllimateDatas(scroller, ellimateDatas, 1);
            this.setEllimateDatas(scroller, throughData, 0);

            for (let i: number = 0; i < len; i++) {
                let col = Math.floor(eliminateEle[i] / scrollers.config.row);
                let row = eliminateEle[i] % scrollers.config.row;
                if (col == scroller.index) {
                    let item: BaseSpinSlotView = scroller.renders[row] as BaseSpinSlotView;
                    this.startEliminateEffectRow(item);
                    ellimateDatas[row] = 0;
                }
            }
            for (let i: number = 0; i < throughGrid.length; i++) {
                let col = Math.floor(throughGrid[i] / scrollers.config.row);
                let row = throughGrid[i] % scrollers.config.row;
                if (col == scroller.index) {
                    throughData[row] = 1;
                }
            }
            throughDataDict[index] = throughData;
            ellimateDatasDict[index] = ellimateDatas;
        }
        let fallTime = this.fallTime + 0.5;
        if (fallTime < EliminateDisappearUtils.disappearTime) {
            fallTime = EliminateDisappearUtils.disappearTime + 0.2;
        }

        cc.tween(this).delay(fallTime).call(() => {
            if (isNextFallByRow) {
                this.eliminateEffectRowComplete(scrollers, ellimateDatasDict, throughDataDict, callBack);
            } else {
                this.eliminateEffectFall(scrollers, ellimateDatasDict, throughDataDict, callBack);
            }
        }).start();
    }
    /**
     * 游戏中-初始化掉落格子数据：
     * @param scroller 
     * @param ellimateDatas 
     */
    private static setEllimateDatas(scroller: JTScroller, ellimateDatas: any[], defaultData: number = 1): void {
        let len: number = scroller.renders.length;
        for (let i: number = 0; i < len; i++) {
            ellimateDatas[i] = defaultData;
        }
    }
    /**
     * 游戏中-获取掉落的索引
     * @param index 
     * @param ellimateDatas 
     */
    private static getFallIndex(index: number, ellimateDatas: any[], throughDatas: number[]): number {
        let len: number = ellimateDatas.length;
        let fallIndex: number = index;
        for (let i: number = index + 1; i < len; i++) {
            if (ellimateDatas[i] == 0) {
                fallIndex = i;
            }
            if (throughDatas[i] == 1) {
                continue;
            }
        }

        return fallIndex;
    }
    /**
     * 游戏中-消除单独item 
     * @param item 
     */
    private static startEliminateEffectRow(item: BaseSpinSlotView): void {
        //统一把缩小动画去掉，由子项目自行表现
        item.scale = 0;
        item.onEliminate();
        // cc.tween(item)
        // .call(()=>{
        //     item.onEliminate();
        // })
        // .to(EliminateDisappearUtils.disappearTime, { scale: 0 })
        // .start();
    }
    /**
     * 游戏中-消除后-开始每一行的掉落处理
     * @param scrollers 
     * @param ellimateDatas 
     * @param callBack 
     */
    private static eliminateEffectRowComplete(scrollers: JTScrollerGroup, elimateDatasDict: any, throughDataDict: any, callBack: Handler): void {
        SoundMger.instance.playEffect(SOUND_NAME.Appear_Wheel, false);

        let len: number;
        let scroller: JTScroller;
        for (let col: number = 0; col < scrollers.items.length; col++) {
            scroller = scrollers.items[col] as JTScroller;
            let elimateDatas = elimateDatasDict[col];
            let throughData = throughDataDict[col];
            len = scroller.renders.length;
            for (let row: number = 0; row < len; row++) {
                if (elimateDatas[row] != 0 && throughData[row] == 0) {
                    let fallIndex = this.getFallIndex(row, elimateDatas, throughData);
                    if (fallIndex != 0) {
                        let item: BaseSpinSlotView = scroller.renders[row] as BaseSpinSlotView;
                        let tagetIndex = row + fallIndex;

                        let tagetItem: any = scroller.renders[tagetIndex];

                        this.processElimateFall(item, item.y, tagetItem.y);
                        elimateDatas[row] = 0;
                        elimateDatas[tagetIndex] = 1;
                        //修改层级和滚轴的数据顺序
                        scroller.renders[tagetIndex] = item;
                        scroller.items[tagetIndex + 1] = item;

                        let j: number = item.index;
                        item.index = tagetItem.index;
                        scroller.renders[row] = tagetItem;
                        scroller.items[row + 1] = tagetItem;
                        tagetItem.index = j;
                        tagetItem.y = item.y;

                    }
                }
            }
            //修改数据

            scroller.sortItemszIndex();
        }

        cc.tween(this).delay(this.appearTime).call(() => {
            this.nextLineStep(scrollers, elimateDatasDict, callBack);
        }).start();
    }
    /**
     * 游戏中，消除后，后续每行格子掉落
     * @param target 
     * @param sy 
     * @param dy 
     */
    private static processElimateFall(target: BaseSpinSlotView, sy: number, dy: number, delay: number = 0, callBack?: Handler): number {
        let distance: number = Math.abs(dy - sy);

        let totalTime: number = distance / this.speed + this.boundTime;
        let scrollerGroup = target.owner.owner as JTScrollerGroup;
        let gridHeight = scrollerGroup.config.girdHeight;

        if (scrollerGroup.isIncline) {
            let pipeline = (target.owner as JTScroller).pipeline as JTEliminatePipeline;
            let p = pipeline.getItemInclineProperty(dy);
            let dx = target.width / 2 + p.offsetX;
            cc.tween(target)
                .delay(delay)
                .to(totalTime * 0.6, { y: dy, x: dx, skewX: p.skewX })
                .by(totalTime * 0.2, { y: gridHeight * 0.3 })
                .by(totalTime * 0.2, { y: -gridHeight * 0.3 })
                .call(() => {
                    (target as BaseSpinSlotView).onDropEnd();
                    if (callBack)
                        callBack.run();
                }).start();
        } else {
            cc.tween(target)
                .delay(delay)
                .to(totalTime * 0.6, { y: dy })
                .by(totalTime * 0.2, { y: gridHeight * 0.3 })
                .by(totalTime * 0.2, { y: -gridHeight * 0.3 })
                .call(() => {
                    (target as BaseSpinSlotView).onDropEnd();
                    if (callBack)
                        callBack.run();
                }).start();
        }

        return totalTime + delay;

    }
    /**
     * 游戏中-下一阶段消除处理
     * @param scrollers 
     * @param elimateDatasDict 
     * @param index 
     */
    private static nextLineStep(scrollers: JTScrollerGroup, elimateDatasDict: any, callBack: Handler): void {
        this.fallRowIndex = scrollers.config.row - 1;
        let newData: any[] = (scrollers.dataProvider as JTArrayCollection).converToList(this.curEliminateResultType.spinResult.gridChanged);
        this.nextElimateStep(scrollers, elimateDatasDict, newData, callBack);
    }
    /**
     * 游戏中-当前阶段，每一行的显示掉落消除处理
     */
    private static nextElimateStep(scrollers: JTScrollerGroup, elimateDatasDict: any, newDataDict: any, callBack: Handler): void {

        let elimateDatas: any[];//=elimateDatasDict[index]
        let count: number = 0;
        for (let i: number = 0; i < scrollers.items.length; i++) {

            elimateDatas = elimateDatasDict[i];
            if (elimateDatas[this.fallRowIndex] == 0) {
                count++;
            }
        }
        this.fallEndIndex = 0;
        if (count > 0) {
            SoundMger.instance.playEffect(SOUND_NAME.Appear_Wheel, false);
            for (let index: number = 0; index < scrollers.items.length; index++) {
                this.nextElimateStepRow(scrollers, elimateDatasDict, newDataDict, index, count, callBack);
            }
        }
        else {
            this.nextElimateStepRowComplete(scrollers, elimateDatasDict, newDataDict, callBack);
        }

    }
    /**
     * 游戏中-每一行的消除后，新元素显示-掉落处理
     * @param scrollers 
     * @param elimateDatasDict 
     * @param index 
     */
    private static fallEndIndex: number = 1;
    private static fallRowIndex: number = 0;
    private static nextElimateStepRow(scrollers: JTScrollerGroup, elimateDatasDict: any, newDataDic: any, index: number, cout: number, callBack: Handler): void {
        let scroller: JTScroller = scrollers.items[index] as JTScroller;
        let elimateDatas: any[] = elimateDatasDict[scroller.index];
        let newData: any[] = newDataDic[scroller.index];

        if (elimateDatas[this.fallRowIndex] == 0) {

            let item = scroller.renders[this.fallRowIndex] as BaseSpinSlotView;
            let offy: number = item.y;
            item.y = -scrollers.config.girdHeight / 2;//scrollers.config.gapHeight;
            item.opacity = 0;
            item.scale = 0;
            item.data = newData[this.fallRowIndex];

            let index = item.index - item.index % scroller.config.row;

            item.gotoAndStop(JTItemRender.STATE_DEFAULT);


            if (this.fallEndIndex == cout - 1) //没一行的的最后一个
            {
                cc.tween(item).delay(this.scaleTimeGap * this.fallEndIndex)
                    .call(() => {
                        item.playDropAnimation && item.playDropAnimation(index);
                    })
                    .to(this.scaleTime, { scale: 1, opacity: 255 })
                    .call(() => { this.scrollerRenderItemFall(item, offy, Handler.create(this, this.nextElimateStepRowComplete, [scrollers, elimateDatasDict, newDataDic, callBack])) })
                    .start();
            }
            else {
                cc.tween(item).delay(this.scaleTimeGap * this.fallEndIndex)
                    .call(() => {
                        item.playDropAnimation && item.playDropAnimation(index);
                    })
                    .to(this.scaleTime, { scale: 1, opacity: 255 })
                    .call(() => { this.scrollerRenderItemFall(item, offy, null) })
                    .start();
            }
            this.fallEndIndex++;
        }
    }

    /**
     * 游戏中-每一行的消除后，新元素显示掉落完成后处理
     * @param scrollers 
     * @param elimateDatasDict 
     * @param newDataDic 
     * @param callBack 
     */
    private static nextElimateStepRowComplete(scrollers: JTScrollerGroup, elimateDatasDict: any, newDataDic: any, callBack: Handler): void {
        this.fallRowIndex--;
        if (this.fallRowIndex < 0) //新的消除阶段处理
        {
            EliminateEffectUtils.processEliminateEffect(scrollers, callBack, false)
        }
        else  //下一行的掉落显示
        {
            this.nextElimateStep(scrollers, elimateDatasDict, newDataDic, callBack);
        }
    }

    /**
     * 元素全部掉到滚轴下方
     * @param scrollers 
     * @param callBack 
     */
    public static beginFallAllElementToBelow(scrollers: JTScrollerGroup, callBack: Handler): void {
        let items: JTItemSkinLoader[] = scrollers.items;
        for (let col: number = 0; col < items.length; col++) {
            let s: JTScroller = items[col] as JTScroller;
            let c = s.config;
            for (let row = 0; row < s.renders.length; row++) {
                let r: BaseSpinSlotView = s.renders[row] as BaseSpinSlotView;
                let offY: number = r.y - c.girdHeight * (c.row + 0.5);
                r.active = true;
                if (col == c.col - 1 && row == c.row - 1) {
                    this.fallItemWithoutBounce(r, offY, callBack);
                } else {
                    this.fallItemWithoutBounce(r, offY, null);
                }
            }
            s.adjustSkinRenders(false);
        }
    }

    /**
 * 元素全部从滚轴上方掉到滚轴中
 * @param scrollers 
 * @param callBack 
 */
    public static beginFallAllElementFromAbove(scrollers: JTScrollerGroup, callBack: Handler): void {
        let items: JTItemSkinLoader[] = scrollers.items;
        for (let col: number = 0; col < items.length; col++) {
            let s: JTScroller = items[col] as JTScroller;
            let c = s.config;
            for (let row = s.renders.length - 1; row >= 0; row--) {
                let r: BaseSpinSlotView = s.renders[row] as BaseSpinSlotView;
                let offY: number = r.y;
                r.y = r.y + c.girdHeight * (c.row + 1);
                r.active = true;
                if (col == c.col - 1 && row == 0) {
                    let handler = Handler.create(this, () => {
                        SoundMger.instance.playEffect(SOUND_NAME.Symbol_Drop, false);
                        callBack.run();
                    })
                    this.scrollerRenderItemFall(r, offY, handler);
                } else {
                    this.scrollerRenderItemFall(r, offY, null);
                }
            }

        }
    }

    /**
     * 元素下落没有回弹效果
     * @param r 
     * @param y 
     * @param callBack 
     */
    private static fallItemWithoutBounce(r: BaseSpinSlotView, y: number, callBack: Handler): void {
        let distance: number = Math.abs(y - r.y);
        let time: number = distance / this.speed;

        cc.tween(r).to(time, { y: y }, { easing: 'quadIn' })
            .delay(0.2)
            .call(() => {
                this.allFallEnd(r, callBack);
            })
            .start();
    }

    /**
     * 游戏中-消除后-新掉落的元素填补空白
     * @param scrollers 
     * @param ellimateDatas 
     * @param callBack 
     */
    private static eliminateEffectFall(scrollers: JTScrollerGroup, elimateDatasDict: any, throughDataDict: any, callBack: Handler): void {
        let len: number;
        let scroller: JTScroller;
        let c = scrollers.config;
        let maxFallTime = this.appearTime;
        for (let col: number = 0; col < scrollers.items.length; col++) {
            scroller = scrollers.items[col] as JTScroller;
            let elimateDatas = elimateDatasDict[col];
            let throughData = throughDataDict[col];
            len = scroller.renders.length;
            let delay = (scrollers.items.length - col - 1) * this.delayDropTime;
            if (this.isLeftRightFallDown) {
                delay = col * this.delayDropTime;
            }
            for (let row: number = len - 1; row >= 0; row--) {
                if (elimateDatas[row] != 0 && throughData[row] == 0) {
                    let fallIndex = this.getFallIndex(row, elimateDatas, throughData);
                    if (fallIndex != row) {
                        let item: BaseSpinSlotView = scroller.renders[row] as BaseSpinSlotView;
                        let tagetIndex = fallIndex;

                        let tagetItem: any = scroller.renders[tagetIndex];
                        let time = this.processElimateFall(item, item.y, tagetItem.y, delay);
                        elimateDatas[row] = 0;
                        elimateDatas[tagetIndex] = 1;
                        //修改层级和滚轴的数据顺序
                        scroller.renders[tagetIndex] = item;
                        scroller.items[tagetIndex + 1] = item;
                        let j: number = item.index;
                        item.index = tagetItem.index;
                        //每单个 元素掉落时（用于加动效或音效）
                        item.onOldElemDropEnd();
                        scroller.renders[row] = tagetItem;
                        scroller.items[row + 1] = tagetItem;
                        tagetItem.index = j;
                        tagetItem.y = item.y;
                        if (time > maxFallTime) {
                            maxFallTime = time;
                        }
                    }
                }
            }
            // scroller.sortItemszIndex();
        }
        let scatter = scrollers.ruleTaskManager.getRuleTask(JTRuleTaskType.SCATTER) as JTScatterTask;
        let scatterDopGapTime = scatter && scatter.isRunning ? this.scatterDopGapTime : 0;
        let scatterWaitDropTime = scatter && scatter.isRunning ? this.scatterWaitDropTime : 0;

        let newData: any[] = (scrollers.dataProvider as JTArrayCollection).converToList(this.curEliminateResultType.spinResult.gridChanged);
        for (let col: number = 0; col < scrollers.items.length; col++) {
            scroller = scrollers.items[col] as JTScroller;
            let elimateDatas = elimateDatasDict[col];
            let throughData = throughDataDict[col];
            len = scroller.renders.length;
            let colData = newData[col];
            let dropRow = 0;
            let delay = (scrollers.items.length - col - 1) * this.delayDropTime + col * scatterDopGapTime + scatterWaitDropTime;
            if (this.isLeftRightFallDown) {
                delay = col * this.delayDropTime + col * scatterDopGapTime + scatterWaitDropTime;
            }
            for (let i = 0; i < elimateDatas.length; i++) {
                if (elimateDatas[i] == 0 || throughData[i] == 1) {
                    dropRow++;
                }
            }
            //单列落下的最大时间
            let singleColFallEndMaxTime: number = delay;
            let dropNum: number = 0;
            for (let row: number = 0; row < len; row++) {
                if (elimateDatas[row] == 0) {
                    let item: BaseSpinSlotView = scroller.renders[row] as BaseSpinSlotView;
                    item.data = colData[row];
                    let offY = item.y;
                    item.y = offY + c.gapHeight * (dropRow + 0.2);
                    item.scale = 1;
                    let time = this.processElimateFall(item, item.y, offY, delay);
                    if (time > maxFallTime) {
                        maxFallTime = time;
                    }
                    //每单个 新元素掉落时（用于加动效或音效）
                    item.onNewElemDropEnd();

                    if (time > singleColFallEndMaxTime) {
                        singleColFallEndMaxTime = time;
                    }
                    dropNum++;
                    if (dropNum == dropRow) {
                        cc.tween(this).delay(singleColFallEndMaxTime - 0.1).call(() => {
                            //每列新元素掉落结束（用于加动效或音效） 
                            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_NEW_ELEMDROP_DROPEND);
                        }).start();
                    }
                }
            }
            /** 每列 新元素掉落时（用于加动效或音效） */
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_NEW_ELEMDROP_END);
            scroller.sortItemszIndex();
        }

        cc.tween(this).delay(maxFallTime - 0.2).call(() => {
            SoundMger.instance.playEffect(SOUND_NAME.Symbol_Drop, false);
        }).start();

        cc.tween(this).delay(maxFallTime + 0.2).call(() => {
            EliminateEffectUtils.processEliminateEffect(scrollers, callBack, false);
        }).start();
    }


    /**
     * 消除类掉落到下方与从上方掉落同时并行
     * @param scrollers 
     * @param callBack 
     */
    public static beginFallToBelowThenAboveFall(scrollers: JTScrollerGroup, callBack: Handler): void {
        let items: JTItemSkinLoader[] = scrollers.items;
        for (let col: number = 0; col < items.length; col++) {
            let s: JTScroller = items[col] as JTScroller;
            let c = s.config;
            for (let row = s.renders.length - 1; row >= 0; row--) {
                let r: BaseSpinSlotView = s.renders[row] as BaseSpinSlotView;
                let y2 = r.y;
                let y1 = -(s.config.row) * s.config.gapHeight - s.config.girdHeight / 2;
                let startY = s.config.gapHeight - s.config.girdHeight / 2;
                let data = s.dataList[row + 1];
                r.active = true;
                if (col == c.col - 1 && row == 0) {
                    let handler = Handler.create(this, () => {
                        callBack.run();
                        SoundMger.instance.playEffect(SOUND_NAME.Symbol_Drop, false);

                    })
                    this.fallAndChangeThenFall(r, y1, data, 0.1, startY, y2, handler)
                } else {
                    this.fallAndChangeThenFall(r, y1, data, 0.1, startY, y2);
                }
            }

        }
    }

    /**
     * 
     * @param r 
     * @param y1 
     * @param data 
     * @param delay 
     * @param startY 
     * @param y2 
     * @param handler 
     */
    public static fallAndChangeThenFall(r: BaseSpinSlotView, y1: number, data: number, delay: number, startY: number, y2: number, handler?: Handler): void {

        let distance1: number = Math.abs(y1 - r.y);
        let time1: number = distance1 / this.speed;

        let distance2: number = Math.abs(y2 - startY);
        let time2: number = distance2 / this.speed;

        cc.tween(r).to(time1, { y: y1 })
            .delay(delay)
            .call(() => {
                r.y = startY;
                r.data = data;
            }).to(time2, { y: y2 })
            .call(() => {
                handler && handler.run();
                r.onDropEnd();
            })
            .start();

    }


    /**
     * 游戏中，每一列消除函数,先判断是否有中断处理
     * @param scrollers 
     * @param callBack 
     * @param isNextFallByRow 消除完的下一步是否是一行一行掉落出现
     */
    public static processUnfixedLengthEliminateEffect(scrollers: JTScrollerGroup, callBack: Handler, isNextFallByRow: boolean): void {
        let result = this.getElinateAttr();
        let items = [];
        let config = scrollers.config;
        let eliminateEle = null;
        let throughGrid = [];
        let isMiddleTask = false;
        let eliminateResult;
        let isLastTimeElinate = false;
        if (result) {
            eliminateEle = result.eliminateEle;
            throughGrid = result.throughGrid;
            isMiddleTask = result.isMiddleTask;
            eliminateResult = result.eliminateResult;
            isLastTimeElinate = eliminateResult.isLast;
            for (let index: number = 0; index < scrollers.items.length; index++) {
                let scroller = scrollers.items[index] as JTScroller;
                (scroller.pipeline as JTUnfixedLengthPipeline).resetRenderPoints()
            }

        }
        if (eliminateEle && eliminateEle.length > 0) {
            let len: number = eliminateEle.length;
            for (let i: number = 0; i < len; i++) {
                let index = eliminateEle[i];
                let col: number = Math.floor(index / config.row);
                let scroller = scrollers.items[col] as JTScroller;
                let row = index % config.row;
                let item = scroller.renders[row] as BaseSpinSlotView;
                items.push(item);
            }

            if (this.elePlayAni) {
                this.elePlayAni.runWith([items, Handler.create(this, this.unfixedLengthEliminateEffectRow, [eliminateEle, throughGrid, scrollers, callBack, isNextFallByRow]), isLastTimeElinate, eliminateResult]);
            } else {
                this.unfixedLengthEliminateEffectRow(eliminateEle, throughGrid, scrollers, callBack, isNextFallByRow);
            }
        } else if (isMiddleTask) {
            cc.tween(this).delay(0.2).call(() => {
                if (this.elePlayAni) {
                    this.elePlayAni.runWith([items, Handler.create(this, this.processUnfixedLengthEliminateEffect, [scrollers, callBack, isNextFallByRow]), isLastTimeElinate, eliminateResult]);
                } else {
                    this.processUnfixedLengthEliminateEffect(scrollers, callBack, isNextFallByRow);
                }
            }).start();
        } else {
            callBack.run();
        }
    }


    /**
 * 游戏中，每一列消除函数
 */
    public static unfixedLengthEliminateEffectRow(eliminateEle: number[], throughGrid: number[], scrollers: JTScrollerGroup, callBack: Handler, isNextFallByRow: boolean): void {
        let scroller: JTScroller;
        let ellimateDatasDict: any = {};
        let throughDataDict: any = {};
        let len: number;
        if (eliminateEle == null) {
            callBack.run();
            return;
        }
        len = eliminateEle.length;

        for (let index: number = 0; index < scrollers.items.length; index++) {
            scroller = scrollers.items[index] as JTScroller;
            let ellimateDatas = [];
            let throughData = [];
            this.setEllimateDatas(scroller, ellimateDatas, 1);
            this.setEllimateDatas(scroller, throughData, 0);
            for (let i: number = 0; i < len; i++) {
                let col = Math.floor(eliminateEle[i] / scrollers.config.row);
                let row = eliminateEle[i] % scrollers.config.row;
                if (col == scroller.index) {
                    let item: BaseSpinSlotView = scroller.renders[row] as BaseSpinSlotView;
                    this.startEliminateEffectRow(item);
                    ellimateDatas[row] = 0;
                }
            }
            for (let i: number = 0; i < throughGrid.length; i++) {
                let col = Math.floor(throughGrid[i] / scrollers.config.row);
                let row = throughGrid[i] % scrollers.config.row;
                if (col == scroller.index) {
                    throughData[row] = 1;
                }
            }
            throughDataDict[index] = throughData;
            ellimateDatasDict[index] = ellimateDatas;
        }
        let fallTime = this.fallTime + 0.5;
        if (fallTime < EliminateDisappearUtils.disappearTime) {
            fallTime = EliminateDisappearUtils.disappearTime + 0.2;
        }

        cc.tween(this).delay(fallTime).call(() => {
            if (isNextFallByRow) {

            } else {
                this.unfixedLengthEliminateEffectFall(scrollers, ellimateDatasDict, throughDataDict, callBack);
            }
        }).start();
    }

    /**
     * 游戏中-消除后-新掉落的元素填补空白
     * @param scrollers 
     * @param ellimateDatas 
     * @param callBack 
     */
    private static unfixedLengthEliminateEffectFall(scrollers: JTScrollerGroup, elimateDatasDict: any, throughDataDict: any, callBack: Handler): void {
        let len: number;
        let c = scrollers.config;
        let maxFallTime = this.appearTime;
        let spinResult = this.curEliminateResultType.spinResult;
        (scrollers.dataProvider as JTArrayCollection).update(spinResult.grid, spinResult.gridChanged, spinResult.realGridShape, spinResult.realGridShapeChanged, spinResult.occupyPosList, spinResult.occupyPosListChanged);
        for (let col: number = 0; col < scrollers.items.length; col++) {
            let scroller = scrollers.items[col] as JTScroller;
            let shapes = (scroller.dataProvider.changedGrids as JTElementArrayList).gridShapes;
            let elimateDatas = elimateDatasDict[col];
            let throughData = throughDataDict[col];

            if(shapes.length==elimateDatas.length){
                continue;
            }else if(shapes.length>elimateDatas.length){
                let count = shapes.length-elimateDatas.length;
                for(let i=0;i<count;i++){
                    elimateDatas.unshift(0);
                    throughData.unshift(0);
                    let j = scroller.items.findIndex((v)=>{
                        return !scroller.renders.includes(v);
                    });

                    scroller.renders.unshift(scroller.items[j]);
                }
            }else{
                // let count = elimateDatas.length - shapes.length;
                // for(let i=0;i<count;i++){
                //     elimateDatas.unshift(0);
                //     let j = scroller.items.findIndex((v)=>{
                //         return !scroller.renders.includes(v);
                //     });

                //     scroller.renders.unshift(scroller.items[j]);
                // }
            }

        }
        
        for (let col: number = 0; col < scrollers.items.length; col++) {
            let scroller = scrollers.items[col] as JTScroller;
            let p = scroller.pipeline as JTUnfixedLengthPipeline;
            let op = (scroller.dataProvider.changedGrids as JTElementArrayList).occupyPosList;
            let shapes = (scroller.dataProvider.changedGrids as JTElementArrayList).gridShapes;
            if (op.length == 0) {
                op = [];
                let len = c.row / shapes.length;
                for (let shape of shapes) {
                    op.push({ pos: shape, len: len });
                }
            }
            let elimateDatas = elimateDatasDict[col];
            let throughData = throughDataDict[col];
            len = scroller.renders.length;
            let delay = (scrollers.items.length - col - 1) * this.delayDropTime;
            if (this.isLeftRightFallDown) {
                delay = col * this.delayDropTime;
            }
            for (let row: number = len - 1; row >= 0; row--) {
                if (elimateDatas[row] != 0 && throughData[row] == 0) {
                    let fallIndex = this.getFallIndex(row, elimateDatas, throughData);
                    if (fallIndex != row) {
                        let item: BaseSpinSlotView = scroller.renders[row] as BaseSpinSlotView;
                        let tagetIndex = fallIndex;
                        let tagetItem: any = scroller.renders[tagetIndex];
                        let time = 0;
                        if (p.extendScrollerInfo && p.extendScrollerInfo.direction == SlotOrientation.Landscape) {
                            let x = this.getUnfixedLengthLandscapePosition(scroller, item, fallIndex, op);
                            time = this.processElimateLandscapePull(item, item.x, x, delay);
                            tagetItem.x = item.x;

                        } else {
                            let y = this.getUnfixedLengthFallPosition(scroller, item, fallIndex, op);
                            time = this.processElimateFall(item, item.y, y, delay);
                            tagetItem.y = item.y;
                        }

                        elimateDatas[row] = 0;
                        elimateDatas[tagetIndex] = 1;
                        //修改层级和滚轴的数据顺序
                        scroller.renders[tagetIndex] = item;
                        //scroller.items[tagetIndex + 1] = item;

                        let j: number = item.index;
                        item.index = tagetItem.index;
                        //每单个 元素掉落时（用于加动效或音效）
                        item.onOldElemDropEnd();
                        scroller.renders[row] = tagetItem;
                        //scroller.items[row + 1] = tagetItem;
                        tagetItem.index = j;
                        if (time > maxFallTime) {
                            maxFallTime = time;
                        }
                    }
                }
            }

            scroller.sortItemszIndex();
        }
        let scatter = scrollers.ruleTaskManager.getRuleTask(JTRuleTaskType.SCATTER) as JTScatterTask;
        let scatterDopGapTime = scatter && scatter.isRunning ? this.scatterDopGapTime : 0;
        let scatterWaitDropTime = scatter && scatter.isRunning ? this.scatterWaitDropTime : 0;

        for (let col: number = 0; col < scrollers.items.length; col++) {
            let scroller = scrollers.items[col] as JTScroller;
            let elimateDatas = elimateDatasDict[col];
            let throughData = throughDataDict[col];
            len = scroller.renders.length;
            let colData = (scroller.dataProvider as JTElementCollection).changedGrids.dataList
            let dropRow = 0;
            let op = (scroller.dataProvider.changedGrids as JTElementArrayList).occupyPosList;
            let shapes = (scroller.dataProvider.changedGrids as JTElementArrayList).gridShapes;
            if (op.length == 0) {
                op = [];
                let len = c.row / shapes.length;
                for (let shape of shapes) {
                    op.push({ pos: shape, len: len });
                }
            }
            let delay = (scrollers.items.length - col - 1) * this.delayDropTime + col * scatterDopGapTime + scatterWaitDropTime;
            if (this.isLeftRightFallDown) {
                delay = col * this.delayDropTime + col * scatterDopGapTime + scatterWaitDropTime;
            }
            for (let i = 0; i < elimateDatas.length; i++) {
                if (elimateDatas[i] == 0 || throughData[i] == 1) {
                    dropRow += op[i].len;
                }
            }
            //单列落下的最大时间
            let singleColFallEndMaxTime: number = delay;
            let dropNum: number = 0;
            let p = scroller.pipeline as JTUnfixedLengthPipeline;

            for (let row: number = 0; row < len; row++) {
                if (elimateDatas[row] == 0) {
                    let item: BaseSpinSlotView = scroller.renders[row] as BaseSpinSlotView;
                    let data = colData[row];
                    let l = op[row].len;
                    item.mixRow = l;
                    let u = c.getUnfixedLengthItemConfig(data, l);
                    item.realData = data;
                    if (u) {
                        item.data = u.mapId;
                    } else {
                        item.data = data;
                    }
                    item.height = c.girdHeight * l + c.gapY * (l - 1);
                    let time = 0;
                    if (p.extendScrollerInfo && p.extendScrollerInfo.direction == SlotOrientation.Landscape) {
                        let offX = this.getUnfixedLengthLandscapePosition(scroller, item, row, op);
                        item.x = offX + c.gapWidth * (dropRow) + item.width;
                        time = this.processElimateLandscapePull(item, item.x, offX, delay);
                    } else {
                        let offY = this.getUnfixedLengthFallPosition(scroller, item, row, op);
                        item.y = offY + c.gapHeight * (dropRow) + item.height;
                        time = this.processElimateFall(item, item.y, offY, delay);
                    }
                    item.active = true;
                    item.scale = 1;
                    if (time > maxFallTime) {
                        maxFallTime = time;
                    }
                    //每单个 新元素掉落时（用于加动效或音效）
                    item.onNewElemDropEnd();

                    if (time > singleColFallEndMaxTime) {
                        singleColFallEndMaxTime = time;
                    }
                    dropNum++;
                    if (dropNum == dropRow) {
                        cc.tween(this).delay(singleColFallEndMaxTime - 0.1).call(() => {
                            //每列新元素掉落结束（用于加动效或音效） 
                            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_NEW_ELEMDROP_DROPEND);
                        }).start();
                    }
                }
            }
            /** 每列 新元素掉落时（用于加动效或音效） */
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_NEW_ELEMDROP_END);
        }

        cc.tween(this).delay(maxFallTime - 0.2).call(() => {
            SoundMger.instance.playEffect(SOUND_NAME.Symbol_Drop, false);
        }).start();

        cc.tween(this).delay(maxFallTime + 0.2).call(() => {
            EliminateEffectUtils.processUnfixedLengthEliminateEffect(scrollers, callBack, false);
        }).start();
    }

    private static getUnfixedLengthFallPosition(scroller: JTScroller, render: BaseSpinSlotView, row: number, op: any[]): number {
        let l = 0;
        let c = scroller.config;
        for (let i = 0; i < row; i++) {
            l += op[i].len;
        }

        let y = -l * c.gapHeight;
        y -= render.height * 0.5;
        return y;
    }

    private static getUnfixedLengthLandscapePosition(scroller: JTScroller, render: BaseSpinSlotView, row: number, op: any[]): number {
        let l = 0;
        let c = scroller.config;
        for (let i = 0; i < row; i++) {
            l += op[i].len;
        }
        let es = (scroller.pipeline as JTUnfixedLengthPipeline).extendScrollerInfo;
        let x = (es.row - row - 1) * (c.gapWidth + es.gap) + c.girdWidth / 2;
        return x;
    }

    /**
     * 游戏中，消除后，后续每行格子掉落
     * @param target 
     * @param sy 
     * @param dy 
     */
    private static processElimateLandscapePull(target: BaseSpinSlotView, sx: number, dx: number, delay: number = 0, callBack?: Handler): number {
        let distance: number = Math.abs(dx - sx);

        let totalTime: number = distance / this.speed + this.boundTime;
        let gridHeight = target.height;
        let pipeline = (target.owner as JTScroller).pipeline as JTUnfixedLengthPipeline;

        if (pipeline.extendScrollerInfo) {
            let p = pipeline.getItemInclineProperty(dx);
            let dy = -target.height / 2 + p.offsetY;
            cc.tween(target)
                .delay(delay)
                .to(totalTime * 1, { y: dy, x: dx, angle: p.angle })
                //.by(totalTime * 0.2, { y: gridHeight * 0.5 })
                //.by(totalTime * 0.2, { y: -gridHeight * 0.5 })
                .call(() => {
                    (target as BaseSpinSlotView).onDropEnd();
                    if (callBack)
                        callBack.run();
                }).start();
        } else {
            cc.tween(target)
                .delay(delay)
                .to(totalTime * 0.6, { y: dx })
                .by(totalTime * 0.2, { y: gridHeight * 0.5 })
                .by(totalTime * 0.2, { y: -gridHeight * 0.5 })
                .call(() => {
                    (target as BaseSpinSlotView).onDropEnd();
                    if (callBack)
                        callBack.run();
                }).start();
        }
        return totalTime + delay;
    }

}