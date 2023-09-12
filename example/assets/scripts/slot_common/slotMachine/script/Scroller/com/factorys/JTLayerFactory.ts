import JTFactory from "./JTFactory";
import JTGComponent from "../base/JTGComponent";
import JTLineMask from "../../masks/JTLineMask";
import JTScrollerGroupMask from "../../masks/JTScrollerGroupMask";
import { SDictionary } from "../../../SlotData/SDictionary";
import JTMask from "../base/JTMask";
import JTContainer from "../base/JTContainer";
import JTScrollerGroup from "../JTScrollerGroup";
import JTGroup from "../base/JTGroup";

/*
* name;层级工厂
*/
export default class JTLayerFactory extends JTFactory {
    /**
     * 滚轴容器
     */
    public static SCROLLER_CONTAINER: number = 100;

    /**
     * 中奖线线容器
     */
    public static LINE_CONTAINER: number = 200;

    /**
     * 格子线框容器
     */
    public static GIRD_CONTAINER: number = 300;

    /**
     * 前框容器
     */
    public static FRONT_FRAME_CONTAINER: number = 400;

    /**
     * 滚轴遮罩容器
     */
    public static SCROLLER_MASK_CONTAINER: number = 500;

    /**
     * 元素上层层的特效容器，调用slotmachine.addEffect时所在的下层容器
     */
    public static EFFECT_ABOVE_CONTAINER = 600;

    /**
     * 线遮罩
     */
    public static LINE_MASK_TYPE: number = 700;

    /**
     * 分散容器
     */
    public static SCATTER_GRID_CONTAINER: number = 800;

    /**
     * 列容器，加速动画所在的父节点
     */
    public static SKIN_LOADER_CONTAINER: number = 900;

    public static WILD_FIEXD_TYPE: number = 1000;
    public static WILD_RONDOM_TYPE: number = 1100;
    /**
     * 展示时中奖元素的容器
     */
    public static LAYER_SORT_PLAY_RENDER: number = 1200;
    /**
     * 展示时非中奖元素的容器
     */
    public static LAYER_SORT_STOP_RENDER: number = 1300;

    public static LAYER_SORT_FLEXIBLE_CONTAINER: number = 1400;
    public static EXTENSIONS_SCROLLER_CONTAINER: number = 1500;

    /**
     * 动态闪光线容器
     */
    public static FLASH_LINE_CONTAINER: number = 1600;

    /**
     * 元素下层层的特效容器，调用slotmachine.addEffect添加所在的上层容器
     */
    public static EFFECT_BELOW_CONTAINER: number = 1700;

    /**
     * 滚轴中奖时展示的黑色蒙版
     */
    public static SCOLLER_GROUP_BLACK_BACK_GROUND: number = 1800;

    /**
     * 中奖线线号的容器
     */
    public static LINE_NUMBER_CONTAINER: number = 1900;

    /**
     * 分散加速时的容器
     */
    public static LAYER_SORT_SCATTER_PLAY_CONTAINER: number = 2000;

    /**
     * 分散加速时的容器
     */
    public static LAYER_SORT_SCATTER_STOP_CONTAINER: number = 2100;

    /**
     * 分散加速时的黑色蒙板
     */
    public static SCATTER_BLACK_BACK_GROUND: number = 2200;

    /**
     * 滚轴遮罩容器
     */
    public static EXTEND_SCROLLER_MASK_CONTAINER_ONE: number = 2300;

    /**
     * 滚轴遮罩容器
     */
    public static EXTEND_SCROLLER_MASK_CONTAINER_TWO: number = 2400;

    private layerMap: SDictionary = null;

    private _layers: any[] = null;
    constructor() {
        super();
        this._layers = [];
        this.layerMap = new SDictionary();
    }

    /**
     * 生产层级对象
     * @param type type类型
     * @param owner 要绑定的对象
     */
    public produce(type: number, owner?: JTContainer, name?:string): JTContainer {
        let product: JTContainer = super.produce(type,owner,name) as JTContainer;
        if (product && owner) product.bind(owner, owner.caller);
        this.layerMap.set(type, product);
        return product;
    }

    /**
     * 初时化层级工厂
     * @param scroller 滚轴 
     */
    public initialize(scroller: JTScrollerGroup): void {
        this.addChildNode(JTLayerFactory.EFFECT_BELOW_CONTAINER, scroller);
        let container: JTGComponent = this.addChildNode(JTLayerFactory.SCROLLER_CONTAINER, scroller) as JTGComponent;
        this.addChildNode(JTLayerFactory.LINE_CONTAINER, scroller);
        this.addChildNode(JTLayerFactory.SKIN_LOADER_CONTAINER, scroller);
        this.addChildNode(JTLayerFactory.FRONT_FRAME_CONTAINER, scroller);
        this.addChildNode(JTLayerFactory.GIRD_CONTAINER, scroller);
        this.addChildNode(JTLayerFactory.EFFECT_ABOVE_CONTAINER, scroller);
        let mask: JTMask = this.produce(JTLayerFactory.SCROLLER_MASK_CONTAINER) as JTMask;
        mask.launch(scroller);
    }

    /**
     * 生产其它没有创建的产品
     */
    public produces(): void {
        let keys: any[] = this.getNotUsedClass();
        for (let i: number = 0; i < keys.length; i++) {
            let type: any = keys[i];
            this.produce(type, this)
        }
    }

    public updateLayer(group?: JTGroup): void {
        if (!group) return;
    }

    public layerSort(): void {

    }

    /**
     * 添加层级
     * @param type 层级类型
     * @param parent 要添加对象的父容器
     */
    public addChildNode(type: number, parent: JTContainer): JTContainer {
        let layer: JTContainer = this.layerMap.get(type);
        (parent as JTGComponent).addChild(layer as JTGComponent);
        this._layers.push({ "layer": layer, "parent": parent });
        return layer;
    }

    /**
     * 获取层级
     * @param type 层级类型
     */
    public getLayer(type:number):JTContainer{
        let layer: JTContainer = this.layerMap.get(type);
        return layer;
    }

    public get layers(): any[] {
        return this._layers;
    }

    /**
     * 还原初始化的层级顺序
     */
    public resetLayer(): void {
        // for (let i: number = 0; i < this._layers.length; i++) {
        //     let item: any = this._layers[i];
        //     let layer: JTContainer = item.layer;
        //     let parent: JTContainer = item.parent;
        //     (layer as JTContainer).removeFromParent();
        //     (parent as JTGComponent).addChild(layer as JTGComponent);
        // };
    }

    /**
     * 注册全局Class
     */
    protected registerClassAlias(): JTLayerFactory {
        this.registerClass(JTLayerFactory.SCROLLER_CONTAINER, JTGComponent);
        this.registerClass(JTLayerFactory.LINE_CONTAINER, JTGComponent);
        this.registerClass(JTLayerFactory.GIRD_CONTAINER, JTGComponent);
        this.registerClass(JTLayerFactory.FRONT_FRAME_CONTAINER, JTGComponent);
        this.registerClass(JTLayerFactory.SCROLLER_MASK_CONTAINER, JTScrollerGroupMask);
        this.registerClass(JTLayerFactory.EFFECT_ABOVE_CONTAINER, JTGComponent);
        this.registerClass(JTLayerFactory.EFFECT_BELOW_CONTAINER, JTGComponent);
        this.registerClass(JTLayerFactory.SKIN_LOADER_CONTAINER, JTGComponent);
        this.registerClass(JTLayerFactory.LINE_MASK_TYPE, JTLineMask);
        return this;
    }
}