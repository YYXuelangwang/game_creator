
import JTComputeUtils from "./JTComputeUtils";
import JTTextureBounds from "./JTTextureBounds";

/*
* name;
*/
export default class JTCanvasTools
{
    private configMap:Object = {};
    private offX:number = 0;
    private offY:number = 0;
    public  static lineWidth:number=6;
    public computeUtils:JTComputeUtils = new JTComputeUtils();


    /**
     * 
     * @param width 设置canvas画布宽
     * @param height 设置canvas画布高
     */
    public initialize(width:number, height:number):void
    {
            //this.canvas.clear();
            //this.canvas.setSize(width, height);
            this.computeUtils.config(new cc.Rect(0, 0, width, height));
    }


    public computeSpaceToCanvas(name:string, index:number):void
    {
            let t:JTTextureBounds = new JTTextureBounds();
            t.value = index;
            t.name = name + index;
            this.configMap[t.name] = t;
    }

    public cacheSpaceToMap(name:string, index:number):void
    {
             let t:JTTextureBounds = new JTTextureBounds();
             t.value = index;
             t.name = name + index;
             this.configMap[t.name] = t;
    }

    private isReally:boolean = false;
    public getTextureBounds(name:string, rect?:cc.Rect):JTTextureBounds
    {
            let bounds:JTTextureBounds = this.configMap[name];
            if (!bounds.rect)
            {
                  bounds.config(rect);
                  this.computeUtils.addToAtlas(bounds);
            }
            return this.configMap[name];
    }

    public getRect(x:number, y:number, points:cc.Vec2[]):cc.Rect
    {
            let maxX:number = 0;
            let maxY:number = 0;
            let minX:number = 0;
            let minY:number = 0;
            for (let i:number = 0; i < points.length; i++)
            {
                    if (i == 0) continue;
                    let point:cc.Vec2 = points[i];
                    let moveX:number = point.x + x;
                    let moveY:number = point.y + y;
                    if (minX == 0)minX = moveX;
                    if (minY == 0)minY = moveY;
                    if (maxX == 0)maxX = moveX;
                    if (maxY == 0)maxY = moveY;
                    minX = Math.min(moveX, minX);
                    minY = Math.min(moveY, minY);
                    maxX = Math.max(moveX, maxX);
                    maxY = Math.max(moveY, maxY);
            }
            let width:number = maxX;
            let height:number = maxY;
            let offY:number = height - minY;
            let offX:number = width - minX
            let rect:cc.Rect = new cc.Rect(offX, offY, width, height);
            return rect;
    }

}

