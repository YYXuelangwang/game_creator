import SlotConfigManager from '../SlotManager/SlotConfigManager';
import { WinType } from "../SlotDefinitions/SlotEnum";
import SlotProtoManager from '../../../network/SlotProtoManager';
import { GData } from '../../../common/utils/GData';

export default class SlotUtils {
    /**
     * 百搭类型
     */
    public static wildType: number = 2;
    /**
     * 弧度转换为角度。
     * @param	radian 弧度值。
     * @return	返回角度值。
     */
    public static toAngle(radian: number) {

        return radian * (180 / Math.PI);
    }

    /**
       * 检查是否为空或未定义
       */
    public static isNullOrUndefined(obj: any) {
        return obj === null || obj === undefined;
    }

    /**
     * 判断指定元素是否是百搭元素，注意，此判断是根据策划的配置数据进行判断，可能不符合实际情况
     * @param eleId 元素ID
     */
    public static isWild(eleId: number): boolean {

        return this.wildType == SlotConfigManager.instance.DataElement.getData(eleId).type;
    }

    public static isShowHashText: boolean = true;

    /**是否有哈希 */
    public static isHaxi(): boolean {
        return SlotProtoManager.getInstance().restoreResult && SlotProtoManager.getInstance().restoreResult.gameMode != protoSlot.game_mode_type_enum.normal;
    }

    /**
     * 判断指定元素是否是个分散元素
     * @param eleId 元素ＩＤ
     */
    public static isScatter(eleId: number): boolean {
        return 4 == SlotConfigManager.instance.DataElement.getData(eleId).type;
    }

    /**
     * 判断指定元素是否普通元素
     * @param eleId 元素ＩＤ
     */
    public static isNormalElement(eleId: number): boolean {
        return 1 == SlotConfigManager.instance.DataElement.getData(eleId).type;
    }

    /**
     * 判断是否有购买功能
     */
    public static isHasBuy(): boolean {
        return SlotProtoManager.buyMultiNum ? true : false;
    }

    /**
     * 设置纹理九宫格拉伸
     * @param node 
     * @param rect 
     */
    public static setScale9GridRect(node: cc.Node, rect: cc.Rect): void {
        let sp = node.getComponent(cc.Sprite);
        sp.type = cc.Sprite.Type.SLICED;
        sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        let spriteFrame = sp.spriteFrame;
        if (spriteFrame) {
            spriteFrame.insetBottom = rect.height
            spriteFrame.insetTop = rect.y;
            spriteFrame.insetLeft = rect.x;
            spriteFrame.insetRight = rect.width;
        }
    }

    /**
     * 生成包内资源的路径(ui:// 格式)
     * 
     * @public
     * @static
     * @method makePackageAssetsUrl
     * @param {string} packageName 包名
     * @param {string} assetsName 资源名,不需要后缀 
     * @return {string} 资源的完整路径，通过它，fairgui相关接口可以正确获取到资源，形如:ui://packageName/assetsName
     */
    public static makePackageAssetsUrl(assetsName: string, FileDir: string = "Card"): string {
        // spinSlot.imgUrl = "ui://Pro29Main/" + AssetsUtils.getElementIcon(ele);
        return `textures/slotMachine/card/${FileDir}/${assetsName}`;//先固定路径，后期看需要怎么修改
    }

    /**
     * 获取元素的图片名
     * @public
     * @static
     * @method makeElementIconName
     * @param {number} ele 元素的ID
     * @param {number = 2} padLeft 需要在前面补多少位
     * @return {string}
     */
    public static makeElementIconName(ele: number, padLeft: number = 2): string {
        return SlotUtils.makeElementIconNameWithPre(ele, padLeft);
    }

    /**
     * 格式化卡牌名
     * @param ele 
     * @param padLeft 
     * @param pre 
     */
    public static makeElementIconNameWithPre(ele: number, padLeft: number = 2, pre: string = ""): string {
        if (padLeft <= 0) return `${pre}${ele}`;
        return `${pre}${SlotUtils.padLeft(ele, padLeft)}`;//外部类还没有写好
    }

