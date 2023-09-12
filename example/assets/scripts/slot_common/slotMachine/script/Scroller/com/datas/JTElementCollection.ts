import JTDataInfo from "./JTDataInfo";
import JTElementArrayList from "./JTElementArrayList";
import JTCollection from "./JTCollection";
import JTGroup from "../base/JTGroup";
import JTElementData from "./JTElementData";
import JTScroller from "../JTScroller";
import JTArrayCollection from "./JTArrayCollection";
import JTRollerData from "./JTRollerData";

/*
* name;
*/
export default class JTElementCollection extends JTCollection<JTDataInfo>
{
    protected _grids: JTElementArrayList = null;
    protected _elements: JTElementData[] = null;

    protected _defaultSourceData: JTRollerData = null;
    protected _freeSourceData: JTRollerData = null;


    /**
     * 更新的转换过后的数据列表
     * @param grids 转换过后的未改变数据列表
     * @param changedGrids  转换过后的改变数据列表
     */
    public update(grids: any[], changedGrids: any[]): void {
        this._grids.changedDataList = grids;
        this._changedGrids.changedDataList = changedGrids;
        //this.resetRefDataList();
        this.refDataList.splice(0, (this._scroller.config.row + 2));
        (this._scroller as JTScroller).pipeline.beforeStart();
        this.syncRefDataList();
    }

    public resetRefDataList(mode: number, rollerId: number): void {
        this.refDataList.splice(0, this.refDataList.length);
        if (mode == JTArrayCollection.FREE_MODE && this.freeSourceData) {
            let freeElements = this.freeSourceData.getElementsByRollerId(rollerId);

            for (let i = 0; i < freeElements.length; i++) {
                let data = freeElements[i];
                this.refDataList.push(data);
            }
        } else {
            let elements = this.defaultSourceData.getElementsByRollerId(rollerId);

            for (let i = 0; i < elements.length; i++) {
                let data = elements[i];
                this.refDataList.push(data);
            }
        }

    }

    /**
     * 更新未转换过后的数据列表
     * @param dataList 未转换过的未改变的数据列表
     * @param changedDataList 未转换过的改变过后的数据列表
     */
    public updateSources(dataList: any[], changedDataList: any[]): void {
        this._grids.dataList = dataList;
        this._changedGrids.dataList = changedDataList;
    }


    public updateShapesAndOccupyList(gridShapes: any[], gridShapesChanged: any[],occupyPosList:any[],occupyPosListChanged:any[]): void {
        this._grids.gridShapes = gridShapes;
        this._grids.occupyPosList = [];

        for(let g of gridShapes){
            let o = occupyPosList.filter((v)=>{
                return v.pos == g;
            });
            if(o){
                this._grids.occupyPosList = this._grids.occupyPosList.concat(o);
            }
        }
        this._changedGrids.gridShapes = gridShapesChanged;
        this._changedGrids.occupyPosList = [];
        for(let g of gridShapesChanged){
            let o = occupyPosListChanged.filter((v)=>{
                return v.pos == g;
            });
            if(o){
                this._changedGrids.occupyPosList = this._changedGrids.occupyPosList.concat(o);
            }
        }
    }

    /**
     * 安装数据模型视图
     * @param s 
     */
    public setupModel(s: JTScroller): void {
        this._scroller = s;
        this._pipeline = s.pipeline;
    }

    /**
     * 同步假数据列表
     */
    public syncRefDataList(): void {
        let list: any[] = this._grids.changedDataList;
        //如果有0元素的话就需要出现两个非0元素之间必须夹着一个0元素 以免出现元素高度设置很小的两个元素出现堆叠情况 参考bug = 9579
        if (this.refDataList.includes(0)) {
            let last = this.refDataList.pop();
            let listLast = list[list.length - 1]
            if (last != 0 && listLast != 0) {
                this.refDataList.push(0)
            }else {
                this.refDataList.push(last);
            }
        }
        for (let i: number = list.length - 1; i >= 0; i--) {
            this.refDataList.push(list[i]);
        }
    }

    public forceUpdateRefDataList(value: any): void {

        this.refDataList.splice(0);
        for (let i: number = 1; i < value.length; i++) {
            this.refDataList.push(value[i]);
        }
    }

    /**
     * 未改变的格子数据
     */
    public get grids(): JTElementArrayList {
        return this._grids;
    }

    public set grids(value: JTElementArrayList) {
        this._grids = value;
    }

    /**
     * 改变过后的格子数据
     */
    public get changedGrids(): JTElementArrayList {
        return this._changedGrids;
    }

    public set changedGrids(value: JTElementArrayList) {
        this._changedGrids = value;
    }


    /**
     * 元素数据列表
     */
    public get elements(): JTElementData[] {
        return this._elements;
    }

    public set elements(value: JTElementData[]) {
        this._elements = value;
    }

    /**
     * 通过索引获取元素数据
     * @param index 索引 
     */
    public getElementAt(index: number): JTElementData {
        return this._elements[index];
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
     * 默认的假数据
     */
    public get defaultSourceData(): JTRollerData {
        return this._defaultSourceData;
    }

    public set defaultSourceData(value: JTRollerData) {
        this._defaultSourceData = value;
    }

    /**
    * 免费下的假数据
    */
    public get freeSourceData(): JTRollerData {
        return this._freeSourceData;
    }

    public set freeSourceData(value: JTRollerData) {
        this._freeSourceData = value;
    }
}
