import { GData } from "../common/utils/GData";
import { Property } from "../common/utils/Property";
import SlotGameManager from "../slotMachine/script/SlotManager/SlotGameManager";
import EntranceViewBase from "./EntranceViewBase";

const { ccclass, property } = cc._decorator;
/**
 * 程序主入口，初始化主界面，音乐，注册弹框配置，适配横竖屏分辨率
 */
@ccclass
export default class EntranceView extends EntranceViewBase {
    private blurryBgNode: cc.Node = null;

    public initView() {
        let canvas: cc.Node = cc.Canvas.instance.node;
        canvas.getComponent(cc.Mask) || canvas.addComponent(cc.Mask);
        EntranceViewBase._instance = this;

        cc.view.resizeWithBrowserSize(true);
        cc.debug.setDisplayStats(false);

        GData.skinId = core.Global.skinId;
        this.isAddView = true;

        //改成netEnterRoom是因为 SlotConfigManager.instance.init 是在进入房间后初始化的，处理使用登入成功监听开始创建预制（预制中在onLoad获取配置）导致获取配置失败
        game.EventManager.getInstance().addEventListener(core.GameCoreConst.mess_netEnterRoom, this.enterLoginSuccess, this);

        this.addBlurryeBG();
        //优先加载配置
        SlotGameManager.instance.loadConfig().then(() => {
            this.setLanguage();
            this.loadConfigComplete();
            this.resize();
        });
    }

    protected addBlurryeBG() {
        this.blurryBgNode = new cc.Node();
        this.blurryBgNode.parent = cc.Canvas.instance.node.parent;

        let blurryUrl = GData.getParameter("main").blurryUrl;
        this.blurryBgNode.setSiblingIndex(0);

        let blurryLoadOver = (sp: cc.Sprite) => {
            game.EventManager.getInstance().raiseEvent("removeStartLoading");
            this.blurryLoadOver(sp);
        };
        Property.setSpriteProperty(this.blurryBgNode.addComponent(cc.Sprite), { spriteFrame: blurryUrl }, null, blurryLoadOver.bind(this));

    }

    //模糊背景图
    public blurryLoadOver(spr?: cc.Sprite): void {
        var size = cc.view.getCanvasSize();
        if (this.blurryBgNode) {
            if (spr) {
                let size = spr.spriteFrame.getOriginalSize();
                this.blurryBgNode.width = size.width;
                this.blurryBgNode.height = size.height;
            }
            this.blurryBgNode.setPosition(cc.Canvas.instance.node.x, cc.Canvas.instance.node.y);
            let designResolutionSize = cc.view.getDesignResolutionSize();
            let srcScaleForShowAll = Math.min(size.width / designResolutionSize.width, size.height / designResolutionSize.height);
            let realWidth = this.blurryBgNode.width * srcScaleForShowAll;
            let realHeight = this.blurryBgNode.height * srcScaleForShowAll;
            this.blurryBgNode.scale = Math.max(size.width / realWidth, size.height / realHeight);
        }
    }

    public setLanguage(): void {

    }
}
