import { CANVAS_SIZE, MAIN_NODE_NAME, Orientation } from "../common/enum/CommonEnum";
import { LayerManage } from "../common/layer/LayerManage";
import SlotProtoManager from "../network/SlotProtoManager";
import { GameEventNames } from "../slotMachine/script/SlotConfigs/GameEventNames";
import SlotConfigManager from "../slotMachine/script/SlotManager/SlotConfigManager";
import SlotGameManager from "../slotMachine/script/SlotManager/SlotGameManager";

import BaseView from "./BaseView";


const { ccclass, property } = cc._decorator;
/**
 * 程序主入口，初始化主界面，音乐，注册弹框配置，适配横竖屏分辨率
 */
@ccclass
export default class EntranceViewBase extends BaseView {
    protected isAddView: boolean = true;
    protected nodes: any = {};
    protected static _instance: EntranceViewBase;

    @property({
        type: cc.Enum(Orientation),
        tooltip: `游戏支持的方向，分固定横屏，固定竖屏，及横竖均支持`
    })
    orientation: Orientation = Orientation.Both;

    static get instance(): EntranceViewBase {
        return EntranceViewBase._instance;
    }

    static set instance(val) {
        EntranceViewBase._instance = val;
    }

    public initView() {
        this.isAddView = true;

        game.EventManager.getInstance().addEventListener(core.GameCoreConst.mess_netEnterRoom, this.enterLoginSuccess, this);
        EntranceViewBase._instance = this;
        super.resize();

        this.loadConfigComplete();
    }

    protected loadConfigComplete() {
        this.beforeLogin();
        game.SoundManager.getInstance().loadLocalVolume(core.Global.gameId.toString());
    }

    protected beforeLogin(): void {

    }

    protected addView() {

    }

    //进入房间成功
    protected enterLoginSuccess() {
        if (this.isAddView) {
            this.isAddView = false;
            this.addView();
        }
        //进入房间的时候请求滚轴模式
    }

    public getNode(nodeName: string): cc.Node {
        return this.nodes[nodeName];
    }

    protected loadPrefab(bundleName: string, prefab: string, layer: number, name?: string, loadComplte?: Function, parent?: cc.Node): void {
        game.ResLoader.getInstance().loadRes(prefab, cc.Prefab, (err: any, pre: cc.Prefab) => {
            if (!err) {
                let node = this.addNode(pre, layer, name, parent);
                game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_LOAD_SINGLE_ASSET_COMPLETE, name);
                if (loadComplte) {
                    loadComplte(node);
                }
            } else {
                return err;
            }
        }, bundleName, "slot");
    }

    public addNode(prefab: cc.Prefab | cc.Node, layer: number, nodeName?: string, parent?: cc.Node): cc.Node {
        if (!prefab) return;
        let node: cc.Node;
        if (prefab instanceof cc.Prefab) {
            node = cc.instantiate(prefab);
        } else {
            node = prefab;
        }
        this.nodes[nodeName] = node;
        if (parent) {
            parent.addChild(node, layer)
        } else {
            this.node.addChild(node, layer);
        }
        if (!nodeName) nodeName = node.name;

        return node;
    }

    public initProto(): void {
        //发起登陆
        core.CommonProto.getInstance().loginReq();
        let uiconf = game.BaseUIConf.getInstance().getUICF();
        game.UIManager.getInstance().initUIConf(uiconf);//注册
        SlotGameManager.instance.init();
        let proto = SlotProtoManager.getInstance();
        SlotConfigManager.instance.gameID = core.Global.gameId;  //Number(window["gameConfig"].gameID);
    }

    getEffectLayer(): cc.Node {
        let effectLayer = this.getNode(MAIN_NODE_NAME.effect);
        if (!effectLayer) {
            effectLayer = new cc.Node();
            this.addNode(effectLayer, LayerManage.effect, MAIN_NODE_NAME.effect);
        }
        return effectLayer;
    }

    /**
     * 设置节点同级索引
     * @param nodeName //节点名称目前只支持MAIN_NODE_NAME枚举下的,通过名称获取节点
     * @param index //要设置的索引值
     * @param node //(可选)要设置的节点,如果填了则使用此节点
     */
    setSiblingIndex(nodeName: string, index: number, node?: cc.Node) {
        if (!node) {
            node = this.getNode(nodeName);
        }
        if (node) {
            node.setSiblingIndex(index);
        } else {
            console.log("获取节点错误");
        }
    }

    // 震屏效果
    // 参数：duration 震屏时间
    shakeEffect(duration: number, ratio: number = 1, node?: cc.Node): void {
        node = !node ? this.node : node;
        node.stopAllActions();
        node.setPosition(0, 0);
        if (!duration) {
            return;
        }
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SHAKE_EFFECT_START);
        node.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.moveTo(0.02, cc.v2(5 * ratio, 7 * ratio)),
                    cc.moveTo(0.02, cc.v2(-6 * ratio, 7 * ratio)),
                    cc.moveTo(0.02, cc.v2(-13 * ratio, 3 * ratio)),
                    cc.moveTo(0.02, cc.v2(3 * ratio, -6 * ratio)),
                    cc.moveTo(0.02, cc.v2(-5 * ratio, 5 * ratio)),
                    cc.moveTo(0.02, cc.v2(2 * ratio, -8 * ratio)),
                    cc.moveTo(0.02, cc.v2(-8 * ratio, -10 * ratio)),
                    cc.moveTo(0.02, cc.v2(3 * ratio, 10 * ratio)),
                    cc.moveTo(0.02, cc.v2(0, 0))
                )
            )
        );

        setTimeout(() => {
            node.stopAllActions();
            node.setPosition(0, 0);
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_SHAKE_EFFECT_END);
        }, duration * 1000);
    }
}
