import JTCanvasTools from "../com/canvas/JTCanvasTools";
import { SDictionary } from "../../SlotData/SDictionary";
import JTAdvanceSkinnableLine from "./skinnables/base/JTAdvanceSkinnableLine";
import JTRuntimeSkinnableLine from "./skinnables/base/JTRuntimeSkinnableLine";
import JTAdvanceSkinnableGrid from "./skinnables/base/JTAdvanceSkinnableGrid";
import JTRuntimeSkinnableGrid from "./skinnables/base/JTRuntimeSkinnableGrid";
import JTChildFactory from "../com/factorys/JTChildFactory";
import JTConfigGroup from "../com/JTConfigGroup";
import JTTextureBounds from "../com/canvas/JTTextureBounds";
import JTRenderMode from "./JTRenderMode";
import JTGComponent from "../com/base/JTGComponent";
import JTItemRender from "../com/base/JTItemRender";
import JTGrid from "../com/canvas/JTGrid";
import JTLineRender from "./JTLineRender";
import JTOddsUtils from "../JTOddsUtils";
import FlashLight from "./skinnables/FlashLight";
import JTFactory from "../com/factorys/JTFactory";
import JTLineScrollerGroup from "../extensions/JTLineScrollerGroup";
import JTSkinnable from "./skinnables/base/JTSkinnable";
import JTAdvanceSkinnable from "./skinnables/base/JTAdvanceSkinnable";

/*
* name;
*/
export default class JTLineRenderUtils {
    /**
     * 画布工具
     */
    public _context: JTCanvasTools = null;
    /**
     * 滚轴组视图
     */
    public _scroller: JTLineScrollerGroup = null;
    /**
     * 默认线宽
     */
    public static DEFAULT_SKIN_COUNT: number = 4;
    /**
     * 线的计数器
     */
    protected _lineCounter: JTSkinnableCounter = null;
    /**
     * 格子框计数器
     */
    protected _gridCounter: JTSkinnableCounter = null;
    /**
     * 线渲染器Map数组
     */
    protected lineMap: SDictionary = null;
    /**
     * 执行次数
     */
    protected exeucteTimes: number = 0;
    /**
     * 默认总共次数
     */
    protected totalTimes: number = 0;

    /**
     * 格子框Map数组（用于护展百搭、分散、scatter）
     */
    public gridTxtMap: SDictionary = null;
    constructor() {
        this._context = new JTCanvasTools();
        this.gridTxtMap = new SDictionary();
    }

    /**
     * 创建线列表
     * @param scroller 滚轴组视图 
     * @param lineMap 线数组
     */
    public createLines(scroller: JTLineScrollerGroup, lineMap: SDictionary): void {
        this._scroller = scroller;
        let lineCount: number = this._scroller.lineCount;
        let factory: JTFactory = scroller.factoryChild;
        this._lineCounter = new JTSkinnableCounter();
        this._gridCounter = new JTSkinnableCounter();
        this.lineMap = lineMap;
        for (let i: number = 1; i < lineCount + 1; i++) {
            let lineRender: JTLineRender = this.createLine(i, scroller);
            if (!lineRender) {
                continue;
            }
            if (lineRender.lineItemRender instanceof JTAdvanceSkinnableLine) {
                this._lineCounter.counter(lineRender.lineItemRender);
            }
            else if (lineRender.lineItemRender instanceof JTRuntimeSkinnableLine) {
            }
            if (lineRender.gridItemRender instanceof JTAdvanceSkinnableGrid) {
                this._gridCounter.counter(lineRender.gridItemRender);
            }
            else if (lineRender.gridItemRender instanceof JTRuntimeSkinnableGrid) {
                for (let j: number = 1; j < lineRender.renders.length; j++) {
                    let skinnable: JTSkinnable = lineRender.createSkinnable(JTChildFactory.GIRD_TYPE, scroller.lineContainer);
                }
            }

            if (lineRender.flashLineItemRender) {
                for (let j: number = 1; j < lineRender.renders.length; j++) {
                    let skinnable: JTSkinnable = lineRender.createSkinnable(JTChildFactory.FLASH_LINE_TYPE, scroller.flashLineContainer);
                }
            }
            lineRender.addSkinnablesToLayer();
        }
        if (this._lineCounter.qualitys.length == 0 && this._gridCounter.qualitys.length == 0) {
            this.executeComplete();
        }
        else if (this._lineCounter.qualitys.length == 0 || this._gridCounter.qualitys.length == 0) {
            this.totalTimes = 1;
        }
        else {
            this.totalTimes = 2;
        }
        this.execute();
    }

