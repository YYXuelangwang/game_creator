import JTOptionTransition from "./JTOptionTransition";
import JTItemRender from "../../base/JTItemRender";
import JTFuturePipeline from "../JTFuturePipeline";
import JTTask from "../../tasks/JTTask";
import JTLayoutPoint from "../../../extensions/JTLayoutPoint";

/*
* name;
*/
export default abstract class JTProcedure extends JTOptionTransition 
{
    
    /**
     * 是否已收到服务器的数据，可以进行下一步操作
     */
    public isDataReady:boolean = false;
    constructor()
    {
        super()
    }

    /**
     * 滚轴X和Y
     * @param x 
     * @param y 
     */
    public setScrollerXY(sourceXLandscape: number , sourceYLandscape: number ,sourceXPortrait: number , sourceYPortrait: number):void
    {
        let pipeline:JTFuturePipeline = this._owner as JTFuturePipeline;
        pipeline.setScrollerXY(sourceXLandscape,sourceYLandscape,sourceXPortrait,sourceYPortrait);
    }

    /**
     * 设置真实渲染的渲染器
     * @param r 
     */
    public setupRender(r:JTItemRender,p:JTLayoutPoint):void
    {
        let pipeline:JTFuturePipeline = this._owner as JTFuturePipeline;
        pipeline.setupRender(r,p);
    }
    /**
     * 数据准备就绪
     */
    public dataStandby():void{
        this.isDataReady = true;
    }

    public continue():void{

    }
    /**
     * 完成函数
     */
    public complete():void
    {
        this.isDataReady = false;
        this.clear();
        this._handler && this._handler.apply(this._caller, [this._scroller]);
        this._owner && (this._owner as JTTask).runningTask();
    }
}