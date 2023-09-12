/**
 * 自定义按钮
 */

import { GData } from "../utils/GData";

const { ccclass, property, menu } = cc._decorator;

// 扩展button过渡类型
export enum CustomBtnTransition {
    /**
     * 不做任何过渡
     */
    NONE = 0,

    /**
     * 颜色过渡
     */
    COLOR,

    /**
     * 精灵过渡
     */
    SPRITE,

    /**
     * 缩放过渡
     */
    SCALE,

    /**
     * 颜色+缩放
     */
    COLOR_SCALE,

    /**
     * 精灵+缩放
     */
    SPRITE_SCALE,
}

// 按钮状态
export enum CustomBtnState {
    NORMAL = 0,
    HOVER,
    PRESSED,
    DISABLED,
}

// 按钮长按触发类型
export enum CustomBtnLongTouchType {
    /**
     * 不支持长按
     */
    NONE = 0,

    /**
     * 单次触发
     */
    ONCE,

    /**
     * 多次触发
     */
    MULTIPLE,
}

// 状态图片
@ccclass('StateSprite')
export class StateSprite {
    @property({ type: cc.SpriteFrame, displayName: 'Normal', tooltip: 'i18n:COMPONENT.button.normal_sprite' })
    normalSprite: cc.SpriteFrame = null;

    @property({ type: cc.SpriteFrame, displayName: 'Pressed', tooltip: 'i18n:COMPONENT.button.pressed_sprite' })
    pressedSprite: cc.SpriteFrame = null;

    @property({ type: cc.SpriteFrame, displayName: 'Hover', tooltip: 'i18n:COMPONENT.button.hover_sprite' })
    hoverSprite: cc.SpriteFrame = null;

    @property({ type: cc.SpriteFrame, displayName: 'Disabled', tooltip: 'i18n:COMPONENT.button.disabled_sprite' })
    disabledSprite: cc.SpriteFrame = null;
}

// 状态颜色
@ccclass('StateColor')
export class StateColor {
    @property({ displayName: 'Normal', tooltip: 'i18n:COMPONENT.button.normal_color' })
    normalColor: cc.Color = cc.Color.WHITE;

    @property({ displayName: 'Pressed', tooltip: 'i18n:COMPONENT.button.pressed_color' })
    pressedColor: cc.Color = cc.color(211, 211, 211);

    @property({ displayName: 'Hover', tooltip: 'i18n:COMPONENT.button.hover_color' })
    hoverColor: cc.Color = cc.Color.WHITE;

    @property({ displayName: 'Disabled', tooltip: 'i18n:COMPONENT.button.disabled_color' })
    disabledColor: cc.Color = cc.color(124, 124, 124);
}

@ccclass
@menu("按钮控制/CustomButton")
export default class CustomButton extends cc.Component {

    @property({ type: cc.Node, tooltip: "i18n:COMPONENT.button.target" })
    target: cc.Node = null;

    @property({ visible: true, displayName: 'interactable', tooltip: 'i18n:COMPONENT.button.interactable' })
    protected _interactable: boolean = true;
    public get interactable() { return this._interactable; }
    public set interactable(val: boolean) {
        this._interactable = val;
        this._updateState();
        if (!this._interactable) this._resetState();
    }

    @property({ visible: true, displayName: 'enableAutoGrayEffect', tooltip: 'i18n:COMPONENT.button.auto_gray_effect' })
    protected _enableAutoGrayEffect: boolean = false;
    public get enableAutoGrayEffect() { return this._enableAutoGrayEffect; }
    public set enableAutoGrayEffect(val: boolean) {
        this._enableAutoGrayEffect = val;
        this._updateDisabledState(true);
    }

    @property({ type: cc.Enum(CustomBtnLongTouchType), visible: true, tooltip: '支持长按类型' })
    longTouchType: CustomBtnLongTouchType = CustomBtnLongTouchType.NONE;

