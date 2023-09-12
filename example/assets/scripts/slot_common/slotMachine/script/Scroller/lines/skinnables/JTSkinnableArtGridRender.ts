import JTAdvanceSkinnableGrid from "./base/JTAdvanceSkinnableGrid";
import JTRenderMode from "../JTRenderMode";
import JTTextureBounds from "../../com/canvas/JTTextureBounds";
import JTConfigGroup from "../../com/JTConfigGroup";
import JTGLoader from "../../renders/JTGLoader";
import JTCanvasTools from "../../com/canvas/JTCanvasTools";
import JTLineScrollerGroup from "../../extensions/JTLineScrollerGroup";
import JTScatterGridRender from "../JTScatterGridRender";

/*
* name;预先创建格子框渲染器《美术资源》(目前是用的Gloader做为显示对象的)
*/
export default class JTSkinnableGridArtRender extends JTAdvanceSkinnableGrid
{
    constructor()
    {
        super();
        this._mode = JTRenderMode.MODE_ART_PRIORITY;
    }

    // private _slotFrameAniName:string = "ui://Game/SlotFrameAni";

    /**
     * 获取边框资源名
     */
    public getSlotFrameResName():string{
        return "ui://Game/SlotFrameAni";
    }

    /**
     * 创建完成
     * @param bounds 
     */
    public createComplete(bounds?:JTTextureBounds):void
    {
            let slotFrameAniName:string = this.getSlotFrameResName();
            let lineRender:JTScatterGridRender = this._owner as JTScatterGridRender;
            let scroller:JTLineScrollerGroup = lineRender.scroller;
            let config:JTConfigGroup = scroller.config;
            // let index:number = lineRender.lineId;
            let gloader:JTGLoader = new JTGLoader();
            this.skinContainer = gloader;//cocos
            gloader.url = slotFrameAniName;  
            //gloader.fill = fairygui.LoaderFillType.Scale; 
            gloader.setAnchorPoint(.5, .5);//cocos

            gloader.width = config.girdWidth + JTCanvasTools.lineWidth;
            gloader.height = config.girdHeight + JTCanvasTools.lineWidth;
            this._defaultWidth = config.girdWidth + JTCanvasTools.lineWidth;
            this._defaultHeight = config.girdHeight + JTCanvasTools.lineWidth;
            // let renders:JTIItemRender[] = lineRender.renders;
            // for (let i:number = 0; i < renders.length; i++)
            // {
            //         let r:JTItemRender = renders[i] as JTItemRender;
            //         if (i == 0)
            //         {
            //               gloader.width = r.width - 20;
            //               gloader.height = r.height - 20;
            //               this._skinContainer.x = r.x - (gloader.width - r.width) / 2;
            //               this._skinContainer.y = r.y - (gloader.height - r.height) / 2;
            //               this._defaultWidth = r.width;
            //               this._defaultHeight = r.height;
            //               lineRender.gridRenders.push(this);
            //               lineRender.skinnables.push(this);
            //               continue;
            //         }
            //         let gridRender:JTSkinnableGridArtRender = new JTSkinnableGridArtRender();
            //         let loader:fairygui.GLoader = new fairygui.GLoader();
            //         gridRender.skinContainer = loader.displayObject;
            //         loader.fill = fairygui.LoaderFillType.Scale; 
            //         loader.addRelation(loader, fairygui.RelationType.Width); 
            //         loader.addRelation(loader, fairygui.RelationType.Height);
            //         loader.url = slotFrameAniName;   
            //         loader.width = r.width - 20;
            //         loader.height = r.height - 20;
            //         lineRender.gridRenders.push(gridRender);
            //         lineRender.skinnables.push(gridRender);
            //         (scroller.gridContainer as any).displayObject.addChild(gridRender.skinContainer);
            //         gridRender.skinContainer.x = (r.owner as any).x - (loader.width - r.width) / 2;
            //         gridRender.skinContainer.y = r.y - (loader.height - r.height) / 2;
            // } 
            // lineRender.showGrids(0);
    }

    /**
     * 设置纹理信息
     * @param texture 纹理
     * @param index 当前索引值
     */
    public setupTexture(texture:cc.Texture2D, index?:number):void
    {
            let skinnable:JTScatterGridRender = this._owner as JTScatterGridRender;
            let globlaPoint:cc.Vec2 = skinnable.gridRenderPoints[index];
            this.skinContainer.x = globlaPoint.x - JTCanvasTools.lineWidth / 2;
            this.skinContainer.y = globlaPoint.y - JTCanvasTools.lineWidth / 2;
    };
}