    /**
     * 获取元素在模糊状态下的图片名
     * @publiclur
     * @static
     * @method makeElementBlurIconName
     * @param {number} ele 元素的ID
     * @param {number = 2} padLeft 需要在元素名前补多少位 
     * @return {string}
     */
    public static makeElementBlurIconName(ele: number, padLeft: number = 2): string {
        return `${SlotUtils.makeElementIconName(ele, padLeft)}_blur`
    }

    /**
     * 生成元素的暗谈图标名
     * @param ele 
     * @param padLeft 
     */
    public static makeElementFadeIconName(ele: number, padLeft: number = 2): string {
        return `${SlotUtils.makeElementIconName(ele, padLeft)}_fade`;
    }

    public static padLeft(num: number, n: number) {
        return (Array(n).join("0") + num).slice(-n);
    }

    /**
     * 获取元素的动画名
     * @public
     * @static
     * @method makeElementAniName
     * @param {number} ele 元素的ID
     * @return {string}
     */
    public static makeElementAniName(ele: number, pad: number = 2): string {
        return `ani_${SlotUtils.padLeft(ele, 2)}`;
    }

    /**
     * 是否为为满线
     */
    public static isFullLine(): boolean {
        let dataGame = GData.getParameter("DataGame");
        let type = dataGame && dataGame.data[dataGame.ids[0]].type;
        console.log("---gameType---", type);
        let bo = type >= 4 && type != 5 && type != 14;//游戏类型
        return bo;
    }

    /**
     * 根据押线索引获取真实押线值
     */
    public static getLineCostByIndex(idx: number): number {
        let cfg = SlotConfigManager.instance.DataGame.getData(SlotConfigManager.instance.gameID);
        if (!cfg) return null;
        let lineCostArr: number[] = cfg.lineValue;
        if (lineCostArr.length <= idx) return null;

        return lineCostArr[idx];
    }

    /**
     * 根据押线获取其在配置表中的索引
     * @param cost 押线
     */
    public static getIndexByLineCost(cost: number): number {
        let cfg = SlotConfigManager.instance.DataGame.getData(SlotConfigManager.instance.gameID);
        if (!cfg) return 0;
        let lineCostArr: number[] = cfg.lineValue;
        return lineCostArr.indexOf(cost);
    }

    /**
         * 从数组查找并返回符合条件的第一个元素的索引，只返回最先查找到的满足条件的元素的索引,如果没找到则返回-1
         * @param arr 要查找的数组
         * @param conditionFun 过滤条件函数,当返回true时，则返回，否则继续查找,该函数第一个参数是数组的元素，第二个参数是当前元素的索引，第三个参数是数组本身
         * @param startIndex 开始查找的索引
         */
    public static findIndexFromArray<T>(arr: T[], conditionFun: (ele: T, idx?: number, arr?: T[]) => boolean, startIndex: number = 0): number {
        if (startIndex >= arr.length) {
            return -1;
        }

        for (; startIndex < arr.length; ++startIndex) {
            if (conditionFun(arr[startIndex], startIndex, arr)) {
                return startIndex;
            }
        }

        return -1;
    }

    /**
     * 获取中奖类型
     * @param win 总赢分
     * @param bet 旋转费用消耗
     * @returns 中奖类型 WinType
     */
    public static getWinType(win: number, bet: number): WinType {
        if (win == 0) {
            return WinType.None;
        }
        let cond: number = SlotConfigManager.instance.getWinAnimationCondition(1);
        let rate = win / bet;
        if ((!SlotUtils.isNullOrUndefined(cond)) && cond > 0 && rate >= cond) {
            return WinType.Great;
        }

        cond = SlotConfigManager.instance.getWinAnimationCondition(2);
        if ((!SlotUtils.isNullOrUndefined(cond)) && cond > 0 && rate >= cond) {
            return WinType.Middle;
        }

        cond = SlotConfigManager.instance.getWinAnimationCondition(3);
        if ((!SlotUtils.isNullOrUndefined(cond)) && cond > 0 && rate >= cond) {
            return WinType.Small;
        }

        cond = SlotConfigManager.instance.getWinAnimationCondition(4);
        if ((!SlotUtils.isNullOrUndefined(cond)) && cond >= 0 && rate >= cond) {
            return WinType.Normal;
        }

        return WinType.None;
    }

