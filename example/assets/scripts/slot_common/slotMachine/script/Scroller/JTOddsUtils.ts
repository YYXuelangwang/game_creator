import JTItemRender from "./com/base/JTItemRender";
import JTLineDirection from "./lines/JTLineDirection";
import JTLogger from "./JTLogger";
import { SDictionary } from "../SlotData/SDictionary";
import RollingResult from "../SlotData/RollingResult";
import SlotConfigManager from '../SlotManager/SlotConfigManager';
import JTLineScrollerGroup from "./extensions/JTLineScrollerGroup";
import JTScroller from "./com/JTScroller";
import JTChildFactory from "./com/factorys/JTChildFactory";
import JTLineType from "./lines/JTLineType";

/*
* name;
*/


export default class JTOddsUtils {
        private static oddLineMap: SDictionary = new SDictionary();
        public static computeOdds(localtions: number[], oddsLines: any[], ids: any[]): any[] {
                var list: any[] = [];
                for (var i: number = 0; i < oddsLines.length; i++) {
                        var lines: any[] = oddsLines[i];
                        var rowValues: number[] = this.getRowValues(localtions, lines);
                        //   var rowLines:Object[] = this.compare(rowValues, ids, i);
                        //   if (!rowLines)
                        //   {
                        //         continue;
                        //   }
                        //   JTLogger.info(rowLines[0]["odds"],                "rowLines               " + rowLines[0]["list"].toString());
                        list.push(rowValues);
                }
                return list;
        }

        public static getRowValues(localtions: number[], indexs: number[]): number[] {
                var list: number[] = [];
                for (var i: number = 0; i < indexs.length; i++) {
                        var index: number = indexs[i];
                        var value: number = localtions[index - 1];
                        list.push(value);
                }
                return list;
        }

        public static compare(rowValues: number[], ids: any[], oddsIndex: number): Object[] {
                var lines: Object[] = null;
                var rowStr: string = rowValues.toString() + ",";
                for (var i: number = 0; i < ids.length; i++) {
                        var oddsInfo: number[] = ids[i];
                        var value: number = oddsInfo[0];
                        var matchs: number[] = this.matchStr(rowValues, value);
                        if (!matchs) {
                                continue;
                        }
                        var odds: Object = this.getOddsValue(matchs, oddsInfo, matchs.length);
                        if (!odds) {
                                continue;
                        }
                        if (!lines) lines = [];
                        lines.push(odds);
                }
                return lines;
        }

        private static getOddsValue(matchs: number[], oddsInfo: Object, length: number): Object {
                var content: Object = null;
                if (matchs.length == length && oddsInfo[length] != 0) {
                        content = {};
                        content["list"] = matchs;
                        content["odds"] = oddsInfo[length];
                }
                return content;
        }

        private static matchStr(rowValues: number[], match: number): number[] {
                var list: number[] = null;
                var length: number = rowValues.length;
                var index: boolean = rowValues[0] == match || rowValues[length - 1] == match;
                if (!index) {
                        return null;
                }
                if (rowValues[0] == match) {
                        list = [];
                        for (let i: number = 0; i < rowValues.length; i++) {
                                let value: number = rowValues[i];
                                if (value != match) {
                                        break;
                                }
                                list.push(value);
                        }
                }
                if (rowValues[length - 1] == match) {
                        list = [];
                        for (let i: number = rowValues.length - 1; i > 0; i--) {
                                let value: number = rowValues[i];
                                if (value != match) {
                                        break;
                                }
                                list.push(value);
                        }
                }
                return list;
        }

        public static formateOdds(list: number[]): string {
                var content: string = "\n";
                var oddsList: any[] = [];
                for (var i: number = 0; i < list.length; i++) {
                        var rows: number[] = oddsList[i % 3];
                        if (!rows) {
                                rows = [];
                                oddsList.push(rows);
                        }
                        rows.push(list[i])
                }
                i = 0;
                for (i; i < oddsList.length; i++) {
                        content += oddsList[i].toString() + "\n";
                }
                return content;

        }

