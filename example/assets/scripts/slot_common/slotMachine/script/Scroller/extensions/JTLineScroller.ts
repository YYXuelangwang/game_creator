import JTScroller from "../com/JTScroller";

/*
* name;单列滚轴
*/
export default class JTLineScroller extends JTScroller
{
    constructor()
    {
        super();
    }

    /**
     * 设置滚轴皮肤
     * 重写此方法可以对滚轴的自定义皮肤样式层级做调整,默认是关闭的，特殊需要可以自定重写层级
     * @param x 皮肤X坐标
     * @param y y坐标
     * @param parent 皮肤的父容器
     * @param isScale 皮肤是否自动填充
     */
    // public setupSkinLoader(x:number, y:number, parent:JTIContainer, isScale:boolean = true):fairygui.GLoader
    // {
    //         let o:JTILineScrollerGroup = this.owner as JTILineScrollerGroup;
    //         let rules:JTITask[] = o.taskContainers;
    //         let loader:fairygui.GLoader = null;
    //         for (let i:number = 0; i < rules.length; i++)
    //         {
    //                 let cc:JTITaskContainer = rules[i] as JTITaskContainer;
    //                 let t:JTIRuleTask = cc.task as JTIRuleTask;
    //                 let layer:JTIContainer = null;
    //                 if (t instanceof JTDynamicWildTask)
    //                 {   
    //                         layer = o.dynamicWildContainer ? o.dynamicWildContainer : o;
    //                 }
    //                 else if (t instanceof JTScatterTask)
    //                 {
    //                         layer = o.skinLoaderContainer ? o.skinLoaderContainer : o;
    //                 }
    //                 else if (t instanceof JTOnceWildTask)
    //                 {
    //                         layer = o.onceWildContainer ? o.onceWildContainer : o; 
    //                 }
    //                 loader = super.setupSkinLoader(x, y, layer, isScale);
    //                 t.skinLoaders.push(loader);
    //                 let index:number = o.skinLoaders.indexOf(loader);
    //                 if (index == -1)
    //                 {
    //                     o.skinLoaders.push(loader);
    //                 }   
    //         }
    //         return loader;
    // }

}