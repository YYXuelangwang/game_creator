const { ccclass, property } = cc._decorator;

@ccclass
export default class EBase extends cc.Component {

    @property(cc.Sprite)
    BgSprite: cc.Sprite = null;

    @property(cc.Sprite)
    SideSprite: cc.Sprite = null;

    @property(cc.Label)
    NameLable: cc.Label = null;

    @property(cc.Color)
    set MenuItemBgColor(v) {
        this.BgColor = v;
        this.onNormal();
    }
    get MenuItemBgColor() {
        return this.BgColor;
    }

    @property(cc.Color)
    set MenuItemSideColor(v) {
        this.SideColor = v;
        this.onNormal();
    }
    get MenuItemSideColor() {
        return this.SideColor;
    }

    @property({ visible: false })
    protected BgColor: cc.Color = new cc.Color(40, 40, 40, 255);

    @property({ visible: false })
    private SideColor: cc.Color = new cc.Color(0, 130, 180, 255);

    private pressStrenth = 0.75;

    onEnable() {
        this.onNormal();
        if(cc.sys.platform=cc.sys.DESKTOP_BROWSER){
            this.node.on(cc.Node.EventType.MOUSE_ENTER, this.onPress, this);
            this.node.on(cc.Node.EventType.MOUSE_LEAVE, this.onNormal, this);
        }
    }
    onDisable() {
        if(cc.sys.platform=cc.sys.DESKTOP_BROWSER){
            this.node.off(cc.Node.EventType.MOUSE_ENTER, this.onPress, this);
            this.node.off(cc.Node.EventType.MOUSE_LEAVE, this.onNormal, this);
        }
    }

    changeColor(press){
        this.BgSprite.node.color = cc.Color.set(null,this.BgColor.r * press, this.BgColor.g * press, this.BgColor.b * press);
    }
    onPress(){
        this.changeColor(this.pressStrenth);
    }
    onNormal(){
        this.changeColor(1);
    }
}