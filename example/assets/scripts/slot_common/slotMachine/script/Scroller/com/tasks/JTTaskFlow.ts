import JTTask from "./JTTask";


/*
* name;任务流
*/
export default abstract class JTTaskFlow extends JTTask
{
    constructor()
    {
        super();
    }

    /**
     * 完成时调度
     */
    public complete():void
    {
        this.clear();
        this._handler && this._handler.apply(this._caller, [this]);
        (this._owner as JTTask).runningTask();
    }
}