    @property({
        visible() {
            return CustomBtnLongTouchType.NONE != this.longTouchType;
        },
        displayName: 'triggerElapsed',
        tooltip: '长按首次触发时长(s)'
    })
    triggerElapsed: number = 1;

    @property({
        visible() {
            return CustomBtnLongTouchType.NONE != this.longTouchType;
        },
        displayName: 'triggerInterval',
        tooltip: '长按持续触发间隔(s)'
    })
    triggerInterval: number = 0.5;

    @property({ type: cc.Enum(CustomBtnTransition), tooltip: 'i18n:COMPONENT.button.transition' })
    transition: CustomBtnTransition = CustomBtnTransition.NONE;

    @property({
        type: cc.Float,
        visible() {
            return CustomBtnTransition.COLOR == this.transition ||
                CustomBtnTransition.SCALE == this.transition ||
                CustomBtnTransition.COLOR_SCALE == this.transition ||
                CustomBtnTransition.SPRITE_SCALE == this.transition
        },
        tooltip: 'i18n:COMPONENT.button.duration'
    })
    duration: number = 0.1;

    @property({
        type: cc.Float,
        visible() {
            return CustomBtnTransition.SCALE == this.transition ||
                CustomBtnTransition.COLOR_SCALE == this.transition ||
                CustomBtnTransition.SPRITE_SCALE == this.transition
        },
        tooltip: 'i18n:COMPONENT.button.zoom_scale'
    })
    zoomScale: number = 1.2;

    @property({
        type: cc.Integer,
        visible() { return CustomBtnTransition.SPRITE == this.transition || CustomBtnTransition.SPRITE_SCALE == this.transition },
        tooltip: '当前使用的状态图片资源集索引'
    })
    spriteSetIdx: number = 0;

    @property({
        type: [StateSprite],
        visible() { return CustomBtnTransition.SPRITE == this.transition || CustomBtnTransition.SPRITE_SCALE == this.transition },
        tooltip: '状态图片资源集'
    })
    spriteSet: StateSprite[] = [];

    @property({
        type: cc.Integer,
        visible() { return CustomBtnTransition.COLOR == this.transition || CustomBtnTransition.COLOR_SCALE == this.transition },
        tooltip: '当前使用的按钮背景颜色集索引'
    })
    colorSetIdx: number = 0;

    @property({
        type: [StateColor],
        visible() { return CustomBtnTransition.COLOR == this.transition || CustomBtnTransition.COLOR_SCALE == this.transition },
        tooltip: '按钮背景颜色集'
    })
    colorSet: StateColor[] = [];

    @property({ type: cc.Component.EventHandler, tooltip: 'i18n:COMPONENT.button.click_events' })
    clickEvents: cc.Component.EventHandler[] = [];

    protected _pressed: boolean = false;
    protected _hovered: boolean = false;
    protected _fromColor: cc.Color = null;
    protected _toColor: cc.Color = null;
    protected _time: number = 0;
    protected _transitionFinished: boolean = true;
    protected _fromScale: cc.Vec2 = cc.Vec2.ZERO;
    protected _toScale: cc.Vec2 = cc.Vec2.ZERO;
    protected _originalScale: cc.Vec2 = null;
    protected _sprite: cc.Sprite = null;
    protected _curState: CustomBtnState = CustomBtnState.NORMAL;    // 当前状态(只用于状态改变消息派发，不参与按钮表现逻辑)
    public get curState() { return this._curState; }
    protected _longTouchTime: number = 0;                           // 长按时长（s）
    protected _longTouchTriggered: boolean = false;                 // 长按首次是否已触发

    /**是否冷却中防止多点触发 */
    private static _isOnCooling: boolean = false;


    onLoad() {
        this._applyTarget();
    }

