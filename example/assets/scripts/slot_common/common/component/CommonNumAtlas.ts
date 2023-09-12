
const { ccclass, property } = cc._decorator;


@ccclass("AtlsElmentConfig")
export class AtlsElmentConfig {

    @property({ type: cc.SpriteFrame, tooltip: `拖动数字图集里的单个元素进来` })
    elmentSpriteFrame: cc.SpriteFrame = null;

    @property({ tooltip: `自己设置对应的数字或字符显示元素图` })
    id: string = "";
}
/**
 * 该脚本不在扩展维护，在MG类型的项目不要再使用，PG项目中谨慎使用。
 */
@ccclass
export default class CommonNumAtlasBase extends cc.Component {

    @property
    private _dataStr = "";
    @property({ type: cc.String })
    /** 输入要显示的数 */
    public set string(value: string) {
        this._dataStr = value;
        this.resetPicFromNum();
    }
    public get string() {
        return this._dataStr;
    }

    @property
    private _anchorY = 1;
    @property({ tooltip: "节点 Y 轴锚点位置" })
    set anchorY(value: number) {
        this._anchorY = value;
        this.resetPicFromNum();
    }

    get anchorY() {
        return this._anchorY;
    }

    @property([AtlsElmentConfig])
    AtlsElment: AtlsElmentConfig[] = [];

    @property
    private _spaceX = 10;

    @property({ tooltip: "数字之间的间距,默认10" })
    set spaceX(value: number) {
        this._spaceX = value;
        this.resetPicFromNum();
    }

    get spaceX() {
        return this._spaceX;
    }

    @property
    private _showStyle: number = 1;
    @property
    private _offScale: number = 1;
    @property
    private _offPosY: number = 0;
    @property
    private _offPosX: number = 0;

    @property({ tooltip: "中奖线金额显示样式，默认1" })
    set showStyle(value: number) {
        this._showStyle = value;
        if (this._showStyle == 2) {
            this.resetPicFromNum();
        }
    }

    get showStyle() {
        return this._showStyle;
    }

    @property({ tooltip: "放大缩小的倍数,默认1" })
    set offScale(value: number) {
        this._offScale = value;
        this.resetPicFromNum();
    }

    get offScale() {
        return this._offScale;
    }

    @property({ tooltip: "X位置增加减少值,默认0" })
    set offPosX(value: number) {
        this._offPosX = value;
        this.resetPicFromNum();
    }

    get offPosX() {
        return this._offPosX;
    }

    @property({ tooltip: "Y位置增加减少值,默认0" })
    set offPosY(value: number) {
        this._offPosY = value;
        this.resetPicFromNum();
    }

    get offPosY() {
        return this._offPosY;
    }

    @property
    private _shrink = false;
    @property({ type: cc.Boolean, tooltip: "是否使用自适应" })
    set shrink(value: boolean) {
        this._shrink = value;
        // 如使用自适应，则是根节点为固定宽度，缩放内部私有节点，达到自适应，因而两者设置互斥
        value && (this._syncRootWidth = false);
        this.resetPicLabelWidth();
        this.resetRootNodeWidth();
    }

    get shrink() {
        return this._shrink;
    }

    @property
    private _maxWidth = 0;
    @property({ type: cc.Float, tooltip: "自适应的节点最大宽度(shrink为true,将生效)" })
    set maxWidth(value: number) {
        this._maxWidth = value;
        this.resetPicLabelWidth();
        this.resetRootNodeWidth();
    }

    get maxWidth() {
        return this._maxWidth;
    }

    @property
    private _syncRootWidth = true;
    @property({ type: cc.Boolean, tooltip: "是否在设置string时同步根节点宽度(若设置了自适应，则节点宽度不受私有节点影响)", visible() { return !this._shrink } })
    set syncRootWidth(value: boolean) {
        this._syncRootWidth = value;
        this.resetRootNodeWidth();
    }

    get syncRootWidth() {
        return this._syncRootWidth;
    }

    @property
    private _useOriginalSize: boolean = false;
    @property({ type: cc.Boolean, tooltip: "是否使用图片剪裁前的原始大小" })
    set useOriginalSize(value: boolean) {
        this._useOriginalSize = value;
        this.resetPicFromNum();
    }

    get useOriginalSize() {
        return this._useOriginalSize;
    }


    protected pool: cc.Node[] = [];

    protected containerNode: cc.PrivateNode = null;

    protected _sumChildrenWidth = 0;

    get sumChildrenWidth() {
        return this._sumChildrenWidth;
    }

    onLoad() {
        this.pool = [];
        this.string = this._dataStr;
    }

