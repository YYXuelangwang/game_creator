import JTComboTask from "./JTComboTask";

/*
* name;//结束需要展示特殊3连任务
*/
export default class JT3ComboTask extends JTComboTask
{
    constructor()
    {
        super();
          /**
         * 注册3连任务
         */
        this.registerWatchTask(12, 3);
    }
}