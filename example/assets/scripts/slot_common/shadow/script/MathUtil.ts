/**
 * 数学辅助类
 * @author zengyong
 */
export default class MathUtil {
    /**
     * 获得两点的距离
     * @param v1 
     * @param v2 
     */
    public static getDistance(v1: cc.Vec2, v2: cc.Vec2): number {
        return cc.v2(v2.x - v1.x, v2.y - v1.y).mag();
    }

    /**
     * 返回整数的点
     * @param v 
     */
    static convertVec2Int(v: cc.Vec2): cc.Vec2 {
        return cc.v2(Math.round(v.x), Math.round(v.y));
    }

    /**
     * 返回整数的点
     * @param x 
     * @param y 
     */
    static getIntVec2(x: number, y: number): cc.Vec2 {
        return cc.v2(Math.round(x), Math.round(y));
    }

    /**
     * 返回随机范围内的数
     * @param min 最小数
     * @param max 最大数
     * @param isInteger 是否整数
     */
    static getRandomRange(min: number, max: number, isInteger: boolean = false): number {
        var n: number = min + Math.random() * (max - min);
        if (isInteger)
            n = Math.round(n);
        return n;
    }
}