    /**
     * 开始执行
     */
    private execute(): void {
        let c: JTConfigGroup = this._scroller.config;
        if (this._lineCounter.qualitys.length == 0) {
            this.executeQualityGrids();
        }
        else {
            this.computeTextureSpace(this._lineCounter.qualitys, c.getWidth(), c.getHeight(), "line_");
        }
    }

    /**
     * 执行品质格子框列表
     */
    private executeQualityGrids(): void {
        let c: JTConfigGroup = this._scroller.config;
        if (this._gridCounter.qualitys.length == 0) {
            this.executePerformances();
        }
        else {
            this.computeTextureSpace(this._gridCounter.qualitys, c.girdWidth, c.girdHeight, "grid_");
        }
    }

    /**
     * 所有的任务执行完毕
     */
    private executeComplete(): void {
        this._scroller.scatterRender && this._scroller.scatterRender.create(this);
    }

    /**
     * 执行性能模式
     */
    private executePerformances(): void {
        let list: JTSkinnable[] = this._gridCounter.performances.concat(this._lineCounter.performances);
        if (list.length == 0) return;
        let config: JTConfigGroup = this._scroller.config;
        this.computeTextureSpace(list, 20, 5, "min_line");
    }

    /**
     * 计算纹理所占用的空间
     * @param list 皮肤列表
     * @param width 皮肤宽
     * @param height 皮肤高
     * @param type 类型
     */
    private computeTextureSpace(list: JTSkinnable[], width: number, height: number, type: string): void {
        let count: number = list.length;
        let size: JTTextureSize = JTLineRenderUtils.getMaxTextureSize(count, width, height);
        this._context.initialize(size.width, size.height);
        for (let i: number = 0; i < count; i++) {
            let skinnable: JTSkinnable = list[i];
            let index: number = (skinnable.owner as JTLineRender).lineId;
            this._context.cacheSpaceToMap(type, index);
        }
        let rectangle: cc.Rect = new cc.Rect(0, 0, width, height);
        for (let i: number = 0; i < count; i++) {
            let skinnable: JTSkinnable = list[i];
            let index: number = (skinnable.owner as JTLineRender).lineId;
            let name: string = type + index;
            let bounds: JTTextureSize = this._context.getTextureBounds(name, rectangle);
            skinnable.createComplete(bounds);
        }
        this.loadComplete("", list, type);
    }

