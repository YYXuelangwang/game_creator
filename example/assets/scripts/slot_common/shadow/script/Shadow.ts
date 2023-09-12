import NodePool from "./NodePool";

const { ccclass, property } = cc._decorator;

/**
 * 残影
 * @author zengyong
 */
@ccclass
export default class Shadow extends cc.Component {

    public fade: number = 5;
    public key: string = "";

    lateUpdate(dt) {
        this.node.opacity -= this.fade;
        if (this.node.opacity <= 10) {
            this.node.removeFromParent();
            NodePool.put(this.key, this.node);
        }
    }
}