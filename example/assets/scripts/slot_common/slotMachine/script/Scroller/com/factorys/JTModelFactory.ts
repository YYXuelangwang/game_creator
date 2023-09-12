import JTFactory from "./JTFactory";
import JTElementCollection from "../datas/JTElementCollection";
import JTElementData from "../datas/JTElementData";
import JTElementArrayList from "../datas/JTElementArrayList";
import JTArrayCollection from "../datas/JTArrayCollection";
import JTContainer from "../base/JTContainer";

/*
* name;数据模型
*/
export default class JTModelFactory extends JTFactory
{
    /**
     * 渲染器数据模型
     */
    public static ITEMRENDER_DATA_MODEL:number = 100;
    /**
     * 单个滚轴数据模型
     */
    public static SCROLLER_DATA_MODEL:number = 200;
    /**
     * 单个滚轴渲染器列表数据模型
     */
    public static ELEMENT_LIST_DATA_MODEL:number = 300;
    /**
     * 滚轴组数据数据模型
     */
    public static SCROLLERGROUP_DATA_MODEL:number = 400;
    constructor()
    {
            super();
    }

    /**
     * 生产数据对象
     * @param type type类型
     * @param owner 要绑定的对象
     */    
    public produce(type:number, owner?:JTContainer):JTContainer
    {
        let product:JTContainer = super.produce(type) as JTContainer;
        if (product && owner)product.bind(owner, owner.caller);
        return product;
    }

    /**
     * 注册全局class类
     */
    protected registerClassAlias():JTModelFactory
    {
            this.registerClass(JTModelFactory.SCROLLER_DATA_MODEL, JTElementCollection);
            this.registerClass(JTModelFactory.ITEMRENDER_DATA_MODEL, JTElementData);
            this.registerClass(JTModelFactory.ELEMENT_LIST_DATA_MODEL, JTElementArrayList);
            this.registerClass(JTModelFactory.SCROLLERGROUP_DATA_MODEL, JTArrayCollection)
            return this;
    }
}