    protected _resetState() {
        this._pressed = false;
        this._hovered = false;
        this._longTouchTime = 0;
        this._longTouchTriggered = false;
        // // Restore button status
        let target = this._getTarget();
        let transition = this.transition;
        let originalScale = this._originalScale;

        if (CustomBtnTransition.COLOR === transition && this._interactable || CustomBtnTransition.COLOR_SCALE === transition) {
            this._setTargetColor(this._getStateColor(CustomBtnState.NORMAL));
        }

        if ((CustomBtnTransition.SCALE === transition || CustomBtnTransition.COLOR_SCALE == transition ||
            CustomBtnTransition.SPRITE_SCALE === transition) && originalScale) {
            target.setScale(originalScale.x, originalScale.y);
        }
        this._transitionFinished = true;

        let state = this._getButtonState();
        if (state != this._curState) {
            this._curState = state;
            this.node.emit('stateChange', this, this._curState, state);
        }
    }

    onEnable() {
        if (!CC_EDITOR) {
            this._registerNodeEvent();
        }

        this._updateState();
    }

    onDisable() {
        this._resetState();

        if (!CC_EDITOR) {
            this._unregisterNodeEvent();
        }
    }

    public switchSpriteSet(index: number) {
        if (index == this.spriteSetIdx) return;
        this.spriteSetIdx = index;
        this._updateState();
    }

    public switchColorSet(index: number) {
        if (index == this.colorSetIdx) return;
        this.colorSetIdx = index;
        this._updateState();
    }

    protected _getTarget() {
        return this.target ? this.target : this.node;
    }

    protected _onTargetScaleChanged() {
        let target = this._getTarget();
        // update _originalScale if target scale changed
        if (this._originalScale) {
            if ((CustomBtnTransition.SCALE !== this.transition &&
                CustomBtnTransition.COLOR_SCALE !== this.transition &&
                CustomBtnTransition.SPRITE_SCALE !== this.transition) || this._transitionFinished) {
                this._originalScale.x = target.scaleX;
                this._originalScale.y = target.scaleY;
            }
        }
    }

    protected _setTargetColor(color: cc.Color) {
        let target = this._getTarget();
        let cloneColor = color.clone();
        target.opacity = cloneColor.a;
        cloneColor.a = 255;  // don't set node opacity via node.color.a
        target.color = cloneColor;
    }

    protected _getStateColor(state: CustomBtnState) {
        let setData = this.colorSet[this.colorSetIdx];
        if (!setData) return cc.Color.WHITE;
        switch (state) {
            case CustomBtnState.NORMAL:
                return setData.normalColor;
            case CustomBtnState.HOVER:
                return setData.hoverColor;
            case CustomBtnState.PRESSED:
                return setData.pressedColor;
            case CustomBtnState.DISABLED:
                return setData.disabledColor;
        }
    }

    protected _getStateSprite(state: CustomBtnState) {
        let setData = this.spriteSet[this.spriteSetIdx];
        if (!setData) return null;
        switch (state) {
            case CustomBtnState.NORMAL:
                return setData.normalSprite;
            case CustomBtnState.HOVER:
                return setData.hoverSprite;
            case CustomBtnState.PRESSED:
                return setData.pressedSprite;
            case CustomBtnState.DISABLED:
                return setData.disabledSprite;
        }
    }

