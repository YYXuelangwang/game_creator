import { GameEventNames } from "../../SlotConfigs/GameEventNames";
import FreeGameManager from "../../SlotManager/FreeGameManager";
import { Handler } from "../../SlotUtils/Handle";
import JTItemRender from "../com/base/JTItemRender";
import JTScroller from "../com/JTScroller";
import JTRuleTask from "./JTRuleTask";



/**
 * 整列的持续百搭,从免费游戏开始到结束保持状态
 */
export  class JTRetainWildTask extends JTRuleTask
{

    
    private state:JTRetainWildState = 0;
    private configs:JTRetainWildConfig[] = null;
    private curConfig:JTRetainWildConfig = null;
    constructor()
    {
        super();
        this.configs = [];
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_FREE_GAME_TRIGGERED, this.treateNewFreeGame, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_FREE_GAME_OVER, this.treateFreeGameOver, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_INIT_FREEGAME, this.onFreeGameInit, this);
    }


    private onFreeGameInit():void{
        if(FreeGameManager.instance.freeGameInfo&&FreeGameManager.instance.freeGameInfo.elemFixPos.length>0){
            let id = FreeGameManager.instance.freeGameInfo.elemFixPos[0].elem;
            for(let i=0;i<this.configs.length;i++){
                if(this.configs[i].id==id){
                    this.curConfig = this.configs[i];
                    this.state = JTRetainWildState.Stay;
                    break;
                }
            }
        }

        
        if(this.curConfig){
            for(let i=0;i<this.curConfig.wildIndexs.length;i++){
                let index =this.curConfig.wildIndexs[i];
                let s = this.scrollerGroup.items[index];
                if(this.curConfig.startCall){
                    this.curConfig.startCall.apply(this.caller, [s]);
                }
                s.skinLoader.active = true;
                s.active = false;
            }
        }
    }

    private treateNewFreeGame():void{
        if(FreeGameManager.instance.freeGameInfo&&FreeGameManager.instance.freeGameInfo.elemFixPos.length>0){
            let id = FreeGameManager.instance.freeGameInfo.elemFixPos[0].elem;
            for(let i=0;i<this.configs.length;i++){
                if(this.configs[i].id==id){
                    this.curConfig = this.configs[i];
                    this.state = JTRetainWildState.TurnStay;
                    break;
                }
            }
        }

    }

    private treateFreeGameOver():void{
         if(this.state == JTRetainWildState.Stay){
             this.state = JTRetainWildState.TurnNone;
         }
    }

    public runningTask():boolean
    {
       super.runningTask();
       if(this.state == JTRetainWildState.TurnStay){
          this.state = JTRetainWildState.Stay;
       }
       if(this.state == JTRetainWildState.TurnNone){
         this.state = JTRetainWildState.None;
         this.curConfig = null;
       }
       return this._isRunning;
    }

    
    /**
     * 
     * @param id 变成百搭的id
     * @param condition 暂时不用
     * @param wildIndexs 要变成整列百搭的索引列表
     * @param startCall 开始变百搭的回调
     * @param skinURL 变成百搭的资源
     * @param scrollDelay 触发变百搭多少秒开始滚动
     * @param showWildDelay 多少秒后百搭显示
     */
    public config(id:any, condition:any, wildIndexs:number[],skinURL:string, startCall?:Function,scrollDelay:number=0,showWildDelay:number=0):void
    {
       let config = new JTRetainWildConfig();
       config.id = id;
       config.condition = condition;
       config.skinURL = skinURL;
       config.startCall = startCall;
       config.scrollDelay = scrollDelay;
       config.wildIndexs = wildIndexs;
       config.showWildDelay = showWildDelay;
       this.configs.push(config);
    }

    public setupWildScroller(s:JTScroller):void{
        if(this.curConfig&&this.curConfig.wildIndexs.indexOf(s.index)>-1){
            s.skinLoader = this.skinLoaders[s.index];
            s.skinLoader.url = this.curConfig.skinURL;
        }

        if(this.state==JTRetainWildState.TurnNone&&this.curConfig.wildIndexs.indexOf(s.index)>-1){
            s.skinLoader = this.skinLoaders[s.index];
            s.skinLoader.url = null;
            s.active = true;
        }
    }

    public checkPlayLineItem(rs:JTItemRender[]):void{
        if(this.state==JTRetainWildState.Stay||this.state==JTRetainWildState.TurnNone){
             if(rs){
                for(let i=0;i<this.curConfig.wildIndexs.length;i++){
                    let index =this.curConfig.wildIndexs[i];
                    let s = this.scrollerGroup.items[index] as JTScroller;
                    for(let j=0;j<rs.length;j++){
                        let r = rs[j];
                        if(s.renders.indexOf(r)>-1){
                            rs.splice(j--,1);
                        }
                    }
                }
             }
        }
    }

    public checkStart():boolean{
        return this.state == JTRetainWildState.TurnStay;
    }

    public retainWildStart(handler:Handler):void{
         if(this.curConfig){
             let ss :JTScroller[]= [];
             for(let i=0;i<this.curConfig.wildIndexs.length;i++){
                 let index =this.curConfig.wildIndexs[i];
                 let s = this.scrollerGroup.items[index] as JTScroller;
                 if(this.curConfig.startCall){
                     this.curConfig.startCall.apply(this.caller, [s]);
                 }
                  s.skinLoader.active = false;
                //  s.active = false;
                 ss.push(s);
             }
             cc.tween(this).delay(this.curConfig.showWildDelay).call(
                ()=>{
                   for(let s of ss){
                    s.skinLoader.active = true;
                    s.active = false;
                   }
                }
            ).start();
             cc.tween(this).delay(this.curConfig.scrollDelay).call(
                 ()=>{
                    handler.run();
                 }
             ).start();
         }
    }


}

export class JTRetainWildConfig{
    public id:any;
    public condition:any;
    public skinURL:string;
    public scrollDelay:number=0;
    public showWildDelay:number = 0;
    public startCall:Function;
    public wildIndexs:number[];
}

enum JTRetainWildState{
    None,
    TurnStay,
    Stay,
    TurnNone
}


