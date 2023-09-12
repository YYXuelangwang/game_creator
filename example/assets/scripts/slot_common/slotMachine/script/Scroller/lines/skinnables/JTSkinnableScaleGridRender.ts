import JTAdvanceSkinnableGrid from "./base/JTAdvanceSkinnableGrid";
import JTRenderMode from "../JTRenderMode";
import JTImage from "../../com/base/JTImage";
import JTTextureBounds from "../../com/canvas/JTTextureBounds";
import JTLineRender from "../JTLineRender";
import JTSkinnable from "./base/JTSkinnable";


/*
* name;
*/
export default class JTSkinnableScaleGridRender extends JTAdvanceSkinnableGrid
{
    private static skinnables:JTSkinnable[] = [];
    constructor()
    {
        super();
        // JTCanvasTools.canvas.lineWidth = 6;
        this._mode = JTRenderMode.MODE_QUALITY_PRIORITY;
        this.setupDefaultSkinClass(JTImage);
    }
    /**
     * 创建完成
     * @param bounds 
     */
    public createComplete(bounds?:JTTextureBounds):void
    {
             let lineRender:JTLineRender = this.owner as JTLineRender;
        //     let canvas:JTCanvas = lineRender.canvas;
        //     let redners:JTIItemRender[] = lineRender.renders;
        //     let girdPoints:cc.Vec2[] = lineRender.gridPoints;
        //     let canvasStyle:JTCanvasStyle = lineRender.canvasStyle;
        //     canvas.begin();
        //     canvas.setStyle(canvasStyle);
        //     canvas.begin();
        //     for (let i:number = 0; i < redners.length; i++)
        //     {
        //         let offPoint:cc.Vec2 = girdPoints[i];
        //         let moveX:number = offPoint.x + bounds.x;
        //         let moveY:number = offPoint.y + bounds.y;
        //         if (i == 0)
        //         {
        //                 canvas.moveTo(moveX, moveY);
        //         }
        //         else
        //         {
        //                 canvas.lineTo(moveX, moveY);
        //         }
        //     }
        //     canvas.endFill();
            lineRender.skinnables.push(this);
    }

    //待优化，可以设置this.displayObject.cmds[]
    //显示的时候就通过cmds命令把texture, x, y 等参数传进去，
    //隐藏的时候就直接删除cmds命令的成员
    //但是此设置不能和自定义格子通过....
    public setupTexture(texture:any, index?:number):void
    {
          
            // super.setupTexture(texture);
            // let lineRender:JTILineRender = this.owner as JTILineRender;
            // let scroller:JTILineScrollerGroup = lineRender.scroller;
            // let renders:JTIItemRender[] = lineRender.renders;
            // let ir:JTItemRender = renders[0] as JTItemRender;
            // let globlaPoint:Laya.Point = scroller.getRenderPoint(ir.index);
            // this._skinContainer.x = globlaPoint.x - JTCanvasTools.canvas.lineWidth / 2;
            // this._skinContainer.y = globlaPoint.y - JTCanvasTools.canvas.lineWidth / 2;
            // this._defaultWidth = ir.width;
            // this._defaultHeight = ir.height;

            // if (JTSkinnableScaleGridRender.skinnables.length == 0)
            // {
            //     for (let i:number = 1; i < renders.length; i++)
            //     {
            //             let r:JTItemRender = renders[i] as JTItemRender;
            //             let globlaPoint:Laya.Point = scroller.getRenderPoint(r.index);
            //             let gridRender:JTSkinnableScaleGridRender = new JTSkinnableScaleGridRender();
            //             gridRender.skinContainer.texture = texture;
            //             gridRender.defaultWidth = r.width;
            //             gridRender.defaultHeight = r.height;
            //             lineRender.gridRenders.push(gridRender);
            //             (scroller.gridContainer as any).displayObject.addChild(gridRender.skinContainer);
            //             gridRender.skinContainer.x = globlaPoint.x - JTCanvasTools.canvas.lineWidth / 2;
            //             gridRender.skinContainer.y = globlaPoint.y - JTCanvasTools.canvas.lineWidth / 2;
            //     } 
            // }
            // lineRender.showGrids(0);
    }
}