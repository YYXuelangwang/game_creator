import EBase from "./EBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EList extends EBase {

    @property(cc.Node)
    TouchArea:cc.Node = null;

    @property(cc.Label)
    ListLabel: cc.Label = null;

    public callback: () => string | void | number;
    public eventData: any;


    init(name: string, cb?: () => string | void | number) {
        this.node.name = name;
        this.NameLable.string = name;
        cb && (this.callback = cb);
    }

    onEnable(): void {
        super.onEnable();
        this.TouchArea.on(cc.Node.EventType.TOUCH_END, this.onClick, this);
    }

    onDisable(): void {
        super.onDisable();
        this.TouchArea.off(cc.Node.EventType.TOUCH_END, this.onClick, this);
    }

    onClick() {
        if (!this.callback) return;
        const result = this.callback();
        if (result) {
            this.ListLabel.string = String(result) || this.ListLabel.string;
        }
    }
}