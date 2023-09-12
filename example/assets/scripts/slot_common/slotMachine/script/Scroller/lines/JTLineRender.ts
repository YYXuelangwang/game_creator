import JTScatterGridRender from "./JTScatterGridRender";
import { JTCanvasStyle } from "../com/canvas/JTCanvasStyle";
import JTChildFactory from "../com/factorys/JTChildFactory";
import JTItemRender from "../com/base/JTItemRender";
import JTGComponent from "../com/base/JTGComponent";
import JTOddsUtils from "../JTOddsUtils";
import { JTLineInfo } from "./JTScrollerLineParser";
import RollingResult from "../../SlotData/RollingResult";
import JTImage from "../com/base/JTImage";
import SlotUtils from "../../SlotUtils/SlotUtils";
import JTSkinnable from "./skinnables/base/JTSkinnable";
import JTLineScrollerGroup from "../extensions/JTLineScrollerGroup";
import JTContainer from "../com/base/JTContainer";
import JTAdvanceSkinnable from "./skinnables/base/JTAdvanceSkinnable";
import { GameEventNames } from "../../SlotConfigs/GameEventNames";
import BaseSpinSlotView, { SpinSlotHiddenSection } from "../../MainView/BaseSpinSlotView";

/*
* name;
*/
export default class JTLineRender extends JTScatterGridRender {
    _flashLineItemRender: JTSkinnable;
    /**
     * 默认的线渲染器
     */
    protected _lineItemRender: JTSkinnable = null;
    /**
     * 默认的格子框渲染器
     */
    protected _gridItemRender: JTSkinnable = null;
    /**
     * 默认的线数字按钮渲染器
     */
    protected _lineButtonRender: JTSkinnable = null;
    /**
     * 格子框渲染器列表
     */
    protected _renders: JTItemRender[] = null;
    /**
     * 画格子框渲染器的坐标点列表
     */
    protected _landscapePoints: cc.Vec2[] = null;

    protected _portraitPoints: cc.Vec2[] = null;

    /**
     * 线ID
     */
    protected _lineId: number = 0;
    /**
     * 格子框坐标点列表
     */
    protected _gridPoints: cc.Vec2[] = null;
    /**
     * canvas画布样式
     */
    protected _canvasStyle: JTCanvasStyle = null;
    /**
     * 中奖线结果，由外部传入引用
     */
    protected _lineResult: JTLineInfo = null;
    /**
     * 所有可扩展皮肤列表
     */
    protected _skinnables: JTSkinnable[] = null;

    protected _gridIndexs: number[] = [];

    /**
     * 初始化线和格子框列表
     * @param scroller  滚轴组视图 
     * @param lineId 线ID
     * @param renders 线对应的渲染器列表格子列表
     * @param points 格子框坐标列表
     */
    public initializes(scroller: JTLineScrollerGroup, lineId: number, renders: JTItemRender[], landscapePoints: cc.Vec2[], portraitPoints: cc.Vec2[]): void {
        this._landscapePoints = landscapePoints;
        this._portraitPoints = portraitPoints;

        this._lineId = lineId;
        this._renders = renders;
        this._scroller = scroller;
        this._skinnables = [];
        this._gridRenders = [];


        this._lineItemRender = this.createSkinnable(JTChildFactory.LINE_TYPE, scroller.lineContainer);
        this._flashLineItemRender = this.createSkinnable(JTChildFactory.FLASH_LINE_TYPE, scroller.flashLineContainer);

        this._gridItemRender = this.createSkinnable(JTChildFactory.GIRD_TYPE, scroller.gridContainer);
        this._lineButtonRender = this.createSkinnable(JTChildFactory.LINE_BUTTON_TYPE);
        this.lineButtonRender && this._lineButtonRender.createComplete((this.lineButtonRender as JTAdvanceSkinnable).mode);
        //this._gridPoints = this.getGridPoints();
        this._gridRenderPoints = this.getGridRenderPoints();

        let indexs = JTOddsUtils.getOddsLineIndexs(scroller, lineId, 1, 1);
        this._gridIndexs = [];
        for (let index of indexs) {
            this._gridIndexs.push(index - 1);
        }
    }

    /**
     * 获取画格子框坐标点
     */
    public getGridPoints(): cc.Vec2[] {
        let r: JTItemRender = this._renders[0] as JTItemRender;
        let point: cc.Vec2 = this._scroller.getRenderCenterPoint(r.index);
        let offX: number = point.x;
        let offY: number = point.y;
        let startX: number = 4;
        let startY: number = 4;
        let endX: number = r.width;
        let endY: number = r.height;
        let list: cc.Vec2[] = [];
        list.push(new cc.Vec2(startX, startY));
        list.push(new cc.Vec2(endX, startY));
        list.push(new cc.Vec2(endX, endY));
        list.push(new cc.Vec2(startX, endY));
        list.push(new cc.Vec2(startX, startY));
        return list;
    }

