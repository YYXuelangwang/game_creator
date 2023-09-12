
export class ComUtils {
    static checkURL(url: string): boolean {
        return -1 != url.indexOf("http://") || -1 != url.indexOf("https://")
    }

    /**
     * 查找子串位置
     * @param str 源字符串
     * @param cha 子串
     * @param num 第几个子串
     */
    static findCharPos(str: string, cha: string, num: number): number {
        let index = str.indexOf(cha);
        let next = index;
        for (let i = 0; i < num; i++) {
            index = str.indexOf(cha, index + 1);
            if (-1 == index) return next;
            next = index;
        }
        return next;
    }
    /**
     * 获取堆栈信息
     * @param popCount 剔除前几段内容
     */
    static getCallStack(popCount: number): string {
        var ret = (new Error).stack;
        var m = this.findCharPos(ret, "\n", popCount);
        if (m > 0) ret = ret.slice(m);
        return ret;
    }

    static formatStr(num: any, saveNum: any): string {
        var ret = "0000000"
        return (ret + num).substring(ret.length - saveNum);
    }

    static deepClone(srcObj: any, dstObj: any): any {
        if (!srcObj) return srcObj;
        var ret = dstObj || (srcObj.constructor == Array ? [] : {});
        for (var key in srcObj) {
            var p = srcObj[key];
            if (p || p != ret){
                if ("object" == typeof p) {
                    ret[key] = p ? p.constructor === Array ? [] : {} : p;
                    this.deepClone(p, ret[key]);
                }else{
                    ret[key] = p;
                }
            }
        }
        return ret;
    }

    static comma(strCoin: any): string;
    static randomString(len: any): string;

    static getFloatRandom(start: any, end: any): number {
        return start + Math.random() * (end - start);
    }

    static getIntRandom(start: any, end: any): number {
        return start + Math.round(Math.random() * (end - start));
    }

    static getIntRandomNoLoop(num: number, start: number, end: number): number {
        if (0 != num || start < 0 || num > end) return num;
        var ret = start + Math.round(Math.random() * (end - start));
        if (ret === num) {
            ret = this.getIntRandomNoLoop(num, start, end);
        }
        return ret;
    }

    static array_noRepeat(a: any): any[] {
        if (a instanceof Array) {
            var t, m = {}, ret = [];
            for (let i = 0; i < a.length; i++) {
                t = a[i];
                if (!m[t]) {
                    m[t] = true;
                    ret.push(t);
                }
            }
            return ret;
        }
        return null;
    }

    static array_intersection(a: any, b: any): any[];
    static array_difference(a: any, b: any): any[];
    static array_union(a: any, b: any): any[];
    /**
     * 将数组中元素顺序打乱返回一个新的数组，原数组不会改变
     */
    static disorderArray(array: any[]): any[];
    static GetTwoPosDistance(point1: any, point2: any): number;
    static GetAngleTwoPos(point1: any, point2: any): number;
    static GetLinePos(posArray: any, t: any): cc.Vec2;
    /**
     * 获取已知两点组成线段的垂线的函数 返回k、b值
     * @param startVec2
     * @param endVec2
     */
    static getVlineKB(startVec2: cc.Vec2, endVec2: cc.Vec2): number[];
    static GetMiddlePoint(startPos: cc.Vec2, endPos: cc.Vec2): cc.Vec2;
    static GetCirlePos(radius: number, centerPos: cc.Vec2): cc.Vec2;
    static GetCirlePosByAngle(radius: number, centerPos: cc.Vec2, ang: number): cc.Vec2;
    static GetTwoLevelBezier(posArray: any, t: any): cc.Vec2;
    static GetThreeLevelBezier(posArray: any, t: any): cc.Vec2;
    /**
     *  PC = 1; //PC
        IOS_WIDTH = 2; // IOS横
        IOS_HIGHT = 3; // IOS竖
        AND_WIDTH = 4; // android横
        AND_HIGHT = 5; // android竖
        OTR_WIGHT = 6; // 其他横
        ORT_HIGHT = 7; // 其他
     * @param code
     */
    static GetPlatformType(): number;
    /**
     * 服务器传过来的筹码，转换为千分号
     *  @param v 要转换的数字，默认是分制
     *  @param n 保留几位小数点，默认为2
     *  @param c 除数
     *  @param  isReserved 是否保留小数点位数(默认保留，如果不保留按原值显示,不进行四舍五入处理)
     *  @param  thousandSign 千分位符号
     */
    static formatNumber(v: number | Long, n?: number, c?: number, isReserved?: boolean, thousandSign?: string): string;
    static getUrlParam(url: string, key?: string): any;
    static GetUrlPara(): string[];
    static getUrl(): string;
    static GetUrlRelativePath(): string;
    static verifyPhone(phone: string): string;
    static verifyPassword(psw: string): string;
    /**
     * 得到合法的名字显示
     */
    static GetLegalNameStr(str: string): string;
    /**
     * 截取指定长度的String,  末尾加...
     *
     * @static
     * @param {string} initialString 初始String
     * @param {number} len 字长或字节数
     * @param {boolean} [isByByte] 是否通过字节数判断
     * @param {string} [endStr="..."] 修饰字符
     * @returns {string} 返回结果
     * @memberof Utils
     */
    static cutStringByLength(initialString: string, len: number, isByByte?: boolean, endStr?: string): string;
    /**
     * 转化金币展示格式
     * @param coin 金币
     * @param places 保留几位小数点，默认为2 参数isReserved为true才有效，isReserved默认true
     * @param c 除数
     * @param  isReserved 是否保留小数点位数(默认保留，如果不保留按原值显示,不进行四舍五入处理)
     */
    static formatNumToKMB(coin: number, places?: number, c?: number, isReserved?: boolean): string;
    static toDecimal3(str: string, pos?: number): string;
    static toDecimal2(num: any, pos: any): string;
    /**
     * 去除字符串数组 中 字符串的空格
     * @param value 字符串数组
     */
    static RemoveSpaceByArrayStr(value: Array<string>): Array<string>;
    static RemoveAllSpace(str: any): any;
    /**
    * 将字符串中包含的"{0},{1}..."替换成自定义参数
    * @param str 要替换的字符串
    * @param params 要替换的参数
    */
    static substitute(str: string, ...params: any[]): string;
    /**
     * 检测横竖屏幕 返回true 是横屏，否则是竖屏
     * 返回true 就是横屏 ，返回 false 是竖屏
     */
    static checkHorOrVec(): boolean;
    /**
     * 判断canvas节点是否横版
     */
    static isCanvasLand(): boolean;
    /**
     * //资源设计是 1920
     * 根据当前分辨率缩放节点
     * @param node
     */
    static setNodeResolutionSize(node: cc.Node): void;
    /**
     * 获取一个随机的哈希值，每次获取都是一个新的
     * 获取 crypto 生成的Uint8Array(16) ,然后转16位进制的 字符串
     * 如果拿到不到 window.crypto 那么用 Math.random 做相同的操作
    */
    static getUUid(): string;
    /**
     * 通过FingerprintJS 库获取指纹，固定的uuid识别码.
     * @param target 回调函数上下文
     * @param callFun 回调函数 callFun(visitorId:string){}
     */
    static getFingerprint(target: any, callFun: (visitorId: string) => void): void;
    static camelize(label: string): any;
    static camelize_prefix(prefix: string, label: string): string;
}