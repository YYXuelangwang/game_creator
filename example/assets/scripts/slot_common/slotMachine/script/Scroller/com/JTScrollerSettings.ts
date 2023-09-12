import { GData } from "../../../../common/utils/GData";

/*
* name;滚轴设置
*/
export default class JTScrollerSettings {
      /**
       * 是否是正常模式
       */
      protected _isNormal: boolean = false;
      /**
       * 滚轴滚动的时间
       */
      protected _time: number = 0;
      /**
       * 开始回弹时间
       */
      protected _beginTime: number = 0;
      /**
       * 结束回弹时间
       */
      protected _endTime: number = 0;
      /**
       * 开始的回弹距离
       */
      protected _distance: number = 0;
      /**
       * 结束的回弹距离
       */
       protected _endDistance: number = 0;
      /**
       * 每列滚轴的开始延迟时间
       */
      protected _delayTime: number = 0;
      /**
       * 每列滚轴的结束延迟时间
       */
      protected _endDelayTime: number = 0;
      /**
       * 滚轴的速度
       */
      protected _speed: number = 0;


      private settingConfig: any = null;

      private _sequence:number[] = [];

      /**
       * 滚轴滚动的时间
       */
       protected _tempTime: number ;
       /**
        * 开始、结束的回弹时间
        */
       protected _tempBeginTime: number ;
       /**
        * 开始、结束的回弹距离
        */
       protected _tempDistance: number ;
       /**
        * 每列滚轴的延迟时间
        */
       protected _tempDelayTime: number ;
       /**
        * 滚轴的速度
        */
       protected _tempSpeed: number ;
       /**
        * 结束的回弹时间
        */
        protected _tempEndTime: number ;
        /**
         * 结束的回弹距离
         */
        protected _tempEndDistance: number ;
               /**
        * 每列滚轴的延迟时间
        */
       protected _tempEndDelayTime: number ;

      /**
       * 
       * @param isTogether 是否一起滚动
       * @param isNormal 是否是正常模式
       */
      constructor(isTogether: boolean = false, isNormal: boolean = true) {
            this._isNormal = isNormal;

            this.settingConfig = GData.getParameter("slotMachine").scrollerSetting;
      }

      /**
      * 滚轴滚动的时间
      */
      public getTime(): number {
            if(this._tempTime!==undefined){
                  this._time = this._tempTime;
                  this._tempTime = undefined;
            }else if (this.settingConfig && this.settingConfig.time) {
                  this._time = this.isNormalMode() ? this.settingConfig.time.normal : this.settingConfig.time.fast;
            } else {
                  this._time = this.isNormalMode() ? 480 : 100;
            }
            return this._time;

      }

      /**
       * 开始回弹时间
       */
      public getBeginTime(): number {
            if(this._tempBeginTime!==undefined){
                  this._beginTime = this._tempBeginTime;
                  this._tempBeginTime = undefined;
            }else if (this.settingConfig && this.settingConfig.beginTime) {
                  this._beginTime = this.isNormalMode() ? this.settingConfig.beginTime.normal : this.settingConfig.beginTime.fast;
            } else {
                  this._beginTime = this.isNormalMode() ? 150 : 10;
            }
            return this._beginTime;

      }

      /**
       * 结束回弹时间
       */
      public getEndTime(): number {
            if(this._tempEndTime!==undefined){
                  this._endTime = this._tempEndTime;
                  this._tempEndTime = undefined;
            }else if (this.settingConfig && this.settingConfig.endTime) {
                  this._endTime = this.isNormalMode() ? this.settingConfig.endTime.normal : this.settingConfig.endTime.fast;
            } else {
                  this._endTime = this.isNormalMode() ? 50 : 10;
            }
            return this._endTime;

      }
      /**
       * 开始回弹距离
       */
      public getDistance(): number {
            if(this._tempDistance!==undefined){
                  this._distance = this._tempDistance;
                  this._tempDistance = undefined;
            }else if (this.settingConfig && this.settingConfig.distance) {
                  this._distance = this.isNormalMode() ? this.settingConfig.distance.normal : this.settingConfig.distance.fast;
            } else {
                  this._distance = this.isNormalMode() ? 50 : 0;
            }
            return this._distance;

      }

