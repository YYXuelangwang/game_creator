/**
 * DataGame
 */
export default class DataGame {
	public getKeys(): any[] {
		// return [3318];
		return this._keys.concat();
	}

	public getIds(): any[] {
		// return [3318];
		return this._ids.concat();
	}

	public getData(key: any) {
		return DataGame.instance._data[key];
	}

	private _data: Object;
	private _keys:any[];
	private _ids:any[];
	public set conf(obj:any){
		this._keys = obj["keys"];
		this._ids = obj["ids"];
		this._data = obj["data"];
	}
	

	public static get instance(): DataGame {
		if (!this._instance) {
			this._instance = new DataGame();
		}
		return this._instance;
	}
	private static _instance: DataGame;

	constructor() {
		this._data = {

		}
	}
}