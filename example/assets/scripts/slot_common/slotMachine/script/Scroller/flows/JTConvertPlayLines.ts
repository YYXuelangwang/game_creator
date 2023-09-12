import JTParseTask from "./JTParseTask";
import JTOddsUtils from "../JTOddsUtils";
import JTLineType from "../lines/JTLineType";
import JTLogger from "../JTLogger";
import { SDictionary } from "../../SlotData/SDictionary";
import RollingResult from "../../SlotData/RollingResult";
import JTLineScrollerGroup from "../extensions/JTLineScrollerGroup";
import JTItemRender from "../com/base/JTItemRender";
import JTScrollerLineParser from "../lines/JTScrollerLineParser";
import SpinManager from "../../SlotManager/SpinManager";
import JTRuleTaskType from "../rules/JTRuleTaskType";
import JTCombineTask from "../rules/JTCombineTask";
import { JTRetainWildTask } from "../rules/JTRetainWildTask";
import BaseSpinSlotView from "../../MainView/BaseSpinSlotView";
import JTScatterTask from "../rules/JTScatterTask";
import JTLineRender from "../lines/JTLineRender";

/*
* name;//转换线列表
*/
export default class JTConvertPlayLines extends JTParseTask {
    constructor() {
        super();
    }

    /**
     * 运行检测当前中奖线是哪一种玩法，并按其玩法转换成相应的渲染器列表
     */
    public runningTask(): void {
        let lines: any[] = this.getLineResults() || [];
        let lineParser: JTScrollerLineParser = this.getLineParser();
        let _scroller: JTLineScrollerGroup = lineParser.owner as JTLineScrollerGroup;
        lineParser.playLineMap = new SDictionary();

        // if(!lineParser.isInitiative){
        //     this.complete();
        //     return;
        // }

        let wildIds = [];
        if (SpinManager.instance.rollingResult && SpinManager.instance.rollingResult.updateList) {
            let data = SpinManager.instance.rollingResult.updateList.find((v) => {
                return v.type == 4;
            })
            if (data) {
                wildIds = data.value.wild.concat([]);
            }
            lineParser.dynamicWildId = wildIds;
        }

        let combine = _scroller.getRuleTask(JTRuleTaskType.COMBINE) as JTCombineTask;
        let retainWild = _scroller.getRuleTask(JTRuleTaskType.RETAIN_WILD_TASK) as JTRetainWildTask;
        let scatter = _scroller.getRuleTask(JTRuleTaskType.SCATTER) as JTScatterTask;

        for (var i: number = 0; i < lines.length; i++) {
            let lineInfo: RollingResult = lines[i];
            let rs: JTItemRender[] = [];
            let urs: JTItemRender[] = [];
            let lineKey: string = JTOddsUtils.getLineKey(lineInfo);
            switch (lineInfo.lineType) {
                case JTLineType.LINE://连线模式
                    {
                        rs = JTOddsUtils.getLineRenders(lineInfo, _scroller);
                        let ars = JTOddsUtils.getOddsLineRenders(_scroller, lineInfo.lineId, lineInfo.lineMode, lineInfo.lineType);
                        urs = ars.filter((a) => {
                            return !rs.includes(a);
                        })
                        break;
                    }
                case JTLineType.APPOINT://指定
                    {
                        rs = JTOddsUtils.getFiexdLineRenders(lineInfo, _scroller);
                        break;
                    }
                case JTLineType.SCROLLER://滚轴
                    {
                        rs = JTOddsUtils.getFiexdScrollerRenders(_scroller, lineInfo);
                        break;
                    }
                case JTLineType.INCLUSIVE://非首尾连线---暂未扩展
                    {
                        rs = JTOddsUtils.getLineRenders(lineInfo, _scroller);
                        break;
                    }
                case JTLineType.INCLUSIVE_CONNTIONE: //非首尾连线（连续）
                    {
                        rs = JTOddsUtils.getInclusiveContinueRenders(_scroller, lineInfo);
                        break;
                    }
                case JTLineType.SCATTER://全局分散
                    {
                        rs = _scroller.getSomesById(lineInfo.eleId);
                        if(scatter){
                            for (let j = 0; j < rs.length; j++) {
                                let r = rs[j] as BaseSpinSlotView;
                                if(scatter.isIgnoreItem(r)){
                                    rs.splice(j, 1);
                                    j--;
                                }
                            }
                        }

                        break;
                    }
                case JTLineType.FULL_LINE://满线
                    {
                        rs = JTOddsUtils.getAppointIndexRenders(lineInfo, _scroller);
                        break;
                    }
                case JTLineType.APPOINT_LINE://指定线
                    {
                        rs = JTOddsUtils.getAppointLineRenders(lineInfo, _scroller);
                        break;
                    }
                case JTLineType.LIGATURE_REPLACE://连线替代
                    {
                        rs = JTOddsUtils.getAppointIndexRenders(lineInfo, _scroller);
                        break;
                    }
                case JTLineType.UN_CONNTIONE_FULL_LINE://非连续满线
                    {
                        rs = JTOddsUtils.getAppointIndexRenders(lineInfo, _scroller);
                        break;
                    }
                case JTLineType.DESPERSE_REPLACE_LINE://替代元素全局分散
                    {
                        rs = JTOddsUtils.getAppointIndexRenders(lineInfo, _scroller);
                        break;
                    }
                default:
                    {
                        JTLogger.info("Can't Find The Line Type!!!")
                        break;
                    }
            }
            combine && combine.checkPlayLineItem(rs);
            retainWild && retainWild.checkPlayLineItem(rs);
            this.changeRenders && this.changeRenders(rs as BaseSpinSlotView[], lineInfo);
            let jtLineInfo = lineParser.converToRenderInfo(rs, lineInfo, urs);
            lineParser.playLineMap.set(lineKey, jtLineInfo);
            let lineRender: JTLineRender = lineParser.lineMap.get(lineInfo.lineId);
            if (lineRender) {
                lineRender.changedSkinnable(jtLineInfo);
            }
        }
        this.generateSpecialLine();
        if (lineParser.playLineMap.values.length == 0) {
            this.complete();
            return;
        }
        console.log("流程：JTConvertPlayLines完成");
        if (this.lineParser.isInitiative)
            this.enableds();
        this.complete();
    }

