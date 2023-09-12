import DataPayLine from '../SlotData/DataPayLine';
import DataElement from '../SlotData/DataElement';
import DataFreeLines from '../SlotData/DataFreeLines';
import DataGame from '../SlotData/DataGame';
import DataRoller from '../SlotData/DataRoller';
import { SDictionary } from '../SlotData/SDictionary';
import DataFreeRoller from '../SlotData/DataFreeRoller';

export default class SlotConfigManager {

    private static _instance: SlotConfigManager = null;
    public static get instance(): SlotConfigManager {
        if (this._instance == null) {
            this._instance = new SlotConfigManager();
        }
        return this._instance;
    }

    private _dataGame: DataGame = null;                   //基础信息类名
    private _dataPayLine: DataPayLine = null;                //奖赏线类名
    private _dataFreePayLine: DataFreeLines;                   //免费线路表
    private _dataElement: DataElement = null;                //元素表
    private _dataRoller: DataRoller = null;
    private _dataFreeRoller: DataFreeRoller = null;
    private _dataPos: any = null;                    //滚轴位置信息类
    private _lineCostList: number[] = [];            //可下押线列表
    private _autoTimesList: number[] = [];           //可自动游戏次数列表
    private _totalLineIds: number[] = [];            //所有奖赏线的ID列表
    private _maxLineNum: number;                     //最大线数
    private _minLineNum: number;                     //最小线数
    private _rewardsEffectsConditions: number[] = [];//中奖特效条件列表

    /**中奖类型（大中小普通奖励）的判断区域基础配置数值 （key:中奖类型；value:中将类型最低倍数）*/
    private _winAnimationConditionMap = {};


    private _gameID: number;

    private _registeredJPTypes: number[] = [];        //注册过的所有的JP奖池类型

    private _lineValueMultiples: number[] = [];

    private _lineRates: number[] = [];


    private configMap: SDictionary = null;
    private _gameIDs: number[];
    private _defaultGameID: number;
    private _isMultipleGame: boolean = false;
    private dataGridMap: SDictionary = null;


    constructor() {
        this.configMap = new SDictionary();
        this.dataGridMap = new SDictionary();
        this._gameIDs = [];
    }

    public init(conf) {
        if (conf instanceof Array) {
            this.initDataGame(conf);
        } else {
            for (let gameID in conf) {
                this.configMap.set(gameID, conf[gameID]);
            }
            this.changeGameID(this.gameID);
        }
        this._initConf();
        this._initMinMaxLine();
        this._initWinAnimationCondition();
        this._initLineCostInfo();
        this._initAutoTimesInfo();
        this._initPayLineIds();
        this._initRewardsEffectsCondition();
        this._initlineValueMultiples();
        this._initLineLineRate();
        this._initRateGap();


    }

    public initDataGame(conf: any[]) {
        console.log("initDataGame")
        for (var key in conf) {
            if (conf[key]._name == "DataGame")
                DataGame.instance.conf = conf[key].json;
            if (conf[key]._name == "DataPayLine")
                DataPayLine.instance.conf = conf[key].json;
            if (conf[key]._name == "DataElement")
                DataElement.instance.conf = conf[key].json;
            if (conf[key]._name == "DataFreeLines")
                DataFreeLines.instance.conf = conf[key].json;
            if (conf[key]._name == "DataRoller")
                DataRoller.instance.conf = conf[key].json;
            if (conf[key]._name == "DataFreeRoller")
                DataFreeRoller.instance.conf = conf[key].json;
        }
    }

    public getDataGameByGameID(gameID: number): any {
        let conf = this.configMap.get(gameID);
        for (var key in conf) {
            if (conf[key]._name == "DataGame") {
                return conf[key].json.data[gameID];
            }
        }
    }

    public changeGameID(gameId: number): void {
        let conf = this.configMap.get(gameId);
        this.gameID = gameId;
        if (conf) {
            this.initDataGame(conf);
            this._initConf();
            this._initMinMaxLine();
            this._initWinAnimationCondition();
            this._initLineCostInfo();
            this._initAutoTimesInfo();
            this._initPayLineIds();
            this._initRewardsEffectsCondition();
            this._initlineValueMultiples();
            this._initLineLineRate();
            this._initRateGap();
        }
    }



