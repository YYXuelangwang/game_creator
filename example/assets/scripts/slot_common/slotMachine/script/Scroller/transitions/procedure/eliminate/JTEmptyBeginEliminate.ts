import JTBeginRunning from "../../../com/plugins/procedure/JTBeginRunning";

/*
* 消除类的开始，没有消除的表现，消除表现再JTRunning类实现
*/
export default class JTEmptyBeginEliminate extends JTBeginRunning
{
    constructor()
    {
        super();
    }

    public dataStandby():void{
        super.dataStandby();
        this.beginRunning();
    }

    public beginRunning():void
    {
        this.scroller.adjustSkinRenders(false);

        if(!this.isDataReady){
            return;
        }
        this.complete();
    }
}