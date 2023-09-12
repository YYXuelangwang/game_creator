import JTContainer from "../../../com/base/JTContainer";
import { Handler } from "../../../../SlotUtils/Handle";
import { JTLineInfo } from "../../JTScrollerLineParser";

/*
* name;可扩展皮肤基类
*/
export default abstract class JTSkinnable extends JTContainer {
    /**
     * 默认宽
     */
    protected _defaultWidth: number = 0;
    /**
     * 默认高
     */
    protected _defaultHeight: number = 0;
    /**
     * 当前皮肤显示对象
     */
    protected _skinContainer: cc.Node = null;
    /**
     * 当前皮肤显示对象的容器Class类
     * 支持(各种Class类)
     */
    protected _skinClass: any = null;
    // protected _mask:any = null;

    protected _singleLineComplete: Handler = null;

    constructor() {
        super();
    }

    /**
     * 预加载
     */
    public preloader(): void {

    }
    /**
     * 改变皮肤样式，由切换线时调度
     * @param data 中奖线的逻辑（没有 试过，自己尝试改一下）
     */
    public changedSkinnable(data: any): void {

    }

    /**更改皮肤 */
    public setSkeSkin(data: any): void {

    }

    /**
     * 显示
     */
    public show(singleLineComplete?: Handler, isMask?: boolean, winCount?: number, direction?: number, lineInfo?: JTLineInfo, winCoinNum?: number): void {
        if (this._skinContainer)
            this._skinContainer.active = true;
    }

    /**
     * 隐藏
     */
    public hide(): void {
        if (this._skinContainer)
            this._skinContainer.active = false;
    }

    /**
     * 安装默认皮肤容器Class
     * @param cls 皮肤的容器
     */
    public setupDefaultSkinClass(cls: any): void {
        this._skinClass = cls;
        this._skinContainer = new cls();
    }

    /**
     * 添加子显示对像到皮肤容器上
     * @param child 
     */
    public addChild(child: any): void {
        this._skinContainer.addChild(child);
    }

    /**
     * 设置纹理信息
     * @param texture 纹理对像
     * @param index 当前索引值
     */
    public setupTexture(texture: any, index?: number): void {
        (this._skinContainer as any).texture = texture;
    }

    /**
     * 当前皮肤显示对象
     */
    public get skinContainer(): cc.Node {
        return this._skinContainer;
    }
    /**
     * 当前皮肤显示对象
     */
    public set skinContainer(value: cc.Node) {
        this._skinContainer = value;
    }
    /**
     * 默认高
     */
    public set defaultHeight(value: number) {
        this._defaultHeight = value;
    }

    /**
     * 默认高
     */
    public get defaultHeight(): number {
        return this._defaultHeight;
    }

    /**
     * 默认宽
     */
    public set defaultWidth(value: number) {
        this._defaultWidth = value;
    }

    /**
     * 默认宽
     */
    public get defaultWidth(): number {
        return this._defaultWidth;   //2018.1.11 change by lmb
    }

    /**
     * 创建完成
     * @param data 
     */
    public abstract createComplete(data?: any): void;

    /**
     * 遮罩设置
     */
    public set mask(value: any) {
        if (this._skinContainer) {
            //if (value) (this._skinContainer as JTMask).parent = null;
            // (this._skinContainer as JTMask).parent  = value;

            // (value as JTMask).parent=this._skinContainer;//cocosMask

        }
    }


    public set singleLineComplete(value: Handler) {
        this._singleLineComplete = value;
    }
    /**
     * 单挑中奖线播放完毕
     */
    public get singleLineComplete(): Handler {
        return this._singleLineComplete;
    }
}