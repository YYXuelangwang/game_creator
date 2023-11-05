const { ccclass, property } = cc._decorator;

@ccclass
export default class ESlider extends cc.Component {

    @property(cc.Sprite)
    bgSprite:cc.Sprite = null;

    @property(cc.Sprite)
    slideSprite:cc.Sprite = null;

    @property(cc.Label)
    nameLabel:cc.Label = null;

    @property(cc.Slider)
    slider: cc.Slider = null;

    @property(cc.EditBox)
    editBox:cc.EditBox = null;

    @property({visible:false})
    private bgColor:cc.Color = new cc.Color(40, 40, 40, 255);

    @property({visible:false})
    private sideColor:cc.Color = new cc.Color(0, 130, 180, 255);
 

    @property(cc.Color)
    set menuItemBgColor(v) {
        this.bgColor = v;
        this.onNormal()
    }
    get menuItemBgColor() {
        return this.bgColor;
    }

    @property(cc.Color)
    set MenuItemSideColor(v) {
        this.sideColor = v;
        this.onNormal();
    }
    get MenuItemSideColor() {
        return this.sideColor;
    }

    private pressStrenth = 0.75;
    public callback: (progress:number)=>void;
    public eventData: any;
    private _scale = 1;


    init(name: string, cb?: (progress:number)=>void, scale?:number) {
        this.node.name = name;
        this.nameLabel.string = name;
        cb && (this.callback = cb);
        scale && (this._scale = scale);
    }

    onEnable() {
        this.onNormal();
        if (cc.sys.platform = cc.sys.DESKTOP_BROWSER) {
            this.node.on(cc.Node.EventType.MOUSE_ENTER, this.onPress, this);
            this.node.on(cc.Node.EventType.MOUSE_LEAVE, this.onNormal, this);
        }
    }
    onDisable() {
        if (cc.sys.platform = cc.sys.DESKTOP_BROWSER) {
            this.node.off(cc.Node.EventType.MOUSE_ENTER, this.onPress, this);
            this.node.off(cc.Node.EventType.MOUSE_LEAVE, this.onNormal, this);
        }
    }

    setProgress(v: number) {
        let value = cc.clamp(Number(v) || 0, 0, this._scale);
        this.slider.progress = value/this._scale;
        this.editBox.string = "" + value;
    }

    onSliderCallback(slider: cc.Slider, customEventData: string) {
        const progress  = slider.progress * this._scale;
        this.editBox.string = "" +progress;
        this.callback&&this.callback(progress);
    }

    onEditDidEnded(editbox: cc.EditBox, customEventData) {
        const value = cc.clamp(Number(editbox.string) || 0, 0, this._scale);
        this.callback&&this.callback(value);
        this.slider.progress = value/this._scale;
    }

    changeColor(press) {
        this.bgSprite.node.color = cc.Color.set(null, this.bgColor.r * press, this.bgColor.g * press, this.bgColor.b * press);
    }
    onPress() {
        this.changeColor(this.pressStrenth);
    }
    onNormal() {
        this.changeColor(1);
    }
    onClick() {
        if (!this.callback) return;
        this.callback(this.slider.progress);
    }

    
}