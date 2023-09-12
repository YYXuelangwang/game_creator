import JTProcedure from "./JTProcedure";

/*
* name;
*/
export default abstract class JTRunning extends JTProcedure
{
    /**
     * 运行函数，继承需重写
     */
    public abstract running():void;

      /**
     * 运行任务
     */
    public runningTask():void
    {
        this.running();
    }
}