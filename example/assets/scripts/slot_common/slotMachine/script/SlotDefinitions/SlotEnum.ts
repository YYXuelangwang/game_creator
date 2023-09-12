

/**
 * 滚轴滚动的方向
 */
export enum SlotOrientation {
    Landscape = 1, // 横向，按X轴
    Portrait = 2, // 纵向, 按Y轴
}

export enum DrawLineType {
    Draw = 1,
    Picture = 2,
}

/*
* 赢取JP奖池的回调点
*/
export enum WinJPPoolInjectPoint {
    BeforeAnimation = 1,
    AfterAnimation = 2
}

// 定义默认音效
export enum SoundAssetsConfig {
    GAME_BACK_MUSIC = "GAME_BACK_MUSIC",    //背景音乐
    SPIN_BUTTON_SOUND = "SPIN_BUTTON_SOUND", //SPIN按钮点击音效
    FREE_GAME_BACK_MUSIC = "FREE_GAME_BACK_MUSIC", //免费游戏背景音乐
    BOUNS_GAME_BACK_MUSIC = "BOUNS_GAME_BACK_MUSIC", //小游戏免费音乐
    REEL_SPIN_SOUND = "REEL_SPIN_SOUND", //滚轴滚动音效
    REEL_STOP_SOUND = "REEL_STOP_SOUND", //滚轴停止音效
    REEL_QUICK_SOUND = "REEL_SPIN_QUICK",//快速滚动音效
    BET_PLUS_BUTTON = "BET_PLUS_BUTTON", //押线"+"按钮音效
    BET_MINUS_BUTTON = "BET_MINUS_BUTTON", // 押线"-"按钮音效
    CLICK_REEL_STOP = "CLICK_REEL_STOP",    //点击滚轴停止音效
    Free_Start_Sound = "Free_Start_Sound",//触发免费游戏时的音效
    Bonus_Game_Start_Sound = "Bonus_Game_Start_Sound",//小游戏触发的音效
    CURRENCY_BUTTON = "CURRENCY_BUTTON",//通用按钮音效
    PRIZE_NORMAL = "PRIZE_NORMAL", //普通奖励音效
    PRIZE_LITTLE = "PRIZE_LITTLE",  //小奖音效
    PRIZE_MID = "PRIZE_MID",    //中等奖音效
    PRIZE_BIG = "PRIZE_BIG",    //大奖音效
    PRIZE_5 = "PRIZE_5", //全中音效
    REEL_START = "REEL_START", //滚轴开始音效
    PRIZE_END = "PRIZE_END", //奖励停止音效
    Prize_Coin = "Prize_Coin", //抛金币音效
    Prize_rool_num = "Prize_rool_num",  //数字滚动音效
    LINE_CHANGE_SOUND = "LINE_CHANGE_SOUND", //切换线
    JACKPOT_OPEN = "JACKPOT_OPEN", //JP开宝箱
    JACKPOT_START = "JACKPOT_START", //JP登场
    GOLD_ROLL = "GOLD_ROLL", //金币滚动,
}

/**
 * 滚轴的中奖类型
 */
export enum WinType {
    None = 0,
    Normal = 1,  //普通奖
    Small = 2,  //小奖
    Middle = 3,//中奖
    Great = 4,//大奖
    FullLine = 6,//某条线全中
    ContinusUnHitted = 7,//连续未中
    BonusGame = 8,//小游戏(触发小游戏)
    BonusGameGainRewards = 9,//小游戏赢取奖赏
    BonusGameOver = 10,//小游戏结束
    FreeGameTriggered = 11,//触发了免费游戏
}

/**
 * 滚轴旋转方向
 */
export enum RollingDirection {
    Up = -1,
    Down = 1
}
/**游戏状态 */
export enum OperationState {
    None = 0,
    /**正常转 */
    Normal = 1,
    /**免费转 */
    Free = 2,           //
    /**重转 */
    ReSpin = 3,         //
    /**小游戏 */
    BonusGame = 4,  //
    UnchangeableBet = 5,
}

export enum RewardsType {
    /**
     * 金币
     */
    Coin = 0,

    /**
     * 免费游戏次数
     */
    FreeGameQuantity = 1,

    /**
     * 结果倍率递增系数
     */
    ResultRateAccFactor = 2,

    /**
     * 结果倍率设置
     */
    ResultRateSetting = 3,

    /**
     * 随机百搭
     */
    RandomWild = 4,


    /**
     * 随机分散
     */
    RandomScatter = 5,

    /**
     * 指定滚轴
     */
    SpecifyReel = 6,

    /**
     * 元素结果倍率影响
     */
    ElementResultRateEffect = 7,

    /**
     * 元素免费次数影响
     */
    ElementFreeQuantityEffect = 8,

    /**
     * 元素固定在的位置
     */
    ElementFixedPos = 9,

    /**
     * 增加可选数量
     */
    AddingChoice = 10,

    /**
     * 结果倍率增加
     */
    AddingResultRate = 11,

    /**
     * 收集增加免费次数
     */
    CollectionAddingFreeQuantity = 12,

    /**
     * 收集增加扩展
     */

    /**
     * 收集增加金币
     */
    CollectionAddingCoin = 14,

    /**
     * 金币倍率增加
     */
    AddingCoinRate = 15,

    /**
     * 收集金币倍率增加
     */

    /**
     * 神奇符号
     */
    MagicalSymbol = 17,

    /**
     * 金币系数
     */
    CoinFactor = 18,

    /**
     * 收集金币系数
     */

    /**
     * 奖励小游戏
     */
    BonusGame = 20,

}


export enum GameMode {
    /**
     * 开发版
     */
    Develop = 1,

    /**
     * 发行版
     */
    Release = 2,
}