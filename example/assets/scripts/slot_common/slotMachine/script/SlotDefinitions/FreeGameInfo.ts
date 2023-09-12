import SpinManager from "../SlotManager/SpinManager";
import { OperationState } from "./SlotEnum";
import SlotUtils from '../SlotUtils/SlotUtils';

/**
 * 免费游戏信息
 */
export default class FreeGameInfo {
    constructor(type: OperationState, raw: protoSlot.stateCommonType) {
        this.type = type;
        this.update(raw);
    }

    /**
     * 
     * @param updateList 原始数据(nextState) 或 一个更新列表
     */
    public update(raw: protoSlot.stateCommonType): boolean {
        this._updateByNextState(raw);
        return true;
    }

    public updateList(list: protoSlot.stateUpdateType[]): boolean {
        return this._updateByUpdateList(list);
    }

    public updateCommonInfo(normalData: protoSlot.normalStateType) {
        if (!normalData) return;
        // this.commonJpCoin = (normalData.spinInfo.spinResult.jpCoin as Long).toNumber();
        // this.commonSpinCoin = (normalData.spinInfo.spinResult.spinCoin as Long).toNumber();
        this.commonSpinCoin = (normalData.triggerFreeSpinCoin as Long).toNumber();

    }

    public clone(): FreeGameInfo {
        let commonType: protoSlot.stateCommonType = <protoSlot.stateCommonType>{};
        commonType.id = this.id;
        commonType.times = this.times;
        commonType.sumTimes = this.sumTimes;
        commonType.ratio = this.ratio;
        commonType.wild = this.wild;
        commonType.scatter = this.scatter;
        commonType.elemFixPos = this.elemFixPos;
        commonType.sumSpinCoin = this.sumSpinCoin;
        commonType.sumLgCoin = this.sumLgCoin;
        commonType.eachSumSpinCoin = this.eachSumSpinCoin;
        commonType.isAuthoritiesRate = this.isAuthoritiesRate;
        commonType.type = this.type;
        commonType.elemExpand = this.elemExpand;
        commonType.gameId = this.gameID;
        commonType.lgHistory = this.lgHistory;
        commonType.handleState = this.handleState;
        commonType.wildNum = this.wildNum;
        commonType.winStreakNum = this.winStreakNum;
        commonType.random = this.random;
        commonType.randomElemPos = this.randomElemPos;
        commonType.accFixGridList = this.accFixGridList;
        return new FreeGameInfo(this.type, commonType);
    }
    
    private _updateByNextState(raw: protoSlot.stateCommonType) {
        if(this.type!=raw.type||this.stateHistory.length==0){
           this.stateHistory.push(raw.type);
           console.log("_updateByNextState stateHistory push:",this.stateHistory)
        }
        this.type = raw.type;
        this.eachSumSpinCoin=(raw.eachSumSpinCoin?SlotUtils.Number(raw.eachSumSpinCoin):0);
        this.id = raw.id;
        this.times = raw.times;
        this.sumTimes = raw.sumTimes;
        this.ratio = raw.ratio;
        this.wild = raw.wild;
        this.scatter = raw.scatter;
        this.sumSpinCoin = SlotUtils.Number(raw.sumSpinCoin);
        // this.sumSpinCoin = (raw.sumSpinCoin as Long).toNumber();
        this.sumLgCoin = SlotUtils.Number(raw.sumLgCoin);// == 0 ? 0 : (raw.sumLgCoin as Long).toNumber();
        this.elemFixPos = raw.elemFixPos as protoSlot.elemFixPosType[];
        this.elemExpand = raw.elemExpand;
        this.gameID = raw.gameId||0;
        this.isAuthoritiesRate = raw.isAuthoritiesRate;
        this.lgHistory = raw.lgHistory;
        this.handleState = raw.handleState;
        this.wildNum = raw.wildNum;
        this.winStreakNum = raw.winStreakNum;
        this.random = raw.random;
        this.randomElemPos = raw.randomElemPos;
        // this.commonSpinCoin = raw.spinInfo.spinResult.spinCoin;
        // this.commonJpCoin = raw.spinInfo.spinResult.jpCoin;
        this.accFixGridList = raw.accFixGridList;
        ++this.triggeredTimes;
    }

