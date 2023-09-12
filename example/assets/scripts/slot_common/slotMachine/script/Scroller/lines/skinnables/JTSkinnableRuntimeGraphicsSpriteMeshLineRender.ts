import JTRuntimeSkinnableLine from "./base/JTRuntimeSkinnableLine";
import JTConfigGroup from "../../com/JTConfigGroup";
import { Handler } from "../../../SlotUtils/Handle";
import JTLineRender from "../JTLineRender";
import JTLineScrollerGroup from "../../extensions/JTLineScrollerGroup";
import JTItemRender from "../../com/base/JTItemRender";
import JTGraphicsSpriteMesh from "../../com/base/JTGraphicsSpriteMesh";
import SlotMachineView from "../../../MainView/SlotMachineView";

/*
* 程序画中奖线spriteMesh
*/
export default class JTSkinnableRuntimeGraphicsSpriteMeshLineRender extends JTRuntimeSkinnableLine {

    private lineImageNode: JTGraphicsSpriteMesh = null;
    private hasAddNode: boolean = false;
    private lineMaskContainer: cc.Node = null;

    constructor() {
        super();
        this.addShowLineNode();
    }
    /**
     * 创建完成
     * @param bounds 
     */
    public createComplete(data?: any): void {
        this.addShowLineNode();
        let lineRender: JTLineRender = this.owner as JTLineRender;
        let renders: JTItemRender[] = lineRender.renders;
        let s: JTLineScrollerGroup = lineRender.scroller as JTLineScrollerGroup;
        let c: JTConfigGroup = s.config;
        let points = s.isLandscape ? lineRender.landscapePoints : lineRender.portraitPoints;
        if (!this.hasAddNode) {
            if (this._skinContainer) this._skinContainer.removeFromParent();
            if (s.lineContainer) {
                this.lineMaskContainer = s.lineContainer.getChildByName("LineMaskContainer");
                this._skinContainer = this.lineImageNode;
                this.lineMaskContainer.addChild(this._skinContainer);
                this.hasAddNode = true;
            }
        }
        this.lineImageNode.clear();
        for (let i: number = 0; i < renders.length; i++) {
            let offPoint: cc.Vec2 = points[i];
            let moveX: number = offPoint.x - c.girdWidth / 2;
            let moveY: number = offPoint.y - c.girdHeight / 2;
            if (i == 0) {
                this.lineImageNode.graphics.moveTo(moveX, moveY);
            }
            else {
                this.lineImageNode.graphics.lineTo(moveX, moveY);
                if (i == renders.length - 1) {
                    this.lineImageNode.stroke();
                    this.lineImageNode.active = true;
                }

            }
        }
        if (SlotMachineView.instance.isGraphicsLineShowAni && this.lineMaskContainer) {
            let width = c.gapWidth * c.col;
            this.lineMaskContainer.width = 0;
            cc.tween(this.lineMaskContainer).to(0.3, { width: 2 * width }).start();
        }
    }

    /**
     * 增加线节点
     */
    addShowLineNode() {
        if (this.lineImageNode) {
            return this.lineImageNode
        }
        this.lineImageNode = new JTGraphicsSpriteMesh();
        this.lineImageNode.graphics.lineJoin = cc.Graphics.LineJoin.ROUND;
        this.lineImageNode.graphics.lineCap = cc.Graphics.LineCap.ROUND;
        return this.lineImageNode
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
        // if (!mask) {
        // } else {
        // }
        this.createComplete();

    }

    /**
     * 隐藏
     */
    public hide(): void {
        super.hide();

        let lineRender: JTLineRender = this.owner as JTLineRender;
        let s: JTLineScrollerGroup = lineRender.scroller as JTLineScrollerGroup;
        this.lineImageNode && (this.lineImageNode.active = false);

    }
}