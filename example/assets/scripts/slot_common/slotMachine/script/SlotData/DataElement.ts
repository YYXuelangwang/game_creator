/**
 * DataElement
 */
export default class DataElement {
	public getKeys(): any[] {
		// return [1, 2, 3, 4, 5, 6, 7, 8, 9];
		return this._keys.concat();
	}

	public getIds(): any[] {
		// return ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
		return this._ids.concat();
	}

	public getData(key: any) {
		return DataElement.instance._data[key];
	}

	private _data: Object;
	private _keys:any[];
	private _ids:any[];
	public set conf(obj:any){
		this._keys = obj["keys"];
		this._ids = obj["ids"];
		this._data = obj["data"];
	}

	public static get instance(): DataElement {
		if (!this._instance) {
			this._instance = new DataElement();
		}
		return this._instance;
	}
	private static _instance: DataElement;

	constructor() {
		this._data = {
		}
	}
}