    /**
     * 
     * @param {protocol.StateUpdateType} updateList 
     */
    private _updateByUpdateList(updateList: protoSlot.stateUpdateType[]): boolean {
        if (!updateList) return false;
        if (updateList.length <= 0) return false;

        let oldTriggeredTimes: number = this.triggeredTimes;
        for (var i: number = 0, len: number = updateList.length; i < len; ++i) {
            switch (updateList[i].type) {
                case 1:
                    this.elemFixPos = updateList[i].value.elemFix as protoSlot.elemFixPosType[];
                    break;
                case 2:
                    let updateTimes: number = updateList[i].value.times;
                    if (updateTimes >= this.times) {
                        // 如果更新后，次数增加或未变，则认为触发了新的免费游戏
                        ++this.triggeredTimes;
                        // 更新总次数
                        this.sumTimes = this.sumTimes - this.times + updateTimes + 1
                    }
                    this.times = updateList[i].value.times;
                    break;
                case 3:
                    this.ratio = updateList[i].value.ratio;
                    break;
                case 4:
                    this.wild = updateList[i].value.wild;
                    break;
                case 5:
                    this.scatter = updateList[i].value.scatter;
                    break;
                case 6:
                    this.handleState = updateList[i].value.handleState;
                    break;
                case 8:
                    this.wildNum = updateList[i].value.wildNum;
                    break;
                case 11:
                    this.random = updateList[i].value.random;
                    break;
                case 16:
                    this.isAuthoritiesRate = updateList[i].value.isAuthoritiesRate;
                default:
                    break;
            }
        }

        this.sumSpinCoin += SpinManager.instance.totalWin;
        return oldTriggeredTimes !== this.triggeredTimes;
    }

    public triggeredTimes: number = 0;

    /**
     * 类型
     */
    public type: OperationState;

    /**
     * 免费游戏重连回来单轮总赢分
     */
    public eachSumSpinCoin: number;

    /**
     * 通用状态的标识
     */
    public id: number;//通用状态的标识
    /**
     * 免费次数
     */
    public times: number;//免费次数

    /**
     * 总共中了多少免费次数的总和
     */
    public sumTimes: number;//总共中了多少免费次数的总和

    /**
     * 结果倍率
     */
    public ratio: number;//结果倍率

    /**
     * 获取的额外的百搭
     */
    public wild: number[];//获取的额外的百搭

    /**
     * 获取的额外的分散
     */
    public scatter: number[];//获取的额外的分散

    /**
     * 元素固定在的位置[{位置,元素,剩余次数}]"-1表示无限次"
     */
    public elemFixPos: protoSlot.elemFixPosType[];//元素固定在的位置[{位置,元素,剩余次数}]"-1表示无限次"

    /**
     * 扩展元素
     */
    public elemExpand: number[];

    /**
     * 在此模式中旋转spin总的赢钱,无特殊需求用加上了免费中触发小游戏的赢赏的sumCoin代替
     */
    public sumSpinCoin?: number;//在此模式中旋转spin总的赢钱

    /**
     * 在此模式中小游戏总的赢钱
     */
    public sumLgCoin?: number;//在此模式中小游戏总的赢钱

    // public commonSpinTotalCoin:number = 0; // 触发此次免费游戏的普通转的奖赏数(所有，含ＪＰ奖池等)

    /**
     * 触发此次免费游戏的普通转赢得钱
     */
    public commonSpinCoin: number = 0;

    /**
     * 触发此次免费游戏的JP奖池的奖赏
     */
    public commonJpCoin: number = 0; // 触发此次免费游戏的JP奖池的奖赏

    /**
     * 触发此次免费游戏的普通转的总奖赏
     */
    public get commonSpinTotalCoin(): number {
        return this.commonSpinCoin /*+ this.commonJpCoin*/;
    }

    /**
     * 此次免费游戏中总共赢得钱，包括了在小游戏中赢得钱
     */
    public get sumCoin(): number {
        return this.sumSpinCoin + this.sumLgCoin;
    }
    
    
    /**
     * 免费中总赢赏和触发局赢赏的和（免费+触发局）
     */
    public get sumCoinAndTrigger(): number {
        return this.sumSpinCoin + this.sumLgCoin + this.commonSpinCoin;
    }

    public gameID:number = 0;

    // public spinInfo?:SpinInfoType;

    public isAuthoritiesRate:boolean = false;

    public lgHistory: protoSlot.lgResultType[];
    
    /**
     * 免费和重转的重叠时的交替史
     */
    public stateHistory:number[] = [];

    public handleState:protoSlot.handleStateType = null;
    /**
     * 获取的额外百搭数量
     */
    public wildNum:number = 0;
    /**
     * 连赢次数
     */
    public winStreakNum:number = 0;
    /**
     * 元素随机替换位置
     */
    public random:protoSlot.elemPosListType[] = [];
    /**
     * 随机元素位置
     */
    public randomElemPos:protoSlot.randomElemPosType[] = [];
    
    /**
     * 累计固定位置
     */
    public accFixGridList:protoSlot.gridType[] = [];
}