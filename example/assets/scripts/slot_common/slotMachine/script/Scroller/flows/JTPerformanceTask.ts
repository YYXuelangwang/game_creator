import { Handler } from "../../SlotUtils/Handle";

import JTParseTask from "./JTParseTask";

export default abstract class JTPerformanceTask extends JTParseTask {
    
    /**
     * 
     */
    protected steps: { eventName: string, args: any }[] = [];
    /**
     * 是否等待
     */
    protected pending:boolean = false;
    
    constructor(){
        super();
        this.steps = [];
        this.addEventListenner();
    }

    public abstract addEventListenner():void

    /**
     * 
     */
    public runningTask():void{
        this.nextStep();
    }

    private isActive():boolean{
        let s = this.getScrollerGroup();
        return s.enabled;
    }
    
    /**
     * 添加子任务,监听事件的方法需在最后加一个handler回调的参数并保证执行到
     * @param eventName 事件名
     * @param args 参数可带多个
     */
    public addStepTask(eventName:string,...args:any[]):void{
        let complete = Handler.create(this,this.nextStep);
        let newArgs = args||[];
        newArgs.push(complete);
        let event = {eventName: eventName, args: newArgs };
        this.steps.push(event);
    }
    
    /**
     * 检查队列中是否有子任务，如果有马上执行下一步，没有直接完成整个流程
     */
    public nextStep():void{
        let event = this.steps.shift();
        if(event){
            game.EventManager.getInstance().raiseEvent(event.eventName,...event.args);
        }else if(!this.pending){
            this.complete();
        }
    }


    public complete():void{
        this.pending = false;
        this.steps = [];
        super.complete();
    }

    public clear():void{
        this.pending = false;
        this.steps = [];
        super.clear();
    }


}
