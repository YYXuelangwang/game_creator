import ResLoader, { resLoader } from "./ResLoader";

export class SoundVO {
    clip: cc.AudioClip;
    clipId: number;
    /**原始音量最大占比 */
    maxVolumePercentage: number;
    /**音效单独的音量大小 */
    volume: number;
    path: string;
    bundle: string;
}

export class SoundManager {
    static IGNORE_VOLUME: number = 0.001;
    private static instance:SoundManager;
    /**音乐音量的百分比 */
    private musicVolume:number = .5;
    /**音效音量的百分比 */
    private effectVolume:number = .5;
    /**正在播放等音效列表 */
    private effectList:SoundVO[] = [];
    private currentMusic:SoundVO = null;
    private musicList:SoundVO[] = [];
    private defaultBtn:SoundVO = null;
    private showHideVolume = 1;
    private isInit = false;

    /**
     * 获取实例
     */
    static getInstance(): SoundManager {
        if (!this.instance) {
            this.instance = new SoundManager();
        }
        return this.instance;
    }

    /**
     * 初始化
     */
    init(): void {
        if (!this.isInit) {
            this.isInit = true;
            cc.game.on(cc.game.EVENT_HIDE, this.gameHide, this);
            cc.game.on(cc.game.EVENT_SHOW, this.gameShow, this);
        }
    }

    private gameHide() {
        this.showHideVolume = 0;
        this.setHideShowVolume();
    }

    private gameShow() {
        this.showHideVolume = 1;
        this.setHideShowVolume();
    }

    private setHideShowVolume() {
        for (let i = this.musicList.length - 1; i >= 0; i--) {
            let ele = this.musicList[i];
            if (ele && ele.volume != SoundManager.IGNORE_VOLUME) {
                cc.audioEngine.setVolume(ele.clipId, this.showHideVolume * this.musicVolume * ele.maxVolumePercentage * ele.volume);
            } else if (!ele) {
                this.musicList.splice(i, 1);
            }
        }
        for (let i = this.effectList.length - 1; i >= 0; i--) {
            let ele = this.effectList[i];
            if (ele && ele.volume != SoundManager.IGNORE_VOLUME) {
                cc.audioEngine.setVolume(ele.clipId, this.showHideVolume * this.effectVolume * ele.maxVolumePercentage);
            } else if (!ele) {
                this.musicList.splice(i, 1);
            }
        } 
    }

    /**
     * 加载本地声音缓存，存储用户设置音量大小，
     * @param gameId 游戏id
     */
    loadLocalVolume(gameId?: string): void {
        var volume = cc.sys.localStorage.getItem(gameId ? "MusicVolume_" + gameId : "MusicVolume");
        volume || (volume = .5);
        var effectVolume = cc.sys.localStorage.getItem(gameId ? "EffectVolume_" + gameId : "EffectVolume");
        effectVolume || (effectVolume = .5);
        this.musicVolume = Number(volume);
        this.effectVolume = Number(effectVolume);
    }

    /**
     * 获取声音值（背景音乐）
     */
    getMusicVolume(): number {
        return this.musicVolume;
    }
    /**
     * 获取音效值（音效）
     */
    getEffectVolume(): number {
        return this.effectVolume;
    }

    /**
     * 设置音乐大小，并且缓存本地
     * @param volume 音量大小 （0--1）
     * @param gameId 游戏id
     */
    setMusicVolume(volume: number, gameId?: string): void
    {
        this.musicVolume = volume;
        cc.sys.localStorage.setItem(gameId ? "MusicVolume_" + gameId : "MusicVolume", volume);
        for (let i = this.musicList.length - 1; i >= 0; i--) {
            let ele = this.musicList[i];
            if (ele && ele.volume != SoundManager.IGNORE_VOLUME) {
                cc.audioEngine.setVolume(ele.clipId, this.showHideVolume * this.musicVolume * ele.maxVolumePercentage * ele.volume);
            } else if (!ele) {
                this.musicList.splice(i, 1);
            }
        }
    }
    /**
     * 设置指定单个音乐的音量大小
     * @param path 音效路径
     * @param volume 音量大小（值范围：[0,1]，当某个音乐不想被总开关控制，例如需要同步音轨，可以设置成game.SoundManager.IGNORE_VOLUME）
     */
    setSingleMusicVolume(path: string, volume: number): void
    {
        for (let i = this.musicList.length - 1; i >= 0; i--) {
            let ele = this.musicList[i];
            if (ele && ele.path == path) {
                ele.volume = volume;
                cc.audioEngine.setVolume(ele.clipId, this.showHideVolume * this.musicVolume * ele.maxVolumePercentage * volume);
                break;
            } 
        }
    }

