import JTFactory from "./JTFactory";
import JTLineScroller from "../../extensions/JTLineScroller";
import JTSkinnableGridRender from "../../lines/skinnables/JTSkinnableGridRender";
import JTItemRender from "../base/JTItemRender";
import JTOddsUtils from "../../JTOddsUtils";
import JTLogger from "../../JTLogger";
import { JTLineInfo } from "../../lines/JTScrollerLineParser";
import RollingResult from "../../../SlotData/RollingResult";
import SlotUtils from "../../../SlotUtils/SlotUtils";
import BaseSpinSlotView from "../../../MainView/BaseSpinSlotView";
import JTSkinnableRuntimeLineRender from "../../lines/skinnables/JTSkinnableRuntimeLineRender";
import JTContainer from "../base/JTContainer";
import JTLineScrollerGroup from "../../extensions/JTLineScrollerGroup";
import JTLineRender from "../../lines/JTLineRender";

/*
* name;子级工厂
*/
export default class JTChildFactory extends JTFactory {
    /**
     * 线类型
     */
    public static LINE_TYPE: number = 1;

    /**
     * 框类型
     */
    public static GIRD_TYPE: number = 2;

    /**
     * 线按钮类型
     */
    public static LINE_BUTTON_TYPE: number = 3;

    /**
     * 滚轴类型
     */
    public static SCROLLER_TYPE: number = 4;

    /**
     * 渲染器类型
     */
    public static ITEMRENDER_TYPE: number = 5;

    /**
     * 分散格子类型<是依赖框类型而产成的，在---预先模式下------------使用此框必须先使用框类型>
     */
    public static SCATTER_GRID_TYPE: number = 6;
    /**
    * 分散格子类型<是依赖框类型而产成的，在---预先模式下------------使用此框必须先使用框类型>
    */
    public static SCATTER_TYPE: number = 7;


    public static EXTENSIONS_SCROLLER_TYPE: number = 8;

    /**
     * 线类型
     */
    public static FLASH_LINE_TYPE: number = 9;



    constructor() {
        super();
    }

    public produce(type: number, owner?: JTContainer): JTContainer {
        let product: JTContainer = super.produce(type) as JTContainer;
        if (product && owner) product.bind(owner, owner.caller);
        return product;
    }

    protected registerClassAlias(): JTFactory {
        // this.registerClass(JTFactoryChild.LINE_TYPE, JTSkinnableScaleLineRender);
        this.registerClass(JTChildFactory.SCROLLER_TYPE, JTLineScroller);
        // this.registerClass(JTChildManager.ITEMRENDER_TYPE, JTDefaultItemRender);
        if (BaseSpinSlotView) {
            this.registerClass(JTChildFactory.ITEMRENDER_TYPE, BaseSpinSlotView);
        }

        // this.registerClass(JTChildManager.GIRD_TYPE, JTSkinnableGridRender);
        this.registerClass(JTChildFactory.GIRD_TYPE, JTSkinnableGridRender);
        this.registerClass(JTChildFactory.LINE_TYPE, JTSkinnableRuntimeLineRender);
        // this.registerClass(JTChildFactory.SCATTER_TYPE, JTScatterGridRender);
        // this.registerClass(JTChildFactory.SCATTER_GRID_TYPE, JTSkinnableGridArtRender);
        // this.registerClass(JTOwnerFactory.GIRD_TYPE, JTSkinnableGridRender);
        // this.registerClass(JTChildManager.LINE_BUTTON_TYPE, JTSkinnableLineButtonRender);
        // this.registerClass(JTChildManager.LINE_TYPE, JTSkinnableScaleLineRender);
        // this.registerClass(JTFactoryChild.MASK_TYPE, JTLineArtMask);

        return this;
    }

    public isExdWild(r: JTItemRender, line: RollingResult, index: number, scroller: JTLineScrollerGroup, renders?: JTItemRender[]): boolean {
        let realData: any = SlotUtils.isNullOrUndefined(r.changedData) ? r.data : r.changedData;
        let isWild = SlotUtils.isWild(realData)||scroller.lineParser.wildId.includes(realData)||scroller.lineParser.dynamicWildId.includes(realData);
        if (line.eleId != realData)
        {
            if(SlotUtils.isNormalElement(line.eleId)&&isWild){//该元素是百搭且中奖元素是普通元素才能替换
                return true;
            }
            JTLogger.info("lineId:   " + line.lineId, " eleMum:  " + line.eleNum, "indexs:   ");
            return false;
        }
        return true;
    }

    public changedLine(lineRender: JTLineRender, lineInfo: JTLineInfo): void {

    }
}