import BaseSpinSlotView from "../../../../MainView/BaseSpinSlotView";
import SpinManager from "../../../../SlotManager/SpinManager";
import { Handler } from "../../../../SlotUtils/Handle";
import JTItemSkinLoader from "../../../com/base/JTItemSkinLoader";
import JTScroller from "../../../com/JTScroller";
import JTScrollerGroup from "../../../com/JTScrollerGroup";

/*
* name;
*/
export default class EliminateDisappearUtils {
    /**
     * 消失的时间
     */
    public static _disappearTime: number = 0.15;
    /**
     * 延迟时间
     */
    public static _disappreaDelayTime: number = 0.1;

    constructor() {

    }
 
    /**
     * 消失的时间
     */
    public static get disappearTime():number{
        return SpinManager.instance.isInTurbo?this._disappearTime*2:this._disappearTime;
    }

    public static set disappearTime(value:number){
        this._disappearTime = value;
    }

    /**
     * 延迟时间
     */
    public static get disappreaDelayTime():number{
        return SpinManager.instance.isInTurbo?this._disappreaDelayTime/2:this._disappreaDelayTime;
    }

    public static set disappreaDelayTime(value:number){
        this._disappreaDelayTime = value;
    }


    
    public static processDissppear(scrollers: JTScrollerGroup, callBack: Handler): void {
        let index: number = Math.floor(Math.random()*11);

        switch (index) {
            case 0:
                this.processMidMoveLeftRight(scrollers, callBack);
                break;
            case 1:
                this.processLeftRightMoveMid(scrollers, callBack);
                break;
            case 2:
                this.processLeftMoveRight(scrollers, callBack);
                break;
            case 3:
                this.processRightMoveLeft(scrollers, callBack);
                break;
            case 4:
                this.processTopMoveBottom(scrollers, callBack);
                break;
            case 5:
                this.processBottomMoveTop(scrollers, callBack);
                break;
            case 6:
                this.processMidMoveTopBottom(scrollers, callBack);
                break;
            case 7:
                this.processLTMoveRB(scrollers, callBack);
                break;
            case 8:
                this.processRBMoveLT(scrollers, callBack);
                break;
            case 9:
                this.processLBMoveRT(scrollers, callBack);
                break;
            case 10:
                this.processRTMoveLB(scrollers, callBack);
                break;
            default:
                this.processLeftRightMoveMid(scrollers, callBack);
                break;
        }
    }

    /**
     * 中间往两边扩散
     * @param scrollers 
     * @param callBack 
     */
    public static processMidMoveLeftRight(scrollers: JTScrollerGroup, callBack: Handler): void {
        let items: JTItemSkinLoader[] = scrollers.items
        let col: number = scrollers.config.col;
        let row: number = scrollers.config.row;
        let arry: any[] = [];
        let len: number = Math.floor(col / 2);

        for (let i: number = 0; i <= len; i++) {
            let temp: any[] = [];

            if (i == 0) {
                let s: JTScroller = items[len] as JTScroller;
                temp = temp.concat(s.renders);
            }
            else {
                let left = items[len - i] as JTScroller;
                temp = temp.concat(left.renders);
                let right = items[len + i] as JTScroller;
                temp = temp.concat(right.renders);
            }
            arry.push(temp);
        }
        this.startDisappear(arry, callBack);
    }

    /**
     * 两边往中间扩散
     * @param scrollers 
     * @param callBack 
     */
    public static processLeftRightMoveMid(scrollers: JTScrollerGroup, callBack: Handler): void {
        let items: JTItemSkinLoader[] = scrollers.items;
        let col: number = scrollers.config.col;
        let row: number = scrollers.config.row;
        let arry: any[] = [];
        let len: number = Math.floor(col / 2);

        for (let i: number = 0; i <= len; i++) {
            let temp: any[] = [];
            let oppositeIndex: number = col - i - 1;

            let s: JTScroller = items[i] as JTScroller;
            temp = temp.concat(s.renders);

            if (oppositeIndex != i) {
                s = items[oppositeIndex] as JTScroller;
                temp = temp.concat(s.renders);
            }

            arry.push(temp);
        }

        this.startDisappear(arry, callBack);

    }

