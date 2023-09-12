import JTSprite from "../com/base/JTSprite";
import JTItemRender from "../com/base/JTItemRender";
import JTConfigGroup from "../com/JTConfigGroup";
import JTContainer from "../com/base/JTContainer";
import JTScrollerGroup from "../com/JTScrollerGroup";
import JTLineScrollerGroup from "../extensions/JTLineScrollerGroup";

/*
* name;
*/
export default class JTLineArtMask extends JTSprite
{
    private scroller:JTScrollerGroup = null;
    constructor()
    {
            super();
    }

    public launch(s:JTScrollerGroup):void
    {
            this.scroller = s;
    }

    private createMask(offX:number, offY:number, width:number, height:number, color:string = "#996600"):void
    {
        //     this.graphics.clear();
        //     this.graphics.drawRect(offX, offY, width, height, color);
         this.x=offX;
         this.y=offY;
        
         this.width=width;
         this.height=height;
    }

    public showAward(rs:JTItemRender[], scroller:JTLineScrollerGroup):void
    {
            let config:JTConfigGroup = this.scroller.config;
            let maskX:number = config.girdWidth * rs.length + config.gapX * rs.length - 1;
            let maskWidth:number = config.getWidth() - maskX;
            this.createMask(maskX, 0, maskWidth, config.getHeight());
            this.parent=(scroller.owner as JTContainer);//cocos
            (scroller as JTLineScrollerGroup).layoutScrollerLayer(rs);
    }

    public redraw(s:JTScrollerGroup, x:number, y:number, width:number, height:number):void
    {
        
    }

    public changed(s:JTScrollerGroup):void
    {

    }

}