import JTSkinnable from "./JTSkinnable";

/*
* name;提前处理皮肤基类
*/
export default abstract class JTAdvanceSkinnable extends JTSkinnable
{
    /**
     * 模式
     */
    protected _mode:number = 0;
    constructor()
    {
        super();
    }

    /**
     * 模式
     */
    public get mode():number
    {
        return this._mode;
    }

    /**
     * 创建完成
     * @param data 外部传入进来的数据 
     */
    public abstract createComplete(data?:any):void;
}