      /**
       * 开始回弹距离
       */
      public getEndDistance(): number {
            if(this._tempEndDistance!==undefined){
                  this._endDistance = this._tempEndDistance;
                  this._tempEndDistance = undefined;
            }else if (this.settingConfig && this.settingConfig.endDistance) {
                  this._endDistance = this.isNormalMode() ? this.settingConfig.endDistance.normal : this.settingConfig.endDistance.fast;
            } else {
                  this._endDistance = this.isNormalMode() ? 50 : 0;
            }
            return this._endDistance;

      }
      /**
       * 滚轴的速度
       */
      public getSpeed(): number {
            if(this._tempSpeed!==undefined){
                  this._speed = this._tempSpeed;
                  this._tempSpeed = undefined;
            }else if (this.settingConfig && this.settingConfig.speed) {
                  this._speed = this.isNormalMode() ? this.settingConfig.speed.normal : this.settingConfig.speed.fast;
            } else {
                  this._speed = this.isNormalMode() ? 50 : 100;
            }
            return this._speed;

      }

      /**
       * 每列滚轴的延迟时间
       */
      public getDelayTime(): number {
            if(this._tempDelayTime!==undefined){
                  this._delayTime = this._tempDelayTime;
                  this._tempDelayTime = undefined;
            }else if (this.settingConfig && this.settingConfig.delayTime) {
                  this._delayTime = this.isNormalMode() ? this.settingConfig.delayTime.normal : this.settingConfig.delayTime.fast;
            } else {
                  this._delayTime = this.isNormalMode() ? 50 : 0;
            }
            return this._delayTime;
      }

      
      /**
       * 每列滚轴的延迟时间
       */
       public getEndDelayTime(): number {
            if(this._tempDelayTime!==undefined){
                  this._endDelayTime = this._tempDelayTime;
                  this._tempDelayTime = undefined;
            }else if (this.settingConfig && this.settingConfig.endDelayTime) {
                  this._endDelayTime = this.isNormalMode() ? this.settingConfig.endDelayTime.normal : this.settingConfig.endDelayTime.fast;
            } else {
                  this._endDelayTime = this.isNormalMode() ? 50 : 0;
            }
            return this._endDelayTime;
      }
      /**
       * 设定启动顺序如 [0,2,1] 即启动顺序为1，3，2，第二列最后启动
       * @param indexs 
       */
      public setRunSequence(indexs:number[]):void{
           this._sequence = indexs;
      }

      public getRunSequence():number[]{
            return this._sequence;
       }
      /**
     * 是否是正常模式
     */
      public isNormalMode(): boolean {
            return this._isNormal;
      }

      /**
       * 更新模式
       * @param isNormal 是否是正常模式(true)/ 快速模式(false)
       */
      public updateMode(isNormal: boolean = true): void {
            this._isNormal = isNormal;
      }
      
      /**
       * 设置一次性滚动参数,滚动完成后会使用默认配置，不区分极速和普通模式
       * @param speed 速度
       * @param delay 开始的列延时
       * @param time 时间
       * @param distance 开始时的回弹距离
       * @param beginTime 开始时的回弹时间
       * @param endDelay 结束时的列延时
       * @param endDistance 结束时的回弹距离
       * @param endTime 结束时的回弹时间
       */
      public setOnceSettings(speed: number, delay: number, time: number , distance: number , beginTime: number,endDelay:number,endDistance:number,endTime):void{
         this._tempSpeed = speed;
         this._tempDelayTime = delay;
         this._tempTime = time;
         this._tempDistance = distance;
         this._tempBeginTime = beginTime;
         this._tempEndDelayTime = endDelay;
         this._tempEndDistance = endDistance;
         this._tempEndTime = endTime;
      }

}