import { Handler } from "../../../SlotUtils/Handle";
import SlotUtils from "../../../SlotUtils/SlotUtils";
import JTGComponent from "../../com/base/JTGComponent";
import JTItemRender from "../../com/base/JTItemRender";
import JTConfigGroup from "../../com/JTConfigGroup";
import JTLineScrollerGroup from "../../extensions/JTLineScrollerGroup";
import JTLineRender from "../JTLineRender";
import JTLineRenderUtils from "../JTLineRenderUtils";
import JTRuntimeSkinnableLine from "./base/JTRuntimeSkinnableLine";
import FlashLight from "./FlashLight";



export default class JTSkinnableFlashLightLineRender extends JTRuntimeSkinnableLine {
    
    private flashLights:FlashLight[];
    private loopIndex:number = 0;
    constructor(){
        super();
    }

    public createComplete(data?: any): void {
        this.loopIndex = 0;
        let lineRender:JTLineRender = this.owner as JTLineRender;
        
        let scroller:JTLineScrollerGroup = lineRender.scroller;
        let config:JTConfigGroup = scroller.config;
        this.flashLights = [];
        this.clearLines();
        let _skinContainer = new cc.Node();
        let propertys:{x:number,y:number,angle:number,width:number}[] = [];

        let ps = scroller.isLandscape?lineRender.landscapePoints:lineRender.portraitPoints;

        let points = ps.slice();
        let index = 0;
        while(index<points.length-2){
            let point1 = points[index];
            let point2 = points[index+1];
            let point3 = points[index+2];
                
            if(Math.atan2(point2.y-point1.y,point2.x-point1.x) == Math.atan2(point3.y-point2.y,point3.x-point2.x)){
                points.splice(index+1,1);
            }else{
                index++;
            }
        }
        
        let totalLenght = 0;
        for(let i:number = 0; i < points.length - 1; i++)
        {
            let point:cc.Vec2 = points[i];
            let nxp:cc.Vec2 = points[i+1];
            let distanceX = (nxp.x - point.x);
            let distanceY = (nxp.y - point.y);

            let angle = SlotUtils.toAngle(Math.atan2(distanceY,distanceX));
            let width = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
            let x = (nxp.x + point.x)/2-config.girdWidth*0.5;
            let y = (nxp.y + point.y)/2-config.girdHeight*0.5;

            propertys.push({x:x,y:y,angle:angle,width:width});
            totalLenght += width;
        }

        for(let i:number = 0; i < propertys.length; i++)
        {
            let node:cc.Node = JTLineRenderUtils.createSingleFlashLight();
            node.angle = propertys[i].angle;
            node.width = propertys[i].width;
            node.x = propertys[i].x;
            node.y = propertys[i].y;
            let renderComp = node.getComponent(FlashLight);
            this.flashLights.push(renderComp);
            _skinContainer.addChild(node);
            renderComp.roundTime = propertys[i].width/totalLenght*1.2;
        }

        this._skinContainer = _skinContainer;
        scroller.flashLineContainer && (scroller.flashLineContainer as JTGComponent).addChild(this._skinContainer);
    }

