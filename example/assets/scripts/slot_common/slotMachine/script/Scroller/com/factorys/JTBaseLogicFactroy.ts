import JTFactory from "./JTFactory";
import JTConvertPlayLines from "../../flows/JTConvertPlayLines";
import JT3ComboTask from "../../flows/JT3ComboTask";
import JTGlobalDisplayLines from "../../flows/JTGlobalDisplayLines";
import JTLoopDisplayLines from "../../flows/JTLoopDisplayLines";
import JTComboTask from "../../flows/JTComboTask";
import JTScrollerLineParser from "../../lines/JTScrollerLineParser";
import { SDictionary } from "../../../SlotData/SDictionary";
import { JTTaskInfo } from "../plugins/procedure/JTPipelineTemplate";
import RollingResult from "../../../SlotData/RollingResult";
import { Handler } from "../../../SlotUtils/Handle";
import JTScheduledTaskPipeline from "../tasks/JTScheduledTaskPipeline";
import JTContainer from "../base/JTContainer";
import JTBonusGameTask from "../../flows/JTBonusGameTask";
import JTCommonRewardTask from "../../flows/JTCommonRewardTask";
import JTFreeGameOverTask from "../../flows/JTFreeGameOverTask ";
import JTNewFreeGameTask from "../../flows/JTNewFreeGameTask";
import JTFullLineAniTask from "../../flows/JTFullLineAniTask";
import JTTrialGuide from "../../flows/JTTrialGuide";
import JTUpLevelTask from "../../flows/JTUpLevelTask";
import JTFreeGameRewardTask from "../../flows/JTFreeGameRewardTask";
import JTCombineOverTask from "../../flows/JTCombineOverTask";
import JTDynamicCombineSplit from "../../flows/JTDynamicCombineSplit";
import JTChangeGameTask from "../../flows/JTChangeGameTask";
import JTEliminateScoreTask from "../../flows/JTEliminateScoreTask";
import JTAfterRewardTask from "../../flows/JTAfterRewardTask";

/*
* name;逻辑工厂
*/
export default class JTBaseLogicFactroy extends JTFactory {
    /**
     * 
     */
    public static CHANGED_LINE_LOGIC: number = 100;
    public static EXPAND_WILD_LOGIC: number = 200;
    public static LINE_PARSE_LOGIC: number = 300;
    /**
     * 任务通道逻辑类型
     */
    public static TASK_PIPELINE_LOGIC: number = 400;
    /**
     * 滚轴线解析
     */
    public static SCROLLER_LINE_PARSE: number = 900;

    private options: SDictionary = null;
    private handler: Handler = null;

    constructor() {
        super();
        this.options = new SDictionary();
    }

    /**
     * 生产逻辑对象
     * @param type type类型
     * @param owner 要绑定的对象
     */
    public produce(type: number, owner?: JTContainer): JTContainer {
        let product: JTContainer = super.produce(type) as JTContainer;
        if (product && owner) product.bind(owner, owner.caller);
        return product;
    }

    /**
     * 子级选项
     * @param cls 子级选项class对象
     * @param priority 子级选项优先级
     * @param complete 执行函数
     */
    public childOption(cls: any, priority: number, complete?: Function): JTBaseLogicFactroy {
        let t: JTTaskInfo = new JTTaskInfo();
        t._cls = cls;
        t._handler = complete;
        this.options.set(priority, t);
        return this;
    }

    /**
     * 根据优先级删除已注册流程
     * @param priority 
     */
    public removeChildOptionByPriority(priority: number): void {
        this.options.remove(priority);
    }

    /**
     * 根据class类删除已注册流程
     * @param cls 
     */
    public removeChildOptionByClass(cls: any): void {
        for (var i: number = 0; i < this.options._values.length; i++) {
            let value = this.options.values[i] as JTTaskInfo;
            if (value._cls == cls) {
                let key = this.options.keys[i];
                this.options.remove(key);
                break;
            }
        }
    }

    /**
     * 更新函数 5连回调
     * @param call 
     */
    public updateHandler(call: Handler): void {
        this.handler = call;
    }