    /**
    * 设置音效大小，并且缓存本地
    * @param volume 音量大小 （0--1）
    * @param gameId 游戏id
    */
    setEffectVolume(volume: number, gameId?: string): void
    {
        this.effectVolume = volume;
        cc.sys.localStorage.setItem(gameId ? "EffectVolume_" + gameId : "EffectVolume", volume);
        for (let i = this.effectList.length - 1; i >= 0; i--) {
            let ele = this.effectList[i];
            if (ele && ele.volume != SoundManager.IGNORE_VOLUME) {
                cc.audioEngine.setVolume(ele.clipId, this.showHideVolume * this.effectVolume * ele.maxVolumePercentage);
            } else if (!ele) {
                this.musicList.splice(i, 1);
            }
        } 
    }

    /**
     * 设置指定单个音效的音量大小
     * @param path 音效路径
     * @param volume 音量大小（值范围：[0,1]，当某个音效不想被总开关控制，例如需要同步音轨，可以设置成game.SoundManager.IGNORE_VOLUME）
     */
    setSingleEffectVolume(path: string, volume: number): void
    {
        for (let i = this.effectList.length - 1; i >= 0; i--) {
            let ele = this.effectList[i];
            if (ele && ele.path == path) {
                ele.volume = volume;
                cc.audioEngine.setVolume(ele.clipId, this.showHideVolume * this.effectVolume * volume * ele.maxVolumePercentage);
                break;
            }
        } 
    }

    /**
     * 播放背景音乐
     * @param path 音乐资源路径
     * @param loop 是否循环播放
     * @param bundle bundle名
     * @param endFunc 播放结束后的回调 可选
     * @param loadFunc 加载完成的回调  可选
     * @param maxVolume 原始音量最大值,默认值100（0，100）
     * @param isStopPrev 是否停止之前的背景音乐（默认停止，只有一个背景音乐）
     */
    playMusic(path: string, loop: boolean, bundle: string, endFunc?: Function, loadFunc?: Function, maxVolume?: number, isStopPrev?: boolean): void
    {
        maxVolume = maxVolume == null ? 100 : maxVolume;
        isStopPrev = isStopPrev == null ? true : false;
        if (path) {
            console.log("play music : " + path);
            for (let i = 0; i < this.musicList.length; i++) {
                if (this.musicList[i] && this.musicList[i].path == path) {
                    cc.audioEngine.resume(this.musicList[i].clipId);
                    return;
                }
            }
            if (isStopPrev) {this.stopAllMusic();}
            var self = this;
            var sound = new SoundVO();
            sound.path = path;
            sound.bundle = bundle;
            this.musicList.push(sound);
            sound.maxVolumePercentage = maxVolume / 100;
            self.currentMusic = sound;
            ResLoader.getInstance().loadRes(path, cc.AudioClip, (e, clip:cc.AudioClip) => {
                if (!e) {
                    if (!sound || -2 == sound.clipId) return;
                    sound.clip = clip;
                    sound.clipId = cc.audioEngine.play(clip, loop, self.showHideVolume * self.musicVolume * sound.volume * sound.maxVolumePercentage);
                    cc.audioEngine.setFinishCallback(sound.clipId, () => {
                        cc.audioEngine.stop(sound.clipId);
                        self.currentMusic && self.currentMusic.clipId == sound.clipId && (self.currentMusic = null);
                        endFunc && endFunc(sound);
                    })
                    loadFunc && loadFunc.call(null, path, sound);
                }
            }, bundle, "@ResSoundMsg" + resLoader.nextUseKey());
        }
    }
    
    /**
     * 播放音效文件
     * @param path 音效路径，相对于bundle
     * @param bool 是否循环
     * @param bundle bundle名
     * @param isSpecial 是否特殊音乐（可能捕猎一些长音效）
     * @param loadfinish 加载完成的回调
     * @param playfinish 播放完成的回调
     * @param maxVolume 原始音量最大值,默认值100（0，100）
     */
    playEffect(path: string, loop: boolean, bundle: string, loadfinish?: Function, playfinish?: Function, maxVolume?: number): void
    {
        var self = this;
        loop = loop == undefined ? false : true;
        loadfinish = loadfinish == undefined ? null : loadfinish;
        playfinish = playfinish == undefined ? null : playfinish;
        maxVolume = maxVolume == undefined ? 100 : maxVolume;
        if (path) {
            var sound = new SoundVO();
            sound.bundle = bundle;
            sound.path = path;
            sound.maxVolumePercentage = maxVolume / 100;
            this.effectList.push(sound);
            ResLoader.getInstance().loadRes(path, cc.AudioClip, (e, clip:cc.AudioClip) => {
                if (!e) {
                    if (!sound || -2 == sound.clipId) return;
                    sound.clip = clip;
                    sound.clipId = cc.audioEngine.play(clip, loop, self.showHideVolume * self.effectVolume * sound.volume * sound.maxVolumePercentage);
                    cc.audioEngine.setFinishCallback(sound.clipId, () => {
                        self.onFinishSound(sound.clipId);
                        playfinish && playfinish.call(self, path, sound);
                    });
                    loadfinish && loadfinish.call(self, path, sound);
                }
            }, bundle, "@ResSoundMsg" + resLoader.nextUseKey());
        }
    }

