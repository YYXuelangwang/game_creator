/**
 * slot自动测试相关配置
 */

/**
* 自动测试key(节点、方法)
* @param SLOT_BTN_MENU 菜单按钮
* @param SLOT_BTN_BACK 返回按钮
* @param SLOT_BTN_HELP 帮助按钮
* @param SLOT_BTN_SET 声音按钮
* @param SLOT_BTN_FRIENDROOM 好友房按钮
* @param SLOT_BTN_GAMERECORD 游戏记录按钮
* 
* @param SLOT_BTN_SPIN 旋转按钮
* @param SLOT_BTN_SPIN_QUICK 快速旋转按钮
* @param SLOT_BTN_SPIN_AUTO 自动旋转按钮
* @param SLOT_BTN_BET_ADD 增加押注按钮
* @param SLOT_BTN_BET_SUB 减少押注按钮
* 
* @param SLOT_LAB_SCORE_TOTAL 总分
* @param SLOT_LAB_SCORE_WIN 赢分
* @param SLOT_LAB_SCORE_BET 压分
* @param SLOT_LAB_SPIN_AUTOTIMES 自动旋转次数
* 
* @param SLOT_FUNC_GETPLAYERLIST 获取多人共玩信息列表
* 
* @param SLOT_FUNC_GET_SPIN_RESULT 获取玩家spin结果
*/
export enum SlotAutoTestKey {
    SLOT_BTN_MENU = 'SLOT_BTN_MENU',
    SLOT_BTN_BACK = 'SLOT_BTN_BACK',
    SLOT_BTN_HELP = 'SLOT_BTN_HELP',
    SLOT_BTN_SET = 'SLOT_BTN_SET',
    SLOT_BTN_FRIENDROOM = 'SLOT_BTN_FRIENDROOM',
    SLOT_BTN_GAMERECORD = 'SLOT_BTN_GAMERECORD',

    SLOT_BTN_SPIN = 'SLOT_BTN_SPIN',
    SLOT_BTN_SPIN_QUICK = 'SLOT_BTN_SPIN_QUICK',
    SLOT_BTN_SPIN_AUTO = 'SLOT_BTN_SPIN_AUTO',
    SLOT_BTN_BET_ADD = 'SLOT_BTN_BET_ADD',
    SLOT_BTN_BET_SUB = 'SLOT_BTN_BET_SUB',
    SLOT_BTN_BET_ROTATION = 'SLOT_BTN_BET_ROTATION',
    SLOT_BTN_BET_BET = 'SLOT_BTN_BET_BET',

    SLOT_LAB_SCORE_TOTAL = 'SLOT_LAB_SCORE_TOTAL',
    SLOT_LAB_SCORE_WIN = 'SLOT_LAB_SCORE_WIN',
    SLOT_LAB_SCORE_BET = 'SLOT_LAB_SCORE_BET',
    SLOT_LAB_SPIN_AUTOTIMES = 'SLOT_LAB_SPIN_AUTOTIMES',

    SLOT_FUNC_GETPLAYERLIST = 'SLOT_FUNC_GETPLAYERLIST',

    SLOT_FUNC_GET_SPIN_RESULT = 'SLOT_FUNC_GET_SPIN_RESULT',
    SLOT_BTN_ROLLERMODE = 'SLOT_BTN_ROLLERMODE'

}

export default class SlotAutoTestConf {
    private static _instance: SlotAutoTestConf = null;
    public static getInstance(): SlotAutoTestConf {
        if (!this._instance) {
            this._instance = new SlotAutoTestConf();
        }
        return this._instance;
    }

    private constructor() {

    }
}