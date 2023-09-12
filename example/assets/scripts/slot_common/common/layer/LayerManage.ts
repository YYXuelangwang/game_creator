import { Layout } from "../utils/Layout";

export class LayerManage {

    /** 背景层 0*/
    static background: number = game.BaseUIConf.BASELAYER_BG;  //0
    /** 主场景层 100*/
    static scene: number = game.BaseUIConf.BASELAYER_GAME;  //100
    /** 头像层 100*/
    static brief: number = game.BaseUIConf.BASELAYER_GAME; 
    /** 菜单层 200*/
    static menu: number = game.BaseUIConf.BASELAYER_UI;   //200
    /** 弹框层 200*/
    static popup: number = game.BaseUIConf.BASELAYER_UI;  
    /** 特效层 300*/
    static effect: number = game.BaseUIConf.BASELAYER_EFFECT; //300
    /** bonus层 300 + 1*/
    static bonus: number = game.BaseUIConf.BASELAYER_EFFECT + 1;
    /** 加载层 400*/
    static load: number = game.BaseUIConf.BASELAYER_LOADING;  //400
    /** 提示层 500*/
    static tip: number = game.BaseUIConf.BASELAYER_TIPS;   // 500



    /**
     * 根据层级添加节点
     * @param _node 
     * @param _index 
     * @param _isScale 是否缩放节点
     */
    static addChildIndex(_node: cc.Node, _index: number = LayerManage.scene, _isScale: boolean = false): void {
        var root = cc.director.getScene().getComponentInChildren(cc.Canvas).node;
        root.addChild(_node, _index);
        if (_isScale) {
            Layout.setNodeResolutionSize(_node);
        }
    }

}