    /**
     * 加载完毕
     * @param base64 base64系统
     * @param list 列表
     * @param type 类型
     */
    private loadComplete(url: string, list: JTSkinnable[], type: string): void {
        //let atlas:cc.Texture2D = cc.loader.getRes(url);//cocos
        let scroller: JTLineScrollerGroup = this._scroller;
        let config: JTConfigGroup = scroller.config;
        //let lineWidth:number = JTCanvasTools.canvas.lineWidth / 2;
        //let shadowOffsetX:number = JTCanvasTools.canvas.shadowOffsetX * 2;
        //let shadowOffsetY:number = JTCanvasTools.canvas.shadowOffsetY * 2;

        for (let i: number = 0; i < list.length; i++) {
            let skinnable: JTAdvanceSkinnable = list[i] as JTAdvanceSkinnable;
            let lineGroup: JTLineRender = skinnable.owner as JTLineRender;
            let name: string = type + lineGroup.lineId;
            let bounds: JTTextureBounds = this._context.getTextureBounds(name);
            //  Laya.Texture.create(texture, gridBounds.x, gridBounds.y, this.scroller.config.girdWidth + lineWidth + shadowOffsetX, this.scroller.config.girdHeight + lineWidth + shadowOffsetY );
            let texture: cc.Texture2D = null;


            if (skinnable.mode == JTRenderMode.MODE_PERFORMANCE_PRIORITY) {
                // texture = cc.Texture2D.Filter.(atlas, bounds.x - lineWidth, bounds.y - lineWidth, bounds.rect.width + lineWidth * 2 , bounds.rect.width + lineWidth * 2);
                //let sprtite =new cc.SpriteFrame();
                // sprtite.setTexture(atlas,new cc.Rect(0, 0, atlas.width , atlas.height)   )
                //texture=atlas;
            }
            else {
                // texture = Laya.Texture.create(atlas, bounds.x, bounds.y, bounds.rect.width + lineWidth, bounds.rect.height + lineWidth);
                //let sprtite =new cc.SpriteFrame();
                // sprtite.setTexture(atlas,new cc.Rect(0, 0, atlas.width , atlas.height)   )
                //texture=atlas;
            }
            let lineRender: JTLineRender = skinnable.owner as JTLineRender;
            if (skinnable instanceof JTAdvanceSkinnableGrid) {
                let scroller: JTLineScrollerGroup = lineRender.scroller;
                let renders: JTItemRender[] = lineRender.renders;
                for (let i: number = 0; i < renders.length; i++) {
                    let r: JTItemRender = renders[i] as JTItemRender;
                    // let globlaPoint:cc.Vec2 = scroller.getRenderPoint(r.index);
                    if (i != 0) {
                        skinnable = lineRender.createSkinnable(JTChildFactory.GIRD_TYPE, scroller.gridContainer) as JTAdvanceSkinnable;
                        skinnable.createComplete();
                    }
                    skinnable.setupTexture(texture, i);
                    // SlotUtils.setScale9GridRect(skinnable.skinContainer,new  cc.Rect(3,1,3,1));
                    skinnable.defaultWidth = r.width;     //2018.1.11 change by lmb
                    skinnable.defaultHeight = r.height;
                    scroller.gridContainer&&(scroller.gridContainer as JTGComponent).addChild(skinnable.skinContainer);
                }
                this.gridTxtMap.set(lineRender.lineId, texture);
                lineRender.showGrids(0);
            }
            else if (skinnable instanceof JTAdvanceSkinnableLine) {
                skinnable.setupTexture(texture);
            }
        }
        if (type == "line_") {
            this.executeQualityGrids();
        }
        else if (type == "grid_") {
            this.executePerformances();
        }
        this.exeucteTimes++;
        if (this.exeucteTimes == this.totalTimes) {
            this.executeComplete();
        }
    }

    /**
     * 获取最大的纹理尺寸大小
     * @param lineCount 线的个数 
     * @param width 宽
     * @param height 高
     */
    public static getMaxTextureSize(lineCount: number, width: number, height: number): JTTextureSize {
        let defaultWidth: number = Math.ceil(width / JTGrid.GRIDUINT) * JTGrid.GRIDUINT;
        let defaultHeight: number = Math.ceil(height / JTGrid.GRIDUINT) * JTGrid.GRIDUINT;
        let size: JTTextureSize = new JTTextureSize();
        size.width = defaultWidth * JTLineRenderUtils.DEFAULT_SKIN_COUNT;
        size.height = Math.ceil(lineCount / JTLineRenderUtils.DEFAULT_SKIN_COUNT) * defaultHeight;
        return size;
    }

