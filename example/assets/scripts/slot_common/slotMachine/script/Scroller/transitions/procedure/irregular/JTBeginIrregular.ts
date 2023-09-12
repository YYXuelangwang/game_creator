

import JTItemRender from "../../../com/base/JTItemRender";
import JTBeginScrolling from "../scrolling/JTBeginScrolling";


export default class JTBeginIrregular extends JTBeginScrolling {

    public beginRunning(): void {
        let s = this._scroller;
        for (let i: number = 0; i < s.items.length; i++) {
            let r: JTItemRender = s.items[i] as JTItemRender;
            r.active = true;
        }
        this.beginStart();
    }

}
