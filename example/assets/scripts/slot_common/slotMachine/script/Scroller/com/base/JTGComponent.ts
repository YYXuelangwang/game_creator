/*
* name;
*/
import JTContainer  from "./JTContainer";

export default class JTGComponent extends JTContainer
{
    protected _proxyOwner:JTContainer = null;
    constructor()
    {
        super();
        this._proxyOwner =  new JTContainer();
        
    }

    /**
     * 绑定
     * @param owner 捆绑的对象
     * @param caller 执行域对象
     */
    public bind(owner:JTContainer, caller:any):void
    {
        this._proxyOwner.bind(owner, caller);
    }

    /**
     *  添加子级对象
     * @param child 被添加的对象
     */
    public addContainer(child:JTContainer):number
    {
         return this._proxyOwner.addContainer(child);
    }

    /**
     * 按索引删除对象个数
     * @param index 删除的索引
     * @param count 要删除的个数
     */
    public removeContainerAt(index:number, count:number = 1):any
    {
         return this._proxyOwner.removeContainerAt(index);
    }

    /**
     * 移除子对象
     * @param child 要移除的对象 
     */
    public removeContainer(child:JTContainer):JTContainer
    {
         return this._proxyOwner.removeContainer(child);
    }

    /**
     * 按索引获取子对象
     * @param index 索引
     */
    public getContainerByIndex(index:number):JTContainer
    {
            return this._proxyOwner.getContainerByIndex(index);
    }
    
    /**
     * 子对象个数
     */
    public get childsCount():number
    {
        return this._proxyOwner.childsCount;
    }

    /**
     * 子对象列表
     */
    public get childs():JTContainer[]
    {
        return this._proxyOwner.childs;
    }

     /**
     * 拥有者
     */
    public get owner():JTContainer
    {
        return this._proxyOwner.owner;
    }

    public set owner(value:JTContainer)
    {
        this._proxyOwner.owner = value;
    } 

    /**
     * 拥有者的执行域对象
     */
    public get caller():any
    {
        return this._proxyOwner.caller;
    }

    public set caller(value:any)
    {
        this._proxyOwner.caller = value;
    }

    /**
     * 销毁
     */
    public destroy():boolean
    {
        super.destroy();
        this._proxyOwner.destroy();
        this._proxyOwner = null;
        return true ;
    }

    /**
     * 清除
     */
    public clear():void
    {
        this._proxyOwner.clear();
    }
}