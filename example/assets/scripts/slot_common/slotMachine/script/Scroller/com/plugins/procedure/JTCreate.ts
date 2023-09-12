import JTProcedure from "./JTProcedure";
import JTItemRender from "../../base/JTItemRender";
import JTScroller from "../../JTScroller";
import JTScheduledPipeline from "../JTScheduledPipeline";

/*
* name;
*/
export default abstract class JTCreate extends JTProcedure
{
    /**
     * 创建函数，继承需重写
     */
    public abstract create():void
    private _indexCounter:number = 0;
    

     /**
     * 运行任务
     */
    public runningTask():void
    {
        this.create();
    }
 
    public complete():void
    {
        // this._scroller.dataList = this._dataList;
        this._handler && this._handler.apply(this._caller, [this._scroller]);
    }

    public destroy():boolean
    {
        // super.destory();
        // let items:JTIItemSkinLoader[] = this._scroller.items;
        // if (items)
        // {
        //     this._scroller.renders.length = 0;
        //     while(items.length)
        //     {
        //         let item:JTItemRender = items.shift() as JTItemRender;
        //         item.removeFromParent();
        //         item.destroy();
        //         item = null;
        //     }   
        //     // this._scroller.skinLoader && this._scroller.skinLoader.removeFromParent();
        //     // this._scroller.skinLoader = null;
        // }
        let s:JTScroller = this._scroller;
        let totalCount:number = s.items.length;
        for (let i:number = 0; i < totalCount; i++)
        {
               let t:JTItemRender = s.items.shift() as JTItemRender;
               t.removeFromParent();
        }
        let pipeline:JTScheduledPipeline = this._owner as JTScheduledPipeline;
        pipeline.items = [];
        pipeline.renders = [];
        // while(s.items.length)
        // {
        //        let t:JTItemRender = s.items.shift() as JTItemRender;
        //        t.removeFromParent();
        // }

        return true;
    }

}