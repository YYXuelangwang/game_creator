import { GameEventNames } from "../SlotConfigs/GameEventNames";
import { Handler } from "../SlotUtils/Handle";
import FreeGameManager from "./FreeGameManager";
import PlayerManager from "./PlayerManager";
import SpinManager, { GameType } from "./SpinManager";

export default class JackPotGameManager {
    public static get instance(): JackPotGameManager {
        if (!this._instance) this._instance = new JackPotGameManager();
        return this._instance;
    }
    private static _instance: JackPotGameManager = null;

    public startJackPotGame(cb: Handler) {
        SpinManager.instance.nowGameType = GameType.JackPotGame;
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_JACKPOT_GAME_TRIGGERED_TASK, cb)
        this._doingJackPotGame = true;
    }

    /**
     * 初始化接口
     */
    init() {
        this._addProtocolListener();
    }

    /**
     * 释放
     */
    dispose() {
        this._removeProtocolListener();
        JackPotGameManager._instance = null;
    }

    public get doingJackPotGame(): boolean {
        return this._doingJackPotGame;
    }
    private _doingJackPotGame: boolean = false;

    public onJackPotGameFinished() {

        let coin = (JackPotGameManager.instance.jpRewardPush.reward as Long).toNumber();

        let isRetain = FreeGameManager.instance.isTreateFromFreeGame && !FreeGameManager.instance.isTreateFreeOver;
        let isAdd = FreeGameManager.instance.isTreateFromFreeGame;

        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_UPDATE_WINSCORE, coin, isRetain, isAdd);
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_UPDATE_FREEGAME_WIN, coin);

        PlayerManager.instance.onBalancePush(coin);

        this._jpRewardPush = null;
        this._doingJackPotGame = false;

    }

    public get hasJackGame(): boolean {
        return this._jpRewardPush != null;
    }

    /**中JP小游戏事件 */
    private jpRwardResp(mess: string, result) {
        this._jpRewardPush = result;
    }


    get jpRewardPush(): protoReport.jackpotRewardPush {
        return this._jpRewardPush
    }

    private _jpRewardPush: protoReport.jackpotRewardPush = null;
    /**
    * 增加协议监听
    */
    private _addProtocolListener() {

        game.EventManager.getInstance().addEventListener(core.GameCoreConst.mess_netJpRewardPush, this.jpRwardResp, this);  //陈中JP转盘小游戏
    }

    /**
     * 移除协议监听
     */
    private _removeProtocolListener() {

        game.EventManager.getInstance().removeEventListener(core.GameCoreConst.mess_netJpRewardPush, this.jpRwardResp, this);    //陈

    }
}
