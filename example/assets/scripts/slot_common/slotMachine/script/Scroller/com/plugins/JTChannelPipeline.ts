import JTLengthFixedPipeline from "./JTLengthFixedPipeline";
import JTScheduledPipeline from "./JTScheduledPipeline";
import JTOptionType from "../../transitions/JTOptionType";
import { SDictionary } from "../../../SlotData/SDictionary";
import { JTPipelineTemplate, JTTaskInfo } from "./procedure/JTPipelineTemplate";
import JTFuturePipeline from "./JTFuturePipeline";
import JTTask from "../tasks/JTTask";

/*
* name 过渡插件的管理通道
*/
export default class JTChannelPipeline  {
        private _pipelines: SDictionary = null;//通道列表
        private static _librarys: SDictionary = new SDictionary();//库map数组
        private static currentPipeline: JTChannelPipeline = null;//当前插件
        private _count: number = 0;//个数
        private _isEgoClone: boolean = false;//是否自我克隆
        protected _centerMapLandscape: Object = null;//当前插件中心点数组
        protected _centerMapPortrait: Object = null;//当前插件中心点数组

        protected _pointMapLandscape: Object = null;//X：0， y:0坐标数组
        protected _pointMapPortrait: Object = null;//X：0， y:0坐标数组

        protected _staticCenterMapPortrait: Object = null;//X：0， y:0坐标数组
        protected _staticCenterMapLandscape: Object = null;//X：0， y:0坐标数组


        protected _id: number = 0;//插件ID

        constructor() {
                this._pipelines = new SDictionary();
                this._centerMapLandscape = {}
                this._centerMapPortrait = {};
                this._pointMapLandscape = {}
                this._pointMapPortrait = {};
                this._staticCenterMapLandscape = {};
                this._staticCenterMapPortrait = {};
        }

        /**
         * 通过indexs获取插件模板
         * @param indexs i索引列表
         */
        public getTemplate(indexs: any): JTPipelineTemplate {
                return this._pipelines.get(indexs);
        }

        /**
         * 获取个数
         */
        public getCount(): number {
                if (this._count == 0) {
                        this._count = this._pipelines.values.length;
                }
                return this._count;
        }

        /**
         * 获取通过列表
         */
        public getValues(): any[] {
                return this._pipelines.values;
        }

        /**
         * 选项
         * @param cls 选项Class类 
         * @param index 选项索引
         * @param dataListType 选项数据类型
         * @param complete 执行函数
         */
        public option(cls: any, index: any, dataListType: number, complete: Function): JTPipelineTemplate {
                let pipeline: JTPipelineTemplate = new JTPipelineTemplate();
                pipeline.setupOption(cls, index, complete);
                pipeline.dataListType = dataListType
                this._pipelines.set(index, pipeline);
                return pipeline;
        }

        /**
         * 通过ID获取插件通道
         * @param id 插件通道ID
         */
        public static getChannelPipeline(id: number): JTChannelPipeline {
                this.currentPipeline = this._librarys.get(id) as JTChannelPipeline;
                return this.currentPipeline;
        }

        /**
         * 所有插件库ID列表
         */
        public static channelIds(): any[] {
                return this._librarys.keys;
        }

        /**
         * 创建插件通道集
         * @param id 创建插件通道集的ID 
         */
        public static mark(id: number): JTChannelPipeline {
                let channelPipeline: JTChannelPipeline = this._librarys.get(id) as JTChannelPipeline;
                if (!channelPipeline) {
                        channelPipeline = new JTChannelPipeline();
                        channelPipeline.id = id;
                        this._librarys.set(id, channelPipeline)
                }
                return channelPipeline;
        }

        /**
         * 子级选项
         * @param cls 子级选项Class类 
         * @param priority 子级选项优先级
         * @param index 子级索引
         * @param complete 执行函数
         */
        public childOption(cls: any, priority: number, index?: any, complete?: Function): JTPipelineTemplate {
                let pipeline: JTPipelineTemplate = this._pipelines.get(index);
                pipeline.childOption(cls, priority, complete);
                return pipeline;
        }

        /**
         * 自我克隆
         * */
        public egoClone(): void {
                let list: any[] = this._pipelines.values;
                for (let i: number = 0; i < list.length; i++) {
                        let t: JTPipelineTemplate = list[i];
                        let count: number = t.indexs.length;
                        let plugin: JTTaskInfo = t.getTaskInfo();
                        let childs: SDictionary = t.options;
                        let cKeys: any[] = childs.keys;
                        for (let j: number = 1; j < count; j++) {
                                let p: JTPipelineTemplate = this.option(plugin.cls, t.indexs[j], t.dataListType, plugin.handler) as JTPipelineTemplate;
                                p.indexs = t.indexs;
                                for (let k: number = 0; k < cKeys.length; k++) {
                                        let priority: number = childs.keys[k];
                                        let child: JTTaskInfo = childs.get(priority);
                                        p.childOption(child.cls, priority, child.handler);
                                }
                        }
                }
                this._isEgoClone = true;
        }

