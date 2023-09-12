import BaseSpinSlotView from "../../MainView/BaseSpinSlotView";
import { GameEventNames } from "../../SlotConfigs/GameEventNames";
import { Handler } from "../../SlotUtils/Handle";
import JTItemRender from "../com/base/JTItemRender";
import JTArrayCollection from "../com/datas/JTArrayCollection";
import JTScroller from "../com/JTScroller";
import JTScrollingPipeline from "../transitions/procedure/scrolling/JTScrollingPipeline";
import JTRuleTask from "./JTRuleTask";

/*
* 
*/
export default class JTDynamicCombineTask extends JTRuleTask {

        /**
         * 合并的列
         */
        private combineIndexs:number[] = [];

        private mainIndex:number = 0;

        private staticIndexs:number[]=[];

        private urlPrefix:string ="";

        private additionTime:number = 0;

        public gridHeight:number=0;

        public gridWidth:number=0;

        public gapX:number = 0;

        public gapY:number=0;

        private elementChangeCall:Function = null;

        private elementSplitCall:Function = null;

        private elementChangeDelay:number = 0;

        private elementSplitDelay:number = 0;

        private isOnce:boolean = true;

        private isTreatFree:boolean = false;

        private isTreateFreeOver = false;

        public isEnabled:boolean = false;


