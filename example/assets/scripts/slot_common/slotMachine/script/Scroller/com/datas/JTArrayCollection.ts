import JTDataInfo from "./JTDataInfo";
import JTRuleTaskManager from "../../rules/JTRuleTaskManager";
import JTConfigGroup from "../JTConfigGroup";
import JTModelFactory from "../factorys/JTModelFactory";
import JTScrollerGroup from "../JTScrollerGroup";
import JTLogger from "../../JTLogger";
import JTFactory from "../factorys/JTFactory";
import JTCollection from "./JTCollection";
import JTElementArrayList from "./JTElementArrayList";
import JTElementCollection from "./JTElementCollection";
import JTChannelPipeline from "../plugins/JTChannelPipeline";
import { JTPipelineTemplate } from "../plugins/procedure/JTPipelineTemplate";
import JTControlScrollerGroup from "../../extensions/JTControlScrollerGroup";
import JTRollerData from "./JTRollerData";

/*
* name;
*/
export default class JTArrayCollection extends JTCollection<JTDataInfo>
{
        protected _grids: JTElementArrayList = null;
        protected _changedGrids: JTElementArrayList = null;
        protected _scroller: JTScrollerGroup = null;

        protected _defaultSourceDataList: JTRollerData[] = [];
        protected _freeSourceDataList: JTRollerData[] = [];

        public static NORMAL_MODE: number = 1;
        public static FREE_MODE: number = 2;

        protected dataMode: number = 1;

        protected rollerId: number = 1;

        constructor() {
                super();
                this._elements = [];

        }

        /**
         * 初始化
         */
        public initialize(): void {
                this._scroller = this._owner as JTControlScrollerGroup;
                this._refDataList = this._scroller.sources;
                this._defaultSourceDataList = [].concat(this._scroller.defaultSources);
                if (this._scroller.freeSources) {
                        this.freeSourceDataList = this._scroller.freeSources;
                }
        }

        /**
         * 更新数据
         * @param grids 格子数据列表
         * @param changedGrids 改变过后的格子数据列表
         */
        public update(grids: any[], changedGrids: any[],gridShapes:any[]=[],gridShapesChanged:any[]=[],occupyPosList:any[]=[],occupyPosListChanged:any[]=[]): void {
                let _grids = [].concat(grids);
                let _changedGrids = [].concat(changedGrids);
                this.updateSourceByGridsConfig(_grids);
                this.updateSourceByGridsConfig(_changedGrids);
                this.convertDataList(_grids,gridShapes,occupyPosList);//转换正常格子需要的数据
                this.convertChangedDataList(_changedGrids,gridShapesChanged,occupyPosListChanged);//转换成改变过后的数据
                let scroller: JTScrollerGroup = this._scroller as JTScrollerGroup;
                (scroller.ruleTaskManager as JTRuleTaskManager).collection = this;
                if (!scroller.items) {
                        this.create();//创建数据集合
                        scroller.create();//创建视图
                        scroller.runningCallTask();
                }
                else {
                        this.updateDataList();
                        this.updateAfterConvertDataList();
                        this.updateShapesAndOccupyList();
                }
        }

        protected updateSourceByGridsConfig(value: any[]): void {
                let gridRenderConfig = this.scroller.gridRenderConfig;
                if (!gridRenderConfig) {
                        return;
                }
                let index = 0;
                for (let col = 0; col < gridRenderConfig.length; col++) {
                        for (let row = 0; row < gridRenderConfig[col].length; row++) {
                                let d = gridRenderConfig[col][row];
                                if (d == 0) {
                                        let id = this.getRondomId();
                                        value.splice(index, 0, id);
                                }
                                index++;
                        }
                }

        }

