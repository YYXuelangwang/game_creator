import JTAdvanceSkinnableLine from "./base/JTAdvanceSkinnableLine";
import JTRenderMode from "../JTRenderMode";
import JTImage from "../../com/base/JTImage";
import JTTextureBounds from "../../com/canvas/JTTextureBounds";
import JTConfigGroup from "../../com/JTConfigGroup";
import JTCanvasTools from "../../com/canvas/JTCanvasTools";
import JTItemRender from "../../com/base/JTItemRender";
import SlotUtils from "../../../SlotUtils/SlotUtils";
import JTLineRender from "../JTLineRender";
import JTLineScrollerGroup from "../../extensions/JTLineScrollerGroup";

/*
* name 预先创建格子框（程序框--性能框）
*/
export default class JTSkinnableScaleLineRender extends JTAdvanceSkinnableLine
{

    constructor()
    {
        super();
        this._mode = JTRenderMode.MODE_PERFORMANCE_PRIORITY;
        this.setupDefaultSkinClass(JTImage)
        // this.lineMask.y = this.lineMask.x = JTCanvasTools.canvas.lineWidth;
        // (this.lineContainer as any).x = (this.lineContainer as any).y = -JTCanvasTools.canvas.lineWidth;
    }
    /**
     * 创建完成
     * @param bounds 
     */
    public createComplete(bounds:JTTextureBounds):void
    {
        // let lineRender:JTILineRender = this.owner as JTILineRender;
        // let canvas:JTCanvas = lineRender.canvas;
        // let redners:JTIItemRender[] = lineRender.renders;
        // let girdPoints:cc.Vec2[] = lineRender.gridPoints;
        // let canvasStyle:JTCanvasStyle = lineRender.canvasStyle;
        // canvas.begin();
        // canvas.setStyle(canvasStyle);
        // canvas.begin();
        // let moveX:number = bounds.x;
        // let moveY:number = bounds.y;
        // canvas.moveTo(moveX, moveY);
        // canvas.lineTo(moveX + bounds.rect.width, moveY);
        // canvas.endFill();
    }

    /**
     * 设置纹理信息
     * @param texture 纹理
     * @param index 当前索引值
     */
    public setupTexture(texture:any, index?:number):void
    {
        let lineRender:JTLineRender = this.owner as JTLineRender;
        let renders:JTItemRender[] = lineRender.renders;
        let scroller:JTLineScrollerGroup = lineRender.scroller;
        let config:JTConfigGroup = scroller.config;
        let distanceX:number = 0;
        let distanceY:number = 0;
        let centerXY:number = JTCanvasTools.lineWidth
        let images:JTImage[] = [];
        for(let i:number = 0; i < config.col - 1; i++)
        {
            let image:JTImage = new JTImage();
            let t:cc.Texture2D = null;
            let value:number = 0;
            // if (i == 0)
            // {
            //         t = Laya.Texture.create(texture, 0, 0, texture.width - 2, texture.height);
            // }
            // else if (i == 3)
            // {
            //         t = Laya.Texture.create(texture, 2, 0, texture.width - 2, texture.height);
            // }
            // else 
            // {
            //         t = Laya.Texture.create(texture, 2, 0, texture.width - 4, texture.height);
            // }
            // image.source = t;
            // image.sizeGrid = "3,4,4,3,0";
            // image.pivotY = 5;
            //t =  //Laya.Texture.create(texture, 0, 0, 10, 10);
            //image.source = t;
            //image.sizeGrid = "4,4,4,4,0";
            SlotUtils.setScale9GridRect(image,new  cc.Rect(3,1,3,1));
            //image.pivotX=image.pivotY = centerXY/2;
            image.setAnchorPoint(centerXY/2,centerXY/2);//cocos 
            let r:JTItemRender = renders[i] as JTItemRender;
            let nxr:JTItemRender = renders[i + 1] as JTItemRender;
            let point:cc.Vec2 = scroller.getRenderCenterPoint(r.index);
            let nxp:cc.Vec2 = scroller.getRenderCenterPoint(nxr.index);
            distanceX = (nxp.x - point.x);
            distanceY = (nxp.y - point.y);
            if(distanceY != 0) 
            {
                let angle = -SlotUtils.toAngle(Math.atan(distanceY / distanceX));
                image.angle = angle;
            }
            // image.width = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2)) + centerXY / 4 + 3;
            // image.x = point.x - centerXY;
            // image.y = point.y + centerXY;
            image.width = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2)) + centerXY;
            image.x = point.x;
            image.y = point.y;
            images.push(image);
        }
        // this.addChild(images[0]);
        // this.addChild(images[3]);
        // this.addChild(images[2]);
        // this.addChild(images[1]);
        for (var i = 0; i < images.length; i++)
        {
            this.addChild(images[i]);
        }
    }
}