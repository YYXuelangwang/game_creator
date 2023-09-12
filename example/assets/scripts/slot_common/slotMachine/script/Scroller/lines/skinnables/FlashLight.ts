import { Handler } from "../../../SlotUtils/Handle";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FlashLight extends cc.Component {
    
    private material:cc.Material = null;

    private renderTime:number=0;

    private enableRender:boolean = false;

    private roundShowComplete:Handler = null;

    private percentRoundShowComplete:Handler = null;

    private compeltePercent:number = -1;

    private loop:boolean = false;

    private _lineWidth:number = 0;
    private _moveWidth:number = 0;
    private _enableRender:boolean = false;
    private _moveSpeed:number = 0;


    onLoad():void{
        
    }
    
    init():void{
        this.material = this.node.getComponent(cc.RenderComponent).getMaterial(0);
    }


    show(loop:boolean=false,percent:number=-1,percentComplete:Handler=null):void{
        this.loop = loop;
        this.renderTime = 0;
        this.compeltePercent = percent;
        this.enableRender = true;
        this.material.setProperty("enableRender", 1);
        this.percentRoundShowComplete = percentComplete;
    }

    hide():void{
        this.renderTime = 0;
        this.enableRender = false;
        this.material.setProperty("enableRender", 0);
    }

    get moveSpeed():number{
        return this.material.getProperty("moveSpeed",0) as number;
    }

    set moveSpeed(value:number){
        this.material.setProperty("moveSpeed",value);
    }

    get moveWidth():number{
        return this.material.getProperty("moveWidth",0) as number;
    }

    get lightWidth():number{
        return this.material.getProperty("lightWidth",0) as number;
    }

    set lightWidth(value:number){
        this.material.setProperty("lightWidth",value);
    }

    get roundTime():number{
        return (this.lightWidth+this.moveWidth)/this.moveSpeed;
    }

    set roundTime(value:number){
        this.moveSpeed = (this.lightWidth+this.moveWidth)/value;
    }

    getPercent():number{
        return (this.renderTime%this.roundTime)/this.roundTime;
    }

    update(dt:number){
        if(!this.enableRender){
            return;
        }
        this.renderTime +=dt;
        this.material.setProperty("renderTime", this.renderTime);
        let percent = this.renderTime/this.roundTime;

        if((this.compeltePercent!=-1&&percent>=this.compeltePercent)){
            if(this.percentRoundShowComplete){
                this.percentRoundShowComplete.run();
                this.percentRoundShowComplete = null;
            }
        } 

        if(percent>=1){
            this.renderTime = 0;
            if(this.roundShowComplete){
                this.roundShowComplete.run();
                this.roundShowComplete = null;
            }
            if(!this.loop){
               this.hide();
            }
        }     
    }

}
