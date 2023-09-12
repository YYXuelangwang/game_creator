import { LineType } from "./LineType";

/**
 * 旋转结果
 */
export default class RollingResult{
    /**
     * 线的类型
     */
    lineType:LineType;

    /**
     * 线模式
     */
    lineMode:number;

    /**
     * 线ID，如果是全局分散等，则为0
     */
    lineId:number;

    /**
     * 中奖主元素ID
     */
    eleId:number;

    /**
     * 中了多少个元素
     */
    eleNum:number;

    /**
     * 赢取的金币
     */
    winCoin:number;

    /**
     * 方向
     */
    direction:number;

    /**
     * 赢的倍率(暂时无用)
     */
    // winRate:number;

    /**
     * 小游戏列表
     */
    bonusGameIds:Long[];
    
    /**
     * 中奖位置,服务器传过来的位置
     */
    winPos:number[];

    /**
     * 中奖的元素列表,指定类型判断需包含主元素和副元素
     */
    eleList:number[];
}