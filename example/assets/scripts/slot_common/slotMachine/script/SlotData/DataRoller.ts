import JTRollerData from "../Scroller/com/datas/JTRollerData";

/**
 * DataRoller
 */
export default class DataRoller {
	public getKeys(): any[] {
		// return [3318];
		return this._keys.concat();
	}

	public getIds(): any[] {
		// return ["3318&1", "3318&2", "3318&3", "3318&4", "3318&5"];
		return this._ids.concat();
	}

	public getData(key: any) {
		return DataRoller.instance._data[key];
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
	

	public static get instance(): DataRoller {
		if (!this._instance) {
			this._instance = new DataRoller();
		}
		return this._instance;
	}
	private static _instance: DataRoller;

	constructor() {
		this._data = {
		}
	}
}