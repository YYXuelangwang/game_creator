import JTRollerData from "../Scroller/com/datas/JTRollerData";

/**
 * DataFreeRoller
 */
export default class DataFreeRoller {
	public getKeys(): any[] {
		return this._keys.concat();
	}

	public getIds(): any[] {
		return this._ids.concat();
	}

	public getData(key: any) {
		return DataFreeRoller.instance._data[key];
	}

	private _data: Object;
	private _keys:any[];
	private _ids:any[];
	public set conf(obj:{}){
		this._keys = obj["keys"];
		this._ids = obj["ids"];
		this._data = obj["data"];
	}

	public getColumnElements(col:number){
		let ids = this.getIds();
		for(let id of ids){
			let data = this.getData(id);
			if(data.column==col){
				return data.elements;
			}
		}
	}

	public getColumnData(col:number):any{
		let ids = this.getIds();
		for(let id of ids){
			let data = this.getData(id);
			if(data.column==col){
				let e = new JTRollerData();
				e.elements = data.elements;
				e.roller = data.roller;
				return e;
			}
		}
	}
	

	public static get instance(): DataFreeRoller {
		if (!this._instance) {
			this._instance = new DataFreeRoller();
		}
		return this._instance;
	}
	private static _instance: DataFreeRoller;

	constructor() {
		this._data = {
		}
	}
}