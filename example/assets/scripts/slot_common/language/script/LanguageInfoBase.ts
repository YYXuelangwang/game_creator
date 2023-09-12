import { GData } from "../../common/utils/GData";
import { Property } from "../../common/utils/Property";

const { ccclass, property } = cc._decorator;
/**
 * 多语言数据脚本,用于有多语言的节点，需要挂载此脚本(支持label或者sprite多语言)
 */
@ccclass
export default class LanguageInfoBase extends cc.Component {

    @property({ tooltip: "文本多语言配置id" })
    id: string = "";
    @property({ tooltip: "资源地址path(相对于textures/取中间path段的路劲/zh（en或者ja等等）/图集名),文本不需要填此项" })
    path: string = "";
    @property({ tooltip: "图集名称(直接父文件夹命名为：多语言简称，比如zh、en等等)" })
    atlas: string = "";
    @property({ tooltip: "1：散图路径(path && atlas必须为空才生效)相对于textures/下的路径。   2：如果是图集中的图片，则为图集里面的图片名字" })
    spriteFrame: string = "";

    @property({
        tooltip: "如果只有部分语言含有资源，则填写含资源的语言，当运行环境的语言没有资源时用英文资源代替，如果不填则会加载运行环境的资源",
        type: cc.String
    })
    onlyInLanguages: string[] = [];

    onLoad() {
        this.createLanguage(this.node);
    }

    /**
    * 传入挂载了LanguageInfo脚本的节点，自动根据当前语言设置显示
    * @param node 可以是当前节点，也可以是包含当前节点的父节点
    */
    private createLanguage(node: cc.Node): void {
        //获取多语言脚本
        var script = node.getComponent(LanguageInfoBase);
        if (script) {
            if (script.id) {
                let label = node.getComponent(cc.Label);
                if (label) {
                    label.string = this.getLanguageLabel(script.id);
                }
            } else {
                let sprite = node.getComponent(cc.Sprite);
                sprite.spriteFrame = null;
                let lang = GData.curLanguage;
                if (script.onlyInLanguages.length > 0) {
                    if (!script.onlyInLanguages.includes(lang)) {
                        lang = game.LanguageType.EN;
                    }
                }
                if (sprite) {
                    if (script.path) {
                        Property.setSpriteProperty(sprite, { atlas: this.getCurLanguageUrl(script.path, script.atlas, lang), spriteFrame: script.spriteFrame });
                        // Property.setSpriteProperty(sprite, { atlas: this.getCurLanguageUrl(script.path, script.atlas,lang), spriteFrame: this.getCurLanguageUrl(script.path, script.spriteFrame,lang) });
                    } else {
                        Property.setSpriteProperty(sprite, { atlas: this.getLanguageUrl(script.atlas, lang), spriteFrame: this.getLanguageUrl(script.spriteFrame, lang) })
                    }
                }

            }
        }
        var len = node.children.length;
        for (var i = 0; i < len; i++) {
            this.createLanguage(node.children[i]);
        }
    }

    /**
     * 返回图集路劲
     * @param url 路劲
     * @param resName 图集名
     * @param lang 当前语言简称
     * @returns 返回图集路劲
     */
    private getCurLanguageUrl(url: string, resName: string, lang: string = GData.curLanguage): string {
        if (!resName) return null;
        url = "textures/" + url + "/" + lang + "/" + resName;
        return url;
    }

    /**
     * 根据id获取当前语言的文本
     * @param id 
     */
    private getLanguageLabel(id: string): string {
        if (!id) return null;
        let langData = GData.getParameter(GData.curLanguage);
        if (!langData) {
            return game.LanguageManager.getInstance().getDstStr(id);
        }
        else {
            var value = langData[id];
            if (value)
                return value;
            else {
                return game.LanguageManager.getInstance().getDstStr(id);
            }
        }
    }

    /**
     * 返回图片路劲
     * @param url 路劲
     * @returns 返回图片路劲
     */
    private getLanguageUrl(url: string, lang: string = GData.curLanguage): string {
        if (!url) return null;
        url = url.replace("&", lang);
        return "textures/" + url;
    }
}