    /**
     * 播放音效结束回调函数
     * @param soundId 声音的id
     */
    private onFinishSound(soundId: number) {
        for (let i = 0; i < this.effectList.length; i++) {
            const element = this.effectList[i];
            if (element && element.clipId == soundId) {
                this.effectList.splice(i, 1);
                break;
            }
        }
    }

    /**
     * 获取音效对象 cc.AudioClip ,有些传入相同的路径名字。 进行playEffect。
     * @param path  播放声音资源路径
     */
    getClipByPath(path: string): SoundVO | SoundVO[]
    {
        for (let i = 0; i < this.musicList.length; i++) {
            if (this.musicList[i] && this.musicList[i].path == path) {
                return this.musicList[i];
            }
        }
        var ret = [];
        for (let i = 0; i < this.effectList.length; i++) {
            const element = this.effectList[i];
            if (this.effectList[i] && this.effectList[i].path == path) {
                ret.push(this.effectList[i]);
            }
        }
        return ret.length > 0 ? ret : null;
    }

    /**
     * 暂停背景音乐的播放
     * @param path 背景音乐资源路径
     */
    pauseMusic(path?: string): void
    {
        console.log("pause music : " + path);
        if (!path && this.currentMusic) {
            path = this.currentMusic.path;
        }
        if (path) {
            for (let i = 0; i < this.musicList.length; i++) {
                const element = this.musicList[i];
                if (element && element.path == path) {
                    cc.audioEngine.pause(element.clipId);
                    break;
                }
            }
        }
    }

    /**
     * 恢复背景音乐资源的播放
     * @param path 背景音乐路径
     */
    resumeMusic(path?: string): void
    {
        if (!path) {
            path = this.currentMusic ? this.currentMusic.path 
                : (this.musicList.length > 0 ? this.musicList[this.musicList.length - 1].path 
                : null);
        }
        if (path) {
            for (let i = 0; i < this.musicList.length; i++) {
                const element = this.musicList[i];
                if (element && element.path == path) {
                    cc.audioEngine.resume(element.clipId);
                    break;
                }
            }
        }
    }

    /**
     * 暂停所有背景音乐的播放
     */
    pauseAllMusic(): void
    {
        for (let i = 0; i < this.musicList.length; i++) {
            const element = this.musicList[i];
            if (element) {
                cc.audioEngine.pause(element.clipId);
            }
        }
    }
    /**
     * 恢复所有背景音乐的播放
     */
    resumeAllMusic(): void
    {
        for (let i = 0; i < this.musicList.length; i++) {
            const element = this.musicList[i];
            if (element) {
                cc.audioEngine.resume(element.clipId);
            }
        }
    }
    /**
     * 暂停音效资源的播放
     * @param path 音效资源路径
     */
    pauseEffect(path: string): void
    {
        for (let i = 0; i < this.effectList.length; i++) {
            const element = this.effectList[i];
            if (element && element.path == path) {
                cc.audioEngine.pause(element.clipId);
            }
        }
    }
    /**
     * 恢复音效资源的播放
     * @param path 音效资源路径
     */
    resumeEffect(path: string): void
    {
        for (let i = 0; i < this.effectList.length; i++) {
            const element = this.effectList[i];
            if (element && element.path == path) {
                cc.audioEngine.resume(element.clipId);
            }
        }
    }

    /**
     * 暂停所有音效的播放
     */
    pauseAllEffect(): void
    {
        for (let i = 0; i < this.effectList.length; i++) {
            const element = this.effectList[i];
            if (element) {
                cc.audioEngine.pause(element.clipId);
            }
        }
    }

