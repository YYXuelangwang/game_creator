import { GameEventNames } from "../../SlotConfigs/GameEventNames";
import JTPerformanceTask from "./JTPerformanceTask";

/*
* name;打开旋转
*/
export default class JTUpLevelTask extends JTPerformanceTask {


    constructor() {
        super();
    }

    public addEventListenner(): void {
        game.EventManager.getInstance().addEventListener(core.GameCoreConst.mess_lvAwardInfoPush, this.lvAwardInfoPush, this);
    }

    /**
     * 运行任务
     */
    public runningTask(): void {
        this.nextStep();
    }

    private lvAwardInfoPush(mess: string, data: protoCommon.lvAwardInfoPush, err: any): void {
        this.addStepTask(GameEventNames.USER_UPLEVEL_ANI, data);
    }

    public complete(): void {
        console.log("流程：JTUpLevelTask完成");
        super.complete();
    }

}