import BonusGameInfo from "../SlotDefinitions/BonusGameInfo";
import BonusGameManager from "../SlotManager/BonusGameManager";
import { RewardsType, WinType } from "../SlotDefinitions/SlotEnum";
import { GameEventNames } from "../SlotConfigs/GameEventNames";
import SlotUtils from "../SlotUtils/SlotUtils";
import BaseView from "../../../main/BaseView";
/**
 * AbstractBonusGameView
 */
export default abstract class AbstractBonusGameView extends BaseView {
    constructor() {
        super();

    }

    onLoad() {
        this.addEventListener()
    }

    start() {
    }
    /**
     * 小游戏信息
     */
    public get bonusGameInfo(): BonusGameInfo {
        return BonusGameManager.instance.bonusGameInfo;
    }
    // private _bonusGameInfo:BonusGameInfo = null;

    /**
     * 本轮小游戏总共的奖励映射表
     * 格式：
     *      {
     *          RewardsType:rewardsValue
     *      }
     */
    public get totalRewardsMap(): {} {
        return this._totalRewardsMap;
    }
    private _totalRewardsMap: {} = {};

    /**
     * 场景奖励映射表
     * 格式:
     * {
     * "sceneId":{
     *      RewardsType: rewardValue
     *  }
     * }
     */
    protected get sceneRewardsMap(): {} {
        return this._sceneRewardsMap;
    }
    private _sceneRewardsMap: {} = {};

    /**
     * 上次操作的结果列表
     * 比如，小游戏是掷色子，则此处结果列表长度为1，内容为色子点数
     * 而此次操作获得的奖励则通过
     */
    public get lastOperateResults(): number[] {
        return this._lastOperateResults;
    }
    private _lastOperateResults: number[] = [];

    /**
     * 游戏的操作历史记录
     */
    public get history(): protoSlot.lgResultType[] {
        if (!this.bonusGameInfo) return [];
        return this.bonusGameInfo.history;
    }

    /**
     * 析构函数
     */
    public dispose() {
        this.removeEventListener();
    }

    /**
     * 初始化时的回调
     */
    protected onInit() {
        this._initRewards();
    }

    /**
     * 获取上一次小游戏操作的结果
     * @protected
     * @method getLastActionResult
     * @return {protocol.LgResultType}
     */
    protected getLastActionResult(): protoSlot.lgResultType {
        return BonusGameManager.instance.lastActionResult;
    }

    /**
     * 获取上次的小游戏操作回复
     */
    protected getLastActionResp(): protoSlot.lgActionResp {
        return BonusGameManager.instance.actionResp;
    }

    protected getLastRewards(rewardsType: RewardsType): number {
        let res: protoSlot.lgResultType = this.getLastActionResult();
        if (res.reward.length <= 0) return 0;
        let idx: number = SlotUtils.findIndexFromArray(res.reward, (e, i, arr) => {
            return e.rewardType === rewardsType;
        });
        if (idx < 0) return 0;
        return (res.reward[idx].number as Long).toNumber();
    }

    /**
     * 判断当次小游戏操作是否有赢奖
     */
    protected isWin(rewards?: protoSlot.lgResultType.lgRewardType[]): boolean {
        rewards = rewards || this.getLastActionResult().reward as protoSlot.lgResultType.lgRewardType[];
        let len: number = rewards.length;
        if (len <= 0) return false;
        for (var i: number = 0; i < len; ++i) {
            if (rewards[i].number > 0) return true;
        }
        return false;
    }

    /**
     * 获取中奖类型（大，中，小，普通）如果未中奖返回WinType.None
     */
    protected getWinType(): WinType {
        return SlotUtils.getWinType(this.getLastRewards(RewardsType.Coin), this.bonusGameInfo.betInfo);
    }

    /**
     * 获取本轮小游戏所有操作的结果
     * @protected
     * @method getActionResults
     * @return {protocol.LgResultType[]}
     */
    // protected getActionResults():protocol.LgResultType[]
    // {
    //     return BonusGameManager.instance.actionResults;
    // }



    /**
     * 玩家进行了一次小游戏操作
     * 调用此函数通知服务器:玩家进行了一次小游戏操作
     * 如果操作成功返回true,否则返回false
     */
    protected operate(choose: number[] = []): boolean {
        if (!this.bonusGameInfo) return false;
        if (this.bonusGameInfo.quantity <= 0) {
            console.log(`lack of operate times!`);
            return false;
        }

        this._lastOperateResults = null;
        BonusGameManager.instance.requestAction(choose);
        return true;
    }

