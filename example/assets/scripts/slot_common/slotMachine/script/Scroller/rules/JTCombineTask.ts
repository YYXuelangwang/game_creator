import BaseSpinSlotView from "../../MainView/BaseSpinSlotView";
import { GameEventNames } from "../../SlotConfigs/GameEventNames";
import { Handler } from "../../SlotUtils/Handle";
import JTItemRender from "../com/base/JTItemRender";
import JTScroller from "../com/JTScroller";
import JTScrollerGroup from "../com/JTScrollerGroup";
import JTScrollingPipeline from "../transitions/procedure/scrolling/JTScrollingPipeline";
import JTRuleTask from "./JTRuleTask";

/*
* 
*/
export default class JTCombineTask extends JTRuleTask {

        /**
         * 合并的列
         */
        private combineIndexs:number[] = [];

        private showScollerIndex:number = 0;

        private urlPrefix:string ="";

        private reduceTime:number = 0;

        public gridHeight:number=0;

        public gridWidth:number=0;

        public gapX:number = 0;

        public gapY:number=0;

        private combineStartCall:Function = null;

        private combineEndCall:Function = null;

        private hideItemIndexs:number[] = [];

        public combineState:JTCombineState = JTCombineState.None;

        constructor() {
                super();
                this.hideItemIndexs = [];
                game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_FREE_GAME_TRIGGERED, this.treateNewFreeGame, this);
                game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_FREE_GAME_OVER_TASK, this.treateFreeGameOver, this);
                game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_INIT_FREEGAME, this.onFreeGameInit, this);

        }
        /**
         * 进游戏或重连时，重置状态
         */
        private onFreeGameInit():void{
            this.combineState = JTCombineState.Stay;
            //this.runningTask();
            let o = this._scrollerGroup;
            for(let i=0;i<o.items.length;i++){
                let s = o.items[i] as JTScroller;
                if(this.isCombineIndexInRunnnig(s)){
                    let pipeline = s.pipeline as JTScrollingPipeline;

                    for(let i=0;i<s.items.length;i++){
                        let r = s.items[i] as BaseSpinSlotView;
                        r.setupUrlPrefix(this.urlPrefix);
                        r.gotoAndStop(BaseSpinSlotView.STATE_DEFAULT);
                    }
                    pipeline.lineTimeComplete();
                }else if(this.isInHide(s)){
                    let o = s.owner as JTScrollerGroup;
                    s.active = false;
                    for(let i=0;i<s.items.length;i++){
                        let r = s.items[i] as BaseSpinSlotView;
                        r.active = false;
                    }
                }
            }

        }

        private treateNewFreeGame():void{
            this.combineState = JTCombineState.TurnStay;
        }

        private treateFreeGameOver():void{
            this.combineState = JTCombineState.TurnNone;
        }
        
        /**
         * 
         * @param condition 条件，暂时无用，保留参数
         * @param combineIndexs 要合并的滚轴列索引
         * @param urlPrefix 合并后的滚轴元素的资源名字为正常元素名加上此参数前缀，如big_,则合并元素资源名为big_01,big_01_fade等
         * @param gridWidth 合并后的滚轴宽
         * @param gridHeight 合并后的滚轴高
         * @param gapX 合并后的x间距
         * @param gapY 合并后的y间距
         * @param reduceTime 合并滚轴滚动要缩短的时间 以毫米为单位
         * @param combineStartCall 合并开始时的回调
         * @param combineEndCall 合并完结分裂时的回调
         */
        public config(condition:any,combineIndexs:number[],urlPrefix:string,gridWidth:number,gridHeight:number,gapX:number,gapY:number,reduceTime:number,combineStartCall:Function=null,combineEndCall:Function=null): void {
            this.condition = condition;
            this.combineIndexs = combineIndexs;
            if(combineIndexs.length>1){
                let mid = Math.floor(combineIndexs.length/2);
                let showScollerIndex = combineIndexs[mid];
                this.showScollerIndex = showScollerIndex;
            }
            this.urlPrefix = urlPrefix;
            this.gridHeight = gridHeight;
            this.gridHeight = gridWidth;
            this.gapX = gapX;
            this.gapY = gapY;
            this.combineStartCall = combineStartCall;
            this.combineEndCall = combineEndCall;
            this.reduceTime = reduceTime;
        }

        public runningTask():boolean{
            super.runningTask();
            console.log("runing task",this.combineState);

            if(this.combineState == JTCombineState.TurnStay){
                this.combineState = JTCombineState.Stay;
            }
            this.setPlayItemsConfig();
            return this.isRunning;
        }

        private setPlayItemsConfig():void{
            let c = this.scrollerGroup.config;
            let index = 0;
            this.hideItemIndexs = [];
            for(let col=0;col<c.col;col++){
                for(let row = 0;row<c.row;row++){
                    if(this.combineIndexs.indexOf(col)>-1){
                        if(this.showScollerIndex==col){
                            let mid = Math.floor(c.row/2);
                            if(row!=mid){
                                this.hideItemIndexs.push(index);
                            }
                        }else{
                            this.hideItemIndexs.push(index);
                        }
                    }
                    index++;
                }
            }
        }

        public setupCombineScroller(s: JTScroller):void{
            if(this.isCombineIndexInRunnnig(s)){
                for(let i=0;i<s.items.length;i++){
                    let r = s.items[i] as BaseSpinSlotView;
                    r.setupUrlPrefix(this.urlPrefix);
                }
                s.time = s.time-this.reduceTime;
            }else if(this.isInHide(s)){
                let o = s.owner as JTScrollerGroup;
                o.removeRunnings(s);
                s.active = false;
                for(let i=0;i<s.items.length;i++){
                    let r = s.items[i] as BaseSpinSlotView;
                    r.active = false;
                }
            }
        }

        public resetRenders(s:JTScroller):void{
            if(s.index!=this.showScollerIndex){
                return;
            }
            for(let i=0;i<s.items.length;i++){
                let r = s.items[i] as BaseSpinSlotView;
                r.scale = 1;
            }
        }
        
        public checkStart():boolean{
            return this.combineState == JTCombineState.TurnStay;
        }

        public checkCanPlayLine():boolean{
            return this.combineState == JTCombineState.TurnStay||this.combineState==JTCombineState.Stay;

        }

        public checkPlayLineItem(rs:JTItemRender[]):void{
            if(this.combineState == JTCombineState.Stay||this.combineState == JTCombineState.TurnNone){
                 if(rs){
                    for(let i=0;i<rs.length;i++){
                        let r = rs[i];
                        if(this.hideItemIndexs.indexOf(r.index)>-1){
                            rs.splice(i--,1);
                        }
                    }
                 }
            }
        }

        public runStartCombine(handler:Handler):void{
             let s = this.scrollerGroup.items[this.showScollerIndex] as JTScroller;
             let pipeline = s.pipeline as JTScrollingPipeline;
             pipeline.lineTimeComplete();
             for(let i=0;i<s.items.length;i++){
                 let r = s.items[i] as BaseSpinSlotView;
                 r.scale = 0;
                 console.log("change start",r.index);

                 cc.tween(r).to(0.6,{scale:1}).call(()=>{
                     console.log("change compte",r.index);
                 }).start();
             }
             s.adjustSkinRenders(true);
             if(this.combineStartCall){
                 this.combineStartCall.apply(this.caller);
             }
             cc.tween(this).delay(1).call(()=>{
                handler.run();
             }).start();
        }

        public combineComplete(handler:Handler):void{
            let items = this.scrollerGroup.items;
            this.combineState = JTCombineState.None;
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SKIP_LOOP_LINE_TASK);
            for(let i=0;i<items.length;i++){
                let s = items[i] as JTScroller;
                let pipeline = s.pipeline as JTScrollingPipeline;
                if(this.showScollerIndex==s.index){
                    for(let i=0;i<s.items.length;i++){
                        let r = s.items[i] as BaseSpinSlotView;
                        r.clearUrlPrefix();
                        r.gotoAndStop(BaseSpinSlotView.STATE_DEFAULT);
                    }
                    pipeline.lineTimeComplete();
                }else if(this.combineIndexs.indexOf(s.index)>-1){
                    s.clear();
                    s.active = true;
                    for(let i=0;i<s.items.length;i++){
                        let r = s.items[i] as BaseSpinSlotView;
                        r.active = true;
                    }
                    pipeline.lineTimeComplete();
                }
            }
            
            for(let i=0;i<items.length;i++){
                let s = items[i] as JTScroller;
                if(this.showScollerIndex==s.index){
                    s.scale = 3;
                    cc.tween(s).to(0.3,{scale:1}).start();
                }else if(this.combineIndexs.indexOf(s.index)>-1){
                     let x = s.x;
                     s.x = items[this.showScollerIndex].x;
                     s.scale = 3;
                     cc.tween(s).to(0.3,{x:x,scale:1}).start();
                }
            }

            if(this.combineEndCall){
                this.combineEndCall.apply(this.caller);
            }
            
            cc.tween(this).delay(0.5).call(()=>{
                this.combineState = JTCombineState.None;
                handler.run();
            }).start();
        }

        public isCombineIndexInRunnnig(s: JTScroller):boolean{
            return (this.combineState !=JTCombineState.None)
                   &&this.showScollerIndex == s.index;
        }

        public isCombineIndexInOver(s: JTScroller):boolean{
            return (this.combineState ==JTCombineState.Stay||this.combineState==JTCombineState.TurnStay)
                   &&this.showScollerIndex == s.index;
        }

        public isInHide(s:JTScroller):boolean{
            return (this.combineState ==JTCombineState.Stay||this.combineState==JTCombineState.TurnStay)
                   &&this.combineIndexs.indexOf(s.index)>-1
                   &&this.showScollerIndex!=s.index;
        }


        public clear(): void {
            super.clear();
            this._isRunning = false;
        }

}

export  enum JTCombineState{
    None,
    TurnStay,
    Stay,
    TurnNone
}