    /**
     * 从左往右扩散
     * @param scrollers 
     * @param callBack 
     */
    public static processLeftMoveRight(scrollers: JTScrollerGroup, callBack: Handler): void {
        let items: JTItemSkinLoader[] = scrollers.items;
        let col: number = scrollers.config.col;
        let arry: any[] = [];

        for (let i: number = 0; i < col; i++) {
            let temp: any[] = [];
            let s: JTScroller = items[i] as JTScroller;

            temp = temp.concat(s.renders);
            arry.push(temp);
        }

        this.startDisappear(arry, callBack);

    }

    /**
     * 从右往左扩散
     * @param scrollers 
     * @param callBack 
     */
    public static processRightMoveLeft(scrollers: JTScrollerGroup, callBack: Handler): void {
        let items: JTItemSkinLoader[] = scrollers.items;
        let col: number = scrollers.config.col;
        let arry: any[] = [];

        for (let i: number = col - 1; i >= 0; i--) {
            let temp: any[] = [];
            let s: JTScroller = items[i] as JTScroller;

            temp = temp.concat(s.renders);
            arry.push(temp);
        }

        this.startDisappear(arry, callBack);
    }

    /**
     * 从上往下扩散
     * @param scrollers 
     * @param callBack 
     */
    public static processTopMoveBottom(scrollers: JTScrollerGroup, callBack: Handler): void {
        let items: JTItemSkinLoader[] = scrollers.items;
        let col: number = scrollers.config.col;
        let row: number = scrollers.config.row;
        let arry: any[] = [];

        for (let j: number = 0; j < row; j++) {
            let temp: any[] = [];

            for (let i: number = 0; i < col; i++) {
                let s: JTScroller = items[i] as JTScroller;

                temp.push(s.renders[j]);
            }

            arry.push(temp);
        }

        this.startDisappear(arry, callBack);
    }

    /**
     * 从下往上扩散
     * @param scrollers 
     * @param callBack 
     */
    public static processBottomMoveTop(scrollers: JTScrollerGroup, callBack: Handler): void {
        let items: JTItemSkinLoader[] = scrollers.items;
        let col: number = scrollers.config.col;
        let row: number = scrollers.config.row;
        let arry: any[] = [];

        for (let j: number = row - 1; j >= 0; j--) {
            let temp: any[] = [];

            for (let i: number = 0; i < col; i++) {
                let s: JTScroller = items[i] as JTScroller;

                temp.push(s.renders[j]);
            }

            arry.push(temp);
        }

        this.startDisappear(arry, callBack);
    }

    /**
     * 从中间往上下扩散
     * @param scrollers 
     * @param callBack 
     */
    public static processMidMoveTopBottom(scrollers: JTScrollerGroup, callBack: Handler): void {
        let items: JTItemSkinLoader[] = scrollers.items;
        let col: number = scrollers.config.col;
        let row: number = scrollers.config.row;
        let arry: any[] = [];
        let len: number = Math.floor(row / 2);

        for (let j: number = 0; j <= len; j++) {
            let temp: any[] = [];

            for (let i: number = 0; i < col; i++) {
                let s: JTScroller = items[i] as JTScroller;

                if (j == 0) {
                    temp.push(s.renders[len]);
                }
                else {
                    temp.push(s.renders[len - j]);
                    temp.push(s.renders[len + j]);
                }
            }

            arry.push(temp);
        }

        this.startDisappear(arry, callBack);
    }

    /**
     * 从左上角向右下角扩散
     * @param scrollers 
     * @param callBack 
     */
    public static processLTMoveRB(scrollers: JTScrollerGroup, callBack: Handler): void {
        let items: JTItemSkinLoader[] = scrollers.items;
        let col: number = scrollers.config.col;
        let row: number = scrollers.config.row;
        let arry: any[] = [];
        // 计算m行n列矩阵扫描线数：m + n - 1
        let scanLines: number = row + col - 1;

        // 遍历扫描线
        for (let line: number = 0; line < scanLines; line++) {
            let startRow: number = line < row ? line : row - 1;
            let startCol: number = line - startRow;
            let temp: any[] = [];

            // 获取扫描线上的格子
            while (startCol < col && startRow < row && startCol >= 0 && startRow >= 0) {
                let s: JTScroller = items[startCol] as JTScroller;

                temp.push(s.renders[startRow]);
                startRow--;
                startCol++;
            }

            arry.push(temp);
        }

        this.startDisappear(arry, callBack);
    }

