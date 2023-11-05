import EGroup from "./EGroup";

const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class EMenu extends cc.Component {
    @property(cc.Size)
    set MenuItemSize(v) {
        this._size = v;
    }
    get MenuItemSize() {
        return this._size;
    }
    @property(cc.Prefab)
    GroupPrefab: cc.Prefab = null;

    @property({ visible: false })
    private _size: cc.Size = new cc.Size(200, 30);
    private _groups = new Map<string,cc.Node>;
    private _isVisible: boolean = true;

    /**
     * @Description: add new group to menu
     * @param {string} name name of menu, could be used to delete group
     * @return {*}
     */
    addGroup(name?:string):EGroup{
        const groupNode = cc.instantiate(this.GroupPrefab);
        const easyGroup  = groupNode.getComponent(EGroup);
        if(name){
            easyGroup.groupName = name
            this._groups.set(name,groupNode);
        }
        easyGroup.parentComp  = this;

        easyGroup.size  = this._size;
        groupNode.parent = this.node;
        return easyGroup;
    };
    /**
     * @Description: get group by name
     * @param {string} name
     * @return {*}
     */
    getGroup(name:string){
        return this._groups.get(name)||null;
    };

    /**
     * @Description: delete group by name
     * @param {string} name
     * @return {*}
     */
    deletEGroup(name:string){
        const group = this.getGroup(name);
        if(group){
            this._groups.delete(name);
            group.removeFromParent();
            group.destroy();
        }
    };

    resetSize(node) {
        node.setContentSize(this.MenuItemSize);
    };
}