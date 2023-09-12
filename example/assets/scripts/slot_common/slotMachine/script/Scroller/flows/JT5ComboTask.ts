import JTComboTask from "./JTComboTask";

/*
* name;//滚动完需要播放5连效果
*/
export default class JT5ComboTask extends JTComboTask
{
    constructor()
    {
        super();
        /**
         * 注册 5连任务
         */
        this.registerWatchTask([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], 5);
    }

    public executeTask():void
    {
         super.executeTask();
        //  this.lineParser.showMaskWithGridLine()
    }

}