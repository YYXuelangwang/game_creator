import { Layout } from "../common/utils/Layout";

const { ccclass, property } = cc._decorator;
/**
 * 基础类，主要用于弹框显示和窗口大小改变适配
 */
@ccclass
export default class BaseView extends game.UIView {

    // public isLandscape: boolean = false;
    protected resize() {

        // this.isLandscape = Layout.isLandscape;
        this.layout();
        this.setLayout();
        if (this.node.getComponent(cc.Layout)) {
            this.node.getComponent(cc.Layout).updateLayout();
        }

        if (this.node.getComponent(cc.Widget)) {
            this.node.getComponent(cc.Widget).updateAlignment();
        }
        game.EventManager.getInstance().addEventListener(game.Const.mess_windowResize, this.onResize, this);
    }

    private onResize(): void {
        this.layout();

        //注释掉是因为有时候改变了横竖向但是这里的判断还是存在判断错误的情况导致没有重新设置布局
        // if (this.isLandscape != Layout.isLandscape) {
        //     this.isLandscape = Layout.isLandscape;
        // }
        this.setLayout();
    }

    private setLayout(): void {
        if (Layout.isLandscape) {
            this.layoutLandscape();
        } else {
            this.layoutPortrait();
        }
    }

    onDestroy() {
        super.onDestroy();
        game.EventManager.getInstance().removeEventListener(game.Const.mess_windowResize, this.onResize, this);
    }

    /**
     * 屏幕切换
     */
    layout(): void {

    }

    /**
     * 切换到横屏
     */
    layoutLandscape(): void {

    }

    /**
    * 切换到竖屏
    */
    layoutPortrait(): void {

    }
}