import JTTaskFlow from "./JTTaskFlow";
import JTScrollerGroup from "../JTScrollerGroup";
import JTGroup from "../base/JTGroup";

/*
* name;选项任务
*/
export default abstract class JTOptionTask extends JTTaskFlow
{
    /**
     * 滚轴视图
     */
    protected _scrollerGroup:JTScrollerGroup = null;
    constructor()
    {
        super();
    }
    
    /**
     * 关联滚轴视图
     * @param s 滚轴视图 
     */
    public contact(s:JTGroup):void
    {
        this._scrollerGroup = s as JTScrollerGroup;
    }

    /**
     * 滚轴组视图
     */
    public get scrollerGroup():JTScrollerGroup
    {
        return this._scrollerGroup;
    }

    /**
     * 销毁
     */
    public destroy():boolean
    {
        super.destroy();
        this._scrollerGroup = null;

        return true;
    }
}