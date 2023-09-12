import BaseSpinSlotView from "../../MainView/BaseSpinSlotView";
import JTGComponent from "../com/base/JTGComponent";
import JTGroup from "../com/base/JTGroup";
import JTItemRender from "../com/base/JTItemRender";
import JTItemSkinLoader from "../com/base/JTItemSkinLoader";
import JTScroller from "../com/JTScroller";
import JTScrollerGroup from "../com/JTScrollerGroup";

/*
* 对中奖元素及非中奖元素处理的容器
*/
export default class JTLayerSortContainer extends JTGComponent
{
    /**
     * 需要排序的子显示对象列表
     */
    protected _childs:JTItemSkinLoader[] = null;
    /**
     * 自定义ID列表（可以按指定ID列表）
     */
    protected _layerSortIds:number[] = null;

    /**是否根据位置index排序 */
    protected _isSortByPosIndex: boolean = false;

    constructor()
    {
        super();
        this._childs = [];
        this._layerSortIds = [];
        this._isSortByPosIndex = false;
    }

    /**
     * 更新改变子显示对象列表层级
     * @param childs 显示对象列表 
     * @param isUpdate 是否马上更新
     */
    public updateChangedChildsLayer(childs:JTItemSkinLoader[], isUpdate:boolean = false):void
    {

            for (let i:number = 0; i < childs.length; i++)
            {
                    let child:JTItemSkinLoader = childs[i];
                    if (this._childs.indexOf(child) != -1)
                    {
                            continue;
                    }
                    this._childs.push(child);
            }
            if (isUpdate)
            {
                    this.updateLayer(this.owner as JTScrollerGroup);
            }
    }

    /**
     * 更新层级
     * @param group 
     */
    public updateLayer(group?:JTGroup):void
    {
        let scroller:JTScrollerGroup = this.owner as JTScrollerGroup;
        this._childs = this.layerSort(this._childs, this._layerSortIds);

        for (let i:number = 0; i < this._childs.length; i++)
        {
                let child:JTItemRender = this._childs[i] as JTItemRender;
                let point:cc.Vec2 = scroller.getRenderPoint(child.index);
                let s:JTItemSkinLoader = child.owner as JTItemSkinLoader;

                if (s.active)
                {
                        child.removeFromParent(false);
                        child.setXYByPoint(point);
                        this.addChild(child,i);
                }
        }

    }

    private sortItems(a:BaseSpinSlotView,b:BaseSpinSlotView):number{
        let typeA = a.getElementType();
        let typeB = b.getElementType();
        if(typeA!=typeB){
            return typeA - typeB;
        }
        return a.data - b.data;
    }

    private sortItemsByIndex(a:BaseSpinSlotView,b:BaseSpinSlotView):number{
        let indexA = a.index;
        let indexbB = b.index;
        return indexA - indexbB;
    }

    /**
     * 层级排序
     * @param childs 需要排序的显示对象列表
     * @param sortIds 排序的ID列表
     */
    public layerSort(childs?:any[], sortIds?:any[]):any[]
    {
        if(this._isSortByPosIndex){
                childs.sort(this.sortItemsByIndex);
                return childs;
        }
        if (sortIds.length == 0)
        {
                childs.sort(this.sortItems);
                return childs;
        }

        let list:any[] = [];
        for (let i:number = 0; i < sortIds.length; i++)
        {
                let id:any = sortIds[i];
                let length:number = childs.length;
                for (let j:number = 0; j < length; j ++)
                {
                        let r:JTItemRender = childs.shift() as JTItemRender;
                        if (r.data != id)
                        {
                                childs.push(r);
                                continue;
                        }
                        list.push(r);
                }
        }
        let rs:any[] = [];
        rs = list.concat(childs);
        childs = rs.reverse();
        return childs;
    }

    /**
     * 可以重写此方法。改自定义排序ID列表
     */
    public get layerSortIds():any[]
    {
            return this._layerSortIds;
    }

    /**
     * 恢复默认层级排序
     */
    public resetLayerSort():void
    {
         if(this._childs.length==0){
                 return;
         }
         while(this._childs.length)
         {
                let r:JTItemRender = this._childs.shift() as JTItemRender;
                let s:JTScroller = r.owner as JTScroller;
                let pos = s.convertToNodeSpaceAR(r.convertToWorldSpaceAR(cc.v2()));
                r.removeFromParent(false);
                r.x = pos.x;
                r.y = pos.y;
                s.addChild(r);
         }

    }

    /**p
     * 获取要排序的子显示对象
     */
    public getChilds():JTItemSkinLoader[]
    {
        return this._childs;
    }

    public layoutLandscape():void{
        
        let scroller:JTScrollerGroup = this.owner as JTScrollerGroup;

        for (let i:number = 0; i < this.children.length; i++)
        {
                let child:JTItemRender = this.children[i] as JTItemRender;
                let point:cc.Vec2 = scroller.getRenderPoint(child.index);
                child.setXYByPoint(point);
                
        }
    }

    public layoutPortrait():void{
        let scroller:JTScrollerGroup = this.owner as JTScrollerGroup;

        for (let i:number = 0; i < this.children.length; i++)
        {
                let child:JTItemRender = this.children[i] as JTItemRender;
                let point:cc.Vec2 = scroller.getRenderPoint(child.index);
                child.setXYByPoint(point);
                
        }
    }
 
}