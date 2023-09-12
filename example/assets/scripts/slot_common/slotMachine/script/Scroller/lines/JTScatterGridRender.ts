import JTContainer from "../com/base/JTContainer";
import JTLayerFactory from "../com/factorys/JTLayerFactory";
import JTGComponent from "../com/base/JTGComponent";
import JTLineRenderUtils from "./JTLineRenderUtils";
import { SDictionary } from "../../SlotData/SDictionary";
import JTChildFactory from "../com/factorys/JTChildFactory";
import JTRuntimeSkinnable from "./skinnables/base/JTRuntimeSkinnable";
import JTLogger from "../JTLogger";
import JTSkinnableGridRender from "./skinnables/JTSkinnableGridRender";
import JTAdvanceSkinnable from "./skinnables/base/JTAdvanceSkinnable";
import JTSkinnableGridArtRender from "./skinnables/JTSkinnableArtGridRender";
import JTItemRender from "../com/base/JTItemRender";
import RollingResult from "../../SlotData/RollingResult";
import JTSkinnable from "./skinnables/base/JTSkinnable";
import JTLineScrollerGroup from "../extensions/JTLineScrollerGroup";
import JTItemSkinLoader from "../com/base/JTItemSkinLoader";
import BaseSpinSlotView from "../../MainView/BaseSpinSlotView";

/*
* name;
*/
export default class JTScatterGridRender extends JTContainer
{
    /**
     * 格子框Map数组
     */
    protected _gridMap:Object = null;
    /**
     * 格子框容器
     */
    protected _gridContainer:JTContainer = null;
    /**
     * 格子框渲染器列表
     */
    protected _gridRenders:JTSkinnable[] = null;
    /**
     * 格子框坐标点列表
     */
    protected _gridRenderPoints:cc.Vec2[] = null;
    /**
     * 滚轴组视图
     */
    protected _scroller:JTLineScrollerGroup = null;
    constructor()
    {
        super();
        this.gridRenderPoints = [];
    }

    /**
     * 初始化
     */
    public initialize():void
    {
         this._gridMap = {};
         this._gridRenders = [];
         this._scroller = this.owner as JTLineScrollerGroup;
         this._gridRenderPoints = this.getGridRenderPoints();
         this.gridContainer = this._scroller.factoryLayer.produce(JTLayerFactory.SCATTER_GRID_CONTAINER, this._scroller) as JTGComponent;
    }

    /**
     * 创建可扩展皮肤
     * @param type 类型
     * @param container 可护展皮肤容器 
     */
    public createSkinnable(type:number, container?:JTContainer):JTSkinnable
    {
            let skinnable:JTSkinnable = this._scroller.factoryChild.produce(type, this) as JTSkinnable;
            return skinnable;
    }

    /**
     * 获取格子框坐标点列表
     */
    protected getGridRenderPoints():cc.Vec2[]
    {
            let renders:JTItemSkinLoader[] = this._scroller.renders;
            let points:cc.Vec2[] = [];
            for (let i:number = 0; i < renders.length; i++)
            {
                let r:JTItemRender = renders[i] as JTItemRender;
                let point:cc.Vec2 = this._scroller.getRenderPoint(r.index);
                points.push(point);
            }
            return points;
    }

    /**
     * 创建
     * @param lineUtils 线渲染器工具
     */
    public create(lineUtils:JTLineRenderUtils):void
    {
           //let renders:JTItemSkinLoader[] = this._scroller.renders;
           let gridTxtMap:SDictionary = lineUtils.gridTxtMap;
           let girdTexture:cc.Texture2D = gridTxtMap.get(1);
           let c = this._scroller.config;
           let count = c.row*c.col;
           for (let i:number = 0; i < count; i++)
           {
                //let r:JTItemRender = renders[i] as JTItemRender;
                let skinnable:JTSkinnable = this.createSkinnable(JTChildFactory.SCATTER_GRID_TYPE, this.gridContainer);
                if (!skinnable)
                {
                        skinnable = this.createSkinnable(JTChildFactory.GIRD_TYPE, this.gridContainer);
                }
                this.gridRenders.push(skinnable);
                // if (skinnable instanceof JTRuntimeSkinnable)
                // {

                // }
                // else
                // {
                    if (!girdTexture && skinnable instanceof JTSkinnableGridRender)
                    {   
                            JTLogger.info("JTScatterGridRender.create:              ");
                            skinnable.createComplete(null);
                            //return;
                    }
                    if (skinnable instanceof JTAdvanceSkinnable)
                    {
                            skinnable.setupTexture(girdTexture, i);
                            skinnable.defaultWidth = c.girdWidth;    //2018.1.11 change by lmb
                            skinnable.defaultHeight = c.girdHeight;
                    }
                    else if (skinnable instanceof JTSkinnableGridArtRender)//JTSkinnableGridArtRender
                    {
                            skinnable.createComplete(null);
                            skinnable.setupTexture(null, i);
                    }
                    if(skinnable && skinnable.skinContainer)
                    this.gridContainer&&(this.gridContainer as JTGComponent).addChild(skinnable.skinContainer);
                //}
           }
           this.showGrids(0);
    }
 
