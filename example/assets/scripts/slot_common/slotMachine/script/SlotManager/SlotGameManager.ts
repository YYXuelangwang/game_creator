// 这里是对游戏流程进行管理的类
import SlotConfigManager from './SlotConfigManager';
import GlobalQueueManager from './GlobalQueueManager';
import PlayerManager from './PlayerManager';
import SpinManager from './SpinManager';
import BonusGameManager from './BonusGameManager';
import FreeGameManager from './FreeGameManager';
import SlotTimeManager from './SlotTimeManager';
import { GameEventNames } from '../SlotConfigs/GameEventNames';
import SlotProtoManager from '../../../network/SlotProtoManager';
import { GData } from '../../../common/utils/GData';
import MultipleGameManager from './MultipleGameManager';
import SpinElementManager from '../MainView/SpinElementManager';
import JackPotGameManager from './JackPotGameManager';
export default class SlotGameManager {

    private static _instance: SlotGameManager = null;
    public static get instance(): SlotGameManager {
        if (this._instance == null) {
            this._instance = new SlotGameManager();

        }
        return this._instance;
    }

    constructor() {
    }
    private _gameAtlas: cc.SpriteAtlas;
    private _gmConfigData: any;
    private _configdata: any;

    private _caller: any;
    private _callback: Function;

    private _cardRes: cc.SpriteAtlas[];

    private resRealyList = {
        comConfig: false,
        gmConfig: true,
        gameRes: false,  //已经打成图集连着预制体一起加载了
        extRes: false,
        defaultRes: false
    }
    private _isInfoBack: boolean = false; //是否收到了现场还原信息

    private isEnterRommSucess: boolean = false;

    public isFirstEnterRoom: boolean = true;

    public netNode: game.NetNode = null;

