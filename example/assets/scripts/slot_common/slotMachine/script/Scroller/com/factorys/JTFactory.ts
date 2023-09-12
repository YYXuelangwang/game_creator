import JTContainer from "../base/JTContainer";
import JTLogger from "../../JTLogger";
import { SDictionary } from "../../../SlotData/SDictionary";
import JTProduct from "../../lines/JTProduct";

/*
* name;
*/
export default abstract class JTFactory extends JTContainer
{
    /**
     * 类型Map数组
     */
    protected _classMap:SDictionary = null;

    /**
     * 使用过的类类型列表
     */
    protected _usedClassList:any[] = null;
    constructor()
    {
        super();
        this._classMap = new SDictionary();
        this._usedClassList = [];
        this.registerClassAlias();
    }

    /**
     * type 类型
     * owner 要绑定的对象
     */
    public produce(type:any, owner?:JTContainer, name?:string):JTProduct
    {
        let cls:any = this.getClass(type);
        let product:JTProduct = null;
        if (cls) product = new cls() as JTProduct;
        if(product && name && name != ""){
            product.name = name;
        }
        this._usedClassList.push(type);
        return product;
    }

    /**
     * 获取没有没有使用的Class列表
     */
    public getNotUsedClass():any[]
    {
        let keys:any[] = this._classMap.keys;
        let list:any[] = [];
        for (let i:number = 0; i < keys.length; i++)
        {
                let key:any = keys[i];
                if (this._usedClassList.indexOf(key) != -1)
                {
                        continue;
                }
                list.push(key);
        }
        return list;
    }

    public isVerify(type:any):boolean
    {
        return this.getClass(type) ? true : false;
    }

    /**
     * 通过Type获取Class类型
     * @param type 类型
     */
    public getClass(type:any):any
    {
        return this._classMap.get(type);
    }

    /**
     * 注册全局的Class类型
     */
    protected registerClassAlias():void
    {

    }

   /**
    * 注册Class类型
    * @param type 类型
    * @param cls  class类型
    */
    public registerClass(type:any, cls:any):void
    {
        if (this._classMap.get(type)) JTLogger.error("[]");
        this._classMap.set(type, cls);
    }

    protected get classMap():Object
    {
        return this._classMap;
    }
}