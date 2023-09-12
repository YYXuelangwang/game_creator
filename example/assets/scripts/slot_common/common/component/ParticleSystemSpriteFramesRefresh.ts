

const { ccclass, property } = cc._decorator;
/**
 * 实现功能：粒子节点，动态替换图集中精灵贴图
 */
@ccclass
export default class ParticleSystemSpriteFramesRefresh extends cc.Component {


    @property({ type: cc.SpriteAtlas, tooltip: "图集资源" })
    public atlas: cc.SpriteAtlas = null;

    @property({ type: cc.Integer, tooltip: "每秒替换粒子贴图多少次" })
    private aniFps: number = 15;

    private ps: cc.ParticleSystem = null;

    private index = 0;
    private count = 0;
    /**图集序列帧集合 */
    private spriteArray: cc.SpriteFrame[] = [];
    protected onLoad(): void {
        if (!this.ps)
            this.ps = this.node.getComponent(cc.ParticleSystem);
        this.spriteArray = this.atlas.getSpriteFrames();
        this.count = this.spriteArray.length;
        this.schedule(this.refreshSprite, 1 / this.aniFps, cc.macro.REPEAT_FOREVER);
    }

    private refreshSprite() {
        if (this.index >= this.count)
            this.index = 0;

        this.ps.spriteFrame = this.spriteArray[this.index];
        this.index++;
    }
}
