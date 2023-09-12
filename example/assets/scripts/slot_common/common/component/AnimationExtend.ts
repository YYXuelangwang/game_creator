import BaseView from "../../main/BaseView";
import { Handler } from "../../slotMachine/script/SlotUtils/Handle";


const { ccclass, property } = cc._decorator;

export enum ANIMATION_TYPE {
    /**
     *     单个clip的序列帧动画
     */
    SPRITE_FRAMES_CLIP,
    /**
     * spin动画
     */
    SKELETON//
}

export class AniParam {
    /**
     * 类型，spin或者序列帧
     */
    aniType: ANIMATION_TYPE;
    /**
     * 1、若为spin则为spin资源的地址，2、若为序列帧，则为图集的地址，也可传入多张图片的地址，参数为字符串数组
     */
    url: string | string[];
    /**
     * 公共库为slot,本地填resources
     */
    bundle: string;
    /**
     * 动画名
     */
    aniName: string;
    /**
     * 加载完成的回调
     */
    loadCompleteHandler?: Handler;
    /**
     * 序列帧的帧率
     */
    sample?: number;

    /**
     * 是否启用预乘
     */
    premultipliedAlpha: boolean = false;

    /**
     * 是否启用
     */
    isAlphaBlendMode: boolean;

    /**
      * 动画速率
      */
    timeScale: number = 1;
    /**是否使用非图集 true:加载地址下的所有图片， false：加载图集*/
    isLoadDir: boolean = false;


    constructor(aniType: ANIMATION_TYPE, url: string, buldle: string, aniName: string, sample?: number, handler?: Handler) {
        this.aniType = aniType;
        this.url = url;
        this.bundle = buldle;
        this.aniName = aniName;
        this.sample = sample;
        this.loadCompleteHandler = handler;
    }
}


@ccclass
export default class AnimationExtend extends BaseView {

    private aniType: ANIMATION_TYPE;

    private aniComp: cc.Animation;

    private skComp: sp.Skeleton;

    private aniName: string = "";

    private defaultSkin: string = "";

    private playCompleteHandler: Handler = null;

    private isResLoaded: boolean = false;

    private isReadyPlay: boolean = false;

    private loop: boolean = false;

    onLoad(): void {

    }

