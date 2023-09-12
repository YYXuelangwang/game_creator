import JTContainer from "../com/base/JTContainer";
import JTScrollerGroup from "../com/JTScrollerGroup";
import JTLayoutPoint from "./JTLayoutPoint";

/*
* 
*/
export default class JTEffectContainer extends JTContainer
{

    private childLayoutMap:{child:cc.Node,point:JTLayoutPoint}[]= []
    constructor()
    {
        super();
        this.childLayoutMap = [];

        this.on(cc.Node.EventType.CHILD_REMOVED,this.onChildRemoved,this);
    }

    onChildRemoved():void{
        for(let c of this.childLayoutMap){
            let child = c.child;
            let index = this.children.indexOf(child);
            if(index==-1){
                this.childLayoutMap.splice(index,1);
            }
        }
    }

    public setupChild(child:cc.Node,landscapeX:number,landscapeY:number,portraitX:number,portraitY:number):void{
         let point = new JTLayoutPoint();
         point.landscapeX = landscapeX;
         point.landscapeY = landscapeY;
         point.portraitX = portraitX;
         point.portraitY = portraitY;
         this.childLayoutMap.push({child:child,point:point});
         let scoller = this.owner as JTScrollerGroup;
         let c = scoller.config;

         this.addChild(child);

         if(c.isLandscape){
            child.x = landscapeX;
            child.y = landscapeY;
         }else{
            child.x = portraitX;
            child.y = portraitY;
         }
    }

    public resetChildrensPosition():void{
        let scoller = this.owner as JTScrollerGroup;
        let isLandscape = scoller.config.isLandscape;
        for(let c of this.childLayoutMap){
            let position = c.point;
            let child = c.child;      
            if(isLandscape){
                child.x = position.landscapeX;
                child.y = position.landscapeY;
            }else{
                child.x = position.portraitX;
                child.y = position.portraitY;
            }
        }
    }

}

