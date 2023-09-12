import JTRuntimeSkinnableGrid from "./base/JTRuntimeSkinnableGrid";
import JTConfigGroup from "../../com/JTConfigGroup";
import JTCanvasTools from "../../com/canvas/JTCanvasTools";
import JTGComponent from "../../com/base/JTGComponent";
import JTImage from "../../com/base/JTImage";
import JTLineRender from "../JTLineRender";
import JTSkinnable from "./base/JTSkinnable";
import JTLineScrollerGroup from "../../extensions/JTLineScrollerGroup";
import JTScatterGridRender from "../JTScatterGridRender";

/*
* name;name 运行时创建格子框（程序-质量框）
*/
export default class JTSkinnableRuntimeGridRender extends JTRuntimeSkinnableGrid 
{
//     private static canvas:JTCanvas = new JTCanvas("gridCanvas";
    constructor()
    {
        super();
    }
    /**
     * 创建完成
     * @param bounds 
     */
    public createComplete(data?:any):void
    {
            let lineRender:JTLineRender = this.owner as JTLineRender;
           // let canvas:JTCanvas = lineRender.canvas;
           // let rs:JTIItemRender[] = lineRender.renders;
           // let girdPoints:cc.Vec2[] = lineRender.gridPoints;
           // let canvasStyle:JTCanvasStyle = lineRender.canvasStyle;
            //let scroller:JTILineScrollerGroup = lineRender.scroller as JTILineScrollerGroup;
           // let c:JTConfigGroup = scroller.config;
            //canvas.setSize(c.girdWidth + 12, c.girdHeight + 12);
           // canvas.begin();
            //canvas.setStyle(canvasStyle);
           // for (let i:number = 0; i < rs.length; i++)
           // {
            //    let point:cc.Vec2 = girdPoints[i];
            //    let moveX:number = point.x;
            //    let moveY:number = point.y;
            //    if (i == 0)
            //    {
           //             canvas.moveTo(moveX, moveY);
            //    }
           //     else
           //     {
           //             canvas.lineTo(moveX, moveY);
            //    }
           // }
           // canvas.endFill();
           let image:JTImage = new JTImage();
           let atlas:cc.Texture2D = cc.loader.getRes("");//cocos
           image.content.spriteFrame=new cc.SpriteFrame(atlas);
           this._skinContainer = image;
            
    } 
        /**
     * 设置纹理信息
     * @param texture 纹理
     * @param index 当前索引值
     */
    public setupTexture(texture:any, index?:number):void
    {
            let skinnable:JTSkinnable = texture as JTSkinnable;
            let sContainer:JTScatterGridRender = this._owner as JTScatterGridRender;
            let scroller:JTLineScrollerGroup = sContainer.scroller;
            let config:JTConfigGroup = scroller.config;
            let globlaPoint:cc.Vec2 = scroller.getRenderPoint(index);
        //      let globlaPoint:Laya.Point = scroller.getRenderPoint(index);
            if (!this._skinContainer)
            {
                    this.skinContainer = new JTImage();
                    (this.skinContainer as JTImage).content.spriteFrame = (skinnable.skinContainer as JTImage).content.spriteFrame;
            }
            this.skinContainer.x = globlaPoint.x - JTCanvasTools.lineWidth / 2;
            this.skinContainer.y = globlaPoint.y - JTCanvasTools.lineWidth / 2;
            this.show();
            sContainer.gridRenderPoints.push(new cc.Vec2(this._skinContainer.x, this._skinContainer.y));
            scroller.gridContainer && (scroller.gridContainer  as JTGComponent).addChild(this._skinContainer);
    };
}