    private _initConf() {
        this._dataGame = DataGame.instance;
        this._dataPayLine = DataPayLine.instance;
        this._dataElement = DataElement.instance;
        this._dataFreePayLine = DataFreeLines.instance;
        this._dataRoller = DataRoller.instance;
        this._dataFreeRoller = DataFreeRoller.instance
    }

    // 初始化线数
    private _initMinMaxLine() {
        // this._gameID = 3318;
        // let gameType = this._dataGame.getData(this._gameID).type;
        // //let payLineLack = gameType==4||gameType==6;//类型4或6时没有连线配置
        // let payLineLack = this.isPlayLineConfigLack();
        // this._maxLineNum = payLineLack ? 0 : this._dataGame.getData(this._gameID).maxLines
        // this._minLineNum = payLineLack ? 0 : this._dataGame.getData(this._gameID).minLines
        this._gameID || (this._gameID = core.Global.gameId);
        this._maxLineNum = this._dataGame.getData(this._gameID).maxLines
        this._minLineNum = this._dataGame.getData(this._gameID).minLines
    }

    /**
     * 奖励动画条件映射
     */
    private _initWinAnimationCondition() {
        this._winAnimationConditionMap = {};
        let conditions: { winningType, rate }[] = this._dataGame.getData(this.gameID).winningAnimationConditions;
        for (var i: number = 0, len = conditions.length; i < len; ++i) {
            this._winAnimationConditionMap[conditions[i].winningType] = conditions[i].rate;
        }
    }

    /**
     * 初始化押线信息
     */
    private _initLineCostInfo() {
        let cfg = this.DataGame.getData(this.gameID);
        if (!cfg) return this._lineCostList = [];
        this._lineCostList = cfg.lineValue;
    }

    /**
     * 初始化自动次数信息
     */
    private _initAutoTimesInfo() {
        // 初始化
        let cfg = this.DataGame.getData(this.gameID);
        this._autoTimesList = cfg.autoSpinTimes;
    }

    /**
     * 初始化奖赏线ID列表
     */
    private _initPayLineIds() {
        // 当前线,默认取最大线
        this._totalLineIds = this.DataPayLine.getIds();
    }

    /**
     * 初始化奖励特效条件
     */
    private _initRewardsEffectsCondition() {
        let base = this.DataGame.getData(this.gameID)
        this._rewardsEffectsConditions = base.winningAnimationConditions;
    }

    /**
 * 初始化奖励特效条件
 */
    private _initlineValueMultiples() {
        let base = this.DataGame.getData(this.gameID);
        this._lineValueMultiples = base.lineValueMultiple || [];
    }

    /**
    * 初始化奖励特效条件
    */
    private _initLineLineRate() {
        let base = this.DataGame.getData(this.gameID);
        this._lineRates = base.lineRate || [];
    }

    // 初始化子项目的加减注数据列表
    private _initRateGap() {
        let base = this.DataGame.getData(this.gameID);
        const data = base.rateXulie && JSON.parse(base.rateXulie);
        this._rateGaps = data && data.map(v => { return { size: v[0], level: v[1] } }) || [];
    }

    /**
    * 奖赏线类名
    */
    public get DataPayLine(): DataPayLine {
        return this._dataPayLine;
    }
    public set DataPayLine(data: DataPayLine) {
        this._dataPayLine = data;
    }
    /**
     * 免费线路表
     */
    public get DataFreePayLine(): DataFreeLines {
        return this._dataFreePayLine;
    }
    public set DataFreePayLine(data: DataFreeLines) {
        this._dataFreePayLine = data;
    }
    /**
     * 基础信息类名
     */
    public get DataGame(): DataGame {
        if (this._dataGame) {
            return this._dataGame;
        } else {
            this._dataGame = DataGame.instance;
            return this._dataGame;
        }
    }
    public set DataGame(data: DataGame) {
        this._dataGame = data;
    }
    /**
     * 元素表
     */
    public get DataElement(): DataElement {
        return this._dataElement;
    }
    public set DataElement(data: DataElement) {
        this._dataElement = data;
    }

