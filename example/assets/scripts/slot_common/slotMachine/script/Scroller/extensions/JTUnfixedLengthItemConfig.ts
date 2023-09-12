import { SlotOrientation } from "../../SlotDefinitions/SlotEnum";

export default class JTUnfixedLengthItemConfig {

    /**
     * 元素占列数
     */
    public column:number = 1;

    /**
     * 元素占行数
     */
     public row:number = 1;

    /**
     * 源ID
     */
     public sourceId:number;

     /**
     * 用于显示的映射ID
     */
     public mapId:number;
     
}

/**
 * 扩展列属性信息
 */
 export class JTExpandScrollerInfo{
    /**
     * 索引
     */
    index:number;
    /**
     * 行数
     */
    row:number;
    /**
     * 方向
     */
   direction:SlotOrientation;
   /**
    * 弧形中心角
    */
   curveDegree:number;
   /**
    * 位置
    */
   position:cc.Vec2;

   /**
    * 遮罩节点类型 目前JTLayerFactory.EXTEND_SCROLLER_MASK_CONTAINER_ONE及
    *  JTLayerFactory.EXTEND_SCROLLER_MASK_CONTAINER_TWO
    */
   maskContainerType:number;

   gap:number;
}