        /**
         * 重置
         */
        public reset(): void {
                // let values:any[] = this._pipelines.values;
                // for (let i:number = 0; i < values.length; i++)
                // {
                //         let template:JTPipelineTemplate = values[i] as JTPipelineTemplate;
                //         let task:JTTaskInfo = template.getPlugin();
                //         let pipeline:JTFuturePipeline = task.pipeline as JTFuturePipeline;
                //         if (pipeline instanceof JTLengthFixedPipeline)
                //         {

                //         }
                //         else if (pipeline instanceof JTScheduledPipeline)
                //         {
                //                 let options:Laya.Dictionary = pipeline.options;
                //                 let vs:any[] = options.values;
                //                 while(vs.length)
                //                 {
                //                         let option:JTTask = vs.shift();
                //                         option.destroy();
                //                 }
                //                 options.clear();
                //                 pipeline.destory();
                //         }
                //         task.pipeline = null;
                // }

                let values: any[] = this._pipelines.values;
                let keys  = this._pipelines.keys;
                for (let i: number = 0; i < keys.length; i++) {
                        let key = keys[i];
                        let template: JTPipelineTemplate = this._pipelines.get(key) as JTPipelineTemplate;

                        //let template: JTPipelineTemplate = values[i] as JTPipelineTemplate;
                        let taskInfo: JTTaskInfo = template.getTaskInfo();
                        let pipeline: JTFuturePipeline = taskInfo.pipeline as JTFuturePipeline;
                        if (pipeline instanceof JTLengthFixedPipeline) {
                        }
                        else if (pipeline instanceof JTScheduledPipeline) {
                                 let options:SDictionary = pipeline.options;
                                pipeline.clear();
                                let optionTask: JTTask = pipeline.getOption(JTOptionType.OPTION_CREATE) as JTTask;
                                optionTask.destroy();
                                 let vs:JTTask[] = options.values;

                                // for (let j:number = 0; j < vs.length; j++)
                                // {
                                //         let o:JTTask = vs[j] as JTTask;

                                // }
                                while(vs.length)
                                {
                                        let option:JTTask = vs.shift();
                                        option.destroy();
                                }
                                options.clear();
                                pipeline.destory();
                        }
                }
        }

        /**
         * 是否自我克隆
         */
        public get isEgoClone(): boolean {
                return this._isEgoClone;
        }

        /**
        * 获取渲染器中心点Point map
        */
        public get centerMapLandscape(): Object {
                return this._centerMapLandscape;
        }

        /**
         * 获取渲染器X=0, Y=0的point Map
         */
        public get centerMapPortrait(): Object {
                return this._centerMapPortrait;
        }
        
        /**
         * 获取渲染器中心点Point map
         */
        public get pointMapLandscape(): Object {
                return this._pointMapLandscape;
        }

        /**
         * 获取渲染器X=0, Y=0的point Map
         */
        public get pointMapPortrait(): Object {
                return this._pointMapPortrait;
        }

        /**
         * 获取静态的中心点
         */
        public get staticCenterMapPortrait(): Object {
                return this._staticCenterMapPortrait;
        }

        /**
         * 获取静态的中心点
         */
        public get staticCenterMapLandscape(): Object {
                return this._staticCenterMapLandscape;
        }


        /**
         * 获取渲染中心点的point
         * @param index 索引
         */
        public getRenderCenterPointPortrait(index: number): cc.Vec2 {
                return this._centerMapPortrait[index.toString()];
        }

        /**
         * 获取渲染中心点的point
         * @param index 索引
         */
        public getRenderCenterPointLandscape(index: number): cc.Vec2 {
                return this._centerMapLandscape[index.toString()];
        }

        /**
         * 获取渲染器x = 0, y = 0的point
         * @param index 索引
         */
        public getRenderPointLandscape(index: number): cc.Vec2 {
                return this._pointMapLandscape[index.toString()];
        }
        /**
         * 获取渲染器x = 0, y = 0的point
         * @param index 索引
         */
         public getRenderPointPortrait(index: number): cc.Vec2 {
                return this._pointMapPortrait[index.toString()];
        }

        /**
        * 获取渲染中心点的point
        * @param index 索引
        */
        public getRenderStaticCenterPointPortrait(index: number): cc.Vec2 {
                return this._staticCenterMapPortrait[index.toString()];
        }

        /**
         * 获取渲染中心点的point
         * @param index 索引
         */
        public getRenderStaticCenterPointLandscape(index: number): cc.Vec2 {
                return this._staticCenterMapLandscape[index.toString()];
        }
        

        /**
         * 插件通道ID
         */
        public get id(): number {
                return this._id;
        }

        public set id(value: number) {
                this._id = value;
        }

        public static destroy(): void {
                this._librarys = new SDictionary();//库map数组
                this.currentPipeline = null;
        }
}