        //创建数据集合
        protected create(): void {
                let s: JTScrollerGroup = this._scroller;
                let count: number = s.channelPipeline.getCount();
                let f: JTFactory = s.factoryModel;
                for (let i: number = 0; i < count; i++) {
                        let c: JTElementCollection = f.produce(JTModelFactory.SCROLLER_DATA_MODEL) as JTElementCollection;
                        c.grids = f.produce(JTModelFactory.ELEMENT_LIST_DATA_MODEL) as JTElementArrayList;
                        c.changedGrids = f.produce(JTModelFactory.ELEMENT_LIST_DATA_MODEL) as JTElementArrayList;
                        c.elements = [];
                        c.refDataList = s.dataProvider.refDataList[i];
                        let dataProvider = s.dataProvider as JTArrayCollection;
                        c.defaultSourceData = dataProvider.defaultSourceDataList[i];
                        if (dataProvider.freeSourceDataList) {
                                c.freeSourceData = dataProvider.freeSourceDataList[i];
                        }
                        if(this._grids.gridShapes.length>0&&this._changedGrids.gridShapes.length>0){
                           c.updateShapesAndOccupyList(this._grids.gridShapes[i].pos,this._changedGrids.gridShapes[i].pos,this._grids.occupyPosList,this._changedGrids.occupyPosList)
                        }
                        let grids: JTElementArrayList = c.grids as JTElementArrayList;
                        let changedGrids: JTElementArrayList = c.changedGrids as JTElementArrayList;
                        grids.changedDataList = this._grids.changedDataList[i];
                        changedGrids.changedDataList = this._changedGrids.changedDataList[i];
                        this.elements.push(c as JTElementCollection);
                }
                this.updateDataList();
        }

        public forceUpdateDefaultDataList(value: any): void {

                for (let i: number = 0; i < this._elements.length; i++) {
                        let c: JTElementCollection = this._elements[i] as JTElementCollection;
                        c.forceUpdateRefDataList(value[i]);
                }
        }

        /**
         * 更新原始数据列表(未转换的数据列表)
         */
        public updateDataList(): void {
                if(this._grids.gridShapes.length>0&&this._changedGrids.gridShapes.length>0){
                        let dataList: any[] = this.getConvertDataListByGridShape(this._grids.dataList,this._grids.gridShapes,false);
                        let changedDataList: any[] = this.getConvertDataListByGridShape(this._changedGrids.dataList,this._changedGrids.gridShapes,false);
                        for (let i: number = 0; i < this._elements.length; i++) {
                                let c: JTElementCollection = this._elements[i] as JTElementCollection;
                                c.updateSources(dataList[i], changedDataList[i]);

                        }
                }else{
                        let dataList: any[] = this.converToList(this._grids.dataList);
                        let changedDataList: any[] = this.converToList(this._changedGrids.dataList);
                        for (let i: number = 0; i < this._elements.length; i++) {
                                let c: JTElementCollection = this._elements[i] as JTElementCollection;
                                c.updateSources(dataList[i], changedDataList[i]);
                        }
                }
        }

        /**
         * 更新转换过后的数据
         */
        public updateAfterConvertDataList(): void {

                for (let i: number = 0; i < this._elements.length; i++) {
                        let collection: JTElementCollection = this._elements[i] as JTElementCollection;
                        let dataList: any[] = this._grids.changedDataList[i];
                        let changedDataList: any[] = this._changedGrids.changedDataList[i];
                        //collection.resetRefDataList(this.dataMode);
                        collection.update(dataList, changedDataList);
                }
        }

        /**
         * 更新转换过后的数据
         */
        public updateShapesAndOccupyList(): void {
                if(this._grids.gridShapes.length>0&&this._changedGrids.gridShapes.length>0){
                    for (let i: number = 0; i < this._elements.length; i++) {
                         let collection: JTElementCollection = this._elements[i] as JTElementCollection;
                         collection.updateShapesAndOccupyList(this._grids.gridShapes[i].pos,this._changedGrids.gridShapes[i].pos,this._grids.occupyPosList,this._changedGrids.occupyPosList)
                    }
                }
        }

        /**
         * 转换数据列表
         * @param values 需要转换成的数据(grids)
         */
        public convertDataList(values: any[],gridShapes:any[]=[],occupyPosList:any[]=[]): void {
                let scroller: JTScrollerGroup = this._scroller;
                if (!this._grids) {
                        this._grids = scroller.factoryModel.produce(JTModelFactory.ELEMENT_LIST_DATA_MODEL) as JTElementArrayList;
                }
                this._grids.dataList = values;
                if (!scroller.channelPipeline.isEgoClone) {
                        scroller.channelPipeline.egoClone();
                }
                this._grids.gridShapes = gridShapes;
                this._grids.occupyPosList = occupyPosList;
                if(gridShapes.length>0){
                    this._grids.changedDataList = this.getConvertDataListByGridShape(values,gridShapes,true);
                }else{
                    this._grids.changedDataList = this.getConvertDataList(values);
                }
        }

