
import JTConfigGroup from "../com/JTConfigGroup";
import JTMask from "../com/base/JTMask";
import JTScrollerGroup from "../com/JTScrollerGroup";
import JTControlScrollerGroup from "../extensions/JTControlScrollerGroup";

/*
* name;
*/
export default class JTScrollerGroupMask extends JTMask
{
    public maskPolygon:cc.Vec2[] = [];
    constructor()
    {
        super();
    }

    public launch(s:JTScrollerGroup):void
    {
         let config:JTConfigGroup = s.config;
         this.width=config.getWidth();
         this.height=config.getHeight() - config.gapY;
         this.anchorX = 0;
         this.anchorY = 1;
         this.x= 0;
         this.y= 0;
    }

    public redraw(s:JTScrollerGroup, x:number, y:number, width:number, height:number):void
    {
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;
    }

    public setPolygon(maskPolygon:cc.Vec2[]):void{
        this.maskPolygon = maskPolygon;
        this.drawPolygon();
    }

    public drawPolygon():void{
        let mask = this.mask;
        let points = [];
        if(this.maskPolygon&&this.maskPolygon.length>=3){
            points = this.maskPolygon;
        }else{
            points = (this.owner as JTControlScrollerGroup).maskPolygon;
        }
        
        if(!points||points.length<3){
            return;
        }
        //@ts-ignore
        mask._updateGraphics = () => {
            //@ts-ignore
            let graphics = mask._graphics as cc.Graphics;
            if(!graphics){
                return;
            }
            graphics.clear();
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

        //@ts-ignore
        mask._updateGraphics();
    }


}