    private generateSpecialLine(): void {
        let lineParser: JTScrollerLineParser = this.getLineParser();
        let rs = [];
        if (this.getSpecialLineRenders) {
            rs = this.getSpecialLineRenders();
        }
        if (rs && rs.length > 0) {
            let lineInfo: RollingResult = new RollingResult();
            lineInfo.lineId = 0;
            lineInfo.lineType = 2;
            lineInfo.lineMode = 1;
            lineInfo.direction = 1;
            lineInfo.winCoin = 0;
            let lineKey: string = JTOddsUtils.getLineKey(lineInfo);
            lineParser.playLineMap.set(lineKey, lineParser.converToRenderInfo(rs, lineInfo, []));
        }
    }

    /**
     * 返回特殊的中奖元素数组，组成一条独立的中奖线
     */
    protected getSpecialLineRenders?(): BaseSpinSlotView[];

    /**
     * 修改已查找到的播放元素
     * @param rs 已查找到的一条线的中奖元素列表，可通过删除此数组的元素或添加元素到数组中实现
     * @param lineInfo 线数据
     */
    protected changeRenders?(rs: BaseSpinSlotView[], lineInfo?: RollingResult);


    protected enableds(): void {
        let lineParser: JTScrollerLineParser = this.getLineParser();
        let _scroller: JTLineScrollerGroup = lineParser.owner as JTLineScrollerGroup;
        _scroller.enableds();
    }
}