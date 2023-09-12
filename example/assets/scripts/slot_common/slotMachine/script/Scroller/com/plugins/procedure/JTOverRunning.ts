import JTProcedure from "./JTProcedure";

/*
* name;
*/
export default abstract class JTOverRunning extends JTProcedure 
{
    /**
     * 结束函数，继承需重写
     */
    public abstract overRunning():void;

    /**
     * 运行任务
     */
    public runningTask():void
    {
        this.overRunning();
    }
}