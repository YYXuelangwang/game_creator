
import JTGraphics from "../../com/base/JTGraphics";
import { Handler } from "../../../SlotUtils/Handle";
import JTRuntimeSkinnableLine from "./base/JTRuntimeSkinnableLine";
import JTLineRender from "../JTLineRender";
import JTLineScrollerGroup from "../../extensions/JTLineScrollerGroup";
import JTConfigGroup from "../../com/JTConfigGroup";
import JTItemRender from "../../com/base/JTItemRender";
import { JTCanvasStyle } from "../../com/canvas/JTCanvasStyle";
import JTGComponent from "../../com/base/JTGComponent";
import BaseSpinSlotView from "../../../MainView/BaseSpinSlotView";
import { JTLineInfo } from "../JTScrollerLineParser";

/*
* 
*/
export default class JTSkinnableRuntimeGraphicLineRender extends JTRuntimeSkinnableLine {

    constructor() {
        super();
    }

    private _alpha: number = 255;

    private isShowMaskLine: boolean = false;

    private winCount: number = 1;
    private direction: number = 1;

    public createComplete(data?: any): void {

    }

    /**
     * graphic的透明度
     */
    set alpha(v: number) {
        if (this._alpha == v) {
            return;
        }
        this._alpha = v;
        if (this.skinContainer) {
            this.isShowMaskLine ? this.drawGraphicMaskLine() : this.drawGraphicLine();
        }
    }

    get alpha(): number {
        return this._alpha;
    }

    /**
     * 设置纹理信息
     * @param texture 纹理
     * @param index 当前索引值
     */
    public setupTexture(texture: any, index?: number): void {

    }

    private drawGraphicLine(): void {
        let lineRender: JTLineRender = this.owner as JTLineRender;
        let renders: JTItemRender[] = lineRender.renders;
        let canvasStyle: JTCanvasStyle = lineRender.canvasStyle;
        let s: JTLineScrollerGroup = lineRender.scroller as JTLineScrollerGroup;
        let c: JTConfigGroup = s.config;
        let points = s.isLandscape ? lineRender.landscapePoints : lineRender.portraitPoints;

        let skinContainer: JTGraphics = this._skinContainer as JTGraphics;
        skinContainer.graphics.clear();
        // skinContainer.graphics.lineWidth = canvasStyle.lineWidth;
        // skinContainer.graphics.lineWidth = 15;//PT中奖线画线的宽度
        skinContainer.graphics.lineWidth = JTCanvasStyle.lineWidth;//PT中奖线画线和框的宽度
        skinContainer.graphics.lineJoin = cc.Graphics.LineJoin.ROUND;
        skinContainer.graphics.lineCap = cc.Graphics.LineCap.ROUND;
        let color = cc.Color.BLACK.fromHEX(canvasStyle.strokeStyle);
        color.setA(this.alpha);
        skinContainer.graphics.strokeColor = color;
        for (let i: number = 0; i < renders.length; i++) {
            let offPoint: cc.Vec2 = points[i];
            let moveX: number = offPoint.x - c.girdWidth / 2;
            let moveY: number = offPoint.y - c.girdHeight / 2;
            if (i == 0) {
                skinContainer.graphics.moveTo(moveX, moveY);
            }
            else {
                skinContainer.graphics.lineTo(moveX, moveY);
                skinContainer.graphics.stroke();
            }
        }

        if (s.lineContainer && !this.skinContainer.parent) {
            s.lineContainer.addChild(this._skinContainer);
        }
    }

    private isHitMixRenderRect(x: number, y: number): boolean {
        let lineRender: JTLineRender = this.owner as JTLineRender;
        let renders = lineRender.renders as BaseSpinSlotView[];
        let s: JTLineScrollerGroup = lineRender.scroller as JTLineScrollerGroup;
        for (let r of renders) {
            if (r.mixRow > 1 || r.mixColumn > 1) {
                let p = s.getRenderPoint(r.index);
                if (p.x - r.width * 0.5 < x && x < p.x + r.width * 0.5 && p.y - r.height * 0.5 < y && y < p.y + r.height * 0.5) {
                    return true;
                }
            }
        }

        return false;

    }

