import { LayerManage } from "../layer/LayerManage";

//横竖屏
export enum LAYOUT {
    landscape = "landscape",
    portrait = "portrait"
}


export enum Orientation {
    /**
     * 固定横屏
     */
    Landscape,
    /**
     * 固定竖屏
     */
    Portrait,
    /**
     * 横竖
     */
    Both
}

//canvas设计分辨率
export enum CANVAS_SIZE {
    width_1920 = 1920,
    height_1080 = 1080,
    width_1136 = 1136,
    height_640 = 640
}
//节点类型
export enum NODE_TYPE {
    sprite = "sprite",
    label = "label",
    node = "node",
    prefab = "prefab",
    component = "component"
}



//菜单栏类型
export enum MENU_TYPE {
    compensateTable = "compensateTable",
    back = "back",
    setting = "setting",
    record = "record",
    open = "open",
    friend = "friend",
    mode = "mode",
    feedback = "feedback",
}

//菜单栏事件类型
export enum MENU_EVENT_TYPE {
    open_compensateTable = "open_compensateTable",
    open_setting = "open_setting",
    open_record = "open_record",
    open_menu = "open_menu",
    close_help = "close_help",
    close_setting = "close_setting",
    close_record = "close_record",
    open_rollerMode = "open_rollerMode"
}



//音乐音效命名
export enum SOUND_NAME {
    /**正常游戏期间背景音乐（循环播放） */
    Game_Back_Music = "Game_Back_Music",
    /**正常获奖音效*/
    Prize_Normal = "Prize_Normal",
    /**获得大奖音效 */
    Prize_Big = "Prize_Big",
    /**获得巨奖音效 */
    Prize_Super = "Prize_Super",
    /**获得超级大奖音效 */
    Prize_Mega = "Prize_Mega",
    /**点击【旋转】按钮的音效  */
    Spin_Button_Sound = "Spin_Button_Sound",
    /**点击减投注按钮通用音效 (如果没有这个音效默认使用通用点击) */
    Bet_Minus_Button = "Bet_Minus_Button",
    /**点击加投注按钮通用音效 (如果没有这个音效默认使用通用点击) */
    Bet_Plus_Button = "Bet_Plus_Button",
    /**点击按钮通用音效  */
    Currency_Button = "Currency_Button",
    /**滚轴转动音效 */
    Reel_Spin = "Reel_Spin",
    /**滚轴停止音效 */
    Reel_Stop = "Reel_Stop",
    /**重转滚轴加速音效 */
    Reel_Quick = "Reel_Quick",
    /**轮播切换线音效 */
    Line_Switch = "Line_Switch",
    /**大奖赏币音效 */
    Coin = "Coin",
    /**中奖底部金币音效 */
    UICoin = "UICoin",
    /**分散音效 */
    Sctter = "Sctter",
    /**大奖停止*/
    Prize_Stop = "Prize_Stop",
    /**中奖底部金币结束音效 */
    UICoinEnd = "UICoinend",
    /**出现音效 */
    Appear_Wheel = "Appear_Wheel",
    /**megawin播完的循环音效 */
    Prize_Loop = "Prize_Loop",
    /**megawin播完的循环完的收尾 */
    Prize_Loop_End = "Prize_Loop_End",
    /**五连 */
    Full_Line = "Full_Line",
    /**免费结算 */
    Free_Game_Settlement = "Free_Game_Settlement",
    /**免费游戏触发 */
    Free_Start_Sound = "Free_Start_Sound",
    /**游戏急停 */
    Click_Reel_Stop = "Click_Reel_Stop",
    /**消除类全部从上方落下到滚轴完的音效 */
    Symbol_Drop = "Symbol_Drop",
    /**总展示大于两条线的音效 */
    Coin_Add = "Coin_Add",
    /**消除类全部从上方落下到滚轴完的音效 */
    Score_Appear = "Score_Appear",
    /**总展示大于两条线的音效 */
    Score_Ratio = "Score_Ratio",

    /**全部大奖总音效 */
    Prize_All = "Prize_All",
    /**全部大奖停止 */
    Prize_All_Stop = "Prize_All_Stop",
    /**bigwin金币出现*/
    Prize_Big_Coin = "Prize_Big_Coin",
    /**bigwin数字变化 */
    Prize_Big_Number = "Prize_Big_Number",
    /**bigwin文字出现 */
    Prize_Big_Text = "Prize_Big_Text",
    /**megawin金币出现 */
    Prize_Mega_Coin = "Prize_Mega_Coin",
    /**megawin数字变化 */
    Prize_Mega_Number = "Prize_Mega_Number",
    /**megawin文字出现 */
    Prize_Mega_Text = "Prize_Mega_Text",
    /**superwin金币出现 */
    Prize_Super_Coin = "Prize_Super_Coin",
    /**superwin数字变化 */
    Prize_Super_Number = "Prize_Super_Number",
    /**superwin文字出现 */
    Prize_Super_Text = "Prize_Super_Text",
    /**superwin文字出现 */
    Settle_Failed = "Settle_Failed",
    /**JP掉宝箱 */
    JP_Box_Drop = "JP_Box_Drop",
    /**JP幕布出现 */
    JP_Cloth = "JP_Cloth",
    /**JP飞到宝箱*/
    JP_Fly_To_Box = "JP_Fly_To_Box",
    /**JP 游戏的背景 */
    JP_Music = "JP_Music",
    /**JP 转到 */
    JP_Rolling = "JP_Rolling",
    /**JP 转动停止 */
    JP_Stop = "JP_Stop",
    /**JP 文字出现 */
    JP_Text_Show = "JP_Text_Show",
    /**JP 宝箱结果出现 */
    JP_Open_Box = "JP_Open_Box",
    /**JP 文字出现 人声*/
    JP_Voice = "JP_Voice",
    /**JP 金币循环音效 */
    JP_Coin_Loop = "JP_Coin_Loop",
    /**JP 金币结束音效 */
    JP_Coin_Stop = "JP_Coin_Stop",
    /**JP 金币背景音效 */
    JP_Coin_Music = "JP_Coin_Music",

    /**免费数字弹窗 */
    FreeGame_Trigger_Again = "FreeGame_Trigger_Again",

    /**点击滚轴元素音效 */
    CLICK_ELEMENT_VIEW = "Click_Element_View",



    //翻倍的音效
    Bg_Pop_Up = "bg_Pop_Up",
    Music_BGM = "music_BGM",
    Streamer = "streamer",
    Click_DH = "click_DH",
    Click_Effect = "click_Effect",
    Click_JC = "click_JC",
    DH_Effect = "DH_Effect",
    Coin_Rotate = "coin_Rotate",
    Over_Effect = "over_Effect",
    Num_Scroll = "num_Scroll"
}




//主界面节点名称
export enum MAIN_NODE_NAME {
    gameControl = "gameControl",//控制按钮
    player = "player",//玩家
    score = "score",//信息栏
    scene = "scene",//背景
    roller = "roller",//滚轴
    gameHead = "gameHead",//玩家头像
    jackPot = "jackPot",//奖池
    menu = "menu",//菜单栏
    gamePlayers = "gamePlayers",//多人共玩
    topBar = "topBar",//顶部栏
    banner = "banner",//跑马灯
    effect = "effect",//特效
    hashCiphertext = "hashCiphertext",//哈希密文
    hashEntrance = "hashEntrance",
    buySpinSlot = "buySpinSlot",
}

export enum WinAniType {
    None = 0,
    Normal = 1,//普通奖
    Small = 2,  //big win
    Middle = 3,//super win
    Great = 4,//Mega win
}