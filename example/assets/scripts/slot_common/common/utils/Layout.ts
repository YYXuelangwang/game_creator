import { CANVAS_SIZE } from "../enum/CommonEnum";
import { GData } from "./GData";
/**
 * 布局类，提供了layout和widget布局设置,以及根据当前分辨率缩放节点的方法
 */
export class Layout {

    static get isLandscape(): boolean {
        var size = cc.view.getCanvasSize();
        if (cc.sys.isMobile) {
            size = cc.winSize;
        }
        return size.width >= size.height;
    }

    static isIphonex(): boolean {
        // if (core.Global.lobbyId > 0) {
        //     if (core.Global.statusBarHeight > 0)
        //         return true;
        // }
        // else {
        //     if (typeof window !== 'undefined' && window && window.innerWidth >= 812) {
        //         return /iphone/gi.test(window.navigator.userAgent) && window.screen.height >= 812;
        //     }
        // }
        if (core.Global.statusBarHeight > 0)
            return true;
        return false;
    };

    static get canvasW(): number {
        var canvas;
        if (GData.getParameter('main'))
            canvas = GData.getParameter('main').canvas;
        if (!canvas) {
            canvas = { width: CANVAS_SIZE.width_1920, height: CANVAS_SIZE.height_1080 };
        }
        return canvas.width;
    }

    static get canvasH(): number {
        var canvas;
        if (GData.getParameter('main'))
            canvas = GData.getParameter('main').canvas;
        if (!canvas) {
            canvas = { width: CANVAS_SIZE.width_1920, height: CANVAS_SIZE.height_1080 };
        }
        return canvas.height;
    }

    /**
     * 根据当前分辨率缩放节点
     * @param node 
     */
    static setNodeResolutionSize(node: cc.Node): void {
        var canvas;
        if (GData.getParameter('main'))
            canvas = GData.getParameter('main').canvas;
        if (!canvas) {
            canvas = { width: CANVAS_SIZE.width_1920, height: CANVAS_SIZE.height_1080 };
        }
        node.setScale(canvas.width / CANVAS_SIZE.width_1920, canvas.height / CANVAS_SIZE.height_1080);
    }

    /**
     * 设置横向布局
     * @param node 
     * @param spacingX 相邻节点的水平间隔
     * @param containerHeight 容器高度 默认设为第一个子元素高度
     * @param direction 排列子点方向
     * @param resizeMode 缩放模式
     */
    public static setHorizontalLayout(node: cc.Node, spacingX: number = 0,
        containerHeight?: number,
        direction: number = cc.Layout.HorizontalDirection.LEFT_TO_RIGHT,
        resizeMode: number = cc.Layout.ResizeMode.CONTAINER): void {
        //重置上次布局遗留的坐标
        for (var i = 0; i < node.children.length; i++) {
            node.children[i].setPosition(0, 0);
            if (node.children[0]) {
                node.height = (typeof containerHeight === 'number') ? containerHeight : node.children[0].height;
            }
            var layout = node.getComponent(cc.Layout) || node.addComponent(cc.Layout);
            layout.type = cc.Layout.Type.HORIZONTAL;
            layout.resizeMode = resizeMode;
            layout.spacingX = spacingX;
            layout.horizontalDirection = direction;
            layout.updateLayout();
        }
    }

    /**
    * 设置纵向布局
    * @param node 
    * @param spacingY 相邻节点的垂直间隔
    * @param containerWidth 容器宽度 默认为第一个子节点宽度
    * @param direction 排列子点方向
    * @param resizeMode 缩放模式
    */
    public static setVerticalLayout(node: cc.Node, spacingY: number = 0,
        containerWidth?: number,
        direction: number = cc.Layout.VerticalDirection.TOP_TO_BOTTOM,
        resizeMode: number = cc.Layout.ResizeMode.CONTAINER): void {
        //重置上次布局遗留的坐标
        for (var i = 0; i < node.children.length; i++) {
            node.children[i].setPosition(0, 0);
        }
        if (node.children[0]) {
            node.width = (typeof containerWidth === 'number') ? containerWidth : node.children[0].width;
        }
        var layout = node.getComponent(cc.Layout) || node.addComponent(cc.Layout);
        layout.type = cc.Layout.Type.VERTICAL;
        layout.resizeMode = resizeMode;
        layout.spacingY = spacingY;
        layout.horizontalDirection = direction;
        layout.updateLayout();
    }

    /**
     * 根据配置设置Layout
     * @param node 要设置的节点
     * @param data 配置数据(例:{
            "landscape": {
                "spacingY": 30,
                "spacingX": 0,
            },
            "portrait": {
                "spacingX": 30,
                "spacingY": 0,
                                                
            }
        })
     */
    public static setLayout(node: cc.Node, data: any): void {
        if (!data) return;
        var isL = Layout.isLandscape;
        var lData = isL ? data.landscape : data.portrait;
        if (!lData) lData = data;
        var layout = node.getComponent(cc.Layout) || node.addComponent(cc.Layout);
        if (layout) {
            //重置上次布局遗留的坐标
            for (var i = 0; i < node.children.length; i++) {
                node.children[i].x = node.children[i].y = 0;
            }
            if (lData.spacingX) {
                Layout.setHorizontalLayout(node, lData.spacingX);
            }
            if (lData.spacingY) {
                Layout.setVerticalLayout(node, lData.spacingY);
            }
            layout.updateLayout();
        }
    }

