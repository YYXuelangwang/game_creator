import JTItemRender from "../com/base/JTItemRender";
import RollingResult from "../../SlotData/RollingResult";
import SlotUtils from "../../SlotUtils/SlotUtils";
import SlotMachineView from "../../MainView/SlotMachineView";
import SpinElementManager from "../../MainView/SpinElementManager";

/*
* name;
*/
export default class JTDefaultItemRender extends JTItemRender {
        protected playCount: number = 0;
        /**
         * 是否暗淡
         */
        protected isFade: boolean = false;
        protected isBlur: boolean = true;
        /**
         * 是否程序暗淡
         */
        protected isFadeMask: boolean = false;
        /**列序号（从0开始） */
        public static playIndex: number = 2;
        public static scatterIndex: number = 8;
        public static fullTypeIndex: number = -1;
        protected urlPrefix: string = "";
        constructor() {
                super();
        }

        /**
         * 是否使用非常规元素图片
         */
        get isUseSpecialTexture(): boolean {
                return this.urlPrefix != "";
        }

        public setupUrlPrefix(v: string) {
                this.urlPrefix = v;
        }

        public clearUrlPrefix(): void {
                this.urlPrefix = "";
        }

        public set data(value: any) {
                if (value == null) return;
                if (this._data == value && value) {
                        this.reset();
                        //this.gotoAndStop(0);
                        return;
                }
                this._data = value;
                this.reset();
                this.currentFrame = 0;
        }
        /**
         * 设置中奖线金额显示位置
         * @param index 列号（从0开始）
         * @param scatterIndex 行号（暂未使用，未实现逻辑）
         */
        public static setPlayCoinIndex(index: number, scatterIndex: number, fullTypeIndex: number = -1): void {
                this.playIndex = index;
                this.scatterIndex = scatterIndex;
                this.fullTypeIndex = fullTypeIndex;
        }

        public get data(): any {
                return this._data;
        }

        public play(line: RollingResult, indexLine: number, slotMachine: SlotMachineView): void {
                super.play(line, indexLine, slotMachine);
                this.playAnimation(line, indexLine, this.index, slotMachine);
        }

        public playAnimation(lineResult?: RollingResult, indexInLine?: number, indexInSlotMachine?: number, slotMachine?: SlotMachineView): void {

        }

        public playLineCall(line?: RollingResult, slotMachine?: SlotMachineView): void {
                if (this.onPlayLineCall) {
                        this.onPlayLineCall(line, slotMachine)
                }
        }

        /**
         * 中奖线轮播时的非中奖元素播放动画
         * @param line 
         * @param slotMachine 
         */
        protected onPlayLineCall?(line?: RollingResult, slotMachine?: SlotMachineView): void

        public gotoAndStop(frame: number): void {
                if (!this.data) {
                        return;
                }
                let config;
                switch (frame) {
                        case JTItemRender.STATE_DEFAULT:
                                {
                                        config = SpinElementManager.instance.getElementImageConfig(this.data, frame);
                                        break;
                                }
                        case JTItemRender.STATE_ROLLING:
                                {
                                        if (this.isBlur) {
                                                config = SpinElementManager.instance.getElementImageConfig(this.data, frame);
                                        }
                                        else {
                                                config = SpinElementManager.instance.getElementImageConfig(this.data, JTItemRender.STATE_DEFAULT);
                                        }
                                        break;
                                }
                        case JTItemRender.STATE_OVER:
                                {
                                        if (this.isFade) // 暗淡
                                        {
                                                if (this.isFadeMask) {
                                                        config = SpinElementManager.instance.getElementImageConfig(this.data, frame);
                                                        config.url = config.url + "#fadeMask";
                                                } else {
                                                        config = SpinElementManager.instance.getElementImageConfig(this.data, frame);
                                                }
                                        }
                                        else {
                                                config = SpinElementManager.instance.getElementImageConfig(this.data, JTItemRender.STATE_DEFAULT);
                                                // 不变暗
                                        }

                                        break;
                                }
                }
                this._skinLoader.url = config.url;
                this._skinLoader.scale = config.scale;
                this._skinLoader.spriteTrim = config.trim;
                super.gotoAndStop(frame);
                this.currentFrame = frame;
                this.onDataOrStageChange();
        }

        /**
         * 格子的数据或状态改变时
         */
        protected onDataOrStageChange(): void {

        }

        public reset(): void {
                super.reset();
                this._skinLoader.playing = false;
                this.playCount = 0;
                this._isPlaying = false;
                this.gotoAndStop(0);
        }
}