import JTBeginRunning from "../../../com/plugins/procedure/JTBeginRunning";

/*
* name;
*/
export default class JTEmptyBeginScrolling extends JTBeginRunning
{
    constructor()
    {
        super();
    }

    public beginRunning():void
    {
        this.scroller.adjustSkinRenders(true);
        this.complete();
    }
}