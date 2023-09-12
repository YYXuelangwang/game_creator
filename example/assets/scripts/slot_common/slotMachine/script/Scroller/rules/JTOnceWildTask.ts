import { JTWildTask } from "./JTWildTask";
import JTScroller from "../com/JTScroller";
import JTGLoader from "../renders/JTGLoader";

/*
* name;只执行一次的百搭扩展
*/
export default class JTOnceWildTask extends JTWildTask
{
    constructor()
    {
        super();
    }

    public showScroller(s:JTScroller):void
    {
               s.active = true;
               let skinLoader:JTGLoader = this._skinLoaders[s.index] as JTGLoader;
               skinLoader.url = null;
    }
}