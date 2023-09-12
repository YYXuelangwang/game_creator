import JTAdvanceSkinnableLine from "./base/JTAdvanceSkinnableLine";
import JTRenderMode from "../JTRenderMode";
import JTTextureBounds from "../../com/canvas/JTTextureBounds";
import JTLineRender from "../JTLineRender";
import JTLineScrollerGroup from "../../extensions/JTLineScrollerGroup";

/*
* name 预先创建静态线渲染器<美术资源>
*/
export default class JTSkinnableArtLineRender extends JTAdvanceSkinnableLine
{
    constructor()
    {
        super();
        this._mode = JTRenderMode.MODE_ART_PRIORITY;
    }

    /**
     * 创建完成
     * @param bounds 
     */
    public createComplete(bounds?:JTTextureBounds):void
    {
            let lineRender:JTLineRender = this._owner as JTLineRender;
            let scroller:JTLineScrollerGroup = lineRender.scroller;
            let index:number = lineRender.lineId;
            // this._skinContainer = scroller.buttonsComponent.getChild("imgLine_" + index).displayObject;
            
            // let x:number = this._skinContainer.x;
            // let y:number = this._skinContainer.y;
            // let point:Laya.Point = scroller.lineButtons.globalToLocal(x, y, new Laya.Point())
            // scroller.buttonsComponent.removeChild(this._skinContainer);
            // this._skinContainer.x = -10;
            // this._skinContainer.y = -10;
            // lineRender.skinnables.push(this);
            // this._skinContainer.x = point.x
            // this._skinContainer.y = point.y;
    }

    /**
     * 设置纹理信息
     * @param texture 纹理
     * @param index 当前索引值
     */
    public setupTexture(texture:cc.Texture2D, index?:number):void
    {
             
    }
}