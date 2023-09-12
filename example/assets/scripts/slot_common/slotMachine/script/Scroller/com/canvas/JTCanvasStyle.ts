/*
* canvas样式;
*/

export  enum LineStyle 
{
    butt,
    round,
    square
}

export class JTCanvasStyle
{
    /**
     * 
     * @param shadowColor 阴影颜色 
     * @param strokeColor 画笔颜色
     * @param lineWidth 线宽
     */
    public setStyle(shadowColor:string, strokeColor:string, lineWidth:number = 7):void
    {
            this.shadowColor = "#000000";
            //this.shadowColor = strokeColor;
            this.strokeStyle = strokeColor;
            this.lineWidth = lineWidth;
    }

    public lineWidth:number = 20;
    public lineJoin:string = LineStyle[LineStyle.round];
    public lineCap:string = LineStyle[LineStyle.round];
    public miterLimit:number = 3;
    public shadowOffsetX:number = 1;
    public shadowOffsetY:number = 1;
    public shadowColor:string = null;
    public shadowBlur:number = 3;
    public strokeStyle:string = null;

    public  static lineWidth:number=7;
    
    /**无线配置时取的颜色*/
    public static strokeStyle:string = "#0000ff";


}

