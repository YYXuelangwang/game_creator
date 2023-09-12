import JTAdvanceSkinnableGrid from "./base/JTAdvanceSkinnableGrid";
import JTRenderMode from "../JTRenderMode";
import JTImage from "../../com/base/JTImage";
import JTTextureBounds from "../../com/canvas/JTTextureBounds";
import { JTCanvasStyle } from "../../com/canvas/JTCanvasStyle";
import JTGraphics from "../../com/base/JTGraphics";
import JTLineRender from "../JTLineRender";


/*
* name;预先创建格子框（程序框--质量框）
*/
export default class JTSkinnableGridRender extends JTAdvanceSkinnableGrid
{
    constructor()
    {
        super();
        // if (JTCanvasTools.canvas) JTCanvasTools.canvas.lineWidth = 6;
        this._mode = JTRenderMode.MODE_QUALITY_PRIORITY;
        this.setupDefaultSkinClass(JTImage);
    }

    /**
     * 创建完成
     * @param bounds 
     */
    public createComplete(bounds?:JTTextureBounds):void
    {
            let canvas:JTGraphics = new JTGraphics();
            this.skinContainer=canvas;
    }

    public show():void{
        let lineRender:JTLineRender = this.owner as JTLineRender;
        let canvas:JTGraphics = this.skinContainer as JTGraphics;
        let canvasStyle:JTCanvasStyle = lineRender.canvasStyle;
        canvas.graphics.clear();
        canvas.graphics.strokeColor=cc.Color.BLACK.fromHEX(canvasStyle?canvasStyle.strokeStyle:JTCanvasStyle.strokeStyle);
        canvas.graphics.lineWidth =JTCanvasStyle.lineWidth;
        canvas.graphics.rect(-canvas.width/2,-canvas.height/2,canvas.width,canvas.height);
        canvas.graphics.stroke();
        super.show();
    }

    //待优化，可以设置this.displayObject.cmds[]
    //显示的时候就通过cmds命令把texture, x, y 等参数传进去，
    //隐藏的时候就直接删除cmds命令的成员
    //但是此设置不能和自定义格子通过....
    public setupTexture(texture:cc.Texture2D, index?:number):void
    {
            //let skinnable:JTISkinnableContainerRender = this._owner as JTISkinnableContainerRender;
            //(this._skinContainer as JTImage).content.spriteFrame= new cc.SpriteFrame(texture);
            //let point:cc.Vec2 = skinnable.gridRenderPoints[index];
            //this.skinContainer.x = point.x;
            //this.skinContainer.y = -point.y;
    }

    public changedSkinnable(data:any):void
    {

    }
}