    /**
     * 显示遮罩线
     * @param count 
     */
    private drawGraphicMaskLine() {

        let lineRender: JTLineRender = this.owner as JTLineRender;
        let lineRollingResult = lineRender.lineResult && lineRender.lineResult.line;
        let renders: JTItemRender[] = lineRender.renders;
        let count = this.winCount || renders.length;

        let canvasStyle: JTCanvasStyle = lineRender.canvasStyle;
        let s: JTLineScrollerGroup = lineRender.scroller as JTLineScrollerGroup;
        let c: JTConfigGroup = s.config;
        let points = s.isLandscape ? lineRender.landscapePoints : lineRender.portraitPoints;

        let gridHeight = c.girdHeight;
        let canvas: JTGraphics = this.skinContainer as JTGraphics;
        canvas.graphics.clear();
        // canvas.graphics.lineWidth = canvasStyle.lineWidth;
        // canvas.graphics.lineWidth = 15;//PT中奖线画线的宽度
        canvas.graphics.lineWidth = JTCanvasStyle.lineWidth;//PT中奖线画线和框的宽度
        canvas.graphics.lineJoin = cc.Graphics.LineJoin.ROUND;
        canvas.graphics.lineCap = cc.Graphics.LineCap.ROUND;
        let color = cc.Color.BLACK.fromHEX(canvasStyle.strokeStyle);
        color.setA(this.alpha);
        canvas.graphics.strokeColor = color;
        if (lineRollingResult && lineRollingResult.winPos && lineRollingResult.winPos.length > 0) {  //解决中奖元素在中间两边没有的情况
            let winPos = lineRollingResult.winPos;
            for (let i = 0; i < renders.length; i++) {
                let halfHeight = gridHeight / 2;
                let girdWidth = c.girdWidth //render.width;
                let halfWidth = girdWidth / 2
                let direct: number = lineRollingResult.direction == 1 ? 1 : -1;
                let index: number = lineRollingResult.direction == 1 ? i : renders.length - i - 1;
                let point = points[index].clone();
                let moveX = point.x - halfWidth;
                let moveY = point.y - halfHeight;
                let lineX = moveX;
                let lineY = moveY;
                if (i < renders.length - 1) {
                    if (lineRender.checkRenderInWinPos(renders[index] as BaseSpinSlotView, winPos)) {
                        let nextPoint = points[index + direct]
                        if (nextPoint) {
                            if (moveX > nextPoint.x - halfWidth) {
                                moveX -= halfWidth
                            } else if (moveX < nextPoint.x - halfWidth) {
                                moveX += halfWidth
                            }
                            if (moveY > nextPoint.y - halfHeight) {
                                moveY -= halfHeight
                            } else if (moveY < nextPoint.y - halfHeight) {
                                moveY += halfHeight
                            }
                            let nextPointIsWin = lineRender.checkRenderInWinPos(renders[index + direct] as BaseSpinSlotView, winPos);
                            if (nextPointIsWin) {
                                if (moveX > nextPoint.x - halfWidth) {
                                    lineX = nextPoint.x;
                                } else if (moveX < nextPoint.x - halfWidth) {
                                    lineX = nextPoint.x - girdWidth;
                                }
                                if (moveY > nextPoint.y - halfHeight) {
                                    lineY = nextPoint.y;
                                } else if (moveY < nextPoint.y - halfHeight) {
                                    lineY = nextPoint.y - gridHeight;
                                }
                            } else {
                                lineX = nextPoint.x - halfWidth;
                                lineY = nextPoint.y - halfHeight;
                            }
                            canvas.graphics.moveTo(Math.floor(moveX), Math.floor(moveY));
                            canvas.graphics.lineTo(Math.floor(lineX), Math.floor(lineY));
                            canvas.graphics.stroke();
                        }
                    } else {
                        let nextPoint = points[index + direct]
                        if (nextPoint) {
                            let nextPointIsWin = lineRender.checkRenderInWinPos(renders[index + direct] as BaseSpinSlotView, winPos);
                            if (nextPointIsWin) {
                                if (moveX > nextPoint.x - halfWidth) {
                                    lineX = nextPoint.x;
                                } else if (moveX < nextPoint.x - halfWidth) {
                                    lineX = nextPoint.x - girdWidth;
                                }
                                if (moveY > nextPoint.y - halfHeight) {
                                    lineY = nextPoint.y;
                                } else if (moveY < nextPoint.y - halfHeight) {
                                    lineY = nextPoint.y - gridHeight;
                                }
                            } else {
                                lineX = nextPoint.x - halfWidth;
                                lineY = nextPoint.y - halfHeight;
                            }
                            canvas.graphics.moveTo(Math.floor(moveX), Math.floor(moveY));
                            canvas.graphics.lineTo(Math.floor(lineX), Math.floor(lineY));
                            canvas.graphics.stroke();
                        }
                    }
                }
            }

        } else {
            for (let i = 0; i < renders.length; i++) {
                let direct: number = this.direction == 1 ? 1 : -1;
                let index: number = this.direction == 1 ? i : renders.length - i - 1;
                let offPoint = points[index].clone();
                offPoint.x = offPoint.x - c.girdWidth / 2;
                offPoint.y = offPoint.y - c.girdHeight / 2;
                let moveX = offPoint.x;
                let moveY = offPoint.y;
                let targetX;
                let targetY;
                if (i < count) {
                    if (points[index + direct]) {
                        let nextPoint = points[index + direct].clone();
                        nextPoint.x = nextPoint.x - c.girdWidth / 2;
                        nextPoint.y = nextPoint.y - c.girdHeight / 2;
                        targetY = offPoint.y;
                        if (moveY > nextPoint.y) targetY = offPoint.y - gridHeight / 2
                        if (moveY < nextPoint.y) targetY = offPoint.y + gridHeight / 2
                        if (nextPoint.x == offPoint.x) {
                            targetX = offPoint.x;
                        } else {
                            targetX = offPoint.x + direct * c.girdWidth / 2;
                        }
                    } else {
                        targetX = offPoint.x + direct * c.girdWidth / 2;
                    }
                    targetX = Math.floor(targetX);
                    targetY = Math.floor(targetY);
                    if (this.isHitMixRenderRect(targetX, targetY)) {
                        continue;
                    }
                    canvas.graphics.moveTo(targetX, targetY);
                    if (i != count - 1) {
                        let nextPoint = points[index + direct].clone();
                        nextPoint.x = nextPoint.x - c.girdWidth / 2;
                        nextPoint.y = nextPoint.y - c.girdHeight / 2;
                        targetY = nextPoint.y;

                        if (offPoint.y > nextPoint.y) targetY = nextPoint.y + gridHeight / 2
                        if (offPoint.y < nextPoint.y) targetY = nextPoint.y - gridHeight / 2
                        if (nextPoint.x == offPoint.x) {
                            targetX = offPoint.x;
                        } else {
                            targetX = nextPoint.x - direct * c.girdWidth / 2;
                        }
                        targetX = Math.floor(targetX);
                        targetY = Math.floor(targetY);
                        canvas.graphics.lineTo(targetX, targetY);
                        canvas.graphics.stroke();
                    }
                }
                else {
                    targetX = Math.floor(moveX);
                    targetY = Math.floor(moveY);
                    canvas.graphics.lineTo(moveX, moveY);
                    canvas.graphics.stroke();
                }
            }
        }

        if (s.lineContainer && !this.skinContainer.parent) {
            (s.lineContainer as JTGComponent).addChild(this.skinContainer);
        }
    }

    public show(_singleLineComplete?: Handler, mask?: boolean, lineCount?: number, direction: number = 1, lineInfo?: JTLineInfo): void {
        super.show();
        cc.Tween.stopAllByTarget(this);
        if (!this.skinContainer) {
            this.skinContainer = new JTGraphics();
        }
        this.isShowMaskLine = mask;
        this.winCount = lineCount;
        this.direction = direction;
        let lineRender: JTLineRender = this.owner as JTLineRender;
        lineInfo && lineRender && (lineRender.lineResult = lineInfo)
        this.alpha = 255;
        if (mask) {
            this.drawGraphicMaskLine();
        } else {
            this.drawGraphicLine();
        }
    }

    /**
     * 隐藏
     */
    public hide(): void {
        if (!this.skinContainer || !this.skinContainer.active || !this.skinContainer.parent) {
            return;
        }
        cc.Tween.stopAllByTarget(this);
        super.hide();
    }
}