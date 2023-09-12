import MathUtil from "./MathUtil";
import NodePool from "./NodePool";
import Shadow from "./Shadow";
import Timer from "./Timer";


const { ccclass, property } = cc._decorator;

/**
 * 残影效果
 * @author zengyong
 */
@ccclass
export default class ShadowFollow extends cc.Component {
    /**影子的容器 */
    @property(cc.Node)
    shadowContainer: cc.Node = null;

    /**需要使用残影的目标节点，用来跟随位置，若不设置，默认是挂载脚本的节点 */
    @property(cc.Node)
    targetNode: cc.Node = null;

    /**需要使用残影的sprite目标节点，用来渲染，若不设置，默认是挂载脚本的节点 */
    @property(cc.Node)
    spriteNode: cc.Node = null;

    /**产生残影的帧间隔 */
    @property
    interval: number = 5;

    /**残影消失速度 */
    @property
    fade: number = 8;

    @property
    key: string = "";

    private _x: number = 0;
    private _y: number = 0;

    private _count: number = 0;
    private _isOnTimer: boolean = false;

    onLoad() {
        if (!this.targetNode)
            this.targetNode = this.node;

        if (!this.spriteNode)
            this.spriteNode = this.node;

        this._x = this.targetNode.x;
        this._y = this.targetNode.y;
    }

    onDisable() {
        this.stopEffect();
    }

    lateUpdate(dt) {
        Timer.onTimer(dt);
    }

    public startEffect() {
        if (!this._isOnTimer) {
            this._isOnTimer = true;
            Timer.loop(this, this.onTimer);
        }
    }

    public stopEffect() {
        this._isOnTimer = false;
        this._count = 0;
        Timer.clear(this, this.onTimer);
    }

    private onTimer() {
        this._count++;
        if (this._count % this.interval == 0) {
            if (MathUtil.getDistance(cc.v2(this._x, this._y), cc.v2(this.targetNode.x, this.targetNode.y)) < 2)
                return;
            var node: cc.Node = NodePool.get(this.key);
            if (!node) {
                node = new cc.Node();
                node.addComponent(cc.Sprite);
                var shadow: Shadow = node.addComponent(Shadow);
                shadow.fade = this.fade;
                shadow.key = this.key;
            }

            node.getComponent(cc.Sprite).spriteFrame = this.spriteNode.getComponent(cc.Sprite).spriteFrame;
            node.scaleX = this.spriteNode.scaleX;
            node.scaleY = this.spriteNode.scaleY;
            this._x = node.x = this.targetNode.x;
            this._y = node.y = this.targetNode.y;
            node.opacity = 255;
            this.shadowContainer.addChild(node);
            this.node.setSiblingIndex(50);
        }
    }
}
