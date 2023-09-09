import NodeUIConfig from "./NodeUIConfig";

const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class MController extends cc.Component {

    @property({
        type:cc.Boolean,
        tooltip:"编辑完后，手动勾选一下保存配置",
    })
    set saveConfig (value) {
        this.updateConfig();
        Editor.info("保存成功");
    }
    get saveConfig () {
        return this.m_saveConfig;
    }

    @property({
        type: cc.Enum({
            0:0,
            1:1,
            2:2,
            3:3,
            4:4,
            5:5,
            6:6,
            7:7,
            8:8,
        })
    })
    get stateIndex () {
        return this._stateIndex;
    };
    set stateIndex (value) {
        this._stateIndex != value && (this._stateIndex = value, this.updateLayout())
    }

    private m_saveConfig = false;
    private _stateIndex = 0;

    private updateLayout() {
        this.setChildrenProp(this.node);
    }

    private updateConfig() {
        this.readChildrenProp(this.node);
    }

    private readChildrenProp(cnode:cc.Node) {
        this.readNodeProp(cnode);
        if (cnode.children.length > 0) {
            for (let index = 0; index < cnode.children.length; index++) {
                const element = cnode.children[index];
                if (element.children.length > 0) {
                    this.readChildrenProp(element);
                }else{
                    this.readNodeProp(element);
                }
            }
        }
    }

    private readNodeProp (cnode:cc.Node) {
        var config = cnode.getComponent(NodeUIConfig);
        if (config) {
            var prop = {};
            for (var i in MController.inheritedAttrList) {
                var cop = cnode.getComponent(i);
                if ("cc.Node" == i) { cop = cnode }
                if (!cop) {continue}
                prop[i] = {};
                var pdic = MController.inheritedAttrList[i];
                for (var key in pdic) {
                    if (null != cop[key]) {
                        if ("spriteFrame" != key) {
                            if ("color" == key) {
                                if (cop[key].r != pdic[key].r || cop[key].g != pdic[key].g || cop[key].b != pdic[key].b) {
                                    prop[i][key] = {};
                                    prop[i][key].r = cop[key].r;
                                    prop[i][key].g = cop[key].g;
                                    prop[i][key].b = cop[key].b;
                                }
                            }else if ("offset" == key) {
                                if (cop[key].x != pdic[key].x || cop[key].y != pdic[key].y) {
                                    prop[i][key] = {};
                                    prop[i][key].x = cop[key].x;
                                    prop[i][key].y = cop[key].y;
                                }
                            }else if ("size" == key) {
                                if (cop[key].width != pdic[key].width || cop[key].height != pdic[key].height) {
                                    prop[i][key] = {};
                                    prop[i][key].width = cop[key].width;
                                    prop[i][key].height = cop[key].height;
                                }
                            }else if ("points" == key) {
                                prop[i][key] = [];
                                var plist = cop[key];
                                for (let p = 0; p < plist.length; p++) {
                                    const ele = plist[p];
                                    var h = {x:0,y:0};
                                    h.x = ele.x, h.y = ele.y;
                                    prop[i][key].push(h)
                                }
                            }else{
                                if (("width" == key || "height" == key) && !config.controlSize){
                                    continue;
                                }
                                if (cop[key] != pdic[key]) {prop[i][key] = cop[key];}
                            }
                        }else{
                            if (!config.controlSpriteFrame) {continue;}
                            var f = {};
                            //@ts-ignore
                            f.uuid = cop[key]._uuid, f.bundle = Editor.remote.assetdb.uuidToUrl(s[c]._uuid), f.bundle = f.bundle.replace("db://assets/", ""), f.bundle = f.bundle.substring(0, f.bundle.indexOf("/")), o[i][c] = f
                        }
                    }
                }
                

            }
            var ori = JSON.parse(config.ui_config);
            ori[this._stateIndex] = prop;
            config.ui_config = JSON.stringify(ori);
        }
    }

    private setChildrenProp(cnode:cc.Node) {
        var config = cnode.getComponent(NodeUIConfig);
        if (config) {
            var props = JSON.parse(config.ui_config);
            if (props[this._stateIndex]) {
                var prop = props[this._stateIndex];
                for (var s in MController.inheritedAttrList) {
                    var cop = cnode.getComponent(s);
                    if ("cc.Node" == s) {
                        cop = cnode
                        for (var key in MController.inheritedAttrList[s]) {
                            if ("color" != key) {
                                if ("active" == key && !config.controlActive) {
                                    continue;
                                }else if (("width" == key || "height" == key) && !config.controlSize) {
                                    continue;
                                }
                                var val = prop && null != prop[s] && null != prop[s][key] ? prop[s][key] : MController.inheritedAttrList[s][key];
                                cop[key] != val && (cop[key] = val);
                            }else{
                                var val = prop && null != prop[s] && null != prop[s][key] ? prop[s][key] : MController.inheritedAttrList[s][key];
                                cop[key].r == val.r && cop[key].g == val.g && cop[key].b == val.b || (cop[key] = cc.color(val.r, val.g, val.b));
                            }
                        }
                    }else if ("cc.Widget" != s) {
                        if (!cop) continue;
                        if (!prop) continue;
                        for (var key in MController.inheritedAttrList[s]) {
                            if ("spriteFrame" == key) {
                                if (!config.controlSpriteFrame) continue;
                                if (!prop[s] || !prop[s][key]) continue;
                                var uuid, pdic = prop[s][key];
                                //@ts-ignore
                                if (window.Editor) {
                                    uuid = "string" != typeof pdic ? pdic.uuid : pdic;
                                    if (this.isExistFileByUuid(uuid)){
                                        Editor.Ipc.sendToPanel("scene", "scene:set-property", {
                                            id:cop.uuid,
                                            path:"spriteFrame",
                                            type:"cc.SpriteFrame",
                                            value:{
                                                uuid:uuid
                                            },
                                            isSubProp: false
                                        })
                                    }
                                }else{
                                    this.changeSpriteFrame(cop, pdic);
                                }
                            }else if ("offset" == key) {
                                var val = prop && null != prop[s] && null != prop[s][key] ? prop[s][key] : MController.inheritedAttrList[s][key];
                                cop[key].x == val.x && cop[key].y == val.y || (cop[key] = cc.v2(val.x, val.y)); 
                            }else if ("size" == key) {
                                var val = prop && null != prop[s] && null != prop[s][key] ? prop[s][key] : MController.inheritedAttrList[s][key];
                                cop[key].width == val.width && cop[key].height == val.height || (cop[key] = cc.size(val.width, val.height));
                            }else if ("points" == key) {
                                if (!prop[s] || !prop[s][key]) continue;
                                var val = prop && null != prop[s] && null != prop[s][key] ? prop[s][key] : MController.inheritedAttrList[s][key];
                                var p = [];
                                for (let index = 0; index < val.length; index++) {
                                    const ele = val[index];
                                    p.push(cc.v2(ele.x, ele.y))
                                } 
                                cop[key] = p;
                            }else{
                                var val = prop && null != prop[s] && null != prop[s][key] ? prop[s][key] : MController.inheritedAttrList[s][key];
                                cop[key] != val && (cop[key] = val);
                            }

                            if ("cc.Layout" == key && cop.enabled) {
                                //@ts-ignore
                                if (!window.Editor) {
                                    cop.updateLayout();
                                }
                                this.resetLayoutChildPosition(cnode);
                            }
                        }
                    }else{
                        if (null != prop[s]) {
                            this.delaySetWidget(cnode, prop);
                        }
                    }
                }
            }
        }
        if (cnode.childrenCount > 0) {
            var children = cnode.children;
            children.forEach(v=>this.setChildrenProp(v));
        }
    }

    private delaySetWidget(cnode:cc.Node, config:any) {
        setTimeout(() => {
            var wg = cnode.getComponent(cc.Widget);
            var s = "cc.Widget";
            // wg.enabled = false;
            for (var key in MController.inheritedAttrList[s]) {
                var val = config && null != config[s] && null != config[s][key] ? config[s][key] : MController.inheritedAttrList[s][key];
                wg[key] != val && (wg[key] = val);               
            }
            //@ts-ignore
            !window.Editor && wg.enabled && wg.updateAlignment()
        }, 30);
    }

    private resetLayoutChildPosition(cnode:cc.Node) {
        var layout = cnode.getComponent(cc.Layout);
        if (layout.type == cc.Layout.Type.HORIZONTAL || layout.type == cc.Layout.Type.VERTICAL) {
            for (let index = 0; index < cnode.children.length; index++) {
                const element = cnode.children[index];
                layout.type == cc.Layout.Type.HORIZONTAL ? element.y = 0 : layout.type == cc.Layout.Type.VERTICAL && (element.x = 0) 
            }
        }
    }

    private changeSpriteFrame(sprite:cc.Sprite, config:any) {

    }

    private isExistFileByUuid(uuid:string) {
        var ret, path = Editor.remote.assetdb.uuidToFspath(uuid);
        if (!path) return false;
        var ext = path.lastIndexOf(".");
        if (-1 != ext) {
            var idx = path.indexOf("/", ext);
            ret = -1 != idx ? path.substr(0, idx) : path
        }
        return !!ret && Editor.remote.assetdb.existsByPath(ret);
    }

    static inheritedAttrList =  {
        "cc.Node": {
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            anchorX: .5,
            anchorY: .5,
            width: 100,
            height: 100,
            active: !0,
            opacity: 255,
            color: {
                r: 255,
                g: 255,
                b: 255
            },
            angle: 0
        },
        "cc.Label": {
            enabled: !0,
            horizontalAlign: 1,
            verticalAlign: 1,
            overflow: 0,
            fontSize: 40
        },
        "cc.Widget": {
            isAlignBottom: !0,
            isAlignLeft: !0,
            isAlignRight: !0,
            isAlignTop: !0,
            isAlignHorizontalCenter: !1,
            isAlignVerticalCenter: !1,
            _isAbsBottom: !0,
            _isAbsHorizontalCenter: !0,
            _isAbsLeft: !0,
            _isAbsRight: !0,
            _isAbsTop: !0,
            _isAbsVerticalCenter: !0,
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            horizontalCenter: 0,
            verticalCenter: 0,
            enabled: !0
        },
        "cc.Sprite": {
            enabled: !0,
            spriteFrame: {}
        },
        "cc.Layout": {
            enabled: !0,
            type: 0,
            resizeMode: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            spacingX: 0,
            spacingY: 0,
            horizontalDirection: 0,
            verticalDirection: 1,
            startAxis: 0,
            affectedByScale: !1
        },
        "cc.ScrollView": {
            enabled: !0,
            horizontal: !1,
            vertical: !0,
            inertia: !0,
            brake: .75,
            elastic: !0,
            bounceDuration: .23
        },
        "cc.BoxCollider": {
            enabled: !0,
            tag: 0,
            offset: {
                x: 0,
                y: 0
            },
            size: {
                width: 100,
                height: 100
            }
        },
        "cc.CircleCollider": {
            enabled: !0,
            tag: 0,
            offset: {
                x: 0,
                y: 0
            },
            radius: 100
        },
        "cc.PolygonCollider": {
            enabled: !0,
            threshold: 1,
            tag: 0,
            offset: {
                x: 0,
                y: 0
            },
            points: [{
                x: -50,
                y: -50
            }, {
                x: 50,
                y: -50
            }, {
                x: 50,
                y: 50
            }, {
                x: -50,
                y: 50
            }]
        }
    }
}   