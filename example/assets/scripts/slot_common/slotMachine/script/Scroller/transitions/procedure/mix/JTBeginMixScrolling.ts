
import JTScroller from "../../../com/JTScroller";
import JTBeginRunning from "../../../com/plugins/procedure/JTBeginRunning";
import JTScrollingMixPipeline from "./JTScrollingMixPipeline";

/*
* name;
*/
export default class JTBeginMixScrolling extends JTBeginRunning
{

    public beginRunning(): void {
            this.complete();
    }
}