    /**
     * 给数字转换为千分号
     *  @param v 要转换的数字
     *  @param n 保留几位小数点，默认为2 参数isReserved为true才有效，isReserved默认true
     *  @param c 除数
     *  @param isRate 是否使用多国倍率
     *  @param  isReserved 是否保留小数点位数(默认保留，如果不保留按原值显示,不进行四舍五入处理)
     *  @param  thousandSign 千分位符号
     */
    static formatNumber(v: number, n: number = 2, c: number = 100, isRate: boolean = false, isReserved: boolean = true, thousandSign: string = ","): string {
        let rate = 1;
        if (isRate)
            rate = core.CommonProto.getInstance().coinRate;
        return game.ComUtils.formatNumber(v, n, c, isReserved, thousandSign);
    }

    /**
    * 将金币数转换成显示需要的字符串
    * 
    * @static
    * @public
    * @method convertToShowingCoin
    * @param {number} coin 真实的金币数，一般从服务器或配置中获取
    * @return {string}
    */
    public static convertToShowingCoin(coin: number, place: number = 2, symbol: string = ""): string {
        let real: number = coin / 100;
        return this.formatMoney(real, place, symbol);
    }

    public static formatMoney(num, places: number = 0, symbol: string = "", thousand: string = ",", decimal: string = "."): string {
        if (typeof (num) == "string") num = Number(num);
        num = num || 0;
        places = !isNaN(places = Math.abs(places)) ? places : 2;
        var negative = num < 0 ? "-" : "";
        num = num.toFixed(places);
        num = this.numberWithCommas(num);
        return symbol + negative + num;
    }

    /**
     * 给一串数字添加千分符 
     * @param x 
     */
    public static numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");// 正则相关知识点 关键字  先前断言  后行断言 
    }

    public static Number(num: number | Long): number {
        if ((num as Long).toNumber)
            return (num as Long).toNumber();
        return num as number;
    }

    public static addFadeButtonClickEffect(...btns: cc.Node[]): void {

        for (let btn of btns) {
            if (!btn) {
                continue;
            }
            btn.on(cc.Node.EventType.TOUCH_START, this.onBtnTouchStart, this, true)
            btn.on(cc.Node.EventType.TOUCH_MOVE, this.onBtnTouchMoved, this, true);
            btn.on(cc.Node.EventType.TOUCH_END, this.onBtnTouchEnd, this, true);
        }
    }

    public static removeFadeButtonClickEffect(...btns: cc.Node[]): void {

        for (let btn of btns) {
            if (!btn) {
                continue;
            }
            btn.off(cc.Node.EventType.TOUCH_START, this.onBtnTouchStart, this, true)
            btn.off(cc.Node.EventType.TOUCH_MOVE, this.onBtnTouchMoved, this, true);
            btn.off(cc.Node.EventType.TOUCH_END, this.onBtnTouchEnd, this, true);
        }
    }

    private static disableOpacity: number = 160;
    public static onBtnTouchStart(e: cc.Event.EventTouch): void {
        let btn = e.target as cc.Node;
        if (btn.getComponent(cc.Button).interactable) {
            let sprites = btn.getComponentsInChildren(cc.Sprite);
            for (let sp of sprites) {
                sp.node.opacity = this.disableOpacity;
            }
        }
    }

    public static onBtnTouchMoved(e: cc.Event.EventTouch): void {
        let touchLocation = e.getLocation();
        let btn = e.getCurrentTarget();
        let pos = btn.convertToNodeSpaceAR(touchLocation);
        let hit = pos.x > -btn.width * 0.5 && pos.x < btn.width * 0.5 &&
            pos.y > -btn.height * 0.5 && pos.y < btn.height * 0.5;

        if (!hit) {
            let sprites = btn.getComponentsInChildren(cc.Sprite);
            for (let sp of sprites) {
                sp.node.opacity = 255;
            }
        }

    }

    public static onBtnTouchEnd(e: cc.Event.EventTouch): void {
        let btn = e.target as cc.Node;
        let sprites = btn.getComponentsInChildren(cc.Sprite);
        for (let sp of sprites) {
            sp.node.opacity = 255;
        }
    }
}