    update(dt: number) {
        if (CustomBtnState.PRESSED == this._curState) {
            let doNext: boolean = false;
            switch (this.longTouchType) {
                case CustomBtnLongTouchType.ONCE:
                    if (!this._longTouchTriggered) {
                        this._longTouchTime += dt;
                        doNext = true;
                    }
                    break;
                case CustomBtnLongTouchType.MULTIPLE:
                    this._longTouchTime += dt;
                    doNext = true;
                    break;
                default:
                    doNext = false;
                    break;
            }

            if (doNext) {
                if (this._longTouchTriggered) {
                    // 后续间隔触发长按
                    if (this._longTouchTime >= this.triggerInterval) {
                        this.node.emit('longTouch', this);
                        this._longTouchTime = 0;
                    }
                } else {
                    // 首次触发长按
                    if (this._longTouchTime >= this.triggerElapsed) {
                        this.node.emit('longTouch', this);
                        this._longTouchTime = 0;
                        this._longTouchTriggered = true;
                    }
                }
            }
        }
        if (this._transitionFinished) return;
        let target = this._getTarget();

        this._time += dt;
        let ratio = 1.0;
        if (this.duration > 0) {
            ratio = this._time / this.duration;
        }

        // clamp ratio
        if (ratio >= 1) {
            ratio = 1;
        }

        if (CustomBtnTransition.COLOR === this.transition || CustomBtnTransition.COLOR_SCALE === this.transition) {
            let color = this._fromColor.lerp(this._toColor, ratio);
            this._setTargetColor(color);
        }

        // Skip if _originalScale is invalid
        if ((CustomBtnTransition.SCALE === this.transition ||
            CustomBtnTransition.COLOR_SCALE === this.transition ||
            CustomBtnTransition.SPRITE_SCALE === this.transition) && this._originalScale) {
            let tmpScale = this._fromScale.lerp(this._toScale, ratio);
            target.scaleX = tmpScale.x;
            target.scaleY = tmpScale.y;
        }

        if (ratio === 1) {
            this._transitionFinished = true;
        }
    }

    protected _registerNodeEvent() {
        this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);

