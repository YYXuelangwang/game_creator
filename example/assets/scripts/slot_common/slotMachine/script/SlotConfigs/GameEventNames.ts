export enum GameEventNames {
    /**
     * 脚本加载完成事件
     */
    EVENT_DYNAMIC_SCRIPT_LOADED = "EVENT_DYNAMIC_SCRIPT_LOADED",

    /**
    * 脚本加载过程中
    */
    EVENT_DYNAMIC_SCRIPT_LOADING = "EVENT_DYNAMIC_SCRIPT_LOADING",

    /**
     * 收到了滚轴还原的信息
     */
    EVENT_LAST_GAME_INFO_GET = "EVENT_LAST_GAME_INFO_GET",

    // 本地数据准备完成
    EVENT_LOCAL_REALY_COMPLETE = "EVENT_LOCAL_REALY_COMPLETE",


    /**
     * 收到服务器发来的错误消息
     */
    EVENT_GAME_ERROR_MSG = "EVENT_GAME_ERROR_MSG",

    /**
     * 用户统计连接发SOCKET
     */
    EVENT_USERSTATISTICS_SOCKET_CONNECTED = "EVENT_USERSTATISTICS_SOCKET_CONNECTED",

    /**
     * 用户统计SOCKET连接出错
     */
    EVENT_USERSTATISTICS_SOCKET_ERROR = "EVENT_USERSTATISTICS_SOCKET_ERROR",


    /**
     * 用户统计SOCKET连接关闭
     */
    EVENT_USERSTATISTICS_SOCKET_CLOSE = "EVENT_USERSTATISTICS_SOCKET_CLOSE",

    /**
     * 必须资源加载完毕
     *
     */
    EVENT_NECESSARY_ASSETS_LOADED = "EVENT_NECESSARY_ASSETS_LOADED",

    /**
     * 玩压的线数发生了改变
     */
    EVENT_LINE_NUM_CHANGED = "EVENT_PLAYER_LINE_NUM_CHANGED",

    /**
     * 玩家的押线发生了变化
     */
    EVENT_LINE_COST_CHANGED = "EVENT_PLAYER_LINE_COST_CHANGED",
    /**
     * 更新玩家的押线
     */
    EVENT_UPDATE_LINE_COST = "EVENT_UPDATE_LINE_COST",

    /**
     * turbo状态发生了改变
     */
    EVENT_TURBO_STATUS_CHANGD = "EVENT_TURBO_STATUS_CHANGD",

    /**
     * 左右手发生了变化
     */
    EVENT_HANDS_MODE_CHANGED = "EVENT_HANDS_MODE_CHANGED",

    /**
     * 自动游戏次数发生了变化
     */
    EVENT_AUTO_TIMES_CHANGED = "EVENT_AUTO_TIMES_CHANGED",

    /**
     * 自动游戏剩余次数发生了变化
     */
    EVENT_REST_AUTO_TIMES_CHANGED = "EVENT_REST_AUTO_TIMES_CHANGED",

    /**
     * 自动游戏状态发生了变化
     */
    EVENT_AUTO_STATE_CHANGED = "EVENT_AUTO_STATE_CHANGED",

    /**
     * 开始按钮可见状态发生了改变
     */
    EVENT_START_BTN_VISIBLE_CHANGED = "EVENT_START_BTN_VISIBLE_CHANGED",

    /**
     * 玩家开始了单次游戏(按下了单次按钮)
     */
    EVENT_PLAYER_CLICKED_SINGLE_START_BTN = "EVENT_PLAYER_CLICKED_SINGLE_START_BTN",

    EVENT_WIN_SCORE_STOP = "EVENT_WIN_SCORE_STOP",

    /**
     * 玩家弹出了押线设置窗口
     */
    EVENT_LINE_SETTING_VIEW_POPUP = "EVENT_LINE_SETTING_VIEW_POPUP",

    /**
     * 玩家点击了多次游戏的按钮
     */
    EVENT_PLAYER_CLICKED_MULTI_START_BTN = "EVENT_PLAYER_CLICKED_MULTI_START_BTN",

    // 点击滚轴
    EVENT_PLAYER_CLICKED_SLOTMACHINE = "EVENT_PLAYER_CLICKED_SLOTMACHINE",
    // 滑动滚轴
    EVENT_PLAYER_SLID_SLOTMACHINE = "EVENT_PLAYER_SLID_SLOTMACHINE",


    /**
    * 滚轴动作完成,包括:
    * 1. 单次旋转完成（滚轴停止了）
    * 2. 多次游戏时，完成了一次旋转并显示完了所有在押线奖励
    */
    EVENT_SLOT_MACHINE_COMPLETED = "EVENT_SLOT_MACHINE_COMPLETED",

    /**
     * 滚轴停止了旋转
     */
    EVENT_SLOT_MACHINE_STOPPED = "EVENT_SLOT_MACHINE_STOPPED",

    /**
     * 滚轴展示线完成了，目前只对免费游戏有效
     */
    EVENT_SHOW_LINE_OVER = "EVENT_SHOW_LINE_OVER",

    /**
     * 主游戏结束
     */
    // EVENT_MAIN_GAME_COMPLETED = "EVENT_MAIN_GAME_COMPLETED",
    /**
     * 设置跑马灯信息 传参index数组索引
     */
    EVENT_SLOT_BANNER_SETINFO = "EVENT_SLOT_BANNER_SETINFO",

    /**
     * 停止跑马灯
     */
    EVENT_SLOT_BANNER_STOP = "EVENT_SLOT_BANNER_STOP",
    /**
     * 开始跑马灯
     */
    EVENT_SLOT_BANNER_START = "EVENT_SLOT_BANNER_START",
    /**
     * 通知滚轴开始滚动
     */
    EVENT_START_ROLLING = "EVENT_START_ROLLING",

    /**
     * 滚轴结果返回了
     */
    EVENT_ROLL_RESULT_RESP = "EVENT_ROLL_RESULT_RESP",



    /**
     * 游戏类型改变了,如正常游戏，小游戏，免费游戏等
     */
    EVENT_GAME_TYPE_CHANGED = "EVENT_GAME_TYPE_CHANGED",

    /**
     * 玩家基础数据更新了
     */
    EVENT_PLAYER_DATA_UPDATED = "EVENT_PLAYER_DATA_UPDATED",

    /**
     * 点击了空白区域
     */
    EVENT_CLICKED_BLANK_AREA = "EVENT_CLICKED_BLANK_AREA",

    /**
     * 玩家金币发生了变化
     */
    EVENT_PLAYER_COIN_CHANGED = "EVENT_PLAYER_COIN_CHANGED",

    /**
     * 玩家显示的钱发生了变化
     */
    EVENT_PLAYER_SHOWING_COIN_CHANGED = "EVENT_PLAYER_SHOWING_COIN_CHANGED",

    /**
     * 玩家是否正在进行游戏的状态改变了
     */
    // EVENT_IN_GAME_STATE_CHANGED = "EVENT_IN_GAME_STATE_CHANGED",
    /**
     * 玩家赢取的金币发生了变化
     */
    EVENT_WIN_COIN_CHANGED = "EVENT_WIN_COIN_CHANGED",

    /**
     * 提前停止滚轴
     */
    EVENT_ADVANCE_STOPPING_SLOT_MACHINE = "EVENT_ADVANCE_STOPPING_SLOT_MACHINE",

    /**
     * 重置滚轴
     */
    EVENT_RESET_SCROLLER = "EVENT_RESET_SCROLLER",

    /**
     * 小游戏操作回复了
     */
    EVENT_BONUS_GAME_ACTION_RESPONSED = "EVENT_BONUS_GAME_ACTION_RESPONSED",

    /**
     * 小游戏结束了
     */
    EVENT_BONUS_GAME_FINISEH = "EVENT_BONUS_GAME_FINISEH",
    //小游戏界面关闭
    EVENT_JP_GAME_VIEW_CLOSE = "EVENT_BONUS_GAME_VIEW_CLOSE",

    /**
     * 立即停止滚轴
     */
    EVENT_STOP_SLOT_MACHINE_IMMEDIATELY = "EVENT_STOP_SLOT_MACHINE_IMMEDIATELY",

    /**
     * 游戏声音状态发生了变化
     */
    EVENT_GAME_SOUND_STATUS_UPDATED = "EVENT_GAME_SOUND_STATUS_UPDATED",

    /**
     * 按下了键盘
     */
    EVENT_KEY_DOWN = "EVENT_KEY_DOWN",

    /**
     * 触发了新的免费游戏
     */
    EVENT_NEW_FREE_GAME_TRIGGERED_TASK = "EVENT_NEW_FREE_GAME_TRIGGERED_TASK",

    /**
     * 再次触发了免费游戏
     */
    EVENT_NEW_FREE_GAME_TRIGGERED_AGAIN_TASK = "EVENT_NEW_FREE_GAME_TRIGGERED_AGAIN_TASK",

    /**
     * 触发了新的重转
     */
    // EVENT_NEW_RE_SPIN_TRIGGERED = "EVENT_NEW_RE_SPIN_TRIGGERED",
    /**
     * 免费游戏信息更新了
     */
    EVENT_FREE_GAME_INFO_UPDATED = "EVENT_FREE_GAME_INFO_UPDATED",

    /**
    * 免费游戏信息更新任务
    */
    EVENT_FREE_GAME_INFO_UPDATED_TASK = "EVENT_FREE_GAME_INFO_UPDATED_TASK",

    /**
    * 结算前的免费游戏信息更新任务
    */
    EVENT_FREE_GAME_INFO_UPDATED_BEFORE_REWARD_TASK = "EVENT_FREE_GAME_INFO_UPDATED_BEFORE_REWARD_TASK",

    /**
     * 显示或隐藏免费游戏信息
     */
    EVENT_SHOW_FREE_GAME_INFO = "EVENT_FREE_GAME_INFO_UPDATED",

    /**
     * 免费游戏次数更新了
     */
    EVENT_FREE_GAME_TIMES_UPDATED = "EVENT_FREE_GAME_TIMES_UPDATED",

    /**
     * 重转信息更新了
     */
    // EVENT_RE_SPIN_INFO_UPDATED = "EVENT_RE_SPIN_INFO_UPDATED",
    /**
     * 免费游戏结束了
     */
    EVENT_FREE_GAME_OVER = "EVENT_FREE_GAME_OVER",

    /**
     * 游戏开始刷新快速自动按钮状态（）
     */
    EVENT_COMMON_BTN_BYFREE = "EVENT_COMMON_BTN_BYFREE",

    /**
     * 触发了小游戏
     */
    EVENT_BONUS_GAME_TRIGGERED = "EVENT_BONUS_GAME_TRIGGERED",


    /**
     * 触发了游戏的各种奖励事件，如小游戏，免费游戏等
     *
     */
    // EVENT_TRIGGERED_BONUS_EVENT = "EVENT_TRIGGERED_BONUS_EVENT",
    /**
     * 触发了加押线
     */
    // EVENT_SETING_LINE_ADD = "EVENT_SETING_LINE_ADD",
    /**
     * 触发了减押线
     */
    // EVENT_SETING_LINE_SUB = "EVENT_SETING_LINE_SUB",
    /**
     * 显示设置押线界面
     */
    EVENT_SHOW_LINESETING_VIEW = "EVENT_SHOW_LINESETING_VIEW",

    /**
     * 关闭设置押线界面
     */
    EVENT_CLOSE_LINESETING_VIEW = "EVENT_CLOSE_LINESETING_VIEW",

    /**
     * 退出自动游戏
     */
    EVENT_CANCEL_AUTO_GAME = "EVENT_CANCEL_AUTO_GAME",

    /**
     * 重置线显示
     */
    EVENT_RESET_LINE_SHOWING = "EVENT_RESET_LINE_SHOWING",

    /**
     * 继续免费游戏，如从小游戏回到了免费游戏
     */
    EVENT_RESUME_FREE_GAME = "EVENT_RESUME_FREE_GAME",

    /**
     * 特定游戏的特殊数据更新了
     */
    EVENT_CUSTOM_DATA_UPDATED = "EVENT_CUSTOM_DATA_UPDATED",

    /**
     * 从服务器获取了特殊数据
     */
    EVENT_CUSTOM_DATA_RECEIVED = "EVENT_CUSTOM_DATA_RECEIVED",

    /**
     * JP奖池更新了
     */
    EVENT_JP_BALANCE_UPDATED = "EVENT_JP_BALANCE_UPDATED",

    /**
     * 赢得了JP奖励
     */
    EVENT_WIN_JP = "EVENT_WIN_JP",

    // 赢取了神秘奖励
    EVENT_WIN_MYS_JP = "EVENT_WIN_MYS_JP",

    // 触发小游戏通知
    EVENT_TRRIGER_BONUS_GAMAE = "EVENT_TRRIGER_BONUS_GAMAE",

    //  记录
    EVENT_RECORD = "EVENT_RECORD",

    //  免转钱包数据
    EVENT_TRANSFER_INFO = "EVENT_TRANSFER_INFO",
    //  屏幕全屏事件
    EVENT_SCREEN_FULL = "EVENT_SCREEN_FULL",
    // 舞台大小发生改变事件
    RESIZE_STAGE = "RESIZE_STAGE",
    //钱不足中断事件
    MONEY_NOT_ENOUGH_BREAK = "MONEY_NOT_ENOUGH_BREAK",
    // 显示大奖的时候通知旋转按钮禁用
    EVENT_STARTBTN_WHEN_PRING = "EVENT_STARTBTN_WHEN_PRING",
    // 收到后台修改余额的推送
    EVENT_PUB_CHIPS_PUSH = "EVENT_PUB_CHIPS_PUSH",
    //通知UI滚动结束了
    EVENT_SLOT_RUN_STOPPED = "EVENT_SLOT_RUN_STOPPED",
    //刷新jp奖池金币显示
    EVENT_SLOT_MONEY_SHOW = "EVENT_SLOT_MONEY_SHOW",
    //刷新余额显示
    EVENT_SLOT_REFSH_BALANCE = "EVENT_SLOT_REFSH_BALANCE",
    //刷新jp奖池金币显示
    EVENT_JP_BALANCE_INIT = "EVENT_JP_BALANCE_INIT",
    //刷新jp奖池金币显示
    EVENT_JP_BALANCE_REFRESH = "EVENT_JP_BALANCE_REFRESH",
    //二级加载
    EVENT_SUBLOAD = "EVENT_SUBLOAD",
    //其他玩家的spin结果返回
    EVENT_OTHER_PLAYER_SPIN_RESP = "EVENT_OTHER_PLAYER_SPIN_RESP",
    //其他玩家的初始化滚轴结果返回
    EVENT_OTHER_PLAYER_RESTORE_RESP = "EVENT_OTHER_PLAYER_RESTORE_RESP",
    //普通大奖特效
    EVENT_NORMAL_PRIZE_PLAY = "EVENT_NORMAL_PRIZE_PLAY",

    /**
     * proto加载完成
     */
    EVENT_PROTO_LOAD_COMPELETE = "EVENT_PROTO_LOAD_COMPELETE",

    /**菜单栏恢复可点击状态 */
    EVENT_MENU_INTERACTABLE = "EVENT_MENU_INTERACTABLE",

    /**
     * 其他玩家的小游戏信息
     */
    LGACTIONRESP_OTHER = "LGACTIONRESP_OTHER",

    /**
     * 重设房间状态
     */
    RESETROOMSTATE = "RESETROOMSTATE",

    /**
     * 旋转按钮禁止
     */
    EVENT_SPIN_BUTTON_STOP = "EVENT_SPIN_BUTTON_STOP",
    /**
    * 旋转按钮开启
    */
    EVENT_SPIN_BUTTON_OPEN = "EVENT_SPIN_BUTTON_OPEN",
    /**大奖特效完成播放赢分特效*/
    EVENT_BIG_PRIZE_COMPLETE = "EVENT_BIG_PRIZE_COMPLETE",

    /**
     * 显示快速模式提示弹窗
     */
    EVENT_SHOW_FAST_MODE_TIP = 'EVENT_SHOW_FAST_MODE_TIP',

    /**
     * 重新渲染滚轴
     */
    EVENT_RERENDER_SLOTMACHINE = 'EVENT_RERENDER_SLOTMACHINE',

    /**
     * 重连后进入房间成功
     */
    EVENT_REENTER_ROOM_SUCCESS = 'EVENT_REENTER_ROOM_SUCCESS',
    /**
     * 显示大奖动画重置赢分效果
     */
    EVENT_RESET_WIN = 'EVENT_RESET_WIN',

    /**
     * 中奖线为五连 （满连）
     */
    EVENT_FULL_LINE_HIT = 'EVENT_FULL_LINE_HIT',

    /**
     * 换房间成功
     */
    EVENT_CHANGE_ROOM_SUCCESS = 'EVENT_CHANGE_ROOM_SUCCESS',

    /**
     * 点击了滚轴
     */
    EVENT_MOUSE_DOWN_ROLLER = 'EVENT_MOUSE_DOWN_ROLLER',

    /**
     * 游戏进入空闲状态，指免费游戏或小游戏或自动游戏都完结且大奖动画也结束
     */
    EVENT_GAME_STATE_TO_IDLE = 'EVENT_GAME_STATE_TO_IDLE',

    /**
     * 免费游戏触发
     */
    EVENT_FREE_GAME_TRIGGERED = 'EVENT_FREE_GAME_TRIGGERED',

    /**
     * 触发了免费游戏
     */
    EVENT_PLAY_FREE_GAME_ANI = 'EVENT_PLAY_FREE_GAME_ANI',

    /**
     * 触发了免费游戏动画
     */
    EVENT_PLAY_FREE_GAME_ADMISSION_ANI = 'EVENT_PLAY_FREE_GAME_ADMISSION_ANI',


    /**
     * 免费游戏又触发了
     */
    EVENT_NEW_FREE_GAME_TRIGGERED_AGAIN = "EVENT_NEW_FREE_GAME_TRIGGERED_AGAIN",

    /**
     * 播放中奖动画
     */
    EVENT_PLAY_REWARD_ANI = "EVENT_PLAY_REWARD_ANI",

    /**
     * 添加免费游戏任务
     */
    EVENT_FREE_GAME_OVER_TASK = "EVENT_FREE_GAME_OVER_TASK",

    /**
     * 添加bonus游戏任务
     */
    EVENT_BONUS_GAME_TASK = "EVENT_BONUS_GAME_TASK",

    /**
     * bonus游戏结束了
     */
    EVENT_BONUS_GAME_OVER_TASK = "EVENT_BONUS_GAME_OVER_TASK",

    /**
     * 跳过轮播线流程
     */
    EVENT_SKIP_LOOP_LINE_TASK = "EVENT_SKIP_LOOP_LINE_TASK",
    EVENT_JACKPOT_GAME_OVER_TASK = "EVENT_JACKPOT_GAME_OVER_TASK",

    /**
     * 选择滚轴模式
     */
    EVENT_ROLLER_MODE = "EVENT_ROLLER_MODE",
    /**
    * 设置信息栏坐标
    */
    EVENT_SET_SCORE_POINT = "EVENT_SET_SCORE_POINT",
    /**
    * 设置游戏按钮坐标
    */
    EVENT_SET_GAMECONTOROL_POINT = "EVENT_SET_GAMECONTOROL_POINT",

    /**
    * 强制更新按钮
    */
    EVENT_FORCE_UPDATE_SPIN_BUTTON = "EVENT_FORCE_UPDATE_SPIN_BUTTON",

    /**
     * 更新局ID
     */
    EVENT_UPDATE_ROUND_ID = "EVENT_UPDATE_ROUND_ID",
    /**
     *
     */
    EVENT_OPERATIONSTATE_CHANGE = "EVENT_OPERATIONSTATE_CHANGE",
    /**
     * 结算界面动画
     */
    EVENT_SETTLEMENT_ANI_PLAY = "EVENT_SETTLEMENT_ANI_PLAY",

    /**
     * 结算界面动画关闭
     */
    EVENT_SETTLEMENT_ANI_HIDE = "EVENT_SETTLEMENT_ANI_HIDE",

    /**
     * 更新赢分
      * @param num 传入金币值
      * @param isRetain 新的一局是否保持
      * @param isAdd 是否在原有数值上基础上增加传入的值
      * @param isResetDelay 是否展示后重置
      * @param complete 完成的回调
      * @param isSyncAllScore 是否同步玩家金币
     */
    EVENT_UPDATE_WINSCORE = 'EVENT_UPDATE_WINSCORE',

    /**
     * 更新赢分
     */
    EVENT_SET_WINSCORE_RETAIN = 'EVENT_RESET_WINSCORE_RETAIN',

    /**
     * 收到spin结果且未处理spin结果前的事件
     */
    EVENT_BEFORE_RENDER_SPINRESULT = 'EVENT_BEFORE_RENDER_SPINRESULT',

    /**
     *
     */
    EVENT_FORCE_UPDATE_ALL_SCORE = 'EVENT_FORCE_UPDATE_ALL_SCORE',

    /**
     * 加注按钮状态发生了变化
     */
    EVENT_ADD_BTN_STATE_CHANGE = 'EVENT_ADD_BTN_STATE_CHANGE',

    /**
     * 减注按钮状态发生了变化
     */
    EVENT_SUB_BTN_STATE_CHANGE = 'EVENT_SUB_BTN_STATE_CHANGE',

    /**
     * bonusgame结束触发下一次bonusgame
     */
    EVENT_TREATE_NEXT_BONUSGAME = 'EVENT_TREATE_NEXT_BONUSGAME',

    /**
     * 强制更新赢分，更新为传入的值
      * @param num 传入金币值
     */
    EVENT_FORCE_UPDATE_WINSCORE = 'EVENT_FORCE_UPDATE_WINSCORE',

    /**
    * 强制更新显示的押分，更新为传入的值
     * @param num 传入金币值
    */
    EVENT_FORCE_UPDATE_BETSCORE = 'EVENT_FORCE_UPDATE_BETSCORE',

    /**
     * 已播放普通奖
     */
    EVENT_PLAYED_NORMAL_REWARD = 'EVENT_PLAYED_NORMAL_REWARD',

    /**
     * 重连时关闭小游戏界面
     */
    EVENT_CLOSE_BONUS_LAYER = 'EVENT_CLOSE_BONUS_LAYER',
    /**
     * 更新玩家分数信息
     */
    USER_INFO_UPDATA = "USER_INFO_UPDATA",
    /**
    * 通知人物升级特效任务
    */
    USER_UPLEVEL_ANI_TASK = "USER_UPLEVEL_ANI_TASK",
    /**
   * 人物升级特效
   */
    USER_UPLEVEL_ANI = "USER_UPLEVEL_ANI",
    /**
   * 免费游戏中奖表现任务,位于大奖动画之前的表现
   */
    EVENT_FREE_GAME_REWARD_TASK = "EVENT_FREE_GAME_REWARD_TASK",

    /**
   * 免费游戏的倍数中奖金币表现
   */
    EVENT_FREE_GAME_RATIO_REWARD = "EVENT_FREE_GAME_RATIO_REWARD",

    /**
   * 免费游戏初始
   */
    EVENT_INIT_FREEGAME = "EVENT_INIT_FREEGAME",

    /**
   * 改变游戏滚轴
   */
    EVENT_CHANGE_GAME_SCROLLER = "EVENT_CHANGE_GAME_SCROLLER",
    /**
     * 开始震屏效果  shakeEffect
     */
    EVENT_SHAKE_EFFECT_START = "EVENT_SHAKE_EFFECT_START",
    /**
     * 结束震屏效果  shakeEffect
     */
    EVENT_SHAKE_EFFECT_END = "EVENT_SHAKE_EFFECT_END",
    /**
     * 更新赢分时触发事件： 赢分大于押分
     */
    EVENT_WIN_MORE_THAN_BET = "EVENT_WIN_MORE_THAN_BET",

    /**
    * 改变押分成功
    */
    EVENT_CHANGE_COST_SUCCESS = "EVENT_CHANGE_COST_SUCCESS",

    /**
    * 改变押分成功
    */
    EVENT_UPDATE_FREEGAME_WIN = "EVENT_UPDATE_FREEGAME_WIN",

    /**
     * 更新角色idle动作(嗨系列2用)
     */
    EVENT_HAIXILIE_IDLE = "EVENT_HAIXILIE_IDLE",
    /**
    * 加载菜单完成
    */
    EVENT_MENU_COM = "EVENT_MENU_COM",
    /**
     * 加载玩家完成
     */
    EVENT_PLAYER_COM = "EVENT_PLAYER_COM",
    /**
     * 加载多人共玩
     */
    EVENT_PLAYERTOGHER_COM = "EVENT_PLAYERTOGHER_COM",
    /**
     * 开场tween动画
     */
    EVENT_START_ANI = "EVENT_START_ANI",
    /**
    * 过场tween动画
    */
    EVENT_STOP_ANI = "EVENT_STOP_ANI",

    /**
    *
    */
    EVENT_UPDATE_SINGLE_ROUND_WIN = "EVENT_UPDATE_SINGLE_ROUND_WIN",

    /**
    *
    */
    EVENT_BONUS_GAME_COMPLETE = "EVENT_BONUS_GAME_COMPLETE",

    /**
    *
    */
    EVENT_CONTOROLBASE_LOAD_COMPLETE = "EVENT_CONTOROLBASE_LOAD_COMPLETE",

    /**
    *
    */
    EVENT_ROLLER_MODE_DATA_RESP = "EVENT_ROLLER_MODE_DATA_RESP",

    /**
   *
   */
    EVENT_SHOW_EXCHANGE_GUIDE = "EVENT_SHOW_EXCHANGE_GUIDE",

    /**
   *
   */
    EVENT_LOAD_SINGLE_ASSET_COMPLETE = "EVENT_LOAD_SINGLE_ASSET_COMPLETE",
    /**
     * 设置弹窗2点击常速与极速
     */
    EVENT_CLICK_AUTO = "EVENT_CLICK_AUTO",
    /**
     * 点击打开菜单栏按钮
     */
    EVENT_CLICK_OPEN_MENU = "EVENT_CLICK_OPEN_MENU",
    /**
     * 点击关闭菜单栏按钮
     */
    EVENT_CLICK_CLOSE_MENU = "EVENT_CLICK_CLOSE_MENU",
    /**
     * 设置菜单栏的是否显示
     */
    EVENT_MENU_SHOW_OR_HIDE = "EVENT_MENU_SHOW_OR_HIDE",
    /**
    * 设置菜单栏的透明度
    */
    EVENT_MENU_SET_OPACITY = "EVENT_MENU_SET_OPACITY",
    /**
    * 设置钱包按钮图标的透明度
    */
    EVENT_BALANCE_SPRITE_SET_OPACITY = "EVENT_BALANCE_SPRITE_SET_OPACITY",
    /**
     * 更新分数node的位置 参数为vec2(x,y)
     */
    EVENT_UPDATE_SCORE_POSITION = "EVENT_UPDATE_SCORE_POSITION",
    /**
     * 大奖动画金币跳动是否完成
     */
    EVENT_UPDATE_COIN_SCROLLER_END = "EVENT_UPDATE_COIN_SCROLLER_END",
    /**
     * 大奖动画播放是否完成
     */
    EVENT_UPDATE_WIN_ANI_END = "EVENT_UPDATE_WIN_ANI_END",
    /**
     * 大奖动画切换
     */
    EVENT_CHANGE_WIN_TYPE = "EVENT_CHANGE_WIN_TYPE",
    /**
     * 点击元素，弹出框  回调事件
     * @data 元素的值
     */
    EVENT_CLICK_ELEMENT_VIEW = "EVENT_CLICK_ELEMENT_VIEW",

    /**
     * 轮播中触发五连
     */
    EVENT_TREAT_FULL_LINE_IN_LOOP = 'EVENT_TREAT_FULL_LINE_IN_LOOP',

    /**
     * 控制按钮是否可以点击(除快速按钮)
     */
    EVENT_GAMECONTROL_ALL_BTN_CLICK = 'EVENT_GAMECONTROL_ALL_BTN_CLICK',

    /**
     * 控制按钮是否可以点击(除快速按钮)--是否置灰
     */
    EVENT_GAMECONTROL_ALL_BTN_OPACITY = 'EVENT_GAMECONTROL_ALL_BTN_OPACITY',

    /**
     * 控制按钮是否显示隐藏(特殊情况：3个分散及以上控制按钮隐藏)
     */
    EVENT_GAMECONTROL_CTR_BTN_SHOW_OR_HIDE = 'EVENT_GAMECONTROL_CTR_BTN_SHOW_OR_HIDE',

    /**
     * 加载bonus资源完成
     */
    EVENT_LOAD_BONUS_GAME_ASSET_COMPLETE = 'EVENT_LOAD_BONUS_GAME_ASSET_COMPLETE',

    /**
     * 单个赔付元素tween
     */
    EVENT_TWEEN_PAY_TABLE = 'EVENT_TWEEN_PAY_TABLE',

    /**
    * 元素显示赔付
    * ID
    */
    EVENT_ELEMENT_PAY_ID_SHOW = 'EVENT_ELEMENT_PAY_ID_SHOW',

    /**
    * 元素显示隐藏
    * 无ID
    */
    EVENT_ELEMENT_PAY_ID_HIDE = 'EVENT_ELEMENT_PAY_ID_HIDE',

    /**
    * 元素隐藏
    * 无ID
    */
    EVENT_DEL_ELEMENT_PAY_ID_HIDE = 'EVENT_DEL_ELEMENT_PAY_ID_HIDE',

    /**
     * 大奖动画文字表现形式出现
     */
    EVENT_BIGWIN_TEXT_SHOW = 'EVENT_BIGWIN_TEXT_SHOW',

    /**
     * 大奖动画文字表现形式消失
     */
    EVENT_BIGWIN_TEXT_HIDE = 'EVENT_BIGWIN_TEXT_HIDE',

    /**
     * 大奖动画文字最后一个表现形式消失
     */
    EVENT_BIGWIN_TEXT_LAST_HIDE = 'EVENT_BIGWIN_TEXT_LAST_HIDE',

    /**改变投注倍数 */
    EVENT_BET_COST_CHANGED = "EVENT_BET_COST_CHANGED",

    /**金币不足弹窗，点击确定按钮的回调*/
    EVENT_GOLDNOTENOUGH_OKBTN = "EVENT_GOLDNOTENOUGH_OKBTN",

    /**
     * 中奖线金额显示
     */
    EVENT_WIN_LINE_COIN = 'EVENT_WIN_LINE_COIN',

    /**
    * 设置哈希显示坐标
    */
    EVENT_SET_HASH_POINT = "EVENT_SET_HASH_POINT",

    EVENT_HASH_REST_UPDATE = "EVENT_HASH_REST_UPDATE",

    /**线ID和金额 */
    EVENT_CHANGE_LINE_WINCOIN = "CHANGE_LINE_WINCOIN",

    /**每局第一次消除前的掉落完成 */
    EVENT_FIRST_DROP_END = "EVENT_FIRST_DROP_END",

    /**显示中奖线动画节点*/
    EVENT_CREATOR_LINE_ANINODE = "EVENT_CREATOR_LINE_ANINODE",

    /** 手动减投注 */
    EVENT_SUBBET_CHANGE = "EVENT_SUBBET_CHANGE",

    /** 手动加投注 */
    EVENT_ADDBET_CHANGE = "EVENT_ADDBET_CHANGE",

    /** 手动最大投注 */
    EVENT_MAXBET_CHANGE = "EVENT_MAXBET_CHANGE",
    /** 手动右侧投注值 */
    EVENT_RIGHTOPTION_BETITEM_CHANGE = "EVENT_RIGHTOPTION_BETITEM_CHANGE",
    /** 手动投注item */
    EVENT_BETITEM_CHANGE = "EVENT_BETITEM_CHANGE",

    /** 点击减投注 */
    EVENT_SUBBET_CLICK = "EVENT_SUBBET_CLICK",

    /**点击加投注 */
    EVENT_ADDBET_CLICK = "EVENT_ADDBET_CLICK",

    /** 点击最大投注按钮 (派发事情给子项目做表现)*/
    EVENT_MAXBET_CLICK = "EVENT_MAXBET_CLICK",
    /** 点击右侧投注值 */
    EVENT_RIGHTOPTION_BETITEM_CLICK = "EVENT_RIGHTOPTION_BETITEM_CLICK",
    /** 点击投注item */
    EVENT_BETITEM_CLICK = "EVENT_BETITEM_CLICK",

    /**关闭余额窗口的事件回调 */
    EVENT_CLOSE_SCORE_BALANCE_VIEW = "EVENT_CLOSE_SCORE_BALANCE_VIEW",
    /**设置中奖线皮肤*/
    EVENT_SET_LINE_SKIN = "EVENT_SET_LINE_SKIN",

    /**请求的滚轴数据返回了，适用于正常网络转态下的旋转数据返回及重连成功时的旋转数据返回,旋转后收到数据前rollingResult会是空*/
    EVENT_GET_ROLLING_RESULT_RESP = "EVENT_GET_ROLLING_RESULT_RESP",

    /**设置菜单栏中 个别按钮的状态 比如在大奖中或者在滚轴中 自动按钮和加注按钮置灰 */
    EVENT_MENBTS_SETSTATE = "EVENT_MENBTS_SETSTATE",

    /** 每列 新元素掉落时（用于加动效或音效） */
    EVENT_NEW_ELEMDROP_END = "EVENT_NEW_ELEMDROP_END",
    /** 每列新元素掉落结束（用于加动效或音效） */
    EVENT_NEW_ELEMDROP_DROPEND = "EVENT_NEW_ELEMDROP_DROPEND",
    /**滚轴开始加速*/
    EVENT_SCROLLER_ONSPEED_RUNNING_START = "EVENT_SCROLLER_ONSPEED_RUNNING_START",

    /**清除免费游戏结束任务，用于一个免费重转结束后中间弹出收集任务导致触发了免费重转*/
    EVENT_CLEAR_FREEGAMEOVER_TASK = "EVENT_CLEAR_FREEGAMEOVER_TASK",

    /**设置gameControl自动按钮的状态 比如在大奖中 自动按钮和加注按钮置灰 */
    EVENT_AUTOBTN_SETSTATE = "EVENT_AUTOBTN_SETSTATE",

    /**触发jackpot游戏 */
    EVENT_JACKPOT_GAME_TRIGGERED_TASK = "EVENT_JACKPOT_GAME_TRIGGERED_TASK",

    /**
     * 重新跑流程事件
     */
    EVENT_RERUN_FLOWS = 'EVENT_RERUN_FLOWS',

    /** 更新购买免费转btn */
    EVENT_RENEW_BUY_FREE_BTN = "EVENT_RENEW_BUY_FREE_BTN",

    /** 翻倍功能按钮btn */
    EVENT_TURN_COIN_BTN = "EVENT_TURN_COIN_BTN",

    /** 点击购买免费后 加可扩展事件 */
    EVENT_BUY_FREE_EXPAND = "EVENT_BUY_FREE_EXPAND",

    /** 翻倍页面关闭 可扩展事件 */
    EVENT_TRUN_COIN_VIEW_CLOSE_EXPAND = "EVENT_TRUN_COIN_VIEW_CLOSE_EXPAND",

    /** 清理轮播线 */
    EVENT_CLEAR_LOOP_LINE = "EVENT_CLEAR_LOOP_LINE",

    /** 积分不足弹框 */
    EVENT_NO_MONEY_TIP_POP = "EVENT_NO_MONEY_TIP_POP",
    /**是否展示哈希密文 */
    EVENT_SHOW_HASH_LABLE = "EVENT_SHOW_HASH_LABLE"
}