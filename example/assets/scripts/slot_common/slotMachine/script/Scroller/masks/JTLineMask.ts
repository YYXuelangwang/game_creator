import JTSprite from "../com/base/JTSprite";
import JTConfigGroup from "../com/JTConfigGroup";
import JTCanvasTools from "../com/canvas/JTCanvasTools";
import JTItemRender from "../com/base/JTItemRender";
import JTDefaultItemRender from "../renders/JTDefaultItemRender";
import JTMask from "../com/base/JTMask";
import JTScrollerGroup from "../com/JTScrollerGroup";
import JTItemSkinLoader from "../com/base/JTItemSkinLoader";
import JTLineScrollerGroup from "../extensions/JTLineScrollerGroup";

/*
* name;
*/
export default class JTLineMask extends JTSprite
{
    private gridMasks:JTMask[] = null;
    private vMasks:JTMask[] = null;
    private hMasks:JTMask[] = null;
    private scrollerGroup:JTScrollerGroup = null;
    constructor()
    {
            super();
            this.gridMasks = [];
            this.vMasks = [];
            this.hMasks = [];
        //     this.x = 4;
        //     this.y = 4;
    }

    public launch(s:JTScrollerGroup):void
    {
            this.scrollerGroup = s;
            this.createMask();
    }

    public createMask():void
    {
            let config:JTConfigGroup = this.scrollerGroup.config;
            let lineWidth:number = JTCanvasTools.lineWidth / 2 ;
            let renders:JTItemSkinLoader[] = this.scrollerGroup.renders;
            for (let i:number = 0; i < renders.length; i++)
            {
                    let r:JTDefaultItemRender = renders[i] as JTDefaultItemRender;
                    let p:cc.Vec2 = this.scrollerGroup.getRenderPoint(r.index);
                    let gMask:JTMask = this.drawGridMask(config, r.index);
                    gMask.x = p.x;
                    gMask.y = p.y;
                    this.gridMasks.push(gMask);
                    this.addChild(gMask);//cocos
                    gMask.parent=this;
            }

            if (config.gapY > 0)
            {
                 let fiexdTimes:number = renders.length  / config.col;
                 for (let i:number = 1; i < fiexdTimes; i++)
                 {
                        let v:number = i * config.gapHeight - config.gapY;
                        let hMask:JTMask = this.drawMask(0, v, config.getWidth(), config.gapY, "#996600");
                        // this.addChild(hMask);
                        hMask.parent=this;
                        this.hMasks.push(hMask);
                 }
            }

            if (config.gapX > 0)
            {
                    let fiexdTimes:number = renders.length / config.row;
                    for (let i:number = 1; i < fiexdTimes; i++)
                    {
                        let v:number = i * config.gapWidth - config.gapX;
                        let vMask:JTMask = this.drawMask(v, 0, config.gapX, config.getHeight(), "#ff6600");
                        this.vMasks.push(vMask);
                        vMask.parent=this;
                        //this.addChild(vMask);
                    }
            }
    }

    private drawGridMask(config:JTConfigGroup, index:number, color:string = "#996600"):JTMask
    {
                let mask:JTMask= new JTMask();
                mask.name = index.toString();
               // mask.graphics.drawRect(0, 0, config.girdWidth, config.girdHeight, color);
               mask.width=config.girdWidth;
               mask.height=config.girdHeight;
                return mask;
    }

    private drawMask(offX:number, offY:number, width:number, height:number, color:string = "#996600"):JTMask
    {
            let mask:JTMask = new JTMask();
        //     mask.graphics.drawRect(offX, offY, width, height, color);
            mask.x=offX;
            mask.y=offY;
            mask.width=width;
            mask.height=height;
            return mask;
    }

    public showAward(rs:JTItemRender[], scroller:JTLineScrollerGroup):void
    {
            let names:string[] = this.getRenderNames(rs);
            for (let i:number = 0; i < this.gridMasks.length; i++)
            {
                     let gMask:JTMask = this.gridMasks[i];
                     gMask.scaleY = 1;
                     if (names.indexOf(gMask.name) == -1)
                     {
                            gMask.active = true;
                            continue;
                     }
                     gMask.active = false;
            }
    }

    private getRenderNames(rs:JTItemRender[]):string[]
    {
        let names:string[] = [];
        for (let i:number = 0; i < rs.length; i++)
        {
                let r:JTItemRender = rs[i] as JTItemRender
                names.push(r.index.toString())
        }
        return names;
    }

    public getGridMask(index:number):JTMask
    {
            for (let i:number = 0; i < this.gridMasks.length; i++)
            {
                     let gMask:JTMask = this.gridMasks[i];
                     gMask.scaleY = 1;
                     if (gMask.name == index.toString())
                     {
                                return gMask;
                     }
            }
            return null;
    }

    public setupGridMask(index:number, isVisible:boolean = false):void
    {
                let gridMask:JTMask = this.getGridMask(index);
                gridMask.active = isVisible;
    }

    public redraw(s:JTScrollerGroup, x:number, y:number, width:number, height:number):void
    {
          
    }

    public changed(s:JTScrollerGroup):void
    {

    }
}