        public getConvertDataListByGridShape(values:any[],gridShapes:any[],isConvertMore:boolean):any[]{
               let list = [];
               let index = 0;
               for(let i=0;i<gridShapes.length;i++){
                  let dataList = [];
                  let p = gridShapes[i].pos;
                  isConvertMore&&dataList.push(this.getRandomIDbyCol(i));
                  for(let j=0;j<p.length;j++){
                      dataList.push(values[index]);
                      index++;
                  }
                  isConvertMore&&dataList.push(this.getRandomIDbyCol(i));
                  list.push(dataList)
               }

               return list;
        }

        /**
        * 转换数据列表
        * @param values 需要转换成的数据(changedGrids)
        */
        public convertChangedDataList(values: any[],gridShapes:any[]=[],occupyPosList:any[]=[]): void {
                let scroller: JTScrollerGroup = this._scroller;
                if (!this._changedGrids) {
                        this._changedGrids = scroller.factoryModel.produce(JTModelFactory.ELEMENT_LIST_DATA_MODEL) as JTElementArrayList;
                }
                this._changedGrids.dataList = values;
                this._changedGrids.gridShapes = gridShapes;
                this._changedGrids.occupyPosList = occupyPosList;
                if(gridShapes.length>0){
                   this._changedGrids.changedDataList = this.getConvertDataListByGridShape(values,gridShapes,true);
                }else{
                   this._changedGrids.changedDataList = this.getConvertDataList(values);
                }

        }


        /**
         * 把一个一维数据拆分成按指定个数的 一个二维数组
         * @param values 一维数组
         * @param count 需要按N个来拆分
         */
        public getConvertToList(values: any[], count: number): any[] {
                let list: any[] = [];
                for (let i: number = 0; i < count; i++) {
                        list.push(values.shift());
                }
                return list;
        }


        /**
         * 按参数配置来转换二维数据
         * @param value 一维数组
         */
        public converToList(value: any[]): any[] {
                let list: any[] = [];
                let v: any[] = [];
                let index: number = 0;
                let config: JTConfigGroup = this._scroller.config;
                for (let i: number = 0; i < value.length; i++) {
                        if (i % config.row == 0) {
                                if (list || !list) list = [];
                        }
                        list.push(value[i])
                        if (list.length == config.row) {
                                v.push(list);
                        }
                }
                return v;
        }

        /**
         * 将一个没有转换的一维数组，通过实例传入的类型来组装数组（二维数组）
         * @param values 原始数据列表
         */
        public getConvertDataList(values: any[]): any[] {
                let channelPipeline: JTChannelPipeline = this._scroller.channelPipeline;
                let totalCount: number = channelPipeline.getCount();
                let datas: any[] = [].concat(values);
                let list: any[] = [];
                let count: number = values.length / totalCount;
                for (let i: number = 0; i < totalCount; i++) {
                        let pipeline: JTPipelineTemplate = channelPipeline.getTemplate(i) as JTPipelineTemplate;
                        let dataType: number = pipeline.dataListType;
                        let dataList: any[] = null;
                        switch (dataType) {
                                case JTScrollerGroup.USE_CONVERT_MROE_LIST:
                                        {
                                                dataList = this.getConvertToMoredataList(datas, i);
                                                break;
                                        }
                                case JTScrollerGroup.USE_CONVERT_TO_LIST:
                                        {
                                                dataList = this.getConvertToList(datas, count);
                                                break;
                                        }
                                default:
                                        {
                                                JTLogger.warn("Cant find convert dataType!");
                                                break;
                                        }
                        }
                        list.push(dataList);
                }
                return list;
        }

