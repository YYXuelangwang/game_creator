import EEdit from "./EEdit";
import EGraph from "./EGraph";
import EItem from "./EItem";
import EList from "./ELIst";
import EMenu from "./EMenu";
import ESlider from "./ESlider";
import EToggle from "./EToggle";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EGroup extends cc.Component {

    @property(cc.Node) arrow: cc.Node;
    @property(cc.Node) tittle: cc.Node;
    @property(cc.Prefab) menuItem: cc.Prefab;
    @property(cc.Prefab) sliderItem: cc.Prefab;
    @property(cc.Prefab) toggleItem: cc.Prefab;
    @property(cc.Prefab) groupItem: cc.Prefab;
    @property(cc.Prefab) editItem: cc.Prefab;
    @property(cc.Prefab) listItem: cc.Prefab;
    @property(cc.Prefab) graphItem: cc.Prefab;
    @property(cc.Label) nameLabel: cc.Label;

    private _size: cc.Size = new cc.Size(200, 30);
    private _item: EItem = null;
    private _isVisible: boolean = true;
    private _groupName = ""
    public parentComp: EMenu;
    private _time = 0;

    set size(v) {
        this._size = v;
        this.setMenuNode();
    }
    get size() {
        return this._size;
    }

    set groupName(v) {
        this._groupName = v;
        this.nameLabel.string = v;
    }

    getParent() {
        return this.parentComp as EMenu;
    }

    onEnable() {
        this.tittle.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        this.tittle.on(cc.Node.EventType.TOUCH_END, this.changeVisible, this);
        this.tittle.on(cc.Node.EventType.TOUCH_MOVE, this.dragPos, this);
    }
    onDisable() {
        this.tittle.off(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        this.tittle.on(cc.Node.EventType.TOUCH_MOVE, this.dragPos, this);
        this.tittle.off(cc.Node.EventType.TOUCH_END, this.changeVisible, this);
    }
    touchStart() {
        this._time = cc.director.getTotalTime();
    }

    dragPos(event: cc.Event.EventTouch) {
        const delay = cc.director.getTotalTime() - this._time;
        if (delay < 90) return;
        const parent = this.node.parent;
        const touch = event.touch;
        const pos = touch.getLocation()
        const pt = parent.parent.convertToNodeSpaceAR(pos);
        parent.setPosition(pt);
        // parent.setWorldPosition(pos.x, pos.y, 0);
    }

    /**
     * @Description: add new group comp
     * @param {string} name
     * @return {*}
     */
    addGroup(name: string): EGroup {
        const item = cc.instantiate(this.groupItem);
        const easyGroup = item.getComponent(EGroup);
        easyGroup.size = this.size
        item.parent = this.node;
        if (name) {
            easyGroup.groupName = name
        }
        easyGroup.parentComp = this.getParent();
        return easyGroup;
    }

        /**
     * @Description: add new slider comp
     * @param {string} name default name for slider
     * @param {function} cb callback
     * @param {number} value
     * @param {*} scale
     * @return {*}
     */
    addSlider(name: string, cb?: (progress: number) => void, value?: number, scale?: number, tempSlider?:ESlider): EGroup {
        const item = cc.instantiate(this.sliderItem);
        item.height = this._size.height;
        item.width = this._size.width;
        item.parent = this.node;
        const sliderItem = item.getComponent(ESlider);
        sliderItem.slider.progress = value;
        sliderItem.editBox.string = "" + value;
        sliderItem && sliderItem.init(name, cb, scale);
        tempSlider && (tempSlider = sliderItem);
        return this;
    }
    /**
     * @Description: add new editbox comp
     * @param {string} name name of the comp
     * @param {string} editbox default editbox's string
     * @param {function} cb edit callback
     * @return {*}
     */
    addEdit(name: string, editbox: string | number, cb?: (input: string) => void): EGroup {
        const item = cc.instantiate(this.editItem);
        item.height = this._size.height;
        item.width = this._size.width;
        item.parent = this.node;
        const editItem = item.getComponent(EEdit);
        editItem && editItem.init(name, editbox, cb);
        return this;
    }

    /**
     * @Description: add new item comp, could be use for btn or string
     * @param {string} name name of graph comp
     * @param {function} cb call back for graph click event
     * @return {*} 
     */
        addGraph(name: string, cb?: () => string | void | number,limit=60,points= 10): EGroup{
        const item = cc.instantiate(this.graphItem);
        item.height = this._size.height;
        item.width = this._size.width;
        item.parent = this.node;
        const graphItem = item.getComponent(EGraph);
        graphItem && graphItem.init(name, cb,limit,points);
        return this;
    }
    /**
     * @Description: add new item comp, could be use for btn or string
     * @param {string} name name of item comp
     * @param {function} cb call back for item click event
     * @return {*} 
     */
    addItem(name: string, cb?: () => string | void | number): EGroup  {
        const item = cc.instantiate(this.menuItem);
        item.height = this._size.height;
        item.width = this._size.width;
        item.parent = this.node;
        const menuItem = item.getComponent(EItem);
        menuItem && menuItem.init(name, cb);
        return this;
    }

        /**
   * @Description: 添加list
   * @param {string} name list组件名字
   * @param {function} cb 是否需要回调 可以是方法/string/number
   * @return {*} 
   */
    addList(name: string, cb?: () => string | void | number): EGroup {
        const item = cc.instantiate(this.listItem);
        item.width = this._size.width;
        item.parent = this.node;
        const listItem = item.getComponent(EList);
        listItem && listItem.init(name, cb);
        return this;
    }
    /**
     * @Description: add toggle comp
     * @param {string} name name of toggle comp
     * @param {function} cb toggle callback
     * @param {*} checked toggle's default checked state
     * @return {*}
     */
    addToggle(name: string, cb?: (bool: boolean) => void, checked = true): EGroup {
        const item = cc.instantiate(this.toggleItem);
        item.height = this._size.height;
        item.width = this._size.width;
        item.parent = this.node;
        const toggleItem = item.getComponent(EToggle);
        toggleItem.toggle.isChecked = checked;
        toggleItem && toggleItem.init(name, cb);
        return this;
    }


    setMenuNode() {
        this.resetSize(this.node);
        const children = this.node.children;
        if (children.length > 0) {
            children.forEach((c) => {
                this.resetSize(c);
            })
        }
    }

    resetSize(node) {
        node && node.setContentSize(this._size);
    }
    resetItem(item: EItem) {
        if (this._item != item && this._item) this._item.onNormal();
        this._item = item;
    }
    changeVisible() {
        this._isVisible = !this._isVisible;
        const children = this.node.children;
        // this.arrow.rotation = cc.Quat.fromAngleZ(new cc.Quat(), (this._isVisible ? -90 : 0));
        for (var i = 1; i < children.length; i++) {
            children[i].active = this._isVisible;
        }
    }
}