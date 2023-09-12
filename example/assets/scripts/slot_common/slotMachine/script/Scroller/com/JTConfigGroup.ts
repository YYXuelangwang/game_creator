import { SlotOrientation } from "../../SlotDefinitions/SlotEnum";
import JTMixItemConfig from "../extensions/JTMixItemConfig";
import JTUnfixedLengthItemConfig from "../extensions/JTUnfixedLengthItemConfig";

/*
* name;滚轴配置
*/
export default class JTConfigGroup
{
    /**
     * 获取滚轴的宽
     */
    private width:number = 0;
    /**
     * 获取滚轴的高
     */
    private height:number = 0;
    
    /**
     * 列数
     */
    public col:number = 0;
    /**
     * 行数
     */
    public row:number = 0;
    /**
     * 格子的宽
     */
    public girdWidth:number = 0; 
    /**
     * 格子的高
     */
    public girdHeight:number = 0;
    /**
     * 格子的x间距
     * */
    //public gapX:number = 0;
    /**
     * 格子的y间距
     */
    //public gapY:number = 0;
    /**
     * 格子的宽加x的间距
     */
    public _gapWidth:number = 0;
    /**
     * 格子的高加y的间距
     */
    public _gapHeight:number = 0;
    
    /**
     * 滚轴的滚动方向，横向及竖向，横向一直无用到，不做处理
     */
    public orientation:SlotOrientation = SlotOrientation.Portrait;

    public gapXLandscape:number = 0;

    public gapYLandscape:number = 0;

    public gapXPortrait:number = 0;

    public gapYPortrait:number = 0;

    public mixConfig:JTMixItemConfig[] = [];

    public unfixedItemConfig:JTUnfixedLengthItemConfig[] = [];

    
    /**
     * 滚轴是否横屏状态
     */
    public isLandscape:boolean = true;

    public get gapX():number{
         return this.isLandscape?this.gapXLandscape:this.gapXPortrait;
    }

    public get gapY():number{
        return this.isLandscape?this.gapYLandscape:this.gapYPortrait;
   }

    public isMixElement(id:number):boolean{
            for(let m of this.mixConfig){
                if(m.id == id){
                    return true;
                }
            }
            return false;
    }

    public getMixElementConfig(id:number):JTMixItemConfig{
        for(let m of this.mixConfig){
            if(m.id == id){
                return m;
            }
        }
    }

    public isUnfixedLengthItem(mapId:number):boolean{
        for(let m of this.unfixedItemConfig){
            if(m.mapId == mapId){
                return true;
            }
        }
        return false;
    }

    public getUnfixedLengthItemConfig(sourceId:number,row:number):JTUnfixedLengthItemConfig{
        for(let m of this.unfixedItemConfig){
            if(m.sourceId == sourceId&&m.row == row){
                return m;
            }
        }
    }

    public getUnfixedLengthItemConfigByMapId(mapId:number):JTUnfixedLengthItemConfig{
        for(let m of this.unfixedItemConfig){
            if(m.mapId == mapId){
                return m;
            }
        }
    }

     /**
      * 获取格子宽加X间距
     */
     public get gapWidthLandscape():number
     {
         return  this.gapXLandscape + this.girdWidth;
     }

      /**
      * 获取格子宽加X间距
      */
     public get gapWidthPortrait():number
     {
           return  this.gapXPortrait + this.girdWidth;
     }

    /**
     * 获取格子宽加X间距
    */
    public get gapWidth():number
    {
        //     if (this._gapWidth == 0)
        //     {
        //             this._gapWidth = this.gapX + this.girdWidth;
        //     }
        //     return this._gapWidth;
        return  this.gapX + this.girdWidth;

    }

     /**
      * 获取格子宽加X间距
     */
      public get gapHeightLandscape():number
      {
          return  this.gapYLandscape + this.girdHeight;
      }
 
       /**
       * 获取格子宽加X间距
       */
      public get gapHeightPortrait():number
      {
            return  this.gapYPortrait + this.girdHeight;
      }

    /**
         * 获取格子高加Y间距
         */
    public get gapHeight():number
    {
        //     if (this._gapHeight == 0)
        //     {
        //             this._gapHeight = this.gapY + this.girdHeight;
        //     }
        //     return this._gapHeight
        return   this.gapY + this.girdHeight;

    }

    /**
     * 获取滚轴的高
     */
    public getHeight():number
    {
            if (this.height == 0)
            {
                    this.height = this.row * this.gapHeight;
            }
            return this.height;
    }

     /**
     * 获取滚轴的宽
     */
    public getWidth():number
    {
            if (this.width == 0)
            {
                    this.width = this.col * this.gapWidth;
            }
            return this.width;
    }
}