import JTTask from "../com/tasks/JTTask";
import JTTaskFlow from "../com/tasks/JTTaskFlow";
import JTTaskPipeline from "../com/tasks/JTTaskPipeline";
import JTLineScrollerGroup from "../extensions/JTLineScrollerGroup";
import JTScrollerLineParser from "../lines/JTScrollerLineParser";

/*
* name;//解析任务 （可以对此类进行优化 结合数据结构里的ArrayCollection进行操作）
*/
export default class JTParseTask extends JTTaskFlow
{
    /**
     * 线解析器
     */
    protected lineParser:JTScrollerLineParser = null;
    constructor()
    {
        super();
    }

    /**
     * 运行任务（用于检查是否满足某种特定的任务）
     * 重写此方法可以针对任务特殊任务进行检测判断
     */
    public runningTask():void
    {

    }

    /**
     * 完成调度
     */
    public complete():void
    {
        this.clear();
        (this._owner as JTTask).runningTask();
    }

    /**
     * 获取线解析器
     */
    public getLineParser():JTScrollerLineParser
    {
        if (!this.lineParser)
        {
             let pipeline:JTTaskPipeline = this._owner as JTTaskPipeline;
             let scroller:JTLineScrollerGroup = pipeline.owner as JTLineScrollerGroup;
            
             this.lineParser = scroller.lineParser as JTScrollerLineParser;
        }
        return this.lineParser;
    }

    public getScrollerGroup():JTLineScrollerGroup{
        let lineParser = this.getLineParser();
        let scroller: JTLineScrollerGroup = lineParser.owner as JTLineScrollerGroup;
        return scroller;
    }

    /**
     * 获取线结果
     */
    public getLineResults():any[]
    {
        if (!this.lineParser)this.getLineParser();
        return this.lineParser.lineResults;
    }

}