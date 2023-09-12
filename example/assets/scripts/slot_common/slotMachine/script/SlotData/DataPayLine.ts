/**
 * DataPayLine
 */
export default class DataPayLine {
	public getKeys(): any[] {
		// return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		return this._keys.concat();
	}

	public getIds(): any[] {
		// return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		return this._ids.concat();
	}

	public getData(key: any) {
		return DataPayLine.instance._data[key];
	}

	private _data: Object;
	private _keys:any[];
	private _ids:any[];
	public set conf(obj:any){
		this._keys = obj["keys"];
		this._ids = obj["ids"];
		this._data = obj["data"];
	}
	

	public static get instance(): DataPayLine {
		if (!this._instance) {
			this._instance = new DataPayLine();
		}
		return this._instance;
	}
	private static _instance: DataPayLine;

	constructor() {
		this._data = {
		}
	}
}