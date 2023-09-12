import JTGroup from "../base/JTGroup";
import JTFuturePipeline from "../plugins/JTFuturePipeline";
import JTDataInfo from "./JTDataInfo";

export default class JTCollection<T extends JTDataInfo> extends JTDataInfo {

    protected _defaultDataList: any[] = null;
    protected _freeDataList:any[] = null;
    protected _refDataList:any[] = null;
    protected _grids: T = null;
    protected _elements: T[] = null;
    protected _scroller: JTGroup = null;
    protected _pipeline: JTFuturePipeline = null;
    protected _changedGrids: any = null;

    /**
    * 未改变的格子数据
     */
    public get grids(): T {
        return this._grids;
    }

    public set grids(value: T) {
        this._grids = value;
    }

    // /**
    //  * 默认的假数据
    //  */
    // public get defaultDataList(): any[] {
    //     return this._defaultDataList;
    // }

    // public set defaultDataList(value: any[]) {
    //     this._defaultDataList = value;
    // }

    // /**
    // * 免费下的假数据
    // */
    // public get freeDataList(): any[] {
    //     return this._freeDataList;
    // }

    // public set freeDataList(value: any[]) {
    //     this._freeDataList = value;
    // }

    /**
    * 假数据的关联引用,关联JTGroup的sources
    */
    public get refDataList(): any[] {
        return this._refDataList;
    }

    public set refDataList(value: any[]) {
        this._refDataList = value;
    }

    /**
 * 元素数据列表
 */
    public get elements(): T[] {
        return this._elements;
    }

    public set elements(value: T[]) {
        this._elements = value;
    }

    /**
 * 改变过后的格子数据
 */
    public get changedGrids(): T {
        return this._changedGrids;
    }

    public set changedGrids(value: T) {
        this._changedGrids = value;
    }

    /**
 * 数据视图
 */
    public set scroller(value: JTGroup) {
        this._scroller = value;
    }

    public get scroller(): JTGroup {
        return this._scroller;
    }

    /**
     * 更新
     * dataList:原始的数据列表
     * changedDataList:改变的数据列表
     */
    update(dataList: any[], changedDataList: any[]): void {

    }
}