        this.node.on(cc.Node.EventType.MOUSE_ENTER, this._onMouseMoveIn, this);
        this.node.on(cc.Node.EventType.MOUSE_LEAVE, this._onMouseMoveOut, this);
    }

    protected _unregisterNodeEvent() {
        this.node.off(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);

        this.node.off(cc.Node.EventType.MOUSE_ENTER, this._onMouseMoveIn, this);
        this.node.off(cc.Node.EventType.MOUSE_LEAVE, this._onMouseMoveOut, this);
    }

    protected _registerTargetEvent(target: cc.Node) {
        target.on(cc.Node.EventType.SCALE_CHANGED, this._onTargetScaleChanged, this);
    }

    protected _unregisterTargetEvent(target: cc.Node) {
        target.off(cc.Node.EventType.SCALE_CHANGED, this._onTargetScaleChanged, this);
    }

    protected _getTargetSprite(target: cc.Node) {
        let sprite = null;
        if (target) {
            sprite = target.getComponent(cc.Sprite);
        }
        return sprite;
    }

    protected _applyTarget() {
        let target = this._getTarget();
        this._sprite = this._getTargetSprite(target);
        if (!this._originalScale) {
            this._originalScale = cc.Vec2.ZERO;
        }
        this._originalScale.x = target.scaleX;
        this._originalScale.y = target.scaleY;

        this._registerTargetEvent(target);
    }

    protected _onTouchBegan(event: cc.Event.EventTouch) {
        if (!this._interactable || !this.enabledInHierarchy) return;
        if (CustomButton.isOnCooling) return;
        this._pressed = true;
        this._longTouchTime = 0;
        this._longTouchTriggered = false;
        this._updateState();
        event.stopPropagation();
        CustomButton.isOnCooling = true;
    }

    protected _onTouchMove(event: cc.Event.EventTouch) {
        if (!this._interactable || !this.enabledInHierarchy || !this._pressed) return;
        // mobile phone will not emit _onMouseMoveOut,
        // so we have to do hit test when touch moving
        let touch = event.touch;
        let hit = this.node['_hitTest'](touch.getLocation());
        let target = this._getTarget();
        let originalScale = this._originalScale;

        let state: CustomBtnState = CustomBtnState.NORMAL;
        if ((CustomBtnTransition.SCALE === this.transition ||
            CustomBtnTransition.COLOR_SCALE === this.transition ||
            CustomBtnTransition.SPRITE_SCALE === this.transition) && originalScale) {
            if (hit) {
                state = CustomBtnState.PRESSED;
                this._fromScale.x = originalScale.x;
                this._fromScale.y = originalScale.y;
                this._toScale.x = originalScale.x * this.zoomScale;
                this._toScale.y = originalScale.y * this.zoomScale;
                this._transitionFinished = false;
            } else {
                state = CustomBtnState.NORMAL;
                this._time = 0;
                this._transitionFinished = true;
                target.setScale(originalScale.x, originalScale.y);
            }
            // 这里不再需要做scale逻辑
            if (CustomBtnTransition.SPRITE_SCALE === this.transition) this._updateSpriteTransition(state);
            if (CustomBtnTransition.COLOR_SCALE === this.transition) {
                let color = this._getStateColor(state);
                this._fromColor = target.color.clone();
                this._toColor = color;
                if (!hit) this._updateColorTransitionImmediately(state);
            }
        } else {
            if (hit) {
                state = CustomBtnState.PRESSED;
            } else {
                state = CustomBtnState.NORMAL;
            }
            this._applyTransition(state);
        }
        event.stopPropagation();

        if (state != this._curState) {
            this._curState = state;
            this.node.emit('stateChange', this, this._curState, state);
        }
    }

    _onTouchEnded(event: cc.Event.EventTouch) {
        if (!this._interactable || !this.enabledInHierarchy) return;

        if (this._pressed) {
            if (!this._longTouchTriggered) {
                // 触发过长按，就不派发点击事件了
                cc.Component.EventHandler.emitEvents(this.clickEvents, event);
                this.node.emit('click', this);
            }
        }
        this._pressed = false;
        this._longTouchTime = 0;
        this._longTouchTriggered = false;
        this._updateState();
        event.stopPropagation();
    }

    _onTouchCancel() {
        if (!this._interactable || !this.enabledInHierarchy) return;

        this._pressed = false;
        this._longTouchTime = 0;
        this._longTouchTriggered = false;
        this._updateState();
    }

    _onMouseMoveIn() {
        if (this._pressed || !this._interactable || !this.enabledInHierarchy) return;
        let hoverSprite = this._getStateSprite(CustomBtnState.HOVER);
        if ((CustomBtnTransition.SPRITE === this.transition || CustomBtnTransition.SPRITE_SCALE === this.transition) && !hoverSprite) return;

        if (!this._hovered) {
            this._hovered = true;
            this._updateState();
        }
    }

    _onMouseMoveOut() {
        if (this._hovered) {
            this._hovered = false;
            this._updateState();
        }
    }

    protected _updateState() {
        let state = this._getButtonState();
        this._applyTransition(state);
        this._updateDisabledState();
        if (state != this._curState) {
            this._curState = state;
            this.node.emit('stateChange', this, this._curState, state);
        }
    }

    protected _getButtonState() {
        let state: CustomBtnState = CustomBtnState.NORMAL;
        if (!this._interactable) {
            state = CustomBtnState.DISABLED;
        }
        else if (this._pressed) {
            state = CustomBtnState.PRESSED;
        }
        else if (this._hovered) {
            state = CustomBtnState.HOVER;
        }
        else {
            state = CustomBtnState.NORMAL;
        }
        return state;
    }

    protected _updateColorTransitionImmediately(state: CustomBtnState) {
        let color = this._getStateColor(state);
        this._setTargetColor(color);
        this._fromColor = color.clone();
        this._toColor = color;
    }

    protected _updateColorTransition(state: CustomBtnState) {
        if (CC_EDITOR || state === CustomBtnState.DISABLED) {
            this._updateColorTransitionImmediately(state);
        } else {
            let target = this._getTarget();
            let color = this._getStateColor(state);
            this._fromColor = target.color.clone();
            this._toColor = color;
            this._time = 0;
            this._transitionFinished = false;
        }
    }

    protected _updateSpriteTransition(state: CustomBtnState) {
        let sprite = this._getStateSprite(state);
        if (this._sprite && sprite) {
            this._sprite.spriteFrame = sprite;
        }
    }

    protected _updateScaleTransition(state: CustomBtnState) {
        if (state === CustomBtnState.PRESSED) {
            this._zoomUp();
        } else {
            this._zoomBack();
        }
    }

    protected _zoomUp() {
        // skip before __preload()
        if (!this._originalScale) {
            return;
        }

        this._fromScale.x = this._originalScale.x;
        this._fromScale.y = this._originalScale.y;
        this._toScale.x = this._originalScale.x * this.zoomScale;
        this._toScale.y = this._originalScale.y * this.zoomScale;
        this._time = 0;
        this._transitionFinished = false;
    }

    protected _zoomBack() {
        // skip before __preload()
        if (!this._originalScale) {
            return;
        }

        let target = this._getTarget();
        this._fromScale.x = target.scaleX;
        this._fromScale.y = target.scaleY;
        this._toScale.x = this._originalScale.x;
        this._toScale.y = this._originalScale.y;
        this._time = 0;
        this._transitionFinished = false;
    }

    protected _applyTransition(state: CustomBtnState) {
        let transition = this.transition;
        switch (transition) {
            case CustomBtnTransition.COLOR:
                this._updateColorTransition(state);
                break;
            case CustomBtnTransition.SPRITE:
                this._updateSpriteTransition(state);
                break;
            case CustomBtnTransition.SCALE:
                this._updateScaleTransition(state);
                break;
            case CustomBtnTransition.COLOR_SCALE:
                this._updateColorTransition(state);
                this._updateScaleTransition(state);
                break;
            case CustomBtnTransition.SPRITE_SCALE:
                this._updateSpriteTransition(state);
                this._updateScaleTransition(state);
                break;
            default:
                break;
        }
    }

    protected _updateDisabledState(force?: boolean) {
        if (!this._sprite) return;

        if (this._enableAutoGrayEffect || force) {
            let useGrayMaterial = false;

            let disabledSprite = this._getStateSprite(CustomBtnState.DISABLED);
            if (!((CustomBtnTransition.SPRITE === this.transition || CustomBtnTransition.SPRITE_SCALE === this.transition) && disabledSprite)) {
                useGrayMaterial = this._enableAutoGrayEffect && !this._interactable;
            }
            this._switchGrayMaterial(useGrayMaterial, this.node, true);
        }
    }

    /**
     * 设置灰色滤镜
     * @param gray true变灰
     * @param node node节点
     * @param recursive 是否递归影响子节点
     */
    protected _switchGrayMaterial(gray: boolean, node: cc.Node, recursive: boolean): void {
        let effectName = gray ? cc.Material.BUILTIN_NAME.GRAY_SPRITE : cc.Material.BUILTIN_NAME.SPRITE;
        var material = cc.Material.createWithBuiltin(effectName.toString(), 0);
        material.define("USE_TEXTURE", true, 0);

        let target: any = node.getComponent(cc.Sprite);
        target && target.setMaterial(0, material);  // sprite置灰
        target = node.getComponent(cc.Label);
        target && target.setMaterial(0, material);  // label置灰
        recursive && node.children.forEach(subNode => {
            this._switchGrayMaterial(gray, subNode, recursive);
        }, this)
    }




    private static _setTimeOutId = null;

    /**获取是否冷却中*/
    public static get isOnCooling() {
        return CustomButton._isOnCooling;
    }

    /**设置是否冷却中 */
    public static set isOnCooling(val: boolean) {
        if (val && this._setTimeOutId) {
            clearTimeout(this._setTimeOutId);
            this._setTimeOutId = null;
        }
        let gameControlCf;
        if (cc.sys.isMobile) {
            gameControlCf = GData.getParameter('gameControl_mobile');
        } else {
            gameControlCf = GData.getParameter('gameControl_pc');
        }
        if (val && gameControlCf && gameControlCf.coolDownTime > 0) {
            CustomButton._isOnCooling = val;
            let delay = gameControlCf.coolDownTime;
            this._setTimeOutId = setTimeout(() => {
                CustomButton._isOnCooling = false
            }, delay * 1000);
        } else {
            CustomButton._isOnCooling = false
        }
    }
}
