

const { ccclass, property } = cc._decorator;
/**
 * 实现功能：多重（也可以只有一个）粒子节点，动态替换图集中精灵贴图，并且随机起始贴图。
 * 使用方式：将组件挂载在粒子节点的直接父节点上
 */
@ccclass
export default class MultiPSRandomRefreshTool extends cc.Component {


    @property({ type: cc.SpriteAtlas, tooltip: "图集资源" })
    private atlas: cc.SpriteAtlas = null;
    @property({ type: cc.Integer, tooltip: "每秒替换粒子贴图多少次" })
    private aniFps: number = 15;
    /**ParticleSystem节点数量 */
    @property({ tooltip: "ParticleSystem节点总数量" })
    private psNodeNum: number = 5;

    @property({ tooltip: "单粒子节点每秒发射粒子数目" })
    private emissionRate: number = 10;

    /**粒子系统贴图当前下标集合 */
    private psIndexArray: number[] = [];
    /**粒子发射器节点集合 */
    private psArray: cc.ParticleSystem[] = [];
    /**图集序列总帧数 */
    private count = 0;
    /**图集序列帧集合 */
    private spriteArray: cc.SpriteFrame[] = [];
    protected onLoad(): void {
        if (!this.atlas) return;

        this.psArray = this.node.getComponentsInChildren(cc.ParticleSystem);
        this.spriteArray = this.atlas.getSpriteFrames();
        this.count = this.spriteArray.length;

        let startIdx = Math.round(Math.random() * this.count);
        this.psIndexArray.push(startIdx)
        while (this.psArray.length < this.psNodeNum) {
            // for (let index = 0; index < this.psNodeNum - 1; index++) {
            let cln = cc.instantiate(this.psArray[0].node);
            cln.parent = this.psArray[0].node.parent;
            let startIdx = Math.round(Math.random() * this.count);
            this.psIndexArray.push(startIdx);
            this.psArray.push(cln.getComponent(cc.ParticleSystem));
        }
    }

    protected onEnable(): void {
        this.schedule(this.refreshSprite, 1 / this.aniFps, cc.macro.REPEAT_FOREVER);
    }
    protected onDisable(): void {
        this.unschedule(this.refreshSprite);
    }
    private refreshSprite() {
        for (let index = 0; index < this.psArray.length; index++) {
            const element = this.psArray[index];
            if (this.psIndexArray[index] >= this.count)
                this.psIndexArray[index] = 0;
            element.spriteFrame = this.spriteArray[this.psIndexArray[index]];
            element.emissionRate = this.emissionRate;
            element.autoRemoveOnFinish = false;
            this.psIndexArray[index]++;
        }
    }
}