        public static toArrayValues(map: Object, splitIndex: number = 0): any[] {
                var list: any[] = [];
                for (var key in map) {
                        var rows: number[] = [];
                        for (var k in map[key]) {
                                var item: number = map[key][k];
                                rows.push(Number(item))
                        }
                        rows.splice(splitIndex, 1);
                        list.push(rows)
                }
                return list;
        }


        public static getOddsLineRenders(scroller: JTLineScrollerGroup, lineId: number, lineMode: number = 1, lineType: number = 1): JTItemRender[] {
                let gameID = scroller.gameID;
                let key: string = this.getLineString(gameID, lineMode, lineId, lineType);
                let lineConfig: JTLineConfig = this.oddLineMap[key];
                if (!lineConfig) {
                        let config: any = scroller.lineConfig.getData(lineId);
                        let colorConfig: JTLineConfig = new JTLineConfig();
                        if (!config) {
                                config = SlotConfigManager.instance.DataFreePayLine;
                                config = config.getData(lineId);
                        }
                        else {
                                colorConfig.color = config.lineColor[0].color ? config.lineColor[0].color.replace(/ /g, "") : "";
                        }
                        let types: any[] = config.type || [];
                        let posList: any[] = config.linePos || [];
                        lineConfig = new JTLineConfig();
                        lineConfig.indexs = [];
                        for (let i: number = 0; i < types.length; i++) {
                                let type: any = types[i];
                                if (type.lineType != lineType && type.lineType != JTLineType.LIGATURE_REPLACE&&type.lineType!=JTLineType.APPOINT_LINE) continue;
                                let pos: any = null;
                                for (let j: number = 0; j < posList.length; j++) {
                                        pos = posList[j];
                                        if (pos.index != type.index) continue;
                                        break;
                                }
                                lineConfig.indexs = pos.elems;
                                break;
                        }
                        this.oddLineMap[lineId] = colorConfig;
                        this.oddLineMap[key] = lineConfig;
                }
                let rs: JTItemRender[] = [];
                for (let i: number = 0; i < lineConfig.indexs.length; i++) {
                        let r: JTItemRender = scroller.getRenderByIndex(lineConfig.indexs[i]) as JTItemRender;
                        if (r)
                                rs.push(r);
                }
                return rs;
        }
        
        /**
         * 获取线的元素位置索引配置，数据以1开始
         * @param scroller 
         * @param lineId 
         * @param lineMode 
         * @param lineType 
         * @returns 
         */
        public static getOddsLineIndexs(scroller: JTLineScrollerGroup, lineId: number, lineMode: number = 1, lineType: number = 1): number[] {
                let gameID = scroller.gameID;
                let key: string = this.getLineString(gameID, lineMode, lineId, lineType);
                let lineConfig: JTLineConfig = this.oddLineMap[key];
                if (!lineConfig) {
                        let config: any = scroller.lineConfig.getData(lineId);
                        let colorConfig: JTLineConfig = new JTLineConfig();
                        if (!config) {
                                config = SlotConfigManager.instance.DataFreePayLine;
                                config = config.getData(lineId);
                        }
                        else {
                                colorConfig.color = config.lineColor[0].color ? config.lineColor[0].color.replace(/ /g, "") : "";
                        }
                        let types: any[] = config.type || [];
                        let posList: any[] = config.linePos || [];
                        lineConfig = new JTLineConfig();
                        lineConfig.indexs = [];
                        for (let i: number = 0; i < types.length; i++) {
                                let type: any = types[i];
                                if (type.lineType != lineType) continue;
                                let pos: any = null;
                                for (let j: number = 0; j < posList.length; j++) {
                                        pos = posList[j];
                                        if (pos.index != type.index) continue;
                                        break;
                                }
                                lineConfig.indexs = pos.elems;
                                break;
                        }
                        this.oddLineMap[lineId] = colorConfig;
                        this.oddLineMap[key] = lineConfig;
                }

                return lineConfig.indexs;
        }

