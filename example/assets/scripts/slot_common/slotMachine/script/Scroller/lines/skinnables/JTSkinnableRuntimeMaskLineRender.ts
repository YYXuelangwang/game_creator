import JTRuntimeSkinnableLine from "./base/JTRuntimeSkinnableLine";
import { JTCanvasStyle } from "../../com/canvas/JTCanvasStyle";
import JTConfigGroup from "../../com/JTConfigGroup";
import JTGComponent from "../../com/base/JTGComponent";
import JTGraphics from "../../com/base/JTGraphics";
import { Handler } from "../../../SlotUtils/Handle";
import JTLineRender from "../JTLineRender";
import JTLineScrollerGroup from "../../extensions/JTLineScrollerGroup";
import JTItemRender from "../../com/base/JTItemRender";
import { JTLineInfo } from "../JTScrollerLineParser";

/*
* 程序画中奖线-不穿透中奖格子
*/
export default class JTSkinnableRuntimeMaskLineRender extends JTRuntimeSkinnableLine {

    constructor() {
        super();
    }
    public createComplete(data?: any): void {
        let lineRender: JTLineRender = this.owner as JTLineRender;
        let renders: JTItemRender[] = lineRender.renders;
        let canvasStyle: JTCanvasStyle = lineRender.canvasStyle;
        let s: JTLineScrollerGroup = lineRender.scroller as JTLineScrollerGroup;
        let c: JTConfigGroup = s.config;
        let points = s.isLandscape ? lineRender.landscapePoints : lineRender.portraitPoints;


        let image: JTGraphics = (this._skinContainer as JTGraphics) || new JTGraphics();
        image.graphics.clear();
        image.graphics.lineWidth = canvasStyle.lineWidth;
        image.graphics.lineJoin = cc.Graphics.LineJoin.ROUND;
        image.graphics.lineCap = cc.Graphics.LineCap.ROUND;
        let color = cc.Color.BLACK.fromHEX(canvasStyle.strokeStyle);
        color.setA(s.runTimeLineOpacity);
        image.graphics.strokeColor = color;
        for (let i: number = 0; i < renders.length; i++) {
            let offPoint: cc.Vec2 = points[i];
            let moveX: number = offPoint.x - c.girdWidth / 2;
            let moveY: number = offPoint.y - c.girdHeight / 2;
            if (i == 0) {
                image.graphics.moveTo(moveX, moveY);
            }
            else {
                image.graphics.lineTo(moveX, moveY);
                image.graphics.stroke();
            }
        }

        if (s.lineContainer) {
            let lineMaskContainer = s.lineContainer.getChildByName("LineMaskContainer");
            this._skinContainer && this._skinContainer.parent && this._skinContainer.removeFromParent(true);   //加这个是为了防止child already added. It can't be added again
            lineMaskContainer.removeChild(this._skinContainer);
            this._skinContainer = image;//_skinContainer;
            lineMaskContainer.addChild(this._skinContainer);
        }

    }
    /**
     * 显示遮罩线
     * @param count 
     */
    private createMaskLine(winCount: number, direction: number) {
        let lineRender: JTLineRender = this.owner as JTLineRender;
        let renders: JTItemRender[] = lineRender.renders;
        let lineResult = lineRender.lineResult
        let count: number
        if (lineResult && lineResult.renders && lineResult.renders.length > 0) {
            count = lineResult.renders.length;
        } else {
            count = winCount || renders.length;
        }
        let canvasStyle: JTCanvasStyle = lineRender.canvasStyle;
        let s: JTLineScrollerGroup = lineRender.scroller as JTLineScrollerGroup;
        let c: JTConfigGroup = s.config;
        let points = s.isLandscape ? lineRender.landscapePoints : lineRender.portraitPoints;

        let gridHeight = c.girdHeight;
        let canvas: JTGraphics = (this.skinContainer as JTGraphics) || new JTGraphics();
        canvas.graphics.clear();
        canvas.graphics.lineWidth = canvasStyle.lineWidth;
        canvas.graphics.lineJoin = cc.Graphics.LineJoin.ROUND;
        canvas.graphics.lineCap = cc.Graphics.LineCap.ROUND;
        // canvas.graphics.strokeColor = cc.Color.BLACK.fromHEX(canvasStyle.strokeStyle);
        let color = cc.Color.BLACK.fromHEX(canvasStyle.strokeStyle);
        color.setA(s.runTimeLineOpacity);
        canvas.graphics.strokeColor = color;
        for (let i = 0; i < renders.length; i++) {
            let direct: number = direction == 1 ? 1 : -1;
            let index: number = direction == 1 ? i : renders.length - i - 1;
            let r = renders[index];
            let offPoint = points[index].clone();
            offPoint.x = offPoint.x - c.girdWidth / 2;
            offPoint.y = offPoint.y - c.girdHeight / 2;
            let moveX = offPoint.x;
            let moveY = offPoint.y;
            let targetX;
            let targetY
            if (i < count) {
                if (points[index + direct]) {
                    let nextPoint = points[index + direct].clone();
                    nextPoint.x = nextPoint.x - c.girdWidth / 2;
                    nextPoint.y = nextPoint.y - c.girdHeight / 2;
                    targetY = offPoint.y;
                    if (moveY > nextPoint.y) targetY = offPoint.y - gridHeight / 2//+canvasStyle.lineWidth/4;
                    if (moveY < nextPoint.y) targetY = offPoint.y + gridHeight / 2//-canvasStyle.lineWidth/4;
                }

                targetX = offPoint.x + direct * c.girdWidth / 2;
                //if (offPoint.y - nextPoint.y != 0)
                //  let targetX = (targetY - offPoint.y) / (offPoint.y - nextPoint.y) * (offPoint.x - nextPoint.x) + offPoint.x;
                targetX = Math.floor(targetX);
                targetY = Math.floor(targetY);
                canvas.graphics.moveTo(targetX, targetY);
                if (i != count - 1) {
                    let nextPoint = points[index + direct].clone();
                    nextPoint.x = nextPoint.x - c.girdWidth / 2;
                    nextPoint.y = nextPoint.y - c.girdHeight / 2;
                    targetY = nextPoint.y;

                    if (offPoint.y > nextPoint.y) targetY = nextPoint.y + gridHeight / 2
                    if (offPoint.y < nextPoint.y) targetY = nextPoint.y - gridHeight / 2
                    targetX = nextPoint.x - direct * c.girdWidth / 2;
                    //if (offPoint.y - nextPoint.y != 0)
                    //  let targetX = (targetY - offPoint.y) / (offPoint.y - nextPoint.y) * (offPoint.x - nextPoint.x) + offPoint.x;
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

        // s.lineContainer && (s.lineContainer as JTGComponent).removeChild(this._skinContainer);
        this._skinContainer && (this._skinContainer as JTGComponent).removeFromParent(true);
        this._skinContainer = canvas;
        s.lineContainer && (s.lineContainer as JTGComponent).addChild(this._skinContainer);
    }
    /**
     * 设置纹理信息
     * @param texture 纹理
     * @param index 当前索引值
     */
    public setupTexture(texture: any, index?: number): void {

    }

    public show(_singleLineComplete?: Handler, mask?: boolean, lineCount?: number, direction: number = 1, renders?: any): void {
        super.show();
        if (!mask) {
            this.createComplete();
        } else {
            this.createMaskLine(lineCount, direction);
        }

    }

    /**
     * 隐藏
     */
    public hide(): void {
        super.hide();

        let lineRender: JTLineRender = this.owner as JTLineRender;
        let s: JTLineScrollerGroup = lineRender.scroller as JTLineScrollerGroup;
        s.lineContainer && (s.lineContainer as JTGComponent).removeChild(this._skinContainer);

    }
}