    /**
     * 元素表
    */
    public get DataRoller(): DataRoller {
        return this._dataRoller;
    }
    public set DataRoller(data: DataRoller) {
        this._dataRoller = data;
    }
    /**
 * 元素表
*/
    public get DataFreeRoller(): DataFreeRoller {
        return this._dataFreeRoller;
    }
    public set DataFreeRoller(data: DataFreeRoller) {
        this._dataFreeRoller = data;
    }
    /**
     * 滚轴位置信息类 
     */
    public get DataPos() {
        return this._dataPos;
    }
    /**
     * 可下押线列表
     */
    public get lineCostList() {
        return this._lineCostList;
    }
    /**
     * 可自动游戏次数列表
     */
    public get autoTimesList(): number[] {
        return this._autoTimesList;
    }
    /**
     * 所有奖赏线的ID列表
     */
    public get totalLineIds(): number[] {
        return this._totalLineIds;
    }
    /**
     * 最大线数
     */
    public get maxLineNum(): number {
        return this._maxLineNum;
    }
    /**
     * 最小线数
     */
    public get minLineNum(): number {
        return this._minLineNum;
    }
    /**
     * 中奖特效条件列表
     */
    public get rewardsEffectsConditions(): number[] {
        return this._rewardsEffectsConditions;
    }

    /**
   * 
   */
    public get lineValueMultiples(): number[] {
        return this._lineValueMultiples;
    }

    private _rateGaps: { size: number, level: number }[];
    public get rateGaps(): { size: number, level: number }[] {
        return this._rateGaps;
    }

    /**
     * 
     */
    public get lineRates(): number[] {
        return this._lineRates;
    }

    /**
     * 游戏ID
     */
    public get gameID() {
        return this._gameID;
    }
    public set gameID(data) {
        this._gameID = data;
    }

    public get gameIDs() {
        return this._gameIDs;
    }

    public set defaultGameID(data) {
        this._defaultGameID = data;
    }

    public get defaultGameID() {
        return this._defaultGameID;
    }

    /**
     * 获取奖励动画条件,中奖类型（大中小普通奖励）的判断区域基础配置数值
     * @param winType 
     */
    public getWinAnimationCondition(winType: number): number | undefined {
        return this._winAnimationConditionMap[winType];
    }

    /**
     * 注册JP奖池类型
     * @param types 
     */
    public registerJPTypes(...types: number[]) {
        if (!types) return;
        let len: number = types.length;
        if (len <= 0) return;
        let index: number = -1;
        for (var i: number = 0; i < len; ++i) {
            index = this._registeredJPTypes.indexOf(types[i]);
            if (index >= 0) continue;
            this._registeredJPTypes.push(types[i]);
        }
    }

    /**
     * 注册多套游戏的id
     * @param gameIDs 游戏id列表
     * @param defaultGameID 默认的游戏id
     */
    public registerGameIds(gameIDs: number[], defaultGameID: number): void {
        this._gameIDs = gameIDs;
        this._defaultGameID = this._gameID = defaultGameID;
        this._isMultipleGame = true;
    }

    public get isMultipleGame(): boolean {
        return this._isMultipleGame;
    }

    public get registeredJPTypes(): number[] {
        return this._registeredJPTypes;
    }



    dispose() {
        this._dataGame = null;                   //基础信息类名
        this._dataPayLine = null;                //奖赏线类名
        this._dataFreePayLine = null;                   //免费线路表
        this._dataElement = null;                //元素表
        this._dataRoller = null;
        this._dataPos = null;                    //滚轴位置信息类
        this._lineCostList;            //可下押线列表
        this._autoTimesList = null;           //可自动游戏次数列表
        this._totalLineIds.length = null;            //所有奖赏线的ID列表
        this._rewardsEffectsConditions = null;//中奖特效条件列表
        this._winAnimationConditionMap = null;          //奖励动画条件映射

    }
}