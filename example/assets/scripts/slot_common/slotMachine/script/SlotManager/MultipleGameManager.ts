import SimpleManagerTemplate from "./SimpleManagerTemplate";
import SlotConfigManager from "./SlotConfigManager";



export default class MultipleGameManager implements SimpleManagerTemplate {
    
    private _defaultGameID:number;
    private _curGameID:number;
    private _normalGrid:number[];
    private _normalGridChanged:number[];
    private _nextGrid:number[];
    private _nextGridChanged:number[];

    private _enabled:boolean = false;

    private _isChangeGame:boolean = false;
    init() {
        this._enabled = SlotConfigManager.instance.isMultipleGame;
        this._defaultGameID = SlotConfigManager.instance.defaultGameID;
    }

    dispose() {
        
    }

    public get isChangeGame():boolean{
        return this._isChangeGame;
    }

    public get curGameID():number{
        return this._curGameID;
    }

    public get normalGrid():number[]{
        return this._normalGrid;
    }

    public get normalGridChanged():number[]{
        return this._normalGridChanged;
    }

    public get nextGrid():number[]{
        return this._nextGrid;
    }

    public get nextGridChanged():number[]{
        return this._nextGridChanged;
    }

    public static get instance(): MultipleGameManager {
        if (!MultipleGameManager._instance) {
            MultipleGameManager._instance = new MultipleGameManager();
        }
        return MultipleGameManager._instance;
    }
    private static _instance: MultipleGameManager = null;


    public render(spinResp: protoSlot.spinResp):void{
        if(!this._enabled){
            return;
        }
        if(!spinResp.nextState){
            this._isChangeGame = false;
            return;
        }
        this._isChangeGame = true;

        if(spinResp.nextState.normalData){
            this._nextGrid = spinResp.nextState.normalData.spinInfo.spinResult.grid;
            this._nextGridChanged = spinResp.nextState.normalData.spinInfo.spinResult.grid;
            if(!spinResp.nextState.freeData){
                if(this._curGameID == this._defaultGameID){
                    this._isChangeGame = false;
                    return;
                }
                this._curGameID = this._defaultGameID;
            }
        }
        if(spinResp.nextState.freeData){
            if(spinResp.nextState.freeData.gameId==this._curGameID){
                this._isChangeGame = false;
                return;
            }
            if(spinResp.nextState.freeData.gameId==0){
                if(this._curGameID == this._defaultGameID){
                    this._isChangeGame = false;
                    return;
                }
                this._curGameID = this._defaultGameID;
            }else{
                this._curGameID = spinResp.nextState.freeData.gameId;
            }
           this._nextGrid = spinResp.nextState.freeData.spinInfo.spinResult.grid;
           this._nextGridChanged = spinResp.nextState.freeData.spinInfo.spinResult.gridChanged;
        }
    }

    public resume(state: protoSlot.stateType):void{
        if(!this._enabled){
            return;
        }
        this._isChangeGame = false;

        if(state.normalData){
            this._normalGrid = state.normalData.spinInfo.spinResult.grid;
            this._normalGridChanged = state.normalData.spinInfo.spinResult.gridChanged;
            this._curGameID = this._defaultGameID;
        }
        if(state.freeData){
            if(state.freeData.gameId!=0){
                this._curGameID = state.freeData.gameId;
            }
            this._nextGrid = state.freeData.spinInfo.spinResult.grid;
            this._nextGridChanged = state.freeData.spinInfo.spinResult.gridChanged;
        }
    }
}