    /**
     * 根据配置设置widget
     * @param node 
     * @param data 配置数据(例: {
                            "landscape": {
                                "top": 180,
                                "left": 50
                            },
                            "portrait": {
                                "top": 860,
                                "left": 50
                            },
                            "horizontalCenter":0,
                            "verticalCenter":0
                        })
     */
    public static setWidget(node: cc.Node, data: any, target?: cc.Node): void {
        if (!data) return;

        var isL = Layout.isLandscape;
        var lData = isL ? data.landscape : data.portrait;
        if (!lData) lData = data;
        var widget: cc.Widget = node.getComponent(cc.Widget) || node.addComponent(cc.Widget);
        if (target && !widget.target) widget.target = target;
        widget.alignMode = cc.Widget.AlignMode.ON_WINDOW_RESIZE;
        Layout.openWidgetProperty(widget, lData);
        for (var key in lData) {
            if (widget[key] != undefined) {
                widget[key] = lData[key];
            }
        }
        widget.updateAlignment();
    }

    //开启widget属性
    private static openWidgetProperty(widget: cc.Widget, data: any): void {
        widget.isAbsoluteBottom = data.isAbsoluteBottom === undefined ? true : data.isAbsoluteBottom;
        widget.isAbsoluteLeft = data.isAbsoluteLeft === undefined ? true : data.isAbsoluteLeft;
        widget.isAbsoluteTop = data.isAbsoluteTop === undefined ? true : data.isAbsoluteTop;
        widget.isAbsoluteRight = data.isAbsoluteRight === undefined ? true : data.isAbsoluteRight;
        widget.isAbsoluteVerticalCenter = data.isAbsoluteVerticalCenter === undefined ? true : data.isAbsoluteVerticalCenter;
        widget.isAbsoluteHorizontalCenter = data.isAbsoluteHorizontalCenter === undefined ? true : data.isAbsoluteHorizontalCenter;
        widget.isAlignBottom = (data.bottom != undefined);
        widget.isAlignLeft = (data.left != undefined);
        widget.isAlignRight = (data.right != undefined);
        widget.isAlignTop = (data.top != undefined);
        widget.isAlignVerticalCenter = (data.verticalCenter != undefined);
        widget.isAlignHorizontalCenter = (data.horizontalCenter != undefined);
    }

    /**
     * 等比缩放节点到屏幕大小 无黑边 可截断 返回值：最终放大比例
     * @param node 待缩放的节点
     */
    public static scaling(node: cc.Node, spriteFrame?: cc.SpriteFrame): number {
        spriteFrame = spriteFrame || node.getComponent(cc.Sprite).spriteFrame;
        if (!spriteFrame) return 0;
        let root = cc.winSize;
        let texture = spriteFrame.getTexture();
        let r_texture = texture.width / texture.height;
        let r_root = root.width / root.height;
        if (r_texture < r_root) {
            node.width = root.width;
            node.height = root.width / r_texture;
        } else {
            node.height = root.height;
            node.width = root.height * r_texture;
        }
        return node.width / texture.width
    }

    /**
     * 通过width/height属性等比缩放节点到指定矩形大小; 覆盖无黑边,返回缩放比例
     * @param node 待缩放的节点
     * @param spriteFrame 若节点图片为动态加载，这里传入动态图
     * @param rect 目标矩形尺寸，默认为全屏cc.winSize
     */
    public static scalingToCoverRectBySize(node: cc.Node, spriteFrame?: cc.SpriteFrame, rect: cc.Size = cc.winSize): number {
        spriteFrame = spriteFrame || node.getComponent(cc.Sprite).spriteFrame;
        if (!spriteFrame) return 0;
        node.getComponent(cc.Sprite).sizeMode = cc.Sprite.SizeMode.CUSTOM;
        let texture = spriteFrame.getTexture();
        let r_texture = texture.width / texture.height;
        let r_rect = rect.width / rect.height;
        if (r_texture < r_rect) {
            node.width = rect.width;
            node.height = rect.width / r_texture;
        } else {
            node.height = rect.height;
            node.width = rect.height * r_texture;
        }
        return node.width / texture.width;
    }

    /**
     * 通过scale属性等比缩放节点到指定矩形大小; 覆盖无黑边,返回缩放比例
     * @param node 待缩放的节点
     * @param spriteFrame 若节点图片为动态加载，这里传入动态图
     * @param rect 目标矩形尺寸，默认为全屏cc.winSize
     */
    public static scalingToCoverRectByScale(node: cc.Node, spriteFrame?: cc.SpriteFrame, rect: cc.Size = cc.winSize): number {
        spriteFrame = spriteFrame || node.getComponent(cc.Sprite).spriteFrame;
        if (!spriteFrame) return 0;
        let texture = spriteFrame.getTexture();
        let r_texture = texture.width / texture.height;
        let r_rect = rect.width / rect.height;
        let s = r_texture < r_rect ? rect.width / texture.width : rect.height / texture.height;
        node.setScale(s);
        return s;
    }

}