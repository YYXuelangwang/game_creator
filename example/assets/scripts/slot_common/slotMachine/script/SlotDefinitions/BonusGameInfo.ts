
/**
 * BonusGameInfo
 * 小游戏的信息
 */
export default class BonusGameInfo {
    constructor(bonusGameId: Long) {
        this.bonusGameId = bonusGameId;
        this.initlized = false;
    }

    public init(info: protoSlot.lgDataResp) {

        this.quantity = info.times;
        this.nowSceneId = info.sceneId;
        this._initHistory(info.history as protoSlot.lgResultType[]);
        this.betInfo = info.costInfo;
        this.rewardList = info.rewardList as protoSlot.lgResultType[];
        this.pickCardResult = info.pickCardResult;
        this.luckyGoldResultList = info.luckyGoldResultList
        this.initlized = true;
    }

    public dispose() {
        this.history = null;
    }

    /**
     * 小游戏 ID
     */
    public bonusGameId: Long;

    /**
     * 剩余次数
     */
    public quantity: number;

    /**
     * 当前场景ID
     */
    public nowSceneId: number;

    /**
     * 相关初始值
     */
    public betInfo: number;

    /**
     * 历史记录
     */
    public history: protoSlot.lgResultType[];

    /**
     * 所有的本场景的中奖结果
     */
    public rewardList: protoSlot.lgResultType[];

    /**
     * 总共赢的钱
     */
    public sumWinCoin: number = 0;

    public get isComplete(): boolean {
        return !!this.nextSceneInfo || !!this.nextState;
    }

    /**
     * 场景跳转信息
     * 如果为空，则表示还不能跳转
     */
    public nextSceneInfo?: protoSlot.lgNextType = null;

    public nextState?: protoSlot.stateType = null;

    public initlized: boolean = false;

    public pickCardResult:protoSlot.pickCardResultType[];

    public luckyGoldResultList:protoSlot.luckyGoldResultListType[];

    /**
     * 初始化历史记录
     * @param history 
     */
    private _initHistory(history: protoSlot.lgResultType[]) {
        this.history = [];
        if (history && history.length > 0) {
            for (var i: number = 0; i < history.length; ++i) {
                this.history.push(history[i]);
            }
        }

    }
}