    /**
     * 创建单条线的渲染器
     * @param lineId 线ID
     * @param scroller 滚轴组视图
     */
    private createLine(lineId: number, scroller: JTLineScrollerGroup): JTLineRender {
        let lineRender: JTLineRender = this.lineMap.get(lineId);
        if (!lineRender) {
            lineRender = new JTLineRender();
            let rs: JTItemRender[] = JTOddsUtils.getOddsLineRenders(scroller, lineId, 1, 1);//针对普通模式的连线玩法
            if (!rs || rs.length == 0) {
                return null;
            }
            let indexs = JTOddsUtils.getOddsLineIndexs(scroller, lineId, 1, 1);
            let pl: cc.Vec2[] = [];
            let pp: cc.Vec2[] = [];
            for (let i: number = 0; i < indexs.length; i++) {
                let index = indexs[i] - 1;
                //let p1: cc.Vec2 = scroller.getRenderCenterPointLandscape(index);
                //let p2: cc.Vec2 = scroller.getRenderCenterPointPortrait(index);
                let p1: cc.Vec2 = scroller.getRenderStaticCenterPointLandscape(index);
                let p2: cc.Vec2 = scroller.getRenderStaticCenterPointPortrait(index);
                pl.push(p1);
                pp.push(p2);
            }
            lineRender.initializes(scroller, lineId, rs, pl, pp);
            this.lineMap.set(lineId, lineRender);
        }
        return lineRender;
    }

    private static flashLightPrefab: cc.Prefab;

    // public static flashLightAssetUrl:string = "slotMachine/prefab/flashLightPrefab";
    public static flashLightAssetUrl: string = "slot_common/slotMachine/prefab/flashLightPrefab";

    private static flashLightPool: cc.NodePool = null;


    public static createSingleFlashLight(): cc.Node {
        if (!this.flashLightPrefab) {
            this.flashLightPrefab = cc.assetManager.getBundle("slot").get(this.flashLightAssetUrl, cc.Prefab);
        }
        if (!this.flashLightPool) {
            this.flashLightPool = new cc.NodePool();
        }
        let node = this.flashLightPool.get();
        if (!node) {
            node = cc.instantiate(this.flashLightPrefab);
            let flash = node.getComponent(FlashLight);
            flash.init();
        }
        return node;
    }

    public static recoverFlashLight(node: cc.Node): void {
        if (!this.flashLightPool) {
            this.flashLightPool = new cc.NodePool();
        }
        this.flashLightPool.put(node);
    }
}

class JTTextureSize {
    width: number;
    height: number;
}

class JTSkinnableCounter {
    arts: JTSkinnable[] = [];
    qualitys: JTSkinnable[] = [];
    performances: JTSkinnable[] = [];

    public counter(skinnable: JTAdvanceSkinnable): void {
        if (!skinnable) return;
        let mode: number = skinnable.mode;
        switch (mode) {
            // case JTRenderMode.MODE_ART_PRIORITY:
            // {
            //     this.arts.push(skinnable);
            //     break;
            // }
            case JTRenderMode.MODE_PERFORMANCE_PRIORITY:
                {
                    this.performances.push(skinnable);
                    break;
                }
            case JTRenderMode.MODE_QUALITY_PRIORITY:
                {
                    this.qualitys.push(skinnable);
                    break;
                }
            default:
                {
                    let lineRender: JTLineRender = skinnable.owner as JTLineRender;
                    if (skinnable instanceof JTAdvanceSkinnableGrid) {
                        this.createGridArtSkinnables(skinnable, lineRender);
                    }
                    else if (skinnable instanceof JTAdvanceSkinnableLine) {
                        skinnable.createComplete(mode);
                    }
                    break;
                }
        }
    }

    private createGridArtSkinnables(skinnable: JTSkinnable, lineRender: JTLineRender): void {
        let scroller: JTLineScrollerGroup = lineRender.scroller;
        let renders: JTItemRender[] = lineRender.renders;
        for (let i: number = 0; i < renders.length; i++) {
            let r: JTItemRender = renders[i] as JTItemRender;
            // let globlaPoint:cc.Vec2 = scroller.getRenderPoint(r.index);
            if (i != 0) {
                skinnable = lineRender.createSkinnable(JTChildFactory.GIRD_TYPE, scroller.gridContainer);
            }
            skinnable.createComplete(null);
            skinnable.setupTexture(null, i);
            scroller.gridContainer&&(scroller.gridContainer as any).addChild(skinnable.skinContainer);
        }
        lineRender.showGrids(0);
    }
}