
import JTConfigGroup from "../com/JTConfigGroup";
import JTContainer from "../com/base/JTContainer";
import JTMask from "../com/base/JTMask";
import JTScrollerGroup from "../com/JTScrollerGroup";

/*
* name;
*/
export default class JTAnomalyMask extends JTMask
{
    constructor()
    {
        super();
    }

    public launch(s:JTScrollerGroup):void
    {
         let config:JTConfigGroup = s.config;
         this.x=0;
         this.y=0;
         this.parent=(s.owner as JTContainer);//cocos
         this.width=config.getWidth();
         this.height=config.getHeight() - config.gapY;
    }

    public redraw(s:JTScrollerGroup, x:number, y:number, width:number, height:number):void
    {
        this.x=x;
        this.y=y;
        this.parent=(s.owner as JTContainer);//cocos
        this.width=width;
        this.height=height;
    }

    public changed(s:JTScrollerGroup):void
    {

    }
}