        public static getInclusiveContinueRenders(scroller: JTLineScrollerGroup, line: RollingResult): JTItemRender[] {
                let lineId: any = line.lineId;
                let list: JTItemRender[] = [];
                let config: any = scroller.lineConfig.getData(lineId);
                if (!config) {
                        config = SlotConfigManager.instance.DataFreePayLine;
                        config = config.getData(lineId);
                }
                let linePos: any = config.linePos[0];
                let elems: any[] = [].concat(linePos.elems);
                let assignElements: any[] = config.assignElement;
                let assignElement: any = this.fromArrayByIndex(assignElements, 1, "index");
                let assignElemts: any[] = [].concat(assignElement.elems);
                let scatterId: number = assignElemts[0];
                let isScatterId: boolean = false;
                if (scatterId == line.eleId) {
                        isScatterId = true;
                }
                for (let i: number = 0; i < elems.length; i++) {
                        let index: number = (elems[i] - 1);
                        let s: JTScroller = scroller.getItem(index) as JTScroller;
                        let rs: JTItemRender[] = s.getSomeChangedById(line.eleId);;
                        if (isScatterId) {
                                for (let j: number = 1; j < assignElemts.length; j++) {
                                        let id: any = assignElemts[j];
                                        rs = rs.concat(s.getSomeChangedById(id))
                                }
                        }
                        if (rs.length == 0) {
                                list.length = 0;
                                continue;
                        }
                        list.push(rs.shift());
                        if (list.length == line.eleNum) {
                                break;
                        }
                }
                return list;
        }

        public static fromArrayByIndex(list: any[], value: number, property: string): any {
                for (let i: number = 0; i < list.length; i++) {
                        let item: any = list[i];
                        if (item[property] != value) {
                                continue;
                        }
                        return item;
                }
                return null;
        }

        public static getFiexdScrollerRenders(scroller: JTLineScrollerGroup, line: RollingResult): JTItemRender[] {
                let lineId: any = line.lineId;
                let list: JTItemRender[] = [];
                let config: any = scroller.lineConfig.getData(lineId);
                if (!config) {
                        config = SlotConfigManager.instance.DataFreePayLine;
                        config = config.getData(lineId);
                }
                let linePos: any = config.linePos[0];
                let elems: any[] = [].concat(linePos.elems);
                if (line.direction == JTLineDirection.DIRECTION_RIGHT) {
                        elems = elems.reverse();
                }
                let assignElements: any[] = config.assignElement;
                let assignElement: any = this.fromArrayByIndex(assignElements, 1, "index");
                let assignElemts: any[] = [].concat(assignElement.elems);
                let scatterId: number = assignElemts[0];
                let isScatterId: boolean = false;
                if (scatterId == line.eleId) {
                        isScatterId = true;
                }
                for (let i: number = 0; i < elems.length; i++) {
                        let index: number = (elems[i] - 1);
                        let s: JTScroller = scroller.getItem(index) as JTScroller;
                        let rs: JTItemRender[] = s.getSomeChangedById(line.eleId);
                        if (isScatterId) {
                                for (let j: number = 1; j < assignElemts.length; j++) {
                                        let id: any = assignElemts[j];
                                        rs = rs.concat(s.getSomeChangedById(id))
                                }
                        }
                        if (rs.length == 0) continue;
                        let r: JTItemRender = rs.shift();
                        list.push(r);
                        if (list.length == line.eleNum) break;
                }
                return list;
        }


        public static getLineKey(line: RollingResult): string {
                return "lineMode:" + line.lineMode + "lineId:" + line.lineId + "dir:" + line.direction + "lineType:" + line.lineType + "elementId:" + line.eleId;
        }

        public static getLineString(gameID: number, lineMode: number, lineId: number = 1, lineType: number = 1, direction: number = 1): string {
                return "gameID" + gameID + "lineMode: " + lineMode + "lineId" + lineId + "dir" + direction + "lineType " + lineType;
        }

        public static getColor(lineId: number): string {
                return this.oddLineMap[lineId].color;
        }

