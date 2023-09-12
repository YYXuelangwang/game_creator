/*
* name;
*/
import JTGComponent from "./JTGComponent";
import JTGLoader from "../../renders/JTGLoader";
import JTContainer from "./JTContainer";


export default abstract class JTItemSkinLoader extends JTGComponent {
    protected _skinLoader: JTGLoader = null;//cocos
    constructor() {
        super();
    }

    /**
     * 安装皮肤加载器
     * @param x 皮肤加载器的X坐标 
     * @param y 皮肤加载器的Y坐标
     * @param parent 皮肤加载器的父容器
     * @param isScale 是否支持自动填充父容器的宽高
     */
    public setupSkinLoader(x: number, y: number, parent: JTContainer, isScale: boolean = true): JTGLoader {
        this._skinLoader = new JTGLoader();
        parent && (parent as any).addChild(this.skinLoader);
        this._skinLoader.touchable = false;
        if (isScale) {
            // this._skinLoader.fill = fairygui.LoaderFillType.Scale; 
            // this._skinLoader.addRelation(this, fairygui.RelationType.Width); 
            // this._skinLoader.addRelation(this, fairygui.RelationType.Height);
            //cocos
        }
        this._skinLoader.x = x;
        this._skinLoader.y = y;
        return this._skinLoader;
    }

    /**
     * 重置皮肤加载器
     */
    public reset(): void {
        if (this._skinLoader && this._skinLoader.parent) {
            this._skinLoader.scaleX = this._skinLoader.scaleY = 1;
            this._skinLoader.opacity = 255;
            this._skinLoader.y = 0;
            this._skinLoader.url = null;
        }
    }

    /**
     * 皮肤加载器
     */
    public get skinLoader(): JTGLoader {
        return this._skinLoader;
    }

    public set skinLoader(value: JTGLoader) {
        this._skinLoader = value;
    }

    /**
     * 清除皮肤加载器
     */
    public clearSkinLoader(): void {
        if (this._skinLoader) this._skinLoader.url = null;
    }
}