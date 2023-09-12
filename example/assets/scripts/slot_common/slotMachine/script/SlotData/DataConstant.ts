/**
 * DataConstant
 */
export default class DataConstant {
	public getKeys(): any[] {
		// return [];
		return this._keys.concat();
	}

	public getIds(): any[] {
		// return [];
		return this._ids.concat();
	}

	public getData(key: any) {
		return DataConstant.instance._data[key];
	}

	private _data: Object;
	private _keys:any[];
	private _ids:any[];
	public set conf(obj:{}){
		this._keys = obj["keys"];
		this._ids = obj["ids"];
		this._data = obj["data"];
	}

	public static get instance(): DataConstant {
		if (!this._instance) {
			this._instance = new DataConstant();
		}
		return this._instance;
	}
	private static _instance: DataConstant;

	constructor() {
		this._data = {

		}
	}
}