import JTProcedure from "./JTProcedure";

/*
* name;
*/
export default abstract class JTBeginRunning extends JTProcedure
{
    /**
     * 将要运行函数
     */
    public abstract beginRunning():void;

    /**
     * 运行任务
     */
    public runningTask():void
    {
        this.beginRunning();
    }
}