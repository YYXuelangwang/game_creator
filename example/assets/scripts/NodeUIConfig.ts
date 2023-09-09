const { ccclass, property } = cc._decorator;

@ccclass
export default class NodeUIConfig extends cc.Component {

    @property({tooltip:"是否记录节点的active属性"})
    controlActive:boolean = false;

    @property({tooltip:""})
    controlSpriteFrame:boolean = false;

    @property({tooltip:"是否记录节点的size属性"})
    controlSize:boolean = false;

    @property({tooltip:"是否记录节点的opacity属性"})
    controlOpacity:boolean = false;

    @property({
        tooltip:"自动生成的配置", 
        readonly:true,
    })
    ui_config:string = "{}";
}