    /**
     * 显示格子框
     * @param line 线结果 
     * @param rs 中奖格子列表
     */
    public showGrid(line:RollingResult, rs:JTItemRender[]):void
    {
        let indexs:any[] = [];
        for (let i:number = 0; i < rs.length; i++)
        {
                let r:JTItemRender = rs[i] as JTItemRender;
                indexs.push(r.index);
        }
        this.showGrids(indexs);
    }

    /**
     * 按索引列表显示格子框
     * @param indexs 索引列表
     */
    public showGrids(indexs:any):void
    {
            if (indexs == 0)indexs = [];
            let totalCount:number = this._gridRenders.length;
            for (let i:number = 0; i < totalCount; i++)
            {
                    let skinnable:JTSkinnable = this._gridRenders[i] as JTSkinnable;
                    if(!skinnable) continue;
                    let r = this.scroller.getRenderByPos(i) as BaseSpinSlotView;
                    if(!r){
                        continue;
                    }
                    let p = this.scroller.getRenderPoint(r.index);
        
                    let skinContainer:any = skinnable.skinContainer;
                    if (!skinContainer) continue;
                    skinContainer.x = p.x;
                    skinContainer.y = p.y;
        
                    skinContainer.height = r.height;
                    skinContainer.width = r.width;
                    if (indexs.indexOf(i) == -1)
                    {
                            skinnable.hide();
                            continue;
                    } 
                    skinnable.show();
            }
    }
    
    /**
     * 隐藏格子
     * @param index 索引
     */
    public hideGrid(index:number):void
    {
        let skinnable:JTSkinnable = this._gridRenders[index] as JTSkinnable;
        skinnable && skinnable.hide();
        // let skinContainer:Laya.Image = skinnable.skinContainer;
        // skinContainer.visible = false;
    }

    public changedSkinnable(data:any):void
    {

    }

    /**
     * 格子框Map数组
     */
    public get gridMap():Object
    {
        return this._gridMap;
    }

    /**
     * 格子框Map数组
     */
    public set gridMap(value:Object)
    {
        this._gridMap = value;
    }

    /**
     * 滚轴组视图
     */
    public get scroller():JTLineScrollerGroup
    {
        return this._scroller;
    }

    /**
     * 滚轴组视图
     */
    public set scroller(value:JTLineScrollerGroup)
    {
        this._scroller = value;
    }

    /**
     * 格子渲染器列表
     */
    public get gridRenders():JTSkinnable[]
    {
        return this._gridRenders;
    }

    /**
     * 格子渲染器列表
     */
    public set gridRenders(value:JTSkinnable[])
    {
        this._gridRenders = value;
    }

    /**
     * 格子渲染器坐标列表
     */
    public get gridRenderPoints():cc.Vec2[]
    {
        return this._gridRenderPoints;
    }

    /**
     * 格子渲染器坐标列表
     */
    public set gridRenderPoints(value:cc.Vec2[])
    {
        this._gridRenderPoints = value;
    }

    /**
     * 格子渲染器容器
     */
    public get gridContainer():JTContainer
    {
        return this._gridContainer;
    }

    /**
     * 格子渲染器容器
     */
    public set gridContainer(value:JTContainer)
    {
        this._gridContainer = value;
    }
}