        /**
         * 将一个没有转换的一维数组转换成一个二维数组(首和尾添加元素)
         * @param values 一维数组
         * @param count 需要按N个来拆分
         */
        public getConvertToMoredataList(values: any[], col: number): any[] {
                let list: any[] = [];
                let config: JTConfigGroup = this._scroller.config;

                //如果有0元素的话就需要出现两个非0元素之间必须夹着一个0元素 以免出现元素高度设置很小的两个元素出现堆叠情况 参考bug = 9579
                if (values.includes(0)) {
                        for (let i: number = 0; i < config.row; i++) {
                                if (i == 0) {
                                        if (values[0] == 0) {
                                                list.push(this.getRandomIDbyCol_exZero(col));
                                        } else {
                                                list.push(0)
                                        }
                                }
                                list.push(values.shift());
                                if (i == config.row - 1) {
                                        if (list[list.length - 1] == 0) {
                                                list.push(this.getRandomIDbyCol_exZero(col));
                                        } else {
                                                list.push(0)
                                        }
                                }
                        }
                } else {
                        for (let i: number = 0; i < config.row; i++) {
                                if (i == 0) {
                                        list.push(this.getRandomIDbyCol(col));
                                }
                                list.push(values.shift());
                                if (i == config.row - 1) {
                                        list.push(this.getRandomIDbyCol(col));

                                }
                        }
                }
                return list;
        }

        /**
         * 获取随机数
         */
        public getRondomId(): number {
                let source = this.scroller.defaultImageIds;
                let index: number = Math.floor(Math.random() * source.length);
                return source[index];
        }


        public getRandomIDbyCol(col: number): number {
                let source: number[] = this._refDataList[col];
                let index: number = Math.floor(Math.random() * source.length);
                return source[index];
        }


        /**随机排除0元素 */
        public getRandomIDbyCol_exZero(col: number): number {
                let source: number[] = this._refDataList[col].filter((num) => { return num > 0 });
                let index: number = Math.floor(Math.random() * source.length);
                return source[index];
        }

        /**
         * 更新原数据列表
         * @param grids 没有改变的格子数据列表
         * @param changeds 没有 改变的格子数据列表
         */
        public updateSources(grids: any[], changeds: any[]): void {
                this._grids.dataList = grids;
                this._changedGrids.dataList = changeds;
        }


        /**
         * 转换成二维数组(自动按参数配置转换成二维数组，<数据单位是统一的>)
         * @param value 没有转换的数据列表
         */
        public converToMoredataList(value: any[]): any[] {
                let list: any[] = [];
                let v: any[] = [];
                let index: number = 0;
                let config: JTConfigGroup = this._scroller.config;
                for (let i: number = 0; i < value.length; i++) {
                        if (i % config.row == 0) {
                                if (list || !list) list = [];
                                list.push(this.getRondomId())
                        }
                        list.push(value[i])
                        if (list.length == config.row + 1) {
                                list.push(this.getRondomId());
                                v.push(list);
                        }
                }
                return v;
        }

        public setDataMode(mode: number, rollerId: number = 1, colIndexs: number[] = []): void {
                this.dataMode = mode;
                this.rollerId = rollerId;
                if (colIndexs.length > 0) {
                        for (let i: number = 0; i < colIndexs.length; i++) {
                                let col = colIndexs[i];
                                let collection: JTElementCollection = this._elements[col] as JTElementCollection;
                                collection.resetRefDataList(this.dataMode, this.rollerId);
                        }
                } else {
                        for (let i: number = 0; i < this._elements.length; i++) {
                                let collection: JTElementCollection = this._elements[i] as JTElementCollection;
                                collection.resetRefDataList(this.dataMode, this.rollerId);
                        }
                }

        }

        //没有改变格子的列表
        public get grids(): JTElementArrayList {
                return this._grids;
        }

        public set grids(value: JTElementArrayList) {
                this._grids = value;
        }


        //改变的数据列表
        public get changedGrids(): JTElementArrayList {
                return this._changedGrids;
        }

        public set changedGrids(value: JTElementArrayList) {
                this._changedGrids = value;
        }

        //当前数据的滚轴视图
        public get scroller(): JTScrollerGroup {
                return this._scroller;
        }

        public set scroller(value: JTScrollerGroup) {
                this._scroller = value;
        }

        /**
     * 默认的假数据
     */
        public get defaultSourceDataList(): JTRollerData[] {
                return this._defaultSourceDataList;
        }

        public set defaultSourceDataList(value: JTRollerData[]) {
                this._defaultSourceDataList = value;
        }

        /**
         * 免费下的假数据
         */
        public get freeSourceDataList(): JTRollerData[] {
                return this._freeSourceDataList;
        }

        public set freeSourceDataList(value: JTRollerData[]) {
                this._freeSourceDataList = value;
        }
}