    /**
     * 从右下角向左上角扩散
     * @param scrollers 
     * @param callBack 
     */
    public static processRBMoveLT(scrollers: JTScrollerGroup, callBack: Handler): void {
        let items: JTItemSkinLoader[] = scrollers.items;
        let col: number = scrollers.config.col;
        let row: number = scrollers.config.row;
        let arry: any[] = [];
        // 计算m行n列矩阵扫描线数：m + n - 1
        let scanLines: number = row + col - 1;

        // 遍历扫描线
        for (let line: number = scanLines - 1; line >= 0; line--) {
            let startRow: number = line < row ? line : row - 1;
            let startCol: number = line - startRow;
            let temp: any[] = [];

            // 获取扫描线上的格子
            while (startCol < col && startRow < row && startCol >= 0 && startRow >= 0) {
                let s: JTScroller = items[startCol] as JTScroller;

                temp.push(s.renders[startRow]);
                startRow--;
                startCol++;
            }

            arry.push(temp);
        }

        this.startDisappear(arry, callBack);
    }

    /**
     * 从左下角向右上角扩散
     * @param scrollers 
     * @param callBack 
     */
    public static processLBMoveRT(scrollers: JTScrollerGroup, callBack: Handler): void {
        let items: JTItemSkinLoader[] = scrollers.items;
        let col: number = scrollers.config.col;
        let row: number = scrollers.config.row;
        let arry: any[] = [];
        // 计算m行n列矩阵扫描线数：m + n - 1
        let scanLines: number = row + col - 1;

        // 遍历扫描线
        for (let line: number = 0; line < scanLines; line++) {
            let startRow: number = line < col ? row - 1 : scanLines - line - 1;
            let startCol: number = line < col ? line : col - 1;
            let temp: any[] = [];

            // 获取扫描线上的格子
            while (startCol < col && startRow < row && startCol >= 0 && startRow >= 0) {
                let s: JTScroller = items[startCol] as JTScroller;

                temp.push(s.renders[startRow]);
                startRow--;
                startCol--;
            }

            arry.push(temp);
        }

        this.startDisappear(arry, callBack);
    }

    /**
     * 从右上角向左下角扩散
     * @param scrollers 
     * @param callBack 
     */
    public static processRTMoveLB(scrollers: JTScrollerGroup, callBack: Handler): void {
        let items: JTItemSkinLoader[] = scrollers.items;
        let col: number = scrollers.config.col;
        let row: number = scrollers.config.row;
        let arry: any[] = [];
        // 计算m行n列矩阵扫描线数：m + n - 1
        let scanLines: number = row + col - 1;

        // 遍历扫描线
        for (let line: number = scanLines - 1; line >= 0; line--) {
            let startRow: number = line < col ? row - 1 : scanLines - line - 1;
            let startCol: number = line < col ? line : col - 1;
            let temp: any[] = [];

            // 获取扫描线上的格子
            while (startCol < col && startRow < row && startCol >= 0 && startRow >= 0) {
                let s: JTScroller = items[startCol] as JTScroller;

                temp.push(s.renders[startRow]);
                startRow--;
                startCol--;
            }

            arry.push(temp);
        }

        this.startDisappear(arry, callBack);
    }

    /**
     * 开始消失处理
     * @param arry 
     * @param callBack 
     */
    public static startDisappear(arry: BaseSpinSlotView[][], callBack: Handler): void {

        let len: number = arry.length;
        for (let i: number = 0; i < len; i++) {
            let temp  = arry[i];
            let tl: number = temp.length;
            for (let j: number = 0; j < tl; j++) {
                //消失的特效
                let s = temp[j];
                let index = i;
                cc.tween(s).delay(this.disappreaDelayTime * index)
                    .call(()=>{
                        s.playDisappearAnimation&&s.playDisappearAnimation(s.index);
                    })
                    .to(this.disappearTime, {scale: 0, opacity: 0})
                    .call(()=>{
                        this.disappearComplete(callBack, index, len);
                    })
                    .start();
            }
        }

    }

    public static disappearComplete(callBack: Handler, index: number, len: number): void {
        if (index == len - 1) {
            callBack.run();
        }
    }


}