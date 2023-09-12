import JTLineScrollerGroup from "./JTLineScrollerGroup";

/*
* channelScrollerGroup;带声音通道的滚轴组
*/
export default class JTChannelScrollerGroup extends JTLineScrollerGroup
{
    public channels:number[] = null;//cocos音效
    constructor()
    {
            super();
            this.channels = [];
    }

    /**
     * 
     * @param isTween 停止滚轴（包含了滚轴滚动、声音、线的展示）
     */
    public stopAll(isTween:boolean = false):void
    {
        this.stopChannels();
        super.stopAll(isTween);
    }

    /**
     * 停止正在播放的滚轴时间----该方法与addChannel结合使用
     */
    public stopChannels():void
    {
         if (this.channels.length > 0)
         {
                while(this.channels.length)
                {
                        let channel:number = this.channels.shift();
                        // channel && channel.stop();
                        //SoundManager.getInstance().StopEffectById(channel);//cocos音效
                        channel = null;
                }
         }
    }

    /**
     * 重写滚动完成
     * 滚动完成触发
     */ 
    public scrollingComplete():void
    {
             this._freeList.push(this._runnings.shift());
             if (this._runnings.length == 0)
             {
                    this.updateRenders();
                    //this.superScrollerComplete();
                    this._isRunning = false;
                    this._ruleTaskManager.clear();
                    if(this._isOnceOpenItems){
                        this._openItemIds = [];
                        this._isOpenItems = false;
                    }
                    this.stopChannels();
                    this._complete && this._complete.apply(this.caller, [this]);
                    this._freeList.length = 0;
                    this._isPending = false;
             }
    }

    /**
     * 
     * @param channel 添加声音 ---停止与stopChannels结合使用
     */
    public addChannel(channel:number):void//cocos音效
    {
        
         if (!channel) return;
         let index:number = this.channels.indexOf(channel);
         if (index == -1) this.channels.push(channel)
    }
}