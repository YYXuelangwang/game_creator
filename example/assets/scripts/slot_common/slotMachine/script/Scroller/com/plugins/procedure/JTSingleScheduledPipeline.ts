import JTItemRender from "../../base/JTItemRender";
import JTScheduledPipeline from "../JTScheduledPipeline";

/*
* name;
*/
export default class JTSingleScheduledPipeline extends JTScheduledPipeline
{
    setRenderBeforeComplete(render: JTItemRender): boolean {
        throw new Error("Method not implemented.");
    }
    resetRenderPoints() {
        throw new Error("Method not implemented.");
    }
    lineTimeComplete(): void {
        throw new Error("Method not implemented.");
    }
    
    constructor()
    {
        super();
    }

}