import JTItemSkinLoader from "./JTItemSkinLoader";
import RollingResult from "../../../SlotData/RollingResult";
import JTElementData from "../datas/JTElementData";
import SlotMachineView from "../../../MainView/SlotMachineView";

/*
* name;
*/
export default abstract class JTItemRender extends JTItemSkinLoader 
{
    protected _data:any = null;

    private _index:number = 0;
    private _currentFrame:number = 0;

    public static STATE_DEFAULT:number = 0;
	public static STATE_ROLLING:number = 1;
	public static STATE_OVER:number = 2;
    protected _isPlaying:boolean = false;
    protected _changedData:any = null;

    protected _elementData:JTElementData = null;
    
    constructor()
    {
        super();
        this.setupSkinLoader(0, 0, this);
    }

    /**
     * 播放中奖结果
     * @param line 线结果
     * @param indexLine 在当前线的索引值
     * @param slotMachine 滚轴的视图父容器
     */
    public play(line:RollingResult, indexLine:number, slotMachine:SlotMachineView):void
	{
		this._isPlaying = true;	
	}

    /**
     * 跳到某个状态(理解成某一帧)
     * @param frame 状态 / 帧
     */
	public gotoAndStop(frame:number):void
	{
		this._isPlaying = false;	 
	}

    /**
     * 渲染器的基础数据(Id)
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
     * 渲染器改变的数据(id)
     */
    public get changedData():any
    {
        return this._changedData;
    }

    public set changedData(value:any)
    {
        this._changedData = value;
    }

    /**
     * 渲染器在滚轴的索引
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
     * 渲染器元素数据
     * 包含了（原始数据、改变过后的数据、索引）
     */
    public get elementData():JTElementData
    {
        return this._elementData;
    }

    public set elementData(value:JTElementData)
    {
        this._elementData = value;
        this.data = this._elementData.data;
        this.changedData = this.elementData.changedData;
    }


    /**
     * 当前的状态（帧）
     */
    public get currentFrame():number
    {
        return this._currentFrame;
    }

    public set currentFrame(value:number)
    {
        this._currentFrame = value;
    } 

    /**
     * 通过point设置渲染器坐标
     * @param point 坐标点对象
     */
    public setXYByPoint(point:cc.Vec2):void
    {
        this.x = point.x;
        this.y = point.y;
    }

    /**
     * 销毁
     */
    public destory():void
    {
        super.destroy();
        this._skinLoader.removeFromParent();
        this._skinLoader = null;
    }
}