    /**
     * 注册任务流，默认为 转换线->五连->总展示->中奖动画->小游戏及其中奖动画（如果有）->免费游戏结束及其中奖动画(如果有)->
     * 新免费游戏触发(如果有,会跳过轮播线)->jp游戏->升级->引导->轮播线
     */
    public registerFlowOptions(): void {

        this.childOption(JTConvertPlayLines, JTTaskPriority.JTCONVERT_PLAYLINES);

        this.childOption(JTDynamicCombineSplit, JTTaskPriority.JTDYNAMIC_COMBINE_SPLIT);

        this.childOption(JTFullLineAniTask, JTTaskPriority.JTFULL_LINE_ANI_TASK);

        this.childOption(JT3ComboTask, JTTaskPriority.JT3COMBO_TASK, this.play3ComboTask);

        this.childOption(JTEliminateScoreTask, JTTaskPriority.JTELIMANATE_SCORE_TASk);

        this.childOption(JTGlobalDisplayLines, JTTaskPriority.JTGLOBAL_DISPLAY_LINES);

        this.childOption(JTFreeGameRewardTask, JTTaskPriority.JTFREEGAME_REWARD_TASK);

        this.childOption(JTCommonRewardTask, JTTaskPriority.JTCOMMON_REWARD_TASK);

        this.childOption(JTBonusGameTask, JTTaskPriority.JTBONUSGAME_TASK);

        this.childOption(JTFreeGameOverTask, JTTaskPriority.JTFREEGAME_OVER_TASK);

        this.childOption(JTAfterRewardTask, JTTaskPriority.JTAFTER_REWARD_TASK);

        this.childOption(JTCombineOverTask, JTTaskPriority.JTCOMBINE_OVER_TASK);

        this.childOption(JTUpLevelTask, JTTaskPriority.JTLEVEL_UP_TASK);

        this.childOption(JTTrialGuide, JTTaskPriority.JTTRIAL_GUIDE);

        this.childOption(JTNewFreeGameTask, JTTaskPriority.JTNEW_FREEGAME_TASK);

        this.childOption(JTChangeGameTask, JTTaskPriority.JTCHANGE_GAME_TASK);

        this.childOption(JTLoopDisplayLines, JTTaskPriority.JTLOOP_DISPLAY_LINES);


    }

    /**
     *调整流程
     *子项目如不想重新完全注册一遍流程，可替换或删除默认流程及自行插入注册的流程
     *如替换公共库默认的流程，替换时替换的流程的优先级与默认的流程的优先级一样即可
     *比如要替换公共库的总线流程 this.childOption(JTGlobalDisplayLines0000, JTTaskPriority.JTGLOBAL_DISPLAY_LINES);
     *如要不需要某些公共库的默认流程，可调用removeChildOptionByClass方法或removeChildOptionByPriority方法删除 
     *自行插入的流程在默认流程中间的，依据默认流程的优先级加或减
     *流程中最后必须包含JTLoopDisplayLines以结束全部流程
     */
    public adjustFlowOptions(): void {

    }



    /**
     * 执行5连外部回调函数
     * @param task X连任务 
     * @param line 连的数据
     */
    protected play5ComboTask(task: JTComboTask, line: RollingResult): void {
        this.handler && this.handler.runWith([Handler.create(task, task.executeTask), line]);
    }

    protected play3ComboTask(task: JTComboTask, line: RollingResult): void {
        task.executeTask();
    }

    /**
     * 获取选项集
     */
    public getOptions(): SDictionary {
        return this.options;
    }

    /**
     * 注册全局Class类
     */
    protected registerClassAlias(): JTBaseLogicFactroy {
        this.registerClass(JTBaseLogicFactroy.SCROLLER_LINE_PARSE, JTScrollerLineParser);
        this.registerClass(JTBaseLogicFactroy.TASK_PIPELINE_LOGIC, JTScheduledTaskPipeline);
        return this;
    }
}

/**
 * 默认流程的先后顺序，越小代表排在前面
 * 默认的流程的优先级为整百数，为避免冲突，子项目插入的流程优先级设定在默认的流程的之间的非整百数即可
 */
export class JTTaskPriority {

    /**
     * = 0
     */
    public static JTCONVERT_PLAYLINES = 0;

    /**
     * = 100
     */
    public static JTFULL_LINE_ANI_TASK = 100;

    /**
     * = 200
     */
    public static JTDYNAMIC_COMBINE_SPLIT = 200;

    /**
     * = 300
     */
    public static JT3COMBO_TASK = 300;
    
    /**
     * = 400
     */
    public static JTELIMANATE_SCORE_TASk = 400;

    /**
     * = 500
     */
    public static JTGLOBAL_DISPLAY_LINES = 500;

    /**
     * = 600
     */
    public static JTFREEGAME_REWARD_TASK = 600;

    /**
     * = 700
     */
    public static JTCOMMON_REWARD_TASK = 700;

    /**
    * = 800
    */
    public static JTLEVEL_UP_TASK = 800;

    /**
     * = 900
     */
    public static JTBONUSGAME_TASK = 900;
    
    /**
     * = 1000
     */
    public static JTJACKPOT_GAME_TASK = 1000;

    /**
     * = 1100
     */
    public static JTFREEGAME_OVER_TASK = 1100;

    /**
     * = 1200
     */
    public static JTAFTER_REWARD_TASK = 1200;

    /**
     * = 1300
     */
    public static JTCOMBINE_OVER_TASK = 1300;

    /**
     * = 1400
     */
    public static JTTRIAL_GUIDE = 1400;

    /**
     * = 1500
     */
    public static JTNEW_FREEGAME_TASK = 1500;

    /**
     * = 1600
     */
    public static JTCHANGE_GAME_TASK = 1600;

    /**
     * = 1700
     */
    public static JTLOOP_DISPLAY_LINES = 1700;

}