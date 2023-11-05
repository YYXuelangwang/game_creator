import EBase from "./EBase";

const { ccclass, property } = cc._decorator;

@ccclass('EToggle')
export default class EToggle extends EBase {

    @property(cc.Toggle)
    toggle:cc.Toggle = null;


    public callback: (bool:boolean)=>void;
    public eventData: any;


    init(name: string,cb?: (bool:boolean)=>void) {
        this.node.name = name;
        this.NameLable.string = name;
        cb && (this.callback = cb);
    }

    onToggleCallback(toggle: cc.Toggle){
        this.callback && this.callback(toggle.isChecked);
    }

}