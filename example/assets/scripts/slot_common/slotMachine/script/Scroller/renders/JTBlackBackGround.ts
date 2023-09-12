import JTContainer from "../com/base/JTContainer";
import JTControlScrollerGroup from "../extensions/JTControlScrollerGroup";


//黑色蒙版，可设定alpha设定透明度
export default class JTBlackBackGround extends JTContainer {

    public graphics: cc.Graphics;

    private points: cc.Vec2[] = [];
    private defalutColor: cc.Color = cc.Color.BLACK;
    constructor() {
        super();
        this.graphics = this.addComponent(cc.Graphics);
        this.on(cc.Node.EventType.SIZE_CHANGED, this.redraw, this);
    }

    /**
     * 设定尺寸及透明度
     * @param width 
     * @param height 
     * @param alpha 
     */
    public setup(width: number, height: number, alpha: number = 160, color: cc.Color = cc.Color.BLACK): void {
        this.defalutColor = color.clone();
        this.active = false;
        if (this.owner) {
            let scroller = this.owner as JTControlScrollerGroup;
            if (scroller.maskPolygon && scroller.maskPolygon.length >= 3) {
                this.points = [].concat(scroller.maskPolygon);
            }
        }
        this._alpha = alpha;
        this.width = width;
        this.height = height;
        
    }

    /**
     * 设定多边形黑色蒙板
     */
    public setPolygon(points: cc.Vec2[]): void {
        this.points = [].concat(points);
        this.redraw();
    }

    private drawPolygon(): void {
        let graphics = this.graphics;
        graphics.fillColor = this.defalutColor;
        let points = this.points;
        this.defalutColor.setA(this._alpha);
        this.graphics.clear();


        for (let i: number = 0; i < points.length; i++) {
            let p: cc.Vec2 = points[i];
            if (i == 0) {
                graphics.moveTo(p.x, p.y);
            }
            else {
                graphics.lineTo(p.x, p.y);
            }
        }
        graphics.close();
        if (cc.game.renderType === cc.game.RENDER_TYPE_CANVAS) {
            graphics.stroke();
        }
        else {
            graphics.fill();
        }
    }

    private _alpha = 255;
    set alpha(v: number) {
        this._alpha = v;
        this.redraw();
    }

    private drawRect(): void {
        this.defalutColor.setA(this._alpha);
        this.graphics.clear();
        this.graphics.fillColor = this.defalutColor;
        this.graphics.fillRect(0, -this.height, this.width, this.height);

    }

    public redraw(): void {
        let points = this.points;
        if (points.length > 3) {
            this.drawPolygon();
        } else {
            this.drawRect();
        }
    }

    get alpha(): number {
        return this._alpha;
    }

}
