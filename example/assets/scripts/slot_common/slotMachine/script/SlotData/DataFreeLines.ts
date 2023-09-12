/**
 * DataFreeLines
 */
export default class DataFreeLines {
	public getKeys(): any[] {
		// return [11, 12];
		return this._keys.concat();
	}

	public getIds(): any[] {
		// return [11, 12];
		return this._ids.concat();
	}

	public getData(key: any) {
		return DataFreeLines.instance._data[key];
	}

	private _data: Object;
	private _keys:any[];
	private _ids:any[];
	public set conf(obj:any){
		this._keys = obj["keys"];
		this._ids = obj["ids"];
		this._data = obj["data"];
	}

	public static get instance(): DataFreeLines {
		if (!this._instance) {
			this._instance = new DataFreeLines();
		}
		return this._instance;
	}
	private static _instance: DataFreeLines;

	constructor() {
		this._data = {
		}
	}
}