        constructor() {
                super();
                this.combineIndexs = [];
                this.staticIndexs = [];
                game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_FREE_GAME_TRIGGERED, this.treateNewFreeGame, this);
                game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_FREE_GAME_OVER, this.treateFreeGameOver, this);
                game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_INIT_FREEGAME, this.onFreeGameInit, this);

        }
        /**
         * 进游戏或重连时，重置状态
         */
        private onFreeGameInit():void{
            this.isOnce = false;
            this.isEnabled = true;
        }

        private treateNewFreeGame():void{
            this.isOnce = false;
            this.isEnabled = true;
            this.isTreatFree = true;
        }

        private treateFreeGameOver():void{
            this.isOnce = true;
            this.isTreateFreeOver = true;
        }
        
        /**
         * 
         * @param combineIndexs 要合并的滚轴列索引
         * @param urlPrefix 合并后的滚轴元素的资源名字为正常元素名加上此参数前缀，如big_,则合并元素资源名为big_01,big_01_fade等
         * @param gridWidth 合并后的滚轴宽
         * @param gridHeight 合并后的滚轴高
         * @param gapX 合并后的x间距
         * @param gapY 合并后的y间距
         * @param additionTime 合并后的滚轴需延长滚动的时间 以毫米为单位
         * @param elementChangeCall 元素改变时的回调
         * @param elementSplitCall 元素连线时分裂时的回调
         * @param elementChangeDelay 元素改变回调的延时
         * @param elementSplitDelay 元素连线时分裂时的延时
         * @param defaultDataList  变大元素的假滚轴列表
         */
        public config(combineIndexs:number[],urlPrefix:string,gridWidth:number,gridHeight:number,gapX:number,gapY:number,additionTime:number,elementChangeCall:Function=null,elementSplitCall:Function=null,elementChangeDelay:number=0,elementSplitDelay:number=0,defaultDataList:number[]=[]): void {
            this.combineIndexs = combineIndexs;
            if(combineIndexs.length>1){
                let mid = Math.floor(combineIndexs.length/2);
                this.mainIndex = combineIndexs[mid];
            }
            this.urlPrefix = urlPrefix;
            this.gridHeight = gridHeight;
            this.gridHeight = gridWidth;
            this.gapX = gapX;
            this.gapY = gapY;
            this.elementChangeCall = elementChangeCall;
            this.elementSplitCall = elementSplitCall;
            this.additionTime = additionTime;
            this.elementSplitDelay = elementSplitDelay;
            this.elementChangeDelay = elementChangeDelay;
            if(this.scrollerGroup){
                 this.registerComplete();
            }
        }

        public registerComplete():void{
            if(this.combineIndexs.length>0){
               let c = this.scrollerGroup.config;
               for(let col=0;col<c.col;col++){
                    if(this.combineIndexs.indexOf(col)==-1){
                        this.staticIndexs.push(col);
                    }
                }
            }
        }

        public runningTask():boolean{
            super.runningTask();
            this.isTreatFree = false;
            if(this.isTreateFreeOver){
                this.isTreateFreeOver = false;
                this.isEnabled = false;
                this.id = 0;
            }
            if(!this.isEnabled){
                this.id = 0;
            }else{
                this.changeDefaultDataList();
            }
            return this.isRunning;
        }

        public changeDefaultDataList():void{
            // let s = this.scrollerGroup.items[this.mainIndex] as JTScroller;
            // let dataProvider = s.dataProvider as JTElementCollection;
            // if(this.defaultDataList.length>0){
            //     dataProvider.forceUpdateDefaultDataList(this.defaultDataList);
            //     dataProvider.syncDefaultDataList();
            // }
          let dataProvider = this.scrollerGroup.dataProvider as JTArrayCollection;
          dataProvider.setDataMode(JTArrayCollection.FREE_MODE);

        }

        public isCombineScroller(s:JTScroller):boolean{
            return this.isEnabled&&s.index==this.mainIndex;
        }

        public isNeedStart():boolean{
            return this.isTreatFree;
        }

        public beforeStartRun(handler:Handler):void{
            cc.tween(this).delay(this.elementChangeDelay)
            .call(()=>{
                this.refreshStaticRenders();
                handler.run();
            }).start();
        }

        public setupScroller(s:JTScroller):boolean{
             let isStart:boolean = true;
             let o = this.scrollerGroup;
             if(this.isOnce){
                this.isEnabled = false;
             }
             if(this.isEnabled){
                if(this.staticIndexs.indexOf(s.index)>-1){
                    o.removeRunnings(s);
                    isStart = false;
                }else if(s.index==this.mainIndex){
                    this.changeDefaultDataList();
                    for(let i=0;i<s.items.length;i++){
                        let r = s.items[i] as BaseSpinSlotView;
                        if(!r.isVisibleRender()){
                            r.data = (this.scrollerGroup.dataProvider as JTArrayCollection).getRandomIDbyCol(i);
                        }
                        r.active = true;
                        r.setupUrlPrefix(this.urlPrefix);
                        r.gotoAndStop(BaseSpinSlotView.STATE_DEFAULT);
                    }
                }else{
                    o.removeRunnings(s);
                    s.active = false;
                    for(let i=0;i<s.items.length;i++){
                        let r = s.items[i] as BaseSpinSlotView;
                        r.active = false;
                    }
                    isStart = false;
                }
             }else{
                for(let i=0;i<s.items.length;i++){
                    let r = s.items[i] as BaseSpinSlotView;
                    r.active = true;
                    r.clearUrlPrefix();
                    r.gotoAndStop(BaseSpinSlotView.STATE_DEFAULT);
                }
                s.active = true;
            }
            return isStart;
        }


        public resetRenders(s:JTScroller):void{
            if(this.isEnabled&&s.index==this.mainIndex){
                for(let i=0;i<this.combineIndexs.length;i++){
                    let index = this.combineIndexs[i];
                    let sc = this.scrollerGroup.items[index] as JTScroller;
                    if(index!=this.mainIndex){
                        (sc.pipeline as JTScrollingPipeline).lineTimeComplete();
                    }
                }

                // if(s.dataList[1]==s.dataList[s.dataList.length-2]){
                //     return;
                // }

                let c = this.scrollerGroup.config;
                let row = 0;
                let firstElement = s.dataList[1];
                for(let i=1;i<s.dataList.length-1;i++){
                        if(s.dataList[i]==firstElement){
                            row++;
                        }
                }
                let currentY = (c.row-row)/c.row*(this.gridHeight+this.gapY);
                
                for (let i: number = 0; i < s.items.length; i++) {
                    let r: JTItemRender = s.items[i] as JTItemRender;
                    if(i==0||i==s.items.length-1)continue;

                    if(i>1&&r.data==(s.items[i-1] as BaseSpinSlotView).data){
                        r.active = false;
                    }else{
                        r.y = currentY -this.gridHeight/2;
                        currentY -= this.gridHeight+this.gapY;
                    }
                }

            }
        }


        public isNeedUpdateRenders(lineRenders:BaseSpinSlotView[]):boolean{
            console.log("isNeedUpdateRenders")

            if(this.isEnabled){
               for(let i=0;i<this.combineIndexs.length;i++){
                   let index = this.combineIndexs[i];
                   let s = this.scrollerGroup.items[index] as JTScroller;
                   for(let j=0;j<s.renders.length;j++){
                       let r = s.renders[j] as BaseSpinSlotView;
                       if(lineRenders.indexOf(r)>-1){
                           return true;
                       }
                   }
               }
            }
            return false;
        }

        public updateRendersBeforeLoopLine(lineRenders:BaseSpinSlotView[],handler:Handler):void{
            if(this.elementSplitCall){
                this.elementSplitCall.call(this.caller);
            }
            let c = this.scrollerGroup.config;
            cc.tween(this).delay(this.elementSplitDelay)
            .call(()=>{
               for(let i=0;i<this.combineIndexs.length;i++){
                   let index = this.combineIndexs[i];
                   let s = this.scrollerGroup.items[index] as JTScroller;
                   if(this.mainIndex == index){
                       let currentY = 0;
                       for(let j=0;j<s.renders.length;j++){
                            let r = s.renders[j] as BaseSpinSlotView;
                            if(lineRenders.indexOf(r)>-1){
                                r.active = true;
                                r.clearUrlPrefix();
                                r.reset();
                                r.gotoAndStop(0);
                                r.y = currentY - c.girdHeight*0.5;
                                currentY -= c.gapHeight;
                            }else{
                                if(j>0&&lineRenders.indexOf(s.renders[j-1] as BaseSpinSlotView)==-1){
                                    r.active = false;
                                }else{
                                    if(j==0){
                                        let count = 0;
                                        for(let k=1;k<s.dataList.length-1;k++){
                                            if(s.dataList[k]==r.data){
                                                count++;
                                            }
                                        }
                                        currentY = (c.row-count)/c.row*(this.gridHeight+this.gapY);
                                    }
                                    r.active = true;
                                    r.y = currentY - this.gridHeight*0.5;
                                    currentY -= (this.gridHeight+this.gapY);
                                }
                            }
                       }
                   }else{
                       let scroller = this.scrollerGroup.items[index] as JTScroller;
                       let p = scroller.pipeline as JTScrollingPipeline;
                       p.lineTimeComplete();

                       scroller.active = true;
                       for(let j=0;j<scroller.renders.length;j++){
                           let r = scroller.renders[j] as BaseSpinSlotView;
                           r.active = lineRenders.indexOf(r)>-1;
                       }
                   }
               }
               handler.run();
            }).start();
        }


        private refreshStaticRenders():void{
            let o = this.scrollerGroup;
            for(let i=0;i<this.staticIndexs.length;i++){
                let index = this.staticIndexs[i];
                let s = o.items[index] as JTScroller;
                (s.pipeline as JTScrollingPipeline).lineTimeComplete();
            }
        }
        
        /**
         * 随机的元素选择表现完成,子游戏主动调用
         * @param id 
         * @param initial 
         */
        public chooseElementComplete(id:number,initial:boolean=false):void{
            let o = this.scrollerGroup;
            if(id==0){
                return;
            }
            if(this.isOnce){
                this.id = id;
                this.isEnabled = true;

                if(initial){
                    for(let i=0;i<this.staticIndexs.length;i++){
                        let index = this.staticIndexs[i];
                        let s = o.items[index] as JTScroller;
                        s.kill(true);
                    }
                    this.changeDefaultDataList();
                    for(let i=0;i<this.combineIndexs.length;i++){
                        let index = this.combineIndexs[i];
                        let s = o.items[index] as JTScroller;
                        if(this.mainIndex==index){
                            for(let i=0;i<s.items.length;i++){
                                let r = s.items[i] as BaseSpinSlotView;
                                r.setupUrlPrefix(this.urlPrefix);
                                if(!r.isVisibleRender()){
                                    r.data = (this.scrollerGroup.dataProvider as JTArrayCollection).getRandomIDbyCol(i);
                                }
                                r.reset();
                                r.gotoAndStop(0);
                            }
                            this.resetRenders(s);
                        }else{
                            s.kill(true);
                            s.active = false;
                            for(let i=0;i<s.items.length;i++){
                                let r = s.items[i] as BaseSpinSlotView;
                                r.active = false;
                            }
                        }
                    }
                }else{
                    cc.tween(this).delay(this.elementChangeDelay)
                    .call(()=>{
                        for(let i=0;i<this.staticIndexs.length;i++){
                            let index = this.staticIndexs[i];
                            let s = o.items[index] as JTScroller;
                            s.kill(true);
                        }
                    }).start();
                    if(this.elementChangeCall){
                        this.elementChangeCall.apply(this.caller);
                    }
                    for(let i=0;i<this.combineIndexs.length;i++){
                        let index = this.combineIndexs[i];
                        let s = o.items[index] as JTScroller;
                        if(this.mainIndex==index){
                            this.changeDefaultDataList();
                            for(let i=0;i<s.items.length;i++){
                                let r = s.items[i] as BaseSpinSlotView;
                                r.setupUrlPrefix(this.urlPrefix);
                                s.refreshRenders(r);
                            }
                            s.changedTimes = 0;
                            s.time = s.time+this.additionTime;
                        }else{
                            s.kill(true);
                            s.active = false;
                        }
                    }
                }
            }else if(this.id!=id){
                this.id = id;
                if(this.elementChangeCall){
                    this.elementChangeCall.apply(this.caller);
                }
                 cc.tween(this).delay(this.elementChangeDelay)
                 .call(()=>{
                    this.refreshStaticRenders();
                }).start();
            }

        }
}



