/**
 * DataGameFreeLines
 */
export default class DataGameFreeLines {
	public getKeys(): any[] {
		// return [3318];
		return this._keys.concat();
	}

	public getIds(): any[] {
		// return [3318];
		return this._ids.concat();
	}

	public getData(key: any) {
		return DataGameFreeLines.instance._data[key];
	}

	private _data: Object;
	private _keys:any[];
	private _ids:any[];
	public set conf(obj:{}){
		this._keys = obj["keys"];
		this._ids = obj["ids"];
		this._data = obj["data"];
	}
	

	public static get instance(): DataGameFreeLines {
		if (!this._instance) {
			this._instance = new DataGameFreeLines();
		}
		return this._instance;
	}
	private static _instance: DataGameFreeLines;

	constructor() {
		this._data = {

		}
	}
}