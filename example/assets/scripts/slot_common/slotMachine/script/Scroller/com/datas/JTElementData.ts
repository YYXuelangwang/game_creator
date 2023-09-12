import JTDataInfo from "./JTDataInfo";

/*
* name;
*/
export default class JTElementData extends JTDataInfo
{
    protected _index:number = 0;
    protected _data:any = null;
    protected _changedData:any = null;
    constructor()
    {
        super();
    }   

    /**
     * 元素索引
     */
    public get index():number
    {
        return this._index;
    }

    public set index(value:number)
    {
        this._index = value;
    }

    /**
     * 元素未改变的数据
     */
    public get data():any
    {
        return this._data;
    }

    public set data(value:any)
    {
        this._data = value;
    }

    /**
     * 元素改变过后的数据
     */
    public get changedData():any
    {
        return this._changedData;
    }

    public set changedData(value:any)
    {
        this._changedData = value;
    }
}