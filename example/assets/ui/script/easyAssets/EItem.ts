import EBase from "./EBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EItem extends EBase {

    public callback: () => string | void | number;
    public eventData: any;

    init(name: string, cb?: () => string | void | number) {
        this.node.name = name;
        this.NameLable.string = name;
        cb && (this.callback = cb);
    }

    onEnable(): void {
        super.onEnable();
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this);
    }

    onDisable(): void {
        super.onDisable();
        this.node.off(cc.Node.EventType.TOUCH_END, this.onClick, this);
    }

    onClick() {
        if (!this.callback) return;
        const result = this.callback();
        if (result) {
            this.NameLable.string = String(result) || this.NameLable.string;
        }
    }
}