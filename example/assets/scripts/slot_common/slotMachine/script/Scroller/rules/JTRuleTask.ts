import JTTask from "../com/tasks/JTTask";
import JTScrollerGroup from "../com/JTScrollerGroup";
import JTGLoader from "../renders/JTGLoader";
import { JTPipelineTemplate } from "../com/plugins/procedure/JTPipelineTemplate";
import JTChannelPipeline from "../com/plugins/JTChannelPipeline";
import JTLineScrollerGroup from "../extensions/JTLineScrollerGroup";

/*
* name;
*/
export default class JTRuleTask extends JTTask
{
    protected _isLock:boolean = false;

    protected _time:number = 0;
    protected _id:any = null;
    protected _speed:any = null;
    protected _condition:any = null;
    protected _endCall:Function = null;
    protected _priority:number = 0;
    protected _skinURL:string = null;
    protected _isRunning:boolean = false;
    protected _scrollerGroup:JTLineScrollerGroup = null;
    protected _skinLoaders:JTGLoader[] = null;
    constructor()
    {
        super();
        this._skinLoaders = [];
    }

    public registerComplete():void{

    }

     public runningTask():boolean
     {
        this._isRunning = false;
        return this._isRunning;
     }

     public get skinURL():string
     {
         return this._skinURL;
     }

     public isContainId(itemIndex:number, items:any[], id:number = null,ignoreIndexs:number[]=[]):boolean
     {
                let isContain:boolean = true;
                if (id == null) id = this._id;
                let channelPipeline:JTChannelPipeline = this._scrollerGroup.channelPipeline;
                let templete:JTPipelineTemplate = channelPipeline.getTemplate(itemIndex);
                if (templete.dataListType == JTScrollerGroup.USE_CONVERT_MROE_LIST)
                {
                         let index:number = items.indexOf(id,1);

                         if (index == -1 || index==0 || index == items.length - 1) 
                         {
                             isContain = false;
                         }
                         if(isContain&&ignoreIndexs.indexOf(index-1)>-1){
                            isContain = false;
                         }
                }
                else if (templete.dataListType == JTScrollerGroup.USE_CONVERT_TO_LIST)
                {
                        let index:number = items.indexOf(id);

                        if (index == -1){
                            isContain = false;
                        }
                        if(isContain&&ignoreIndexs.indexOf(index)>-1){
                            isContain = false;
                         }

                }
                return isContain;
     }

     public containIdCount(itemIndex:number, items:any[], id:any = null,ignoreIndexs:number[]=[]):number{
        let count = 0;
        if (id == null) id = this._id;
        let channelPipeline:JTChannelPipeline = this._scrollerGroup.channelPipeline;
        let templete:JTPipelineTemplate = channelPipeline.getTemplate(itemIndex);

        if (templete.dataListType == JTScrollerGroup.USE_CONVERT_MROE_LIST)
        {
               for(let i=1;i<items.length-1;i++){
                   if(ignoreIndexs.length>0&&ignoreIndexs.indexOf(i-1)>-1){
                       continue;
                   }
                   if(id instanceof Array){
                      if(id.includes(items[i])){
                         count++;
                      }
                   }else if(items[i]==id){
                       count++;
                   }
               }
        }
        else if (templete.dataListType == JTScrollerGroup.USE_CONVERT_TO_LIST)
        {
            for(let i=0;i<items.length;i++){
                if(ignoreIndexs.length>0&&ignoreIndexs.indexOf(i)>-1){
                    continue;
                }
                if(id instanceof Array){
                    if(id.includes(items[i])){
                       count++;
                    }
                 }else if(items[i]==id){
                     count++;
                 }
            }
        }
        return count;
     }

     public setupLock(value:boolean):void
     {
        this._isLock = value;
     }

     public set skinURL(value:string)
     {
         this._skinURL = value;
     }

     public get priority():number
     {
         return this._priority;
     }

     public get skinLoaders():JTGLoader[]
     {
         return this._skinLoaders;
     }

     public set skinLoaders(value:JTGLoader[])
     {
         this._skinLoaders = [];
     }
     
     public set priority(value:number)
     {
         this._priority = value;
     }

     public set condition(value:any)
     {
         this._condition = value;
     }

     public get condition():any
     {
         return this._condition;
     }

     public get time():number
     {
         return this._time;
     }

     public set time(value:number)
     {
         this._time = value;
     }

     public get isRunning():boolean
     {
         return this._isRunning;
     }

     public set isRunning(value:boolean)
     {
         this._isRunning = value;
     }

     public clearSkinLoaders():void
     {
         if (!this._skinLoaders || this._skinLoaders.length == 0) return;
         for (let i:number = 0; i < this._skinLoaders.length; i++)
         {
                let loader:JTGLoader = this._skinLoaders[i];
                loader.url = null;
         }
     }

    public get scrollerGroup():JTLineScrollerGroup
    {
        return this._scrollerGroup;
    }

    public set scrollerGroup(value:JTLineScrollerGroup)
    {
        this._scrollerGroup = value;
    }

     public get isLock():boolean
     {
         return this._isLock;
     }

     public set isLock(value:boolean)
     {
         this._isLock = value;
     }

     public get speed():any
     {
         return this._speed;
     }

     public set speed(value:any)
     {
         this._speed = value;
     }

     public get id():any
     {
         return this._id;
     }

     public set id(value:any)
     {
         this._id = value;
     }

     public get endCall():Function
     {
         return this._endCall;
     }

     public set endCall(value:Function)
     {
          this._endCall = value;
     }

     public clear():void
     {
         super.clear();
     }
}