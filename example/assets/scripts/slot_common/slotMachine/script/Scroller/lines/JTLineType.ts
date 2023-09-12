/*
* name;
*/
export default class JTLineType
{
    /**
     * 普通连线规则
     */
    public static LINE:number = 1;

    /**
     * 指定规则
     */
    public static APPOINT:number = 2;

    /**
     * 滚轴规则
     */
    public static SCROLLER:number = 3;

    /**
     * 非首尾连线规则
     */
    public static INCLUSIVE:number = 4;

    /**
     * 分散（特殊ID百搭、bounds、scatter）规则
     */
    public static SCATTER:number = 5;

    /**
     * 非首尾连线（连续）规则
     */
    public static INCLUSIVE_CONNTIONE:number = 9;

    /**
     * 满线规则
     */
    public static FULL_LINE:number = 14;

    /**
     * 指定连线规则
     */
    public static APPOINT_LINE:number = 18;

    /**
     * 连线替代
     */
    public static LIGATURE_REPLACE:number = 32;

    /**
     * 非连续满线
     */
    public static UN_CONNTIONE_FULL_LINE:number = 33;

    /**
     * 替代元素全局分散
     * 
     */
    public static DESPERSE_REPLACE_LINE:number = 34;
}
    