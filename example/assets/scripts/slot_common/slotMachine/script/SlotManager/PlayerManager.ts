import SimpleManagerTemplate from "./SimpleManagerTemplate";
import { GameEventNames } from "../SlotConfigs/GameEventNames";
import NetSlotConst from "../../../network/NetSlotConst";

/**
 * PlayerManager
 */
export default class PlayerManager implements SimpleManagerTemplate {
    public static get instance(): PlayerManager {
        if (!PlayerManager._instance) {
            PlayerManager._instance = new PlayerManager();
        }
        return PlayerManager._instance;
    }
    private static _instance: PlayerManager = null;


    private _showingCoin: number;//前端自己提前扣钱显示暂时弃用

    private _readlyCoin: number; //真实的钱；
    // private _winCoin:number; // 赢得的钱

    private _lastCoin: number;

    get isNew(): boolean {
        return this._isNew;
    }

    set isNew(value: boolean) {
        this._isNew = value;
    }

    private _isNew: boolean = false;

    private _guideStep: number = 0;

    get guideStep(): number {
        return this._guideStep;
    }

    set guideStep(value: number) {
        this._guideStep = value;
    }

    constructor() { }

    public get userInfo() {
        return core.CommonProto.getInstance().userinfo;
    }

    init() {
        //切换房间this.userInfo数据不是新的不用改变
        if (this._readlyCoin && this._readlyCoin === this._showingCoin) {
        } else {
            this._readlyCoin = this._showingCoin = (this.userInfo.scores as Long).toNumber();
        }
        game.EventManager.getInstance().addEventListener(NetSlotConst.SPINRESP, this._onRollingResp, this);
        game.EventManager.getInstance().addEventListener(core.GameCoreConst.mess_updateUserInfo, this.updateAllScore, this);
        game.EventManager.getInstance().addEventListener(core.GameCoreConst.mess_netupdateUserInfoPush, this.updateUserInfoPush, this);
        game.EventManager.getInstance().addEventListener(NetSlotConst.USERINFO_PUSH, this.userInfoPush, this);
    }

    dispose() {
        this._showingCoin = 0;
        game.EventManager.getInstance().removeEventListener(NetSlotConst.SPINRESP, this._onRollingResp, this);
        game.EventManager.getInstance().removeEventListener(core.GameCoreConst.mess_updateUserInfo, this.updateAllScore, this);
        game.EventManager.getInstance().removeEventListener(core.GameCoreConst.mess_netupdateUserInfoPush, this.updateUserInfoPush, this);
        game.EventManager.getInstance().removeEventListener(NetSlotConst.USERINFO_PUSH, this.userInfoPush, this);
    }
    public _userInfoUpdata: any = null;
    public userInfoPush(mess: any, result: any) {
        console.log("userinfopush", result)
        //this.syncShowingCoin(result.userInfo.balance);

        this._userInfoUpdata = result;
    }
    public get userInfoUpdata(): any {
        this._showingCoin = this._userInfoUpdata.userInfo.balance;
        this._readlyCoin = this._userInfoUpdata.userInfo.balance;
        return this._userInfoUpdata;
    }

    public updateUserInfoPush(mess: string, data: protoCommon.updateUserInfoPush, error: any): void {
        console.log("updateUserInfoPush", data)

        if (Number(core.CommonProto.getInstance().userinfo.userId) == Number(data.userInfo.userId)) {
            // if (data.update[0].key === protoCommon.update_param_type.add_scores) {
            //     this._showingCoin += Number(data.update[0].value);
            // } else {
            //     this._showingCoin -= Number(data.update[0].value);
            // }
            // game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SLOT_REFSH_BALANCE);
            //this._readlyCoin = data.userInfo.scores.toNumber();

        }
    }
    private _onRollingResp(msg, resp: protoSlot.spinResp) {
        // var balance =  (resp.balance as Long).toNumber();
        this._lastCoin = this._readlyCoin;
        this._readlyCoin = (resp.balance as Long).toNumber();
        // this._winCoin = (resp.spinResult.spinCoin as Long).toNumber();
    }

    //伪扣钱
    public deductMoney(money: number) {
        if (this._showingCoin - money >= 0) {
            this._showingCoin -= money;
        }
    }

    updateAllScore(msg: string, scores: number, awardScores: number) {
        if (awardScores) {//升级加分
            this._showingCoin = this._showingCoin + awardScores;
            this._readlyCoin = scores;
        } else {
            this._readlyCoin = this._showingCoin = scores === undefined ? (this.userInfo.scores as Long).toNumber() : scores;
        }
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SLOT_REFSH_BALANCE);
    }
    /**
     * 同步玩家显示的钱
     * @public
     * @for PlayerManager
     * @method syncShowingCoin
     * @param {number} [result = null] 要同步到的数量
     * 
     */
    public syncShowingCoin(result?: number) {
        // //神秘奖池金币拦截
        // if (SpinManager.instance.hasJpOrMystJp() && JPManager.instance.isShowing) {
        //     return;
        // }

        this._showingCoin = result || this._readlyCoin;
        //NetLogin.getInstance().RoleInfo.chips = this._showingCoin;
    }

    public updateRealCoin(num: number): void {
        this._readlyCoin = num;
    }

    /**
     * 显示的钱
     */
    public get showCoin(): number {
        return this._showingCoin;
    }

    public onBalancePush(balance: number) {
        this._readlyCoin += balance;
        this.syncShowingCoin();
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_PUB_CHIPS_PUSH);
    }

    /**
     *  赢得的钱
     */
    //     public get winCoin(): string {
    //         return (this._winCoin * 0.01).toFixed(2);
    //     }

    /**
     * 上一次金币
     */
    public get lastCoin(): number {
        return this._lastCoin;
    }
}