/*
* name; JTContainer 容器
*/
export default class JTContainer extends cc.Node
{
    protected _owner:JTContainer = null;
    protected _caller:any = null;
    protected _childs:JTContainer[] = null;
    constructor()
    {
        super();
        this._childs = [];
        this.name = this.constructor.name;  //方便调试
    }

    /**
     * 绑定
     * @param owner 捆绑的对象
     * @param caller 执行域对象
     */
    public bind(owner:JTContainer, caller:any):void
    {
        this._owner = owner;
        if (owner) owner.addContainer(this);
        this._caller = caller;
    }

    /**
     *  添加子级对象
     * @param child 被添加的对象
     */
    public addContainer(child:JTContainer):number
    {
         let index:number = this._childs.indexOf(child);
         if (index == -1)this._childs.push(child);
         return index;
    }

    /**
     * 按索引删除对象个数
     * @param index 删除的索引
     * @param count 要删除的个数
     */
    public removeContainerAt(index:number, count:number = 1):any
    {
            if (index < 0 || index > this._childs.length - 1)
            {
                    return null;
            }
            let owns:JTContainer[] = this._childs.splice(index, count);
            for (let i:number = 0; i < owns.length; i++)
            {
                 let own:JTContainer = owns[i];
                 own.clear();
            }
            return owns;
    }

    /**
     * 移除子对象
     * @param child 要移除的对象 
     */
    public removeContainer(child:JTContainer):JTContainer
    {
           let index:number = this._childs.indexOf(child);
           if (index == -1) return null;
           return this.removeContainerAt(index);
    }

    /**
     * 按索引获取子对象
     * @param index 索引
     */
    public getContainerByIndex(index:number):JTContainer
    {
            return this._childs[index];
    }
    
    /**
     * 子对象个数
     */
    public get childsCount():number
    {
        return this._childs.length;
    }

    /**
     * 子对象列表
     */
    public get childs():JTContainer[]
    {
        return this._childs;
    }

    /**
     * 拥有者
     */
    public get owner():JTContainer
    {
        return this._owner;
    }

    public set owner(value:JTContainer)
    {
        this._owner = value;
    } 

    /**
     * 拥有者的执行域对象
     */
    public get caller():any
    {
        return this._caller;
    }

    public set caller(value:any)
    {
        this._caller = value;
    }

    /**
     * 销毁
     */
    public destroy():boolean
    {
        this._owner = null;
        this._caller = null;
        this._childs.length = 0;
        return true ;
    }

    /**
     * 清除
     */
    public clear():void
    {
       
    }
}