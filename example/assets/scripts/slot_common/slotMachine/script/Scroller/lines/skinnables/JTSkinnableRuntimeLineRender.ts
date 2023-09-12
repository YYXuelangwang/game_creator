import JTRuntimeSkinnableLine from "./base/JTRuntimeSkinnableLine";
import { JTCanvasStyle } from "../../com/canvas/JTCanvasStyle";
import JTConfigGroup from "../../com/JTConfigGroup";
import JTGComponent from "../../com/base/JTGComponent";
import JTGraphics from "../../com/base/JTGraphics";
import { Handler } from "../../../SlotUtils/Handle";
import JTLineRender from "../JTLineRender";
import JTLineScrollerGroup from "../../extensions/JTLineScrollerGroup";
import JTItemRender from "../../com/base/JTItemRender";
import SlotMachineView from "../../../MainView/SlotMachineView";

/*
* 程序画中奖线
*/
export default class JTSkinnableRuntimeLineRender extends JTRuntimeSkinnableLine {

    constructor() {
        super();
    }
    /**
     * 创建完成
     * @param bounds 
     */
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
            if (SlotMachineView.instance.isGraphicsLineShowAni) {
                let width = c.gapWidth * c.col;
                lineMaskContainer.width = 0;
                cc.tween(lineMaskContainer).to(0.5, { width: 2 * width }).start();
            }
            lineMaskContainer.removeChild(this._skinContainer);
            this._skinContainer = image;//_skinContainer;
            lineMaskContainer.addChild(this._skinContainer);
        }

    }
    /**
     * 显示遮罩线
     * @param count 
     */
    private createMaskLine(count: number, direction: number) {
        let lineRender: JTLineRender = this.owner as JTLineRender;
        let renders: JTItemRender[] = lineRender.renders;
        let canvasStyle: JTCanvasStyle = lineRender.canvasStyle;
        let s: JTLineScrollerGroup = lineRender.scroller as JTLineScrollerGroup;
        let c: JTConfigGroup = s.config;
        let points = s.isLandscape ? lineRender.landscapePoints : lineRender.portraitPoints;

        var gridHeight = c.girdHeight;
        let canvas: JTGraphics = (this.skinContainer as JTGraphics) || new JTGraphics();
        canvas.graphics.clear();
        canvas.graphics.lineWidth = canvasStyle.lineWidth;
        canvas.graphics.lineJoin = cc.Graphics.LineJoin.ROUND;
        canvas.graphics.lineCap = cc.Graphics.LineCap.ROUND;
        let color = cc.Color.BLACK.fromHEX(canvasStyle.strokeStyle);
        color.setA(s.runTimeLineOpacity);
        canvas.graphics.strokeColor = color;
        // canvas.graphics.strokeColor = cc.Color.BLACK.fromHEX(canvasStyle.strokeStyle);

        for (var i = 0; i < renders.length; i++) {
            var direct: number = direction == 1 ? 1 : -1;
            var index: number = direction == 1 ? i : renders.length - i - 1;
            var r = renders[index];
            var offPoint = points[index].clone();
            offPoint.x = offPoint.x - c.girdWidth / 2;
            offPoint.y = offPoint.y - c.girdHeight / 2;
            var moveX = offPoint.x;
            var moveY = offPoint.y;
            if (i < count) {
                if (points[index + direct]) {
                    var nextPoint = points[index + direct].clone();
                    nextPoint.x = nextPoint.x - c.girdWidth / 2;
                    nextPoint.y = nextPoint.y - c.girdHeight / 2;
                    var targetY = offPoint.y;
                    if (moveY > nextPoint.y) targetY = offPoint.y - gridHeight / 2//+canvasStyle.lineWidth/4;
                    if (moveY < nextPoint.y) targetY = offPoint.y + gridHeight / 2//-canvasStyle.lineWidth/4;
                }

                targetX = offPoint.x + direct * c.girdWidth / 2;
                if (offPoint.y - nextPoint.y != 0)
                    var targetX = (targetY - offPoint.y) / (offPoint.y - nextPoint.y) * (offPoint.x - nextPoint.x) + offPoint.x;

                targetX = Math.floor(targetX);
                targetY = Math.floor(targetY);
                canvas.graphics.moveTo(targetX, targetY);

                if (i != count - 1) {
                    var nextPoint = points[index + direct].clone();
                    nextPoint.x = nextPoint.x - c.girdWidth / 2;
                    nextPoint.y = nextPoint.y - c.girdHeight / 2;
                    var targetY = nextPoint.y;

                    if (offPoint.y > nextPoint.y) targetY = nextPoint.y + gridHeight / 2
                    if (offPoint.y < nextPoint.y) targetY = nextPoint.y - gridHeight / 2
                    targetX = nextPoint.x - direct * c.girdWidth / 2;
                    if (offPoint.y - nextPoint.y != 0)
                        var targetX = (targetY - offPoint.y) / (offPoint.y - nextPoint.y) * (offPoint.x - nextPoint.x) + offPoint.x;
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
        s.lineContainer && (s.lineContainer as JTGComponent).removeChild(this._skinContainer);
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

    public show(_singleLineComplete?: Handler, mask?: boolean, lineCount?: number, direction?: number, renders?: any): void {
        super.show();
        //if (!mask) {
        this.createComplete();
        // }else {
        //     this.createMaskLine(lineCount, direction);
        // }

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