/**
 * 布局类（不裁剪撑满屏幕，布局策略 cc.ResolutionPolicy.UNKNOWN）
 */

import { GData } from "./GData";

// 布局类型
export enum LayoutType {
    Landscape,  // 横版
    Portrait,   // 竖版
    Auto,       // 横竖自由切换
}

// 基于刘海的偏移
export interface IBangsOffset {
    top?: number,
    bottom?: number,
    left?: number,
    right?: number
}

const noExtraOffset = cc.v2(0, 0);

export class LayoutEx {

    public static layoutType: LayoutType = LayoutType.Landscape;
    public static get originDesignResolution() {
        let canvas = GData.getParameter('main').canvas;
        let retSize: cc.Size = new cc.Size(100, 100);
        switch (this.layoutType) {
            case LayoutType.Landscape:
                retSize.width = canvas.width;
                retSize.height = canvas.height;
                break;
            case LayoutType.Portrait:
                retSize.width = canvas.height;
                retSize.height = canvas.width;
                break;
            case LayoutType.Auto:
                if (this.isLandscape) {
                    retSize.width = canvas.width;
                    retSize.height = canvas.height;
                } else {
                    retSize.width = canvas.height;
                    retSize.height = canvas.width;
                }
                break;
        }

        if (!retSize.width) retSize.width = 100;
        if (!retSize.height) retSize.height = 100;
        return retSize;
    }

    public static get isLandscape() {
        let frameSize = cc.view.getFrameSize();
        return frameSize.width >= frameSize.height;
    }

    // 初始化
    public static init(layoutType?: LayoutType) {
        if (undefined === layoutType) { 
            layoutType = this.getLayoutType();
        }

        this.layoutType = layoutType;
        let cvs = cc.find('Canvas');
        let cvsComp = cvs.getComponent(cc.Canvas);
        if (cvsComp) {
            cvsComp.fitWidth = false;
            cvsComp.fitHeight = false;
        }
    }

    public static resize() {
        let dr = this.originDesignResolution;
        let s = cc.view.getFrameSize();
        let rw = s.width;
        let rh = s.height;

        // 先注释测试解决 mg中的适配 bug 4279 【适配】iphone11pro 横屏后缺少底部信息栏展示

        // let bangsOffset = this.getBangsOffset(noExtraOffset, noExtraOffset);    // 刘海屏偏移
        // let xOffset = bangsOffset.left > bangsOffset.right ? bangsOffset.left : bangsOffset.right;  // 刘海屏x轴单侧偏移
        // let yOffset = bangsOffset.top > bangsOffset.bottom ? bangsOffset.top : bangsOffset.bottom;  // 刘海屏y轴单侧偏移
        // rw = rw - 2 * xOffset;  // 窗口宽限制在刘海内，左右对称
        // rh = rh - 2 * yOffset;  // 窗口高限制在刘海内，上下对称
        let finalW = rw;
        let finalH = rh;

        if ((rw / rh) > (dr.width / dr.height)) {
            //如果更长，则用定高
            finalH = dr.height;
            finalW = finalH * rw / rh;
        }
        else {
            //如果更短，则用定宽
            finalW = dr.width;
            finalH = rh / rw * finalW;
        }

        cc.view.setDesignResolutionSize(finalW, finalH, cc.ResolutionPolicy.SHOW_ALL);
        let cvs = cc.find('Canvas');
        cvs.setContentSize(finalW, finalH);
        // console.log(`drS(${dr.width}, ${dr.height}), frameS(${s.width}, ${s.height}), rs(${rw}, ${rh}), finalS(${finalW}, ${finalH})`);
    }

    /**
     * 获取基于刘海的偏移量
     * @param offsetL 横板额外偏移量
     * @param offsetV 竖版额外偏移量
     */
    public static getBangsOffset(offsetL: cc.Vec2 = cc.v2(0, 0), offsetV: cc.Vec2 = cc.v2(0, 0)): IBangsOffset {
        let isLand = this.isLandscape;
        let offset = isLand ? offsetL : offsetV;
        let ret: IBangsOffset = { top: 0, bottom: 0, left: 0, right: 0 };
        let angle: string | number = 0;
        if (isLand) {
            if (window.orientation) {
                angle = window.orientation;
            } else if (screen.orientation&&screen.orientation.angle) {//safari浏览器没有这玩意
                angle = screen.orientation.angle;
            }
            if (90 == angle || 0 == angle) {
                // 正向 -> 逆时针旋转
                if (typeof window !== 'undefined' && window && window.navigator && window.navigator.userAgent && window.innerWidth >= 812) {
                    if (/iphone/gi.test(window.navigator.userAgent) && window.screen.height >= 812)
                        // 原接口iphone数据太大，修正
                        ret.left = 40 + offset.x;
                } else {
                    ret.left = core.Global.statusBarHeight + offset.x;
                }
                ret.right = offset.x;
                ret.top = offset.y;
            } else if (-90 == angle) {
                // 正向 -> 顺时针旋转
                ret.left = offset.x;
                if (typeof window !== 'undefined' && window && window.navigator && window.navigator.userAgent && window.innerWidth >= 812) {
                    if (/iphone/gi.test(window.navigator.userAgent) && window.screen.height >= 812)
                        // 原接口iphone数据太大，修正
                        ret.right = 40 + offset.x;
                } else {
                    ret.right = core.Global.statusBarHeight + offset.x;
                }
                ret.top = offset.y;
            } else {
                ret.left = offset.x;
                ret.right = offset.x;
                ret.top = offset.y;
            }
        } else {
            ret.left = offset.x;
            ret.right = offset.x;
            ret.top = core.Global.bangsHeight + offset.y;
        }

        return ret;
    }

    // 获取当前布局模式
    public static getLayoutType() {
        let layoutType = LayoutType.Auto;
        if (cc.sys.isMobile) {
            layoutType = GData.getParameter('main').layoutType_mobile;
        } else {
            layoutType = GData.getParameter('main').layoutType_pc;
        }
        return layoutType;
    }
}