    /**
     * 恢复所有音效的播放
     */
    resumeAllEffect(): void
    {
        for (let i = 0; i < this.effectList.length; i++) {
            const element = this.effectList[i];
            if (element) {
                cc.audioEngine.resume(element.clipId);
            }
        } 
    }
    /**
     * 暂停所有背景音乐和音效
     */
    pauseAll(): void {
        this.pauseAllMusic();
        this.pauseAllEffect();
    }
    /**
     * 恢复所有背景音乐和音效
     */
    resumeAll(): void {
        this.resumeAllMusic();
        this.resumeAllEffect();
    }

    /**
     * 获取音效当前到播放时长
     * @param path 声音资源路径
     */
    getMusicCurPlayTime(path?: string): number 
    {
        var time = 0;
        if (!path && this.currentMusic) {
            path = this.currentMusic.path;
        }
        if (!path) return time;
        for (let i = 0; i < this.musicList.length; i++) {
            const element = this.musicList[i];
            if (element && element.path == path) {
                time = cc.audioEngine.getCurrentTime(element.clipId);
                break;
            }
        }
        return time;
    }

    /**
     * 停止背景音乐
     * @param path 传入播放声音资源路径 ,若不传，停止当前的音乐
     */
    stopMusic(path?: string): void
    {
        console.log("stop music : " + path);
        if (!path && this.currentMusic) {
            path = this.currentMusic.path;
        } 
        if (path) {
            for (let i = 0; i < this.musicList.length; i++) {
                const element = this.musicList[i];
                if (element && element.path == path) {
                    cc.audioEngine.stop(element.clipId);
                    this.musicList.splice(i, 1);
                    element.clipId = -2;
                    break;
                }
            }
            if (this.currentMusic && this.currentMusic.path == path) {
                this.currentMusic = null;
            }
        }
    }

    /**
     * 停止所有背景声音，并且在列表中的也全部清理
     */
    stopAllMusic(): void
    {
        for (let i = 0; i < this.musicList.length; i++) {
            const element = this.musicList[i];
            if (element) {
                cc.audioEngine.stop(element.clipId);
                element.clipId = -2;
            }
        }
        this.musicList.length = 0;
        this.currentMusic = null;
    }
    /** 列表中是否存在 背景音乐 */
    hasMusicClip(path: string): boolean 
    {
        for (let i = 0; i < this.musicList.length; i++) {
            const element = this.musicList[i];
            if (element && element.path == path) {
                return true;
            }
        }
        return false;
    }
    /**
     * 停止某个音效  可能存在多个音效，但是会自动加后缀，所以遍历的时候 查找字符
     * @param path 音效资源路径
     */
    stopEffect(path: string): void
    {
        for (let i = 0; i < this.effectList.length; i++) {
            const element = this.effectList[i];
            if (element && element.path == path) {
                cc.audioEngine.stop(element.clipId);
                element.clipId = -2;
                this.effectList.splice(i, 1);
                break;
            }
        }
    }

    /**
     * 停止全部音效
     */
    stopAllEffect(): void
    {
        for (let i = 0; i < this.effectList.length; i++) {
            const element = this.effectList[i];
            if (element) {
                cc.audioEngine.stop(element.clipId);
                element.clipId = -2;
            }
        }
        this.effectList.length = 0;
    }
    /**
     * 设置当前的音频时间。
     * @param path 音效资源路径
     * @param sec 时间
     */
    setMusicCurrentTime(path: string, sec: number): void
    {
        for (let i = 0; i < this.musicList.length; i++) {
            const element = this.musicList[i];
            if (element && element.path == path) {
                cc.audioEngine.setCurrentTime(element.clipId, sec);
                break;
            }
        }
    }
    /**
     * 设置当前的音频时间。
     * @param path 音效资源路径
     * @param sec 时间
     */
    setEffectCurrentTime(path: string, sec: number): void
    {
        for (let i = 0; i < this.effectList.length; i++) {
            const element = this.effectList[i];
            if (element && element.path == path) {
                cc.audioEngine.setCurrentTime(element.clipId, sec);
                break;
            }
        }
    }
    /**
     * 设置默认的音效资源路径
     * @param path 音效的资源路径
     */
    setDefaultButton(path: string, bundle: string): void
    {
        if (!this.defaultBtn) {
            this.defaultBtn = <SoundVO>{
                clip : null,
                clipId : -1,
                maxVolumePercentage : 1,
                volume : 1,
                path : null
            };
        }
        this.defaultBtn.path = path;
        this.defaultBtn.bundle = bundle;
    }
    /**
     * 播放默认的按钮音效
     */
    playBtnSound(): void
    {
        this.playEffect(this.defaultBtn.path, false, this.defaultBtn.bundle);
    }
}