        /** 中奖线 */
        public static getLineRenders(line: RollingResult, scroller: JTLineScrollerGroup): JTItemRender[] {
                let list: JTItemRender[] = [];
                let rs: JTItemRender[] = this.getOddsLineRenders(scroller, line.lineId, line.lineMode, line.lineType);
                let id: number = line.eleId;
                if (line.direction == 1) {
                        for (var i: number = 0; i < line.eleNum; i++) {
                                let r: JTItemRender = rs.shift(); //取第一位，从左往右
                                if (!r) {
                                        break;
                                }
                                // if ((scroller.factoryChild as JTChildFactory).isExdWild(r, line, i, scroller))//去掉这个判断元素的，只以服务器发的位置为准
                                list.push(r);
                        }
                }
                else if (line.direction == 2) {
                        for (var i: number = 0; i < line.eleNum; i++) {
                                let r: JTItemRender = rs.pop(); //取最后一位，从右往左
                                if (!r) {
                                        break;
                                }
                                // if ((scroller.factoryChild as JTChildFactory).isExdWild(r, line, i, scroller))
                                list.push(r);
                        }
                }
                else {
                        JTLogger.warn("Can't find line.direction :  " + line.direction);
                }
                if (list.length == 0) {
                        JTLogger.warn(" ________________________________________>>>>>>>>    get odds error!");
                }
                return list;
        }

        public static getAppointLineRenders(line: RollingResult, scroller: JTLineScrollerGroup): JTItemRender[] {
                let list: JTItemRender[] = [];
                let rs: JTItemRender[] = this.getOddsLineRenders(scroller, line.lineId, line.lineMode, line.lineType);
                if (line.direction == 1) {
                        for (var i: number = 0; i < line.eleNum; i++) {
                                let r: JTItemRender = rs.shift(); //取第一位，从左往右
                                if (!r) {
                                        break;
                                }
                                list.push(r);
                        }
                }
                else if (line.direction == 2) {
                        for (var i: number = 0; i < line.eleNum; i++) {
                                let r: JTItemRender = rs.pop(); //取最后一位，从右往左
                                if (!r) {
                                        break;
                                }
                                list.push(r);
                        }
                }
                else {
                        JTLogger.warn("Can't find line.direction :  " + line.direction);
                }
                if (list.length == 0) {
                        JTLogger.warn(" ________________________________________>>>>>>>>    get odds error!");
                }
                return list;
        }

        public static getFiexdLineRenders(line: RollingResult, scroller: JTLineScrollerGroup): JTItemRender[] {

                let list: JTItemRender[] = [];
                let rs: JTItemRender[] = this.getOddsLineRenders(scroller, line.lineId, line.lineMode, line.lineType);
                let tempRs = rs.slice();
                let id: number = line.eleId;
                let count: number = rs.length;
                if (line.direction == 1) {
                        for (var i: number = 0; i < count; i++) {
                                let r: JTItemRender = rs.shift(); //取第一位，从左往右
                                // if ((scroller.factoryChild as JTChildFactory).isExdWild(r, line, i, scroller, tempRs))
                                //         list.push(r);
                                if(line.eleList.includes(r.changedData)){
                                         list.push(r);
                                }

                        }
                }
                else if (line.direction == 2) {
                        for (var i: number = 0; i < count; i++) {
                                let r: JTItemRender = rs.pop(); //取最后一位，从右往左
                                // if ((scroller.factoryChild as JTChildFactory).isExdWild(r, line, i, scroller, tempRs))
                                //         list.push(r);
                                if(line.eleList.includes(r.changedData)){
                                        list.push(r);
                                }
                        }
                }
                else {
                        JTLogger.warn("Can't find line.direction :  " + line.direction);
                }
                if (list.length == 0) {
                        JTLogger.warn(" ________________________________________>>>>>>>>    get odds error!");
                }
                return list;
        }
        
        /**
         * 根据服务器winPos获取中奖元素
         * @param line 
         * @param scroller 
         * @returns 
         */
        public static getAppointIndexRenders(line: RollingResult, scroller: JTLineScrollerGroup):JTItemRender[]{
                let list:JTItemRender[] = [];
                for(let index of line.winPos){
                    let r = scroller.getRenderByIndex(index);
                    list.push(r);
                }
                return list;
        }

        public static destroy(): void {
                this.oddLineMap = new SDictionary();
        }

}

class JTLineConfig {
        indexs: number[];
        color: string;
}