    /**
     * 获取格子框坐标列表
     */
    protected getGridRenderPoints(): cc.Vec2[] {
        let points: cc.Vec2[] = [];
        for (let i: number = 0; i < this.renders.length; i++) {
            let r: JTItemRender = this.renders[i] as JTItemRender;
            let point: cc.Vec2 = this._scroller.getRenderPoint(r.index);
            points.push(point);
        }
        return points;
    }

    /**
     * 创建可扩展皮肤
     * @param type 皮肤类型
     * @param container 容器 
     */
    public createSkinnable(type: number, container?: JTContainer): JTSkinnable {
        let s: JTSkinnable = this._scroller.factoryChild.produce(type, this) as JTSkinnable;
        if (!s) return s;
        if (type == JTChildFactory.GIRD_TYPE) {
            this._gridRenders.push(s);
        }
        this._skinnables.push(s);
        return s;
    }

    /**
     * 添加可扩展皮肤到层级
     */
    public addSkinnablesToLayer(): void {
        if (this._gridItemRender) {
            this._gridItemRender.hide();
            this.addSkinnable(this.scroller.gridContainer, this.gridItemRender);
        }
        if (this._lineItemRender) {
            this._lineItemRender.hide();
            this.addSkinnable(this.scroller.lineContainer, this._lineItemRender);
        }

        if (this._flashLineItemRender) {
            this._flashLineItemRender.hide();
            this.addSkinnable(this.scroller.flashLineContainer, this._flashLineItemRender);
        }
    }

    /**
     * 添加可扩展皮肤
     * @param c 父容器
     * @param s 皮肤
     */
    private addSkinnable(c: JTContainer, s: JTSkinnable): void {
        if (!s || !c || !s.skinContainer) return;
        (c as JTGComponent).addChild(s.skinContainer);
    }

    // public createSkinnable(factory:JTIFactory, type:number, container?:JTIContainer):JTSkinnable
    // {
    //         let skinnable:JTSkinnable = factory.produce(type, this) as JTSkinnable;
    //         // if (!skinnable) return null;
    //         // if (container)(container as any).displayObject.addChild(skinnable.skinContainer as any);
    //         return skinnable;
    // }


    private _rollingResult: RollingResult = null;
    /**
     * 显示格子框
     * @param line 线结果 
     * @param rs 中奖格子列表
     */
    public showGrid(line: RollingResult, rs: JTItemRender[]): void {
        //改了lineType，原来是写死的1
        this._renders = JTOddsUtils.getOddsLineRenders(this._scroller, this._lineId, 1, 1);//普通模式、连线玩法
        if (line) this._rollingResult = line;
        if (line.direction == 1) {
            this.showGrids(rs.length);
        }
        else {
            // this.createGridSkinnables();
            if (this._gridRenders.length != this._renders.length || this._gridRenderPoints.length != this._renders.length) {
                return;//有可能没有预加载线和框没有初始化好,导致格子的坐标和格子数量不一致
            }
            let totalCount: number = this.gridRenders.length;
            let index: number = 0;
            let c = this._scroller.config;
            for (let i: number = totalCount - 1; i >= 0; i--) {
                index++;
                let skinnable: JTSkinnable = this._gridRenders[i] as JTSkinnable;
                if (!skinnable) continue;
                let skinContainer: JTImage = skinnable.skinContainer as JTImage;
                let r = this.scroller.getRenderByPos(this._gridIndexs[i]) as BaseSpinSlotView;
                if (!r) {
                    continue;
                }
                let p = this.scroller.getRenderPoint(r.index);

                if (r.mixRow > 1 && r.visibleRow < r.mixRow) {
                    skinContainer.x = p.x;
                    skinContainer.y = p.y + (r.mixRow - r.visibleRow) * c.girdHeight * 0.5 * (r.hiddenSection == SpinSlotHiddenSection.Bottom ? 1 : -1);

                    skinContainer.height = r.height - (r.mixRow - r.visibleRow) * c.girdHeight;
                    skinContainer.width = r.width;
                } else {
                    skinContainer.x = p.x;
                    skinContainer.y = p.y;

                    skinContainer.height = r.height;
                    skinContainer.width = r.width;
                }
                if (rs.length > 0 && line && line.winPos && line.winPos.length > 0) {
                    if (this.checkRenderInWinPos(r, line.winPos)) {
                        // console.log(`graphlineShow2  - dir=2 ------winPos:${lineRollingResult.winPos}----lineId:${lineRollingResult.lineId}-----`)
                        skinnable.parent && (skinnable.parent.active = true);
                        skinnable.show();
                        continue;
                    }
                }
                if (index <= rs.length) {
                    skinnable.show();
                    continue;
                }
                skinnable.hide();

            }
        }
    }