        /**
     * 显示遮罩线
     * @param count 
     */
    private createMaskLine(count: number, direction: number) {
        this.loopIndex = 0;
        this.clearLines();
        let lineRender: JTLineRender = this.owner as JTLineRender;
        let renders: JTItemRender[] = lineRender.renders;

        let s: JTLineScrollerGroup = lineRender.scroller as JTLineScrollerGroup;
        let c: JTConfigGroup = s.config;
        let  gridHeight = c.girdHeight;
        let points: cc.Vec2[] = s.isLandscape?lineRender.landscapePoints:lineRender.portraitPoints;
        let newPoints:{x:number,y:number,end:boolean}[] = [];
        for (let i = 0; i < renders.length; i++) {
            let  direct: number = direction == 1 ? 1 : -1;
            let  index: number = direction == 1 ? i : renders.length - i - 1;
            let  offPoint = points[index].clone();
            offPoint.x = offPoint.x - c.girdWidth / 2;
            offPoint.y = offPoint.y - c.girdHeight / 2;
            let  moveX = offPoint.x;
            let  moveY = offPoint.y;
            let nextPoint:cc.Vec2,targetX:number,targetY:number;
            if (i < count) {
                if (points[index + direct]) {
                    nextPoint = points[index + direct].clone();
                    nextPoint.x = nextPoint.x - c.girdWidth / 2;
                    nextPoint.y = nextPoint.y - c.girdHeight / 2;
                    targetY = offPoint.y;
                    if (moveY > nextPoint.y) targetY = offPoint.y - gridHeight / 2;
                    if (moveY < nextPoint.y) targetY = offPoint.y + gridHeight / 2;
                }

                targetX = offPoint.x + direct * c.girdWidth / 2;
                if (offPoint.y - nextPoint.y != 0)
                    targetX = (targetY - offPoint.y) / (offPoint.y - nextPoint.y) * (offPoint.x - nextPoint.x) + offPoint.x;

                targetX = Math.floor(targetX);
                targetY = Math.floor(targetY);

                newPoints.push({x:targetX,y:targetY,end:false});

                if (i != count - 1) {
                    let  nextPoint = points[index + direct].clone();
                    nextPoint.x = nextPoint.x - c.girdWidth / 2;
                    nextPoint.y = nextPoint.y - c.girdHeight / 2;
                    let  targetY = nextPoint.y;

                    if (offPoint.y > nextPoint.y) targetY = nextPoint.y + gridHeight / 2//-canvasStyle.lineWidth/4;
                    if (offPoint.y < nextPoint.y) targetY = nextPoint.y - gridHeight / 2//+canvasStyle.lineWidth/4;
                    targetX = nextPoint.x - direct * c.girdWidth / 2;
                    if (offPoint.y - nextPoint.y != 0)
                          targetX = (targetY - offPoint.y) / (offPoint.y - nextPoint.y) * (offPoint.x - nextPoint.x) + offPoint.x;
                    targetX = Math.floor(targetX);
                    targetY = Math.floor(targetY);
                    newPoints.push({x:targetX,y:targetY,end:true});

                }
            }
            else {
                targetX = Math.floor(moveX);
                targetY = Math.floor(moveY);
                newPoints.push({x:targetX,y:targetY,end:true});
            }
        }

        this.flashLights = [];
        let _skinContainer = new cc.Node();
        for(let i:number = 0; i < newPoints.length - 1; i++)
        {
            let node:cc.Node = JTLineRenderUtils.createSingleFlashLight();
            let point = newPoints[i];
            let nxp = newPoints[i+1];
            let distanceX = (nxp.x - point.x);
            let distanceY = (nxp.y - point.y);
            if(point.end&&i<newPoints.length - 2){
                continue;
            }
            if(distanceX != 0) 
            {
                let angle = SlotUtils.toAngle(Math.atan(distanceY / distanceX));
                node.angle = angle;
            }
            node.width = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
            node.x = (nxp.x + point.x)/2;
            node.y = (nxp.y + point.y)/2;
            let renderComp = node.getComponent(FlashLight);
            this.flashLights.push(renderComp);
            _skinContainer.addChild(node);
            renderComp.roundTime = 0.4;
        }

        this._skinContainer && this._skinContainer.removeFromParent();
        this._skinContainer = _skinContainer;
        s.flashLineContainer && (s.flashLineContainer as JTGComponent).addChild(this._skinContainer);
    }

    public show(_singleLineComplete?: Handler, mask?: boolean, lineCount?: number, direction?: number): void {
        this.createComplete();
        this.showLines();
        super.show();
    }

    private showLines():void{
        if(this.loopIndex>=this.flashLights.length){
            return;
        }
        let light = this.flashLights[this.loopIndex];
        light.show(false,0.4,Handler.create(this,()=>{
            this.showLines();
        }));
        this.loopIndex++;
    }

    private clearLines():void{
        if(this._skinContainer){
            let children = this._skinContainer.children;
            for(let child of children){
                JTLineRenderUtils.recoverFlashLight(child);
            }
            this._skinContainer.removeAllChildren();
            this._skinContainer.removeFromParent();
        }
    }

    public hide():void{
        super.hide();
        this.clearLines();
    }


}
