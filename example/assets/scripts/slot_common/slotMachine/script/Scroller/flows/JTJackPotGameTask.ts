import JackPotGameManager from "../../SlotManager/JackPotGameManager";
import { Handler } from "../../SlotUtils/Handle";
import JTParseTask from "./JTParseTask";

export default class JTJackPotGameTask extends JTParseTask {


    public runningTask(): void {
        if (JackPotGameManager.instance.hasJackGame) {
            JackPotGameManager.instance.startJackPotGame(Handler.create(this, this.finishJackPotGame))
            return;
        } else {
            console.log("流程 JTJackPotGameTask完成1");
            this.complete();
        }
    }

    private finishJackPotGame(): void {
        console.log("流程 JTJackPotGameTask完成2");
        JackPotGameManager.instance.onJackPotGameFinished();
        this.complete();
    }
}