    /**
     * 创建格子框
     */
    private createGridSkinnables(): void {
        if (this.gridItemRender.skinContainer) return;
        let defaultSkinnable: JTSkinnable = null;
        for (let i: number = 0; i < this._gridRenders.length; i++) {
            let s: JTSkinnable = this.gridRenders[i];
            let r: JTItemRender = this._renders[i] as JTItemRender;
            if (i == 0) {
                s.createComplete(i);
                defaultSkinnable = s;
            }
            s.setupTexture(defaultSkinnable, i)
        }
    }

    /**
     * 显示多个格子框
     * @param count 个数 0为清空 
     */
    public showGrids(count: any): void {
        // this.createGridSkinnables();
        // if (this._gridRenders.length != this._renders.length || this._gridRenderPoints.length != this._renders.length)
        // {
        //         return;//有可能没有预加载线和框没有初始化好,导致格子的坐标和格子数量不一致
        // }
        this._renders = JTOddsUtils.getOddsLineRenders(this._scroller, this._lineId, 1, 1);//普通模式、连线玩法
        let totalCount: number = this._gridRenders.length;
        let c = this._scroller.config;
        for (let i: number = 0; i < totalCount; i++) {
            let skinnable: JTSkinnable = this._gridRenders[i] as JTSkinnable;
            if (!skinnable) continue
            let skinContainer: JTImage = skinnable.skinContainer as JTImage;
            let r = this.scroller.getRenderByPos(this._gridIndexs[i]) as BaseSpinSlotView;
            if (!r) {
                continue;
            }
            let p = this.scroller.getRenderPoint(r.index);

            if (r.mixRow > 1 && r.visibleRow < r.mixRow) {
                skinContainer.x = p.x;
                skinContainer.y = p.y + (r.mixRow - r.visibleRow) * c.girdHeight * 0.5 * (r.hiddenSection == SpinSlotHiddenSection.Bottom ? 1 : -1);

                skinContainer.height = r.height - (r.mixRow - r.visibleRow) * c.girdHeight;
                skinContainer.width = r.width;
            } else {
                skinContainer.x = p.x;
                skinContainer.y = p.y;

                skinContainer.height = r.height;
                skinContainer.width = r.width;
            }
            if (count > 0 && this._rollingResult && this._rollingResult.winPos && this._rollingResult.winPos.length > 0) {
                if (this.checkRenderInWinPos(r, this._rollingResult.winPos)) {
                    // console.log(`graphlineShow2--  - dir=1 ----winPos:${lineRollingResult.winPos}----lineId:${lineRollingResult.lineId}-----`)
                    skinnable.parent && (skinnable.parent.active = true);
                    skinnable.show();
                    continue;
                }
            } else {
                if (count - 1 >= i) {
                    skinnable.parent && (skinnable.parent.active = true);
                    skinnable.show();
                    continue;
                }
            }
            skinnable.hide();
        }
    }


    /**检测元素是否在winPos里 */
    public checkRenderInWinPos(render: BaseSpinSlotView, winPos) {
        if (render) {
            if (render.mixIndexs && render.mixIndexs.length > 0) {
                for (let i = 0; i < render.mixIndexs.length; i++) {
                    let mixIndex = render.mixIndexs[i] + 1;
                    for (let i = 0; i < winPos.length; i++) {
                        let winIndex = winPos[i];
                        if (winIndex == mixIndex) {
                            return true;
                        }
                    }
                }
            } else {
                for (let i = 0; i < winPos.length; i++) {
                    let winIndex = winPos[i];
                    if (winIndex == render.index + 1) {
                        return true;
                    }
                }
            }
        }
        return false
    }

    /**
     * 改可扩展的皮肤
     * @param line 线自定义数据 
     */
    public changedSkinnable(line: any): void {
        this._lineResult = line;
        let lineResult: JTLineInfo = this.lineResult;
        let lineInfo: RollingResult = lineResult.line;
        let renders: JTItemRender[] = lineResult.renders;
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_CHANGE_LINE_WINCOIN, lineInfo);
        // if (lineInfo.direction  == jtline)
        // {

