import SlotProtoManager from "../../network/SlotProtoManager";
import { GameEventNames } from "../../slotMachine/script/SlotConfigs/GameEventNames";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HashEntranceSlot extends game.View {

    private lastPoint: cc.Vec3 = cc.v3();
    @property(cc.Node)
    iconBtn: cc.Node = null;
    @property(cc.SpriteFrame)
    timestampIcon: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    directIcon: cc.SpriteFrame = null;
    @property(cc.Sprite)
    iconNode: cc.Sprite = null;
    @property(cc.Node)
    timestampText: cc.Node = null;
    @property(cc.Node)
    directText: cc.Node = null;
    @property(cc.Node)
    hashChainText: cc.Node = null;
    @property({ type: cc.Node, tooltip: 'hashRest' })
    nodeGameNum: cc.Node = null;

    @property(cc.Node)
    nodeTips: cc.Node = null;
    @property(cc.Node)
    nodeTipsBg: cc.Node = null;
    @property(cc.Label)
    labelTips: cc.Label = null;
    @property(cc.Node)
    nodeProgress: cc.Node = null;
    @property(cc.Sprite)
    spriteProgress: cc.Sprite = null;

    @property(cc.Label)
    labelProgress: cc.Label = null;

    @property(cc.Label)
    labelGameNum: cc.Label = null;

    curProgress: number = null;

    onLoad() {
        this.resize();
        this.addEvent();
        game.EventManager.getInstance().addEventListener(core.GameCoreConst.mess_slot_hash_chain_verify, this.openHelpView, this);
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_HASH_REST_UPDATE, this.updateHashRest, this);
    }

    onDestroy(): void {
        game.EventManager.getInstance().removeEventListener(core.GameCoreConst.mess_slot_hash_chain_verify, this.openHelpView, this);
        game.EventManager.getInstance().removeEventListener(GameEventNames.EVENT_HASH_REST_UPDATE, this.updateHashRest, this);
    }

    start() {
        this.nodeTips.active = false;
        let isOpen1 = Boolean(cc.sys.localStorage.getItem(core.Global.gameId + "_openHashHelp"));
        let isOpen2 = Boolean(cc.sys.localStorage.getItem(core.Global.gameId + "_openHashHelpSlot"));
        if (!isOpen1 || !isOpen2) {
            this.openHelpView();
        }
        let gameMode: protoSlot.game_mode_type_enum = SlotProtoManager.getInstance().restoreResult.gameMode;
        this.nodeGameNum.active = gameMode == protoSlot.game_mode_type_enum.hash_chain;

        this.renderHashRest();
        this.directText.active = gameMode == protoSlot.game_mode_type_enum.direct_hash;
        this.timestampText.active = gameMode == protoSlot.game_mode_type_enum.timestamp_hash;
        this.hashChainText.active = gameMode == protoSlot.game_mode_type_enum.hash_chain;
        this.iconNode.spriteFrame = gameMode == protoSlot.game_mode_type_enum.direct_hash ? this.directIcon : this.timestampIcon;
    }

    private renderHashRest() {
        if (!this.nodeGameNum.active) return;
        let hashRest = SlotProtoManager.getInstance().hashRest;
        if (hashRest == null) return;
        if (hashRest < 0) return;

        if (hashRest === 10000) {
            this.createHashChaining();
        }
        else {
            this.labelGameNum.string = '' + hashRest;
        }
    }

    private createHashChaining() {
        this.nodeTips.active = true;
        this.spriteProgress.fillRange = 0;
        this.labelProgress.string = '0%';
        this.nodeTips.stopAllActions();
        this.nodeTips.getComponentInChildren(cc.Label).string = game.LanguageManager.getInstance().getDstStr('hunt_hash_59');
        this.nodeTips.scale = 0;
        this.nodeTipsBg.scaleX = this.node.x > 0 ? 1 : -1;
        this.labelTips.node.x = this.node.x > 0 ? -300 : 300;
        this.nodeProgress.x = this.node.x > 0 ? -300 : 300;
        cc.tween(this.nodeTips)
            .to(0.2, { scale: 1 }, { easing: 'easeOut' })
            .call(() => {
                this.curProgress = 0;
            })
            .delay(2.5)
            .call(() => {
                this.labelGameNum.string = '0';
            })
            .to(0.2, { scale: 0 }, { easing: 'easeIn' })
            .start();
        setTimeout(() => {
            this.nodeTips.scale = 0;
            this.labelGameNum.string = '0';
        }, 3);
    }

    protected update(dt: number): void {
        if (this.curProgress == null) return;
        this.curProgress += dt / 2;
        if (this.curProgress >= 1) this.curProgress = 1;
        this.spriteProgress.fillRange = this.curProgress;
        this.labelProgress.string = (this.curProgress * 100).toFixed(1) + '%';
        if (this.curProgress >= 1) this.curProgress = null;
    }

    private addEvent(): void {
        this.iconBtn.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.iconBtn.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    private updateHashRest(evt: string) {
        console.log('updateHashRest-----------');
        this.renderHashRest();
    }

    private onTouchStart() {
        this.iconBtn.on(cc.Node.EventType.TOUCH_MOVE, this.iconTouchMove, this);
        this.clickBinanceHashBtn();
    }

    // 上报事件
    private clickBinanceHashBtn() {
        // if (game.Global.gameId === 0) {
        // }
        // 房间
        // core.DataAnalysis && core.DataAnalysis.instance.httpEventReport(core.GameEventData.instance.gamepublic_hash_open2);
    }

    private onTouchEnd() {
        this.iconBtn.off(cc.Node.EventType.TOUCH_MOVE, this.iconTouchMove, this);
        let curPos: cc.Vec3 = this.node.position;
        if ((this.lastPoint.x == 0 && this.lastPoint.y == 0) || game.ComUtils.GetTwoPosDistance(curPos, this.lastPoint) < 50) {
            game.SoundManager.getInstance().playBtnSound();
            this.openHelpView(null, {
                seed: SlotProtoManager.getInstance().ciphertext,
                autoHashValueCalculation: false,
                rollerGameId: null,
                rollerId: null,
            });
        }
        this.lastPoint = this.node.position;
    }

    private openHelpView(evnt?: string, data?: {
        seed: string,
        autoHashValueCalculation: boolean,
        rollerGameId: number,
        rollerId: number,
    }): void {
        let gameMode: protoSlot.game_mode_type_enum = SlotProtoManager.getInstance().restoreResult.gameMode;

        // 哈希链
        if (gameMode === protoSlot.game_mode_type_enum.hash_chain) {
            let dataHashCheckHelp = {
                pageIndex: 0,
                toggleIndex: 0,
                autoHashValueCalculation: false,
                seed: data?.seed,
                gameMode: gameMode,
                gameId: core.Global.gameId,
                rollerModeId: SlotProtoManager.getInstance().rollerModeId,
                rollerGameId: data?.rollerGameId,
                rollerId: data?.rollerId,
            }
            if (data) {
                if (data.hasOwnProperty('autoHashValueCalculation')) {
                    if (data.autoHashValueCalculation) {
                        dataHashCheckHelp.toggleIndex = 1;
                    }
                    dataHashCheckHelp.autoHashValueCalculation = data.autoHashValueCalculation;
                }
            }
            game.UIManager.getInstance().open(core.COREUIID.UI_HASH_CHECK_HELP_CHAIN, dataHashCheckHelp);
        }
        // 其他
        else {
            let dataHashCheckHelp = {
                pageIndex: 0,
                gameMode: gameMode,
                gameId: core.Global.gameId,
                rollerModeId: SlotProtoManager.getInstance().rollerModeId
            }
            game.UIManager.getInstance().open(core.COREUIID.UI_HASH_CHECK_HELP, dataHashCheckHelp);
        }
    }

    /** 
     * 按钮移动
     */
    private iconTouchMove(event: cc.Event.EventTouch) {
        if (this.node) {
            let pos = cc.Canvas.instance.node.convertToNodeSpaceAR(event.getLocation());
            let width: number = cc.Canvas.instance.node.width;
            let height: number = cc.Canvas.instance.node.height;
            if ((-height >> 1) < pos.y && pos.y < (height >> 1)) {
                this.node.setPosition(pos);
            }
        }
    }


    layoutLandscape() {
        game.Utils.setWidget(this.node, { right: 200, top: 80 });
    }

    layoutPortrait() {
        game.Utils.setWidget(this.node, { right: 200, top: 80 });
    }


}