    protected resetPicFromNum() {
        let dataStr = this._dataStr;

        /**创建一个容器节点，中心点靠左*/
        if (!this.containerNode) {
            let node = this.node.getChildByName("_Private_ContainerNode");
            if (node) {
                this.containerNode = node;
            } else {
                this.containerNode = new cc.PrivateNode("_Private_ContainerNode");
                this.node.addChild(this.containerNode);
                this.containerNode.anchorX = 0;
            }
        }


        for (let i = 0; i < this.containerNode.childrenCount; i++) {
            this.pool.push(this.containerNode[i]);
        }
        this.containerNode.removeAllChildren();

        /**用来计算这个容器最后的总宽度（所有子元素的宽度总和）*/
        this._sumChildrenWidth = 0;


        for (let index = 0; index < dataStr.length; index++) {
            let id = dataStr[index];
            let c = this.getPicElementConfig(id);
            let pic = c ? c.elmentSpriteFrame : null;

            /**在容器里再创建子节点，中心点靠左*/
            let childNode = this.pool.pop();
            if (!childNode) {
                childNode = new cc.Node();
                childNode.addComponent(cc.Sprite);
            }
            childNode.anchorX = 0;

            if (id == "," || id == ".") {
                childNode.anchorY = this.anchorY;
            } else {
                childNode.anchorY = 0.5;
            }
            this.containerNode.addChild(childNode);
            this.containerNode.children[index].getComponent(cc.Sprite).spriteFrame = pic;

            if (index == 0) {
                this.containerNode.children[index].x = 0;
                if (pic) {
                    if (!this._useOriginalSize)
                        this._sumChildrenWidth += pic.getRect().width;
                    else
                        this._sumChildrenWidth += pic.getOriginalSize().width;
                }
                else
                    this._sumChildrenWidth += this.containerNode.children[index].width;
            } else {
                var preSprite = this.containerNode.children[index - 1].getComponent(cc.Sprite);
                var preNodeWidth = 0;
                if (preSprite && preSprite.spriteFrame) {
                    if (!this._useOriginalSize)
                        preNodeWidth = preSprite.spriteFrame.getRect().width;
                    else
                        preNodeWidth = preSprite.spriteFrame.getOriginalSize().width;
                }
                else
                    preNodeWidth = this.containerNode.children[index - 1].width;
                this.containerNode.children[index].x = this.containerNode.children[index - 1].x + this.spaceX + preNodeWidth;
                if (pic) {
                    if (!this._useOriginalSize)
                        this._sumChildrenWidth += pic.getRect().width + this.spaceX;
                    else
                        this._sumChildrenWidth += pic.getOriginalSize().width + this.spaceX;
                }
                else {
                    if (this.containerNode.children[index].width > 0)
                        this._sumChildrenWidth += this.containerNode.children[index].width + this.spaceX;
                }
            }
        }
        this.containerNode.width = this._sumChildrenWidth;

        this.node.scale = this.offScale;
        if (this.showStyle == 2) {
            this.node.x = this.offPosX;
            this.node.y = this.offPosY;
        } else {
            this.node.x += this.offPosX;
            this.node.y += this.offPosY;
        }
        this.containerNode.x = 0;

        // TODO 待修正正确的anchorX值 对应的偏移值
        if (this.node.anchorX === 0.5) {
            this.containerNode.x = -(this.containerNode.width / 2);
        } else {
            this.containerNode.x = -(this.containerNode.width * this.offScale / 2);
        }

        // 文字自适应
        this.resetPicLabelWidth();
        this.resetRootNodeWidth();
    }

    private getPicElementConfig(str: string): AtlsElmentConfig {
        for (let c of this.AtlsElment) {
            if (str == c.id) {
                return c;
            }
        }
    }

    /** 处理自适应内部"图集"字宽度 */
    private resetPicLabelWidth() {
        if (!this.shrink) {
            this.containerNode.scale = 1
            return;
        }
        this.containerNode.scale = this._sumChildrenWidth <= this.maxWidth ? 1 : this.maxWidth / this._sumChildrenWidth;
        this.containerNode.x = - (this.containerNode.width * this.containerNode.scale) / 2;
    }

    /** 同步根节点宽度
     *      - 若使用根节点宽度，则根节点宽度会随子节点改变
     *      - 若不适用，则使用最大宽度
     */
    private resetRootNodeWidth() {
        if (!this._syncRootWidth) {
            this.node.width = this._sumChildrenWidth <= this.maxWidth ? this._sumChildrenWidth : this.maxWidth;
        } else {
            this.node.width = this._sumChildrenWidth * this.offScale;
        }
    }

    protected onDestroy(): void {
        for (let e of this.pool) {
            e && e.destroy();
        }
    }
}