        // }
        // for (let i:number = 0; i < this._skinnables.length; i++)
        // {
        //         let s:JTIChangedSkinnable = this._skinnables[i] as JTIChangedSkinnable;
        //         if (lineInfo.direction == JTLineDirection.DIRECTION_LEFT)
        //         {

        //         }
        //         else if (lineInfo.direction == JTLineDirection.DIRECTION_RIGHT)
        //         {

        //         }
        //         s.changedSkinnable(this);
        // }
    }

    /**
     * 改变格子框列表
     * @param index 格子框索引 
     * @param x 格子框X坐标
     * @param y 格子框Y坐标
     * @param width 格子框的宽
     * @param height 格子框的高
     * @param sizeGrid 格子框的改变比例 new cc.Rect (20, 5, 20, 5,0)
     */
    public changedGrids(index: number, x: number, y: number, width: number, height: number, sizeGrid?: cc.Rect): JTSkinnable {
        if (this._gridRenders.length == 0) return;
        let skinnable: JTSkinnable = this._gridRenders[index] as JTSkinnable;
        if (!skinnable) return
        let skinContainer: JTImage = skinnable.skinContainer as JTImage;
        if (!sizeGrid) {
            sizeGrid = new cc.Rect(20, 5, 20, 5);
        }
        SlotUtils.setScale9GridRect(skinContainer, sizeGrid);//cocos
        //skinContainer.pivotY = 0;
        skinContainer.width = width;
        skinContainer.height = height;
        skinContainer.y = y;
        skinContainer.x = x;
        return skinnable;
    }

    /**
     * 隐藏某个格子框
     * @param index 格子框索引 
     */
    public hideGrid(index: number): void {
        let skinnable: JTSkinnable = this._gridRenders[index] as JTSkinnable;
        skinnable && skinnable.hide();
        // let skinContainer:Laya.Image = skinnable.skinContainer;
        // skinContainer.visible = false;
    }

    /**
     * 所有可扩展皮肤列表
     */
    public get skinnables(): JTSkinnable[] {
        return this._skinnables;
    }

    /**
     * 所有可扩展皮肤列表
     */
    public set skinnables(value: JTSkinnable[]) {
        this._skinnables = value;
    }

    /**
     * 线ID
     */
    public get lineId(): number {
        return this._lineId;
    }

    /**
     * 格子框渲染器列表
     */
    public get renders(): JTItemRender[] {
        return this._renders;
    }

    /**
     * 中奖线结果，由外部传入引用
     */
    public get lineResult(): JTLineInfo {
        return this._lineResult;
    }

    /**
     * 中奖线结果，由外部传入引用
     */
    public set lineResult(value: JTLineInfo) {
        this._lineResult = value;
    }

    /**
     * 画格子框渲染器的坐标点列表
     */
    public get landscapePoints(): cc.Vec2[] {
        return this._landscapePoints;
    }

    /**
 * 画格子框渲染器的坐标点列表
 */
    public get portraitPoints(): cc.Vec2[] {
        return this._portraitPoints;
    }
    /**
     * 格子框坐标点列表
     */
    public get gridPoints(): cc.Vec2[] {
        return this._gridPoints;
    }

    /**
     * 默认的线渲染器
     */
    public get lineItemRender(): JTSkinnable {
        return this._lineItemRender;
    }

    /**
     * 默认的线渲染器
     */
    public set lineItemRender(value: JTSkinnable) {
        this._lineItemRender = value;
    }

    /**
 * 默认的线渲染器
 */
    public get flashLineItemRender(): JTSkinnable {
        return this._flashLineItemRender;
    }

    /**
     * 默认的线渲染器
     */
    public set flashLineItemRender(value: JTSkinnable) {
        this.flashLineItemRender = value;
    }


    /**
     * 默认的线数字按钮渲染器
     */
    public get lineButtonRender(): JTSkinnable {
        return this._lineButtonRender;
    }

    /**
     * 默认的格子框渲染器
     */
    public get gridItemRender(): JTSkinnable {
        return this._gridItemRender;
    }

    /**
     * 默认的格子框渲染器
     */
    public set gridItemRender(value: JTSkinnable) {
        this._gridItemRender = value;
    }


    /**
     * 格子框索引
     */
    public get gridIndexs():number[] {
        return this._gridIndexs;
    }
    /**
     * canvas画布样式
     * 默认从配置表里读取
     */
    public get canvasStyle(): JTCanvasStyle {
        if (!this._canvasStyle) {
            this._canvasStyle = new JTCanvasStyle();
            let color: string = JTOddsUtils.getColor(this.lineId);
            this._canvasStyle.setStyle(color, color);
        }
        return this._canvasStyle;
    }
}