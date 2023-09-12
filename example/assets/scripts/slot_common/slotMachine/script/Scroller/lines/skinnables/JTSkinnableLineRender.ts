import JTAdvanceSkinnableLine from "./base/JTAdvanceSkinnableLine";
import JTRenderMode from "../JTRenderMode";
import JTImage from "../../com/base/JTImage";
import JTTextureBounds from "../../com/canvas/JTTextureBounds";

/*
* name;预先创建线（程序框--质量框）
*/
export default class JTSkinnableLineRender extends JTAdvanceSkinnableLine
{
//     private lineTween:Laya.Tween = null;
    constructor()
    {
        super();
        // if (JTCanvasTools.canvas) JTCanvasTools.canvas.lineWidth = 6;
        this._mode = JTRenderMode.MODE_QUALITY_PRIORITY;
        this.setupDefaultSkinClass(JTImage);
        // this.lineTween = new Laya.Tween();
    }
    /**
     * 创建完成
     * @param bounds 
     */
    public createComplete(bounds?:JTTextureBounds):void
    {
        //     let lineRender:JTILineRender = this.owner as JTILineRender;
        //     let canvas:JTCanvas = lineRender.canvas;
        //     let renders:JTIItemRender[] = lineRender.renders;
        //     let points:cc.Vec2[] = lineRender.points;
        //     let canvasStyle:JTCanvasStyle = lineRender.canvasStyle;
        //     canvas.begin();
        //     canvas.setStyle(canvasStyle);
        //     canvas.begin();
        //     for (let i:number = 0; i < renders.length; i++)
        //     {
        //             let r:JTIItemRender = renders[i];
        //             let offPoint:cc.Vec2 = points[i];
        //             let moveX:number = offPoint.x + bounds.x;
        //             let moveY:number = offPoint.y + bounds.y;
        //             if (i == 0)
        //             {
        //                     canvas.moveTo(moveX, moveY);
        //             }
        //             else
        //             {
        //                     canvas.lineTo(moveX, moveY);
        //             }
        //     }
        //     canvas.endFill();
    }

    public show():void
    {
            super.show();
        //     this.lineTween.to(this._skinContainer, )
    }

    public setupTexture(texture:cc.Texture2D, index?:number):void
    {
                // super.setupTexture(texture);
                // this.x = JTCanvasTools.canvas.lineWidth;
                // this.y = JTCanvasTools.canvas.lineWidth;
    }

}