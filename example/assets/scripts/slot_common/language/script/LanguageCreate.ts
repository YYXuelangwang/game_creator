import { GData } from "../../common/utils/GData";
import { Property } from "../../common/utils/Property";
import LanguageInfoBase from "./LanguageInfoBase";
/**
 * 多语言生成类，通过获取节点上挂载的“LanguageInfoBase”脚本，自动生成当前语言显示。
 * 也可以主动调用createLanguage方法生成,getLanguageLabel方法获取当前语言文本
 */
export class LanguageCreate {
    private static _instance: LanguageCreate;
    static get instance(): LanguageCreate {
        if (!LanguageCreate._instance) {
            LanguageCreate._instance = new LanguageCreate();
        }
        return LanguageCreate._instance;
    }

    /**
     * 传入挂载了LanguageInfo脚本的节点，自动根据当前语言设置显示
     * @param node 可以是当前节点，也可以是包含当前节点的父节点
     */
    createLanguage(node: cc.Node): void {
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

    //内部脚本使用
    private getCurLanguageUrl(url: string, resName: string, lang: string = GData.curLanguage): string {
        if (!resName) return null;
        url = "textures/" + url + "/" + lang + "/" + resName;
        return url;
    }

    /**
     * 根据id获取当前语言的文本
     * @param id 
     */
    getLanguageLabel(id: string): string {
        if (!id) return null;
        var value = GData.getParameter(GData.curLanguage)[id];
        return value;
    }

    /**
     * 根据自定义格式转换成当前语言路径(相对于resources/textures/下的路径)
     * @param url 
     */
    getLanguageUrl(url: string, lang: string = GData.curLanguage): string {
        if (!url) return null;
        url = url.replace("&", lang);
        return "textures/" + url;
    }
}