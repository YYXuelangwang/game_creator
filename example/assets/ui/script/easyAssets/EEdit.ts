import EBase from "./EBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EEdit extends EBase {

    @property(cc.EditBox)
    editbox: cc.EditBox = null;

    public callback: (input:string)=>void;
    public eventData: any;

    init(name: string, editstring:any, cb?: (input:string)=>void) {
        this.node.name = name;
        this.NameLable.string = name;
        this.editbox.string  = editstring;
        cb && (this.callback = cb);
    }

    setProgress(v: number) {
        let value = cc.clamp(Number(v) || 0, 0, 1);
        this.editbox.string = "" + value;
    }
 
    onEditDidEnded(editbox: cc.EditBox, customEventData) {
        const value = editbox.string;
        this.callback&&this.callback(value);
    }

 

}