    public init(): void {
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_LAST_GAME_INFO_GET, this.onInfoResq, this)
        game.EventManager.getInstance().addEventListener(core.GameCoreConst.mess_netEnterRoom, this.enterNormalRoom, this);
        game.EventManager.getInstance().addEventListener(core.GameCoreConst.mess_netCreateRoom, this.enterNewRoom, this);
        game.EventManager.getInstance().addEventListener(core.GameCoreConst.mess_netJionRoom, this.enterNewRoom, this);
        game.EventManager.getInstance().addEventListener(core.GameCoreConst.mess_netChangeRoom, this.enterNewRoom, this);
    }

    public start(callBack: Function, caller: any) {
        this._isInfoBack = false;
        this._callback = callBack;
        this._caller = caller;
        this._gameAtlas = null;
        //加载配置
        let config = GData.getParameter("slotMachine").slotMachine;

        game.ResLoader.getInstance().loadRes("slot_common/slotMachine/prefab/flashLightPrefab", cc.Asset, (err: Error, res: cc.Prefab) => {
            this.resRealyList.defaultRes = true;
            this.loadSigleComplete();
        }, "slot", "flashPrefab");

        if (config.extRes && config.extRes.length > 0) {
            game.ResLoader.getInstance().loadRes(config.extRes, cc.SpriteFrame, (err: Error, res: cc.SpriteFrame) => {
                this.resRealyList.extRes = true;
                this.loadSigleComplete();
            }, GData.bundleName, "extRes");
        } else {
            this.resRealyList.extRes = true;
        }

        let cardRes = config.cardRes;
        let cardResLang = config.cardResLang;
        let lang = GData.curLanguage;
        if (cardResLang) {
            if (cardResLang[lang]) {
                cardRes = cardRes.concat(cardResLang[lang]);
            } else if (cardResLang["en"]) {
                cardRes = cardRes.concat(cardResLang["en"]);
            }

        }
        if (this.resRealyList.comConfig && this.isEnterRommSucess) {
            this.begin();
        }
        game.ResLoader.getInstance().loadRes(cardRes, cc.SpriteAtlas, (err: Error, res: cc.SpriteAtlas[]) => {
            this.resRealyList.gameRes = true;
            this._cardRes = res;
            this.loadSigleComplete();
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_LOAD_SINGLE_ASSET_COMPLETE, "cardRes");
        }, GData.bundleName, "slot");

    }

    public loadConfig() {
        console.log("load config")
        return new Promise<void>((resolve, reject) => {
            let config = GData.getParameter("slotMachine").slotMachine;
            let confList: any[] = config.confList;
            let registGameIds = [];
            registGameIds.push(core.Global.gameId);
            let checkPush = (gameId) => {
                for (const key in confList) {
                    if (Object.prototype.hasOwnProperty.call(confList, key)) {
                        if (gameId == Number(key)) {
                            registGameIds.push(gameId)
                            return true;
                        }
                    }
                }
                return false;
            }
            let i = 1;
            while (checkPush(core.Global.gameId * 10 + i)) {
                i += 1
            }
            if (registGameIds.length > 1)
                SlotConfigManager.instance.registerGameIds(registGameIds, core.Global.gameId);
            let gameIDs = SlotConfigManager.instance.gameIDs;
            if (gameIDs && gameIDs.length > 0) {
                for (let gameId of gameIDs) {
                    this.resRealyList[gameId] = false;
                }
                let loadCount = 0;
                for (let gameID of gameIDs) {
                    let c = confList[gameID];
                    this._configdata = {};
                    game.ResLoader.getInstance().loadRes(c, cc.JsonAsset, (err: Error, res: cc.JsonAsset) => {
                        loadCount++;
                        this._configdata[gameID] = res;
                        if (loadCount == gameIDs.length) {
                            this.resRealyList.comConfig = true;
                            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_LOAD_SINGLE_ASSET_COMPLETE, "dataConfig");
                            resolve()
                        }
                    }, GData.bundleName, "slot");
                }
            } else {
                let urls = [];
                if (confList instanceof Array) {
                    urls = confList;
                } else {
                    urls = confList[core.Global.gameId];
                }
                game.ResLoader.getInstance().loadRes(urls, cc.JsonAsset, (err: Error, res: cc.JsonAsset) => {
                    this.resRealyList.comConfig = true;
                    this._configdata = res;
                    SlotConfigManager.instance.init(this._configdata);
                    game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_LOAD_SINGLE_ASSET_COMPLETE, "dataConfig");
                    resolve()
                }, GData.bundleName, "slot");
            }
        })
    }

    // private loadConfig(confList: any): void {
    //     let gameIDs = SlotConfigManager.instance.gameIDs;
    //     for (let gameId of gameIDs) {
    //         this.resRealyList[gameId] = false;
    //     }
    //     let loadCount = 0;
    //     for (let gameID of gameIDs) {
    //         let c = confList[gameID];
    //         this._configdata = {};
    //         game.ResLoader.getInstance().loadRes(c, cc.JsonAsset, (err: Error, res: cc.JsonAsset) => {
    //             loadCount++;
    //             this._configdata[gameID] = res;
    //             if (loadCount == gameIDs.length) {
    //                 this.resRealyList.comConfig = true;
    //                 if (this.isEnterRommSucess) {
    //                     this.begin();
    //                 }
    //                 game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_LOAD_SINGLE_ASSET_COMPLETE, "dataConfig");
    //             }
    //         }, GData.bundleName, "slot");
    //     }
    // }

    private enterNormalRoom(event, data, param: any): void {
        this.netNode = game.NetManager.getInstance().getNetNode()
        // socket断开时不进行自动重连，直接弹出断线重连提示
        this.netNode.setDisconnectCallback(function () {
            this.closeTips();
            return false
        });
        if (!param) {
            if (!this.isFirstEnterRoom) {
                game.EventManager.getInstance().raiseEvent(GameEventNames.RESETROOMSTATE);
                this.reEnterRoomSuccess();
                return;
            }
            this.isEnterRommSucess = true;
            if (this.resRealyList.comConfig == true) {
                // this.begin();
            }
        }
    }

    /**
     * 重连后重新进入房间
     */
    private reEnterRoomSuccess(): void {
        this.clear();
        this.begin();
    }

    private isNewRoom: boolean = false;
    private enterNewRoom(event, data, param: any): void {
        if (!param) {

            this.isNewRoom = true;
            if (!this.isFirstEnterRoom) {
                game.EventManager.getInstance().raiseEvent(GameEventNames.RESETROOMSTATE);
                this.reEnterRoomSuccess();
                return;
            }
            this.isEnterRommSucess = true;
            if (this.resRealyList.comConfig == true) {
                this.begin();
            }
        }
    }

    private hasInit: boolean = false
    private begin() {
        if (this.hasInit) return;
        this.hasInit = true;
        SlotConfigManager.instance.init(this._configdata);
        JackPotGameManager.instance.init();
        MultipleGameManager.instance.init();
        GlobalQueueManager.instance.init();
        SlotTimeManager.instance.init();

        PlayerManager.instance.init();
        SpinManager.instance.init();
        BonusGameManager.instance.init();
        FreeGameManager.instance.init();
        core.CommonProto.getInstance().readyReq();
        SlotProtoManager.getInstance().requestLastGameInfo();
        SpinElementManager.instance.init();


        //SlotProtoManager.getInstance().rollerModeDataReq();

    }

    // 通过名字获取对应卡片SpriteFrame
    public getCardByName(name): cc.SpriteFrame {
        for (let card of this._cardRes) {
            let spriteFrame = card.getSpriteFrame(name);
            if (spriteFrame) {
                return spriteFrame;
            }
        }
    }


    private loadSigleComplete() {
        if (this.isNewRoom) {
            this.isNewRoom = false;
            // core.CommonProto.getInstance().readyReq();
            //game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_CHANGE_ROOM_SUCCESS);
            //return;
        }
        if (this.resRealyList.extRes && this.resRealyList.comConfig && this.resRealyList.gameRes && this.resRealyList.defaultRes && this._isInfoBack && this._callback) {
            this._isInfoBack = false;
            this._callback.call(this._caller);
            this._callback = null;
            this.isFirstEnterRoom = false;
        }
    }

    private onInfoResq() {
        this._isInfoBack = true;
        this.loadSigleComplete();
        SlotProtoManager.getInstance().rollerModeDataReq();

    }

    public get gmConfigData() {
        return this._gmConfigData;
    }

    public clear() {
        GlobalQueueManager.instance.dispose();
        //SlotConfigManager.instance.dispose();
        PlayerManager.instance.dispose();
        //SpinManager.instance.dispose();
        BonusGameManager.instance.dispose();
        FreeGameManager.instance.dispose();
        SlotTimeManager.instance.dispose();
    }
}