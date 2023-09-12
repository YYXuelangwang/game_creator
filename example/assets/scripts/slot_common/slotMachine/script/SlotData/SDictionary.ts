
export interface IDictionary {
    set (key: any, value: any): void;
    get (key: any): any;
    remove (key: any): void;
    containsKey (key: any): boolean;
    keys: any[];
    values: any[];
}

export class SDictionary {
    _keys: any[] = [];
    _values: any[] = [];

    constructor(/**init: { key:string; value:any; }[]**/) {

        // for (var x = 0; x < init.length; x++) 
        // {
        //     this[init[x].key] = init[x].value;
        //     this._keys.push(init[x].key);
        //     this._values.push(init[x].value);
        // }
    }

    public set (key: any, value: any): void {
        if (this[key] == null) {
            this[key] = value;
            this._keys.push(key);
            this._values.push(value);
        }
        else {
            var i: number = this._values.indexOf(value);
            if (i != -1) {
                this._values[i] = value;
            }
            this[key] = value;
        }
    }

    public get (key: any): any {
        return this[key];
    }

    public remove (key: any): void {
        var index = this._keys.indexOf(key, 0);
        this._keys.splice(index, 1);
        this._values.splice(index, 1);

        delete this[key];
    }

    public get keys (): any[] {
        return this._keys;
    }

    public get values (): any[] {
        return this._values;
    }

    public containsKey (key: any): boolean {
        if (typeof this[key] === "undefined") {
            return false;
        }

        return true;
    }

    public clear (): void {
        for (var i: number = 0; i < this.keys.length; i++) {
            //if (this.keys.hasOwnProperty(key)) {
            delete this[this.keys[i]];
            //}
        }
        this._keys = [];
        this._values = [];
    }

    public toLookup (): IDictionary {
        return this;
    }
}
