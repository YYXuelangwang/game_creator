import JTContainer from "../base/JTContainer";
import JTCollection from "../datas/JTCollection";
import JTDataInfo from "../datas/JTDataInfo";
import JTElementArrayList from "../datas/JTElementArrayList";

/*
* name;任务
*/
export default abstract class JTTask extends JTContainer
{
    /**
     * 数据提供者
     */
    protected _dataProvider:JTCollection<JTDataInfo> = null;
    /**
     * 优先级
     */
    protected _priority:number = 0; 
    /**
     * 执行函数
     */
    protected _handler:Function = null;
    constructor()
    {
        super();
    }

    /**
     * 运行任务
     */
    public abstract runningTask():any;

    /**
     * 未发生改变的数据列表
     */
    public get dataList():any[]
    {
        return (this._dataProvider.grids as JTElementArrayList).changedDataList;
    }

    /**
     * 已经发生改变所数据列表
     */
    public get changedDataList():any[]
    {
        return (this._dataProvider.changedGrids as JTElementArrayList).changedDataList;
    }

    /**
     * 执行函数
     */
    public get handler():Function
    {
        return this._handler;
    }

    public set handler(value:Function)
    {
        this._handler = value;
    }

    /**
     * 优先级
     */
    public get priority():number
    {
        return this._priority;
    }

    public set priority(value:number)
    {
        this._priority = value;
    }

    /**
     * 销毁
     */
    public destroy():boolean
    {
        super.destroy();
        this._handler = null;
        return true;
    }

    /**
     * 数据提供者
     */
    public get dataProvider():JTCollection<JTDataInfo>
    {
        return this._dataProvider;
    }

    public set dataProvider(value:JTCollection<JTDataInfo>)
    {
        this._dataProvider = value;
    }
}