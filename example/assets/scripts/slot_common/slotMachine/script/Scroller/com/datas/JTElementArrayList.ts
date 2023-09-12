import JTDataInfo from "./JTDataInfo";

/*
* name;元素列表
*/
export default class JTElementArrayList extends JTDataInfo
{
    protected _dataList:any[] = null;
    protected _changedDataList:any[] = null;

    protected _gridShapes: any = null;
    protected _occupyPosList: any = null;

    constructor()
    {
        super();
    }

    /**
     * 更新数据列表
     * @param dataList 没有转换的数据列表
     * @param changeds 转换过后的数据列表
     */
    public update(dataList:any[],  changeds:any[]):void
    {
        this._dataList = dataList;
        this._changedDataList = changeds;
    }

    /**
     * 转换过后的数据列表
     */
    public get changedDataList():any[]
    {
        return this._changedDataList;
    }

    public set changedDataList(value:any[])
    {
        this._changedDataList = value;
    }

    /**
     * 没有转换的数据列表
     */
    public get dataList():any[]
    {
        return this._dataList;
    }

    public set dataList(value:any[])
    {
        this._dataList = value;
    }

    /**
     
     */
    public get gridShapes():any[]
    {
        return this._gridShapes;
    }

    public set gridShapes(value:any[])
    {
        this._gridShapes = value;
    }

    /**
     *
     */
    public get occupyPosList():any[]
    {
        return this._occupyPosList;
    }

    public set occupyPosList(value:any[])
    {
        this._occupyPosList = value;
    }
}