    private addAnimationComp(): void {
        switch (this.aniType) {
            case ANIMATION_TYPE.SKELETON:
                if (this.node.getComponent(cc.Sprite)) {
                    this.node.removeComponent(cc.Sprite);
                }
                this.skComp = this.node.addComponent(sp.Skeleton);
                this.skComp.premultipliedAlpha = false;
                this.skComp.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.SHARED_CACHE);
                break;
            case ANIMATION_TYPE.SPRITE_FRAMES_CLIP:
                if (this.node.getComponent(sp.Skeleton)) {
                    this.node.removeComponent(sp.Skeleton);
                }
                this.node.getComponent(cc.Sprite) || this.node.addComponent(cc.Sprite);
                this.aniComp = this.node.getComponent(cc.Animation) || this.node.addComponent(cc.Animation);
                break;
        }
    }


    public init(param: AniParam, premultipliedAlpha?: boolean, defaultSkin?:string): void {
        this.aniType = param.aniType;
        this.addAnimationComp();
        switch (param.aniType) {
            case ANIMATION_TYPE.SKELETON:
                if (premultipliedAlpha) {
                    this.loadSekeleton(param.url as string, param.bundle, param.aniName, param.loadCompleteHandler, param.timeScale, premultipliedAlpha, defaultSkin);

                } else {

                    this.loadSekeleton(param.url as string, param.bundle, param.aniName, param.loadCompleteHandler, param.timeScale, param.premultipliedAlpha, defaultSkin);
                }
                break;
            case ANIMATION_TYPE.SPRITE_FRAMES_CLIP:
                this.loadSpriteFrames(param.url, param.bundle, param.aniName, param.sample, param.loadCompleteHandler, param.timeScale, param.isLoadDir);
                break;
        }


    }

    private loadSpriteFrames(url: string | string[], bundle: string, clipName: string, sample: number = 30, completeHandler: Handler = null, speed?: number, isLoadDir: boolean = false): void {
        if (!url) return;
        if (typeof url == "string") {
            if (isLoadDir) {
                this.loadResDir(url, cc.SpriteFrame, (err: Error, spriteFrames: cc.SpriteFrame[]) => {
                    if (err) {

                    } else {
                        this.isResLoaded = true;
                        this.addAnimation(spriteFrames, sample, clipName, completeHandler, speed);
                        if (this.isReadyPlay) {
                            this.playSpriteFramesClip();
                        }
                    }
                }, bundle);
            } else {
                this.loadRes(url, cc.SpriteAtlas, (err: Error, atlas: cc.SpriteAtlas) => {
                    if (err) {

                    } else {
                        this.isResLoaded = true;
                        let spriteFrames = atlas.getSpriteFrames();
                        this.addAnimation(spriteFrames, sample, clipName, completeHandler, speed);
                        if (this.isReadyPlay) {
                            this.playSpriteFramesClip();
                        }
                    }
                }, bundle);
            }
        } else {
            this.loadRes(url, cc.SpriteFrame, (err: Error, spriteFrames: cc.SpriteFrame[]) => {
                if (err) {

                } else {
                    this.isResLoaded = true;
                    this.addAnimation(spriteFrames, sample, clipName, completeHandler, speed);
                    if (this.isReadyPlay) {
                        this.playSpriteFramesClip();
                    }
                }
            }, bundle);
        }
    }

    private addAnimation(spriteFrames: cc.SpriteFrame[], sample: number, clipName: string, completeHandler: Handler, speed: number = 1): void {
        spriteFrames.sort((a, b) => {
            return a.name.localeCompare(b.name, 'zh-CN', { numeric: true })
        });
        let clip = cc.AnimationClip.createWithSpriteFrames(spriteFrames, sample);
        clip.name = clipName;
        clip.speed = speed;
        this.aniName = clipName;
        this.aniComp.addClip(clip);
        clip.wrapMode = cc.WrapMode.Loop;
        if (completeHandler) {
            completeHandler.run();
        }
    }

    //tiaojia 
    public addClip(url: string | string[], bundle: string, clipName: string, sample: number = 30, speed?: number, isLoadDir: boolean = false): void {
        if (this.aniType != ANIMATION_TYPE.SPRITE_FRAMES_CLIP) {
            return;
        }
        let clips = this.aniComp.getClips();
        //已添加过的clip不再重复添加
        if (clips.some(clip => clip.name === clipName)) {
            this.isResLoaded = true;
        } else {
            this.isResLoaded = this.isReadyPlay = false;
            this.loadSpriteFrames(url, bundle, clipName, sample, null, speed, isLoadDir);
        }
    }

    private loadSekeleton(url: string, bundle: string, aniName: string, completeHandler?: Handler, timeScale: number = 1, premultipliedAlpha: boolean = false, defaultSkin:string = "default"): void {
        this.loadRes(url, sp.SkeletonData, (err: Error, skeletonData: sp.SkeletonData) => {
            if (err) {

            } else {
                this.isResLoaded = true;
                this.aniName = aniName;
                this.defaultSkin = defaultSkin;
                this.skComp.timeScale = timeScale;
                this.skComp.skeletonData = skeletonData;
                this.skComp.premultipliedAlpha = premultipliedAlpha;
                this.skComp.setSkin(defaultSkin);
                if (completeHandler) {
                    completeHandler.run();
                }

                if (this.isReadyPlay) {
                    this.playSkeleton();
                }
            }
        }, bundle);

    }

    public play(name: string, loop: boolean = true, complete: Handler = null): void {
        this.aniName = name;
        this.playCompleteHandler = complete;
        this.loop = loop;
        this.isReadyPlay = true;
        if (this.isResLoaded) {
            switch (this.aniType) {
                case ANIMATION_TYPE.SPRITE_FRAMES_CLIP:
                    this.playSpriteFramesClip();
                    break;
                case ANIMATION_TYPE.SKELETON:
                    this.playSkeleton();
                    break;
            }
        }
    }

    public stop(): void {
        switch (this.aniType) {
            case ANIMATION_TYPE.SPRITE_FRAMES_CLIP:
                this.aniComp.stop();
                break;
            case ANIMATION_TYPE.SKELETON:
                this.skComp.paused = true;
                break;
        }
    }

    public hide(): void {
        this.node.active == false;
    }

    private playSkeleton(): void {
        this.skComp.node.active = true;
        this.skComp.setSkin(this.defaultSkin);
        this.skComp.setAnimation(0, this.aniName, this.loop);
        this.skComp.setCompleteListener(() => {
            if (this.playCompleteHandler) {
                let templateCall = this.playCompleteHandler;
                this.playCompleteHandler = null;
                templateCall.run();
            }
        })
    }

    private playSpriteFramesClip(): void {
        this.node.active = true;
        this.aniComp.on('finished', this.spFrameClipFinish, this);
        let state = this.aniComp.play(this.aniName);
        state.wrapMode = this.loop ? cc.WrapMode.Loop : cc.WrapMode.Normal;
    }

    private spFrameClipFinish() {
        if (this.playCompleteHandler) {
            let templateCall = this.playCompleteHandler;
            this.playCompleteHandler = null;
            templateCall.run();
        }
    }
}