    /**
     * 切换小游戏场景
     */
    protected onChangeScene?(nextSceneInfo: protoSlot.lgNextType): void;

    /**
     * 小游戏动作结果更新回调
     */
    protected onActionResult?(): void;

    /**
     * 下一步，当小游戏完成当前场景操作后（根据文档需求自行决定是否需要由玩家手动触发），.
     * 请调用此函数进行场景跳转或回到主界面（如果没有下一个场景了）框架会判断和处理是否可以跳转
     */
    protected next(): void {
        this._checkAndChangeScene();
    }

    /**
     * 添加事件监听
     */
    protected addEventListener(): void {
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_BONUS_GAME_ACTION_RESPONSED, this._onActionResultUpdated, this);
    }

    /**
     * 移除事件监听
     */
    protected removeEventListener(): void {
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_BONUS_GAME_ACTION_RESPONSED, this._onActionResultUpdated, this);
    }

    /**
     * 检查是否可以跳转到下一场景，如果检查成功，则进行跳转
     * 检查包括:1. 玩家是否发起了跳转的请求
     *         2. 服务器是否已经允许跳转到下一场景
     */
    private _checkAndChangeScene(): void {
        if (this.bonusGameInfo.nextSceneInfo) {
            this.onChangeScene && this.onChangeScene(this.bonusGameInfo.nextSceneInfo);
            // 更新场景ID
            this.bonusGameInfo.nowSceneId = this.bonusGameInfo.nextSceneInfo.sceneId;
            return;
        }

        if (this.bonusGameInfo.nextState) return this._goToNextState(this.bonusGameInfo.nextState);
        // if(this.bonusGameInfo.)
    }

    /**
     * 跳转到下一个状态
     */
    private _goToNextState(nextState: protoSlot.stateType) {
        // 退出
        // UIManager.instance.hideWindow(this);
        BonusGameManager.instance.onBonusGameFinished();
    }

    /**
     * 小游戏的操作结果更新了
     */
    private _onActionResultUpdated(): void {
        this._renderResult(this.getLastActionResult());
        this.onActionResult && this.onActionResult();
    }

    private _renderResult(result: protoSlot.lgResultType): void {

        this._renderOperateResults(result);
        // 处理操作奖励
        this._renderResultRewards(result);

    }

    private _renderOperateResults(lastResult: protoSlot.lgResultType) {
        // let lastResult:protocol.LgResultType = this.getLastActionResult(); // 上次游戏操作的结果
        this._lastOperateResults = lastResult.result;
    }
    /**
     * 处理奖励结果
     */
    private _renderResultRewards(lastResult: protoSlot.lgResultType): void {
        // 处理操作奖励
        // let lastResult:protocol.LgResultType = this.getLastActionResult(), // 上次游戏操作的结果
        let sceneId: number = lastResult.sceneId,    // 操作的场景ID
            rewards: protoSlot.lgResultType.lgRewardType[] = lastResult.reward as protoSlot.lgResultType.lgRewardType[], // 操作的奖励列表
            rewardsLen: number;  // 奖励列表长度
        if (!lastResult.reward || (rewardsLen = rewards.length) <= 0) return;

        // 是否已经存在本场景的奖励数据,及初始化
        let sceneRewards: {} = this._sceneRewardsMap[sceneId];
        if (!sceneRewards) {
            this._sceneRewardsMap[sceneId] = {};
            sceneRewards = this._sceneRewardsMap[sceneId];
        }

        let oldSceneValue: number = 0;
        let oldValue: number = 0;
        let reward: protoSlot.lgResultType.lgRewardType;
        for (var i: number = 0; i < rewardsLen; ++i) {
            reward = rewards[i];
            // 将奖励添加到本场景的奖励列表中去                
            oldSceneValue = sceneRewards[reward.rewardType] || 0;
            sceneRewards[reward.rewardType] = oldSceneValue + (reward.number as Long).toNumber();

            // 将奖励添加到本次小游戏的总奖励列表中去
            oldValue = this._totalRewardsMap[reward.rewardType] || 0;
            this._totalRewardsMap[reward.rewardType] = oldValue + (reward.number as Long).toNumber();
        }

        // 更新总共赢取的金币
        this.bonusGameInfo.sumWinCoin = this._totalRewardsMap[RewardsType.Coin] || 0;

    }

    /**
     * 初始化奖励
     */
    private _initRewards() {
        let results: protoSlot.lgResultType[] = this.history;
        for (var i: number = results.length - 1; i >= 0; --i) {
            this._renderResult(results[i]);
        }
    }

    onDestroy() {
        super.onDestroy();
        this.dispose();
    }
}
