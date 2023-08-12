import packageInfo from '../plugin.json'
import BgCoverPlugin from "./index"

import { Dialog, showMessage } from "siyuan";
import { configs } from "./configs";

import * as adp from './themeAdapterUI';
import * as cst from "./constants";
import * as fileManagerUI from "./fileManagerUI";
import * as noticeUI from "./noticeUI";
import * as settingsUI from "./settingsUI";
import * as topbarUI from "./topbarUI";

import {
    error, warn, info, debug,
    CloseCV, MD5, OS, Numpy,
    getThemeInfo
} from './utils';
import { type } from 'os';

let np = new Numpy();
let cv2 = new CloseCV();

export function createBgLayer() {
    var bgLayer = document.createElement('canvas');

    bgLayer.id = "bglayer";
    bgLayer.className = "bglayer";

    document.body.appendChild(bgLayer);

    debug('[bgRender][createBgLayer] bgLayer created')
}

export function bindNotePanel() {
    // 给layouts, dockLeft, dockRight三个元素的父级面板，增加一个方便定位的ID值
    let dockPanelElement = document.getElementById('layouts').parentElement
    dockPanelElement.id = 'dockPanel'

    debug('[bgRender][changeSiyuanOrder] moved elements')
}

export function unbindNotePanel() {

    let notePanel = document.getElementById('bgPluginChanges');
    document.body.removeChild(notePanel);

    // 解除layouts, dockLeft, dockRight三个元素的父级面板，定位的ID值
    let dockPanelElement = document.getElementById('dockPanel');
    dockPanelElement.id = null;
}

export function useDefaultLiaoLiaoBg() {
    debug(`[bgRender][applySettings] 没有缓存任何图片，使用默认的了了妹图片ULR来当作背景图`)
    changeBackgroundContent(cst.demoImgURL, cst.bgMode.image)
    configs.set('bgObj', undefined);
}

export function changeBackgroundContent(background: string, mode: cst.bgMode) {
    var bgLayer = document.getElementById('bglayer');

    if (mode === cst.bgMode.image) {
        debug(`[bgRender][changeBackgroundContent] 替换当前背景图片为${background}`)
        bgLayer.style.setProperty('background-image', `url('${background}')`);
    } else if (mode == cst.bgMode.video) {
        noticeUI.showIndev();
    } else if (mode == cst.bgMode.live2d) {
        noticeUI.showIndev();
    } else {
        error(`[SwitchBgCover Plugin][Error] Background type [${mode}] is not supported, `, 7000, "error");
    }
};

export function changeOpacity(alpha: number, transMode: number, adaptMode: boolean) {
    let opacity = 0.99 - 0.25 * alpha;

    if (configs.get('activate')) {
        // 遍历所有css style
        var hasBgColorStyles = filterCssSheetWithBackgroundColor();
        console.log(hasBgColorStyles)
        window.hasBgColorStyles = hasBgColorStyles;
    } else {
    }
}

function filterCssSheetWithBackgroundColor(){
    var styles : cst.StyleInfo[] = [];
    var sheets = document.styleSheets;
    
    // 遍历所有的css style，找到指定的css
    for (var i = 0; i < sheets.length; i++) {
        debug(`[bgRender][changeOpacity] 当前遍历到的CSS Style文件为：`, sheets[i].href)

        // 保证当前的cssstyle可以访问
        try {
            var rules = sheets[i].cssRules;
        } catch (err) {
            const errorMessage = `[${window.bgCoverPlugin.i18n.addTopBarIcon} Plugin] ${window.bgCoverPlugin.i18n.themeCssReadDOMError}<br>ErrorFile: <code>${sheets[i].href}</code> when calling <code> document.styleSheets[${i}].cssRules;</code>`

            error(errorMessage, err);
            continue;
        }

        if (!rules) {
            debug(`[bgRender][changeOpacity] 当前css rule非法格式: ${rules}`)
            continue;
        }

        let s = parseRulesList(rules);
        styles = [...styles, ...s]
    }

    return styles
}

function parseRulesList(rules:CSSRuleList){
    var styles : cst.StyleInfo[] = [];

    for (var j = 0; j < rules.length; j++) {
        let rule = rules[j] as CSSStyleRule

        /**
         * 这边的CSSStyleRule会有两种情况，
         * 第一种情况：正常的CSSStyle
         * 第二种情况：为@import url(/appearance/.../toolbar.css);
         * e.g. var sheets = document.styleSheets;
         * sheets[5].rules >>>
         *    ...
         *    19: CSSImportRule {href: '/appearance/.../sidebar.css'}  // 第二种情况
         *    ...
         *    31: CSSStyleRule {selectorText: ':root', style: ...}  // 第一种情况
         * 
         * 第二种情况下，内部又有一个CSSStyleList, 需要重复上述步骤把style给扒出来
         *    typeof(rule.styleSheet.cssRules typeof) >>> CSSRuleList
         */
        if (rule instanceof CSSImportRule) {
            let imRuleList = rule.styleSheet.cssRules as CSSRuleList;

            let s = parseRulesList(imRuleList);
            styles = [...styles, ...s]
        }else{
            if (rule.style && rule.style.backgroundColor) {
                let s: cst.StyleInfo = {
                    href: rule.parentStyleSheet.href,
                    selector: rule.selectorText,
                    backgroundColor: rule.style.backgroundColor,
                    rule: rule,
                }
                styles.push(s);
            }
        }
    }

    return styles
}

export function changeOpacityOld(alpha: number, transMode: number, adaptMode: boolean) {
    // opacity mode: fully transparent (adaptMode=False)
    // css mode: only background transparent (adaptMode=True)
    let opacity = 0.99 - 0.25 * alpha;

    if (typeof transMode == 'string'){
        transMode = parseInt(transMode);
    };

    const [themeMode, themeName] = getThemeInfo();

    let operateElement: {
        opacity: {
            operateOpacityElement: string[],
            zIndexValue: string[],
            operateElementStyle: string[],
            operateCssStyle: string[]
        },
        css: {
            operateOpacityElement: string[],
            zIndexValue: string[],
            operateElementStyle: string[],
            operateCssStyle: string[]
        },
    }
    operateElement = {
        // opacity模式：修改组件的opactiy来实现前景的透明, themeAdapt=false
        opacity: {
            operateOpacityElement: ["toolbar", "dockPanel", "dockBottom", "status"],
            // 调整opacity还需要修改z-index的值，不然会导致按钮点击不了
            // https://blog.csdn.net/weixin_51474815/article/details/121070612
            // 
            // 使用下面的代码，获取所有的z-index值：
            // window.document.defaultView.getComputedStyle(
            //    document.getElementById('layouts')
            // ).getPropertyValue('z-index');
            // 计算之后的结果为（默认的结果）：
            //    layouts -> 10 (部分主题)
            //    toolbar -> auto
            //    dockLeft -> auto
            //    dockRight -> auto
            //    dockBottom -> auto
            //    status -> 2
            zIndexValue: ['2', '1', '2', '3'],
            operateElementStyle: [],
            operateCssStyle: [],
        },
        // css模式：修改组件背景颜色的alpha值，来实现前景的透明, themeAdapt=true
        css: {
            operateOpacityElement: [],
            zIndexValue: ['1'],
            operateElementStyle: ["toolbar", "dockLeft", "dockRight", "dockBottom", "status"],
            operateCssStyle: [
                ".layout-tab-bar", ".layout-tab-container", 
                ".protyle", ".protyle-breadcrumb", ".protyle-content"]
        }
    }

    // 获取constance.ts的配置中，所有需要适配主题对应的element id和对应的css值
    let themeAdaptObject: cst.themeAdaptObject;
    let themeAdaptElement: string[] = [];

    if (themeName in adp.toAdaptThemes && adaptMode) { 
        // 如果当前的主题在主题适配列表中且启用兼容模式
        // 获取constance.ts的配置中，所有需要适配主题对应的element id和对应的css值
        themeAdaptObject = adp.toAdaptThemes[themeName];
        // >>> "Savor": {...}
        themeAdaptElement = Object.keys(themeAdaptObject) as string[];
        // >>> ["toolbar", ".protyle", ...]

        // 合并并去除重复项
        for (let i in themeAdaptElement) {
            const itemName = themeAdaptElement[i];

            // 如果是".xxxx"开头，说明这边要改的是css的样式
            debug(`[bgRender][chageOpacity] 添加主题适配列表内容${itemName}.slice(0,1) === '.'`, itemName.slice(0,1) === '.')
            if (itemName.slice(0,1) === '.') {
                // 如果不含有当前的元素，则添加
                if (!operateElement.css.operateCssStyle.includes(itemName)) {
                    operateElement.css.operateCssStyle.push(itemName);
                }
            }else{
                if (!operateElement.css.operateElementStyle.includes(itemName)) {
                    operateElement.css.operateElementStyle.push(itemName);
                }
            }
        }
    }

    debug(`[bgRender][changeOpacity] operateElement: `, operateElement)

    /**
     * 用户打开图片背景
     */
    if (configs.get('activate')) {

        let addOpacityElement: string[];
        let zIndexValue: string[];
        let addElementStyle: string[];
        let editCssStyle: string[];

        let rmOpacityElement: string[];
        let rmElementStyle: string[];
        let restoreCssStyle: string[];

        debug(`${transMode}, ${typeof transMode}`)

        if (transMode === 1 ) { // 开启css的透明模式（部分透明）
            debug(`[bgRender][changeOpacity] 检测到tranMode为${transMode} - 部分透明模式`)
            addOpacityElement = operateElement.css.operateOpacityElement;
            zIndexValue = operateElement.css.zIndexValue;
            addElementStyle = operateElement.css.operateElementStyle;
            editCssStyle = operateElement.css.operateCssStyle;

            rmOpacityElement = operateElement.opacity.operateOpacityElement;
            rmElementStyle = operateElement.opacity.operateElementStyle;
            restoreCssStyle = operateElement.opacity.operateCssStyle;
        } else {  // 开启 opacity 透明模式 (全局透明)
            debug(`[bgRender][changeOpacity] 检测到tranMode为${transMode} - 全局透明模式`)
            addOpacityElement = operateElement.opacity.operateOpacityElement;
            zIndexValue = operateElement.opacity.zIndexValue;
            addElementStyle = operateElement.opacity.operateElementStyle;
            editCssStyle = operateElement.opacity.operateCssStyle;

            rmOpacityElement = operateElement.css.operateOpacityElement;
            rmElementStyle = operateElement.css.operateElementStyle;
            restoreCssStyle = operateElement.css.operateCssStyle;
        }

        // 遍历修改opacity
        for (let eid in addOpacityElement) {
            var changeItem = document.getElementById(addOpacityElement[eid]);

            changeItem.style.setProperty('opacity', opacity.toString());
            changeItem.style.setProperty('z-index', zIndexValue[eid]);
        }
        for (let eid in rmOpacityElement) {
            var changeItem = document.getElementById(rmOpacityElement[eid]);

            changeItem.style.removeProperty('opacity');
            changeItem.style.removeProperty('z-index');
        }

        // 遍历修改Alpha
        if (addElementStyle.length > 0) {
            for (let eid in addElementStyle) {
                const elementid: string = addElementStyle[eid];
                var changeItem = document.getElementById(elementid);

                var themeAdaptColor: string;
                var adaptColor: string;

                debug(`[bgRender][changeOpacity] 修改元素ID为${elementid}的元素alpha值`);

                if (themeAdaptElement.includes(elementid)) {
                    // 如果当前元素的css在主题适配列表中，直接获取适配列表中的配置
                    themeAdaptColor = themeAdaptObject[elementid][themeMode];
                    adaptColor = eval('`' + themeAdaptColor + '`'); // 有些配置涉及到运算
                } else {
                    // 不需要针对主题进行适配，直接计算当前元素的颜色alpha值
                    themeAdaptColor = getComputedStyle(changeItem, null).getPropertyValue('background-color');
                    adaptColor = cv2.changeColorOpacity(themeAdaptColor, opacity);
                }

                debug(`[bgRender][changeOpacity] ${elementid} originalColor: ${themeAdaptColor}, adaptColor: ${adaptColor}`);

                changeItem.style.setProperty('background-color', adaptColor, 'important');
                changeItem.style.setProperty('background-blend-mode', `lighten`);
            }
        }
        if (rmElementStyle.length > 0) {
            for (let eid in rmElementStyle) {
                const elementid: string = rmElementStyle[eid];
                var changeItem = document.getElementById(elementid);

                changeItem.style.removeProperty('background-color');
                changeItem.style.removeProperty('background-blend-mode');
            }
        }

        // 遍历修改css自身的值
        if (transMode === 1) {
            var sheets = document.styleSheets;
            if (editCssStyle.length + restoreCssStyle.length > 0) {
                // 遍历所有的css style，找到指定的css
                for (var i in sheets) {
                    debug(`[bgRender][changeOpacity] 当前遍历到的CSS Style文件为：`, sheets[i].href)
                    try {
                        var rules = sheets[i].cssRules;
                    } catch (err) {
                        const errorMessage = `[${window.bgCoverPlugin.i18n.addTopBarIcon} Plugin] ${window.bgCoverPlugin.i18n.themeCssReadDOMError}<br>ErrorFile: <code>${sheets[i].href}</code> when calling <code> document.styleSheets[${i}].cssRules;</code>`
                        // showMessage(errorMessage, 0, 'error');

                        error(errorMessage, err);
                        continue;
                    }
                    for (var r in rules) {
                        let rule = rules[r] as CSSStyleRule;
                        let csstext = rule.selectorText;
        
                        // 需要修改的css属性
                        if (editCssStyle.includes(csstext)) {
                            let cssColor = rule.style.getPropertyValue('background-color');
                            if (!cssColor) {  // 当前样式不存在颜色值，就赋一个白色
                                cssColor = 'rgb(255,255,255)';
                                window.bgCoverPlugin.cssThemeStyle[csstext] = 'null';
                            }else{
                                window.bgCoverPlugin.cssThemeStyle[csstext] = cssColor;
                            }
                            
                            let transparentColor: string
                            if (themeAdaptElement.includes(csstext)) {
                                // 如果当前元素的css在主题适配列表中，直接获取适配列表中的配置
                                themeAdaptColor = themeAdaptObject[csstext][themeMode];
                                transparentColor = eval('`' + themeAdaptColor + '`'); // 有些配置涉及到运算
                            } else {
                                // 不需要针对主题进行适配，直接计算当前元素的颜色alpha值
                                if ([".protyle", ".protyle-breadcrumb", ".protyle-content"].includes(csstext)) {
                                    transparentColor = cv2.changeColorOpacity(cssColor, 0);
                                }else{
                                    transparentColor = cv2.changeColorOpacity(cssColor, opacity);
                                }
                            }
                            
                            rule.style.setProperty('background-color', transparentColor, 'important');
                            debug(`[bgRender][changeOpacity]修改css属性表${csstext},从${cssColor}修改为透明色${transparentColor}`, rule.style);
                        }

                        // 需要恢复的css属性
                        if (restoreCssStyle.includes(csstext)) {
                            let originalColor = window.bgCoverPlugin.cssThemeStyle[csstext]
                            // 主题中该项css样式为空，则直接删除这个项
                            if (originalColor !== 'null') {
                                rule.style.setProperty('background-color', originalColor);
                            }else{
                                rule.style.removeProperty('background-color')
                            }
                            
                            debug(`[bgRender][changeOpacity]恢复css属性表${csstext}为主题默认色${window.bgCoverPlugin.cssThemeStyle[csstext]}`, rule.style);
                        }
                    }
                }
            }
        }
        debug('cssThemeStyle Value:', window.bgCoverPlugin.cssThemeStyle);
        
    /**
     * 用户关闭图片背景
     */
    } else {
        // 插件不启用，则需要删除之前添加的所有元素的值
        let removeOpacityElement = np.merge(
            operateElement.opacity.operateOpacityElement,
            operateElement.css.operateOpacityElement,
        )
        debug(`[bgRender][changeOpacity] 移除下列元素的opacity和z-index值:`, removeOpacityElement)
        for (let eid in removeOpacityElement) {
            const elementid: string = removeOpacityElement[eid]
            var changeItem = document.getElementById(elementid)
            changeItem.style.removeProperty('opacity')
            changeItem.style.removeProperty('z-index')
        }

        let removeCssElement = np.merge(
            operateElement.opacity.operateElementStyle,
            operateElement.css.operateElementStyle,
        );
        debug(`[bgRender][changeOpacity] 移除下列元素的background-color和blend-mode值:`, removeCssElement);
        for (let eid in removeCssElement) {
            const elementid: string = removeCssElement[eid];
            var changeItem = document.getElementById(elementid);
            changeItem.style.removeProperty('background-color');
            changeItem.style.removeProperty('background-blend-mode');
        };

        // 恢复之前的css样式值
        let removeCssStyle = np.merge(
            operateElement.opacity.operateCssStyle,
            operateElement.css.operateCssStyle,
        );

        var sheets = document.styleSheets;
        if (removeCssStyle.length > 0 && adaptMode) {
            // 遍历所有的css style，找到指定的css
            for (var i in sheets) {
                debug(`[bgRender][changeOpacity] 当前遍历到的CSS Style文件为：`, sheets[i])
                try {
                    var rules = sheets[i].cssRules;
                } catch (err) {
                    const errorMessage = `[${window.bgCoverPlugin.i18n.addTopBarIcon} Plugin] ${window.bgCoverPlugin.i18n.themeCssReadDOMError}<br>ErrorFile: <code>${sheets[i].href}</code> when calling <code> document.styleSheets[${i}].cssRules;</code>`
                    // showMessage(errorMessage, 0, 'error');

                    error(errorMessage, err);
                    continue;
                }

                for (var r in rules) {
                    let rule = rules[r] as CSSStyleRule;
                    // switch (rules[r].constructor.name) {
                    //     case 'CSSStyleRule': 
                    //         rule = rules[r] as CSSStyleRule;
                    //     case 'CSSImportRule':
                    //         // todo
                    //         continue;
                    // }
                    let csstext = rule.selectorText;
    
                    // 需要修改的css属性
                    if (removeCssStyle.includes(csstext)) {
                        let originalColor = window.bgCoverPlugin.cssThemeStyle[csstext]
                        // 主题中该项css样式为空，则直接删除这个项
                        if (originalColor !== 'null') {
                            rule.style.setProperty('background-color', originalColor);
                        }else{
                            rule.style.removeProperty('background-color')
                        }
                    };
                };
            };
        };
    };
};

export function changeBlur(blur: number) {
    var bgLayer = document.getElementById('bglayer');
    bgLayer.style.setProperty('filter', `blur(${blur}px)`)
}

export function changeBgPosition(x: string, y: string) {
    var bgLayer = document.getElementById('bglayer');

    if (x == null || x == undefined) {
        debug(`[bgRender][changeBgPosition] xy未定义，不进行改变`)
        bgLayer.style.setProperty('background-position', `center`);
    } else {
        debug(`[bgRender][changeBgPosition] 修改background-position为${x}% ${y}%`)
        bgLayer.style.setProperty('background-position', `${x}% ${y}%`);
    }
}

export async function applySettings() {
    var bgLayer = document.getElementById('bglayer');
    debug(bgLayer);

    if (configs.get('activate')) {
        bgLayer.style.removeProperty('display')
    } else {
        bgLayer.style.setProperty('display', 'none')
    }

    // 缓存文件夹中没有图片 | 用户刚刚使用这个插件 | 用户刚刚重置了插件数据 | 当前文件404找不到
    const cacheImgNum = fileManagerUI.getCacheImgNum()
    debug(`[bgRender][applySettings] cacheImgNum= ${cacheImgNum}`)
    if (cacheImgNum === 0) {
        // 没有缓存任何图片，使用默认的了了妹图片ULR来当作背景图
        useDefaultLiaoLiaoBg();
    } else if (configs.get('bgObj') === undefined) {
        // 缓存中有1张以上的图片，但是设置的bjObj却是undefined，随机抽一张
        debug(`[bgRender][applySettings] 缓存中有1张以上的图片，但是设置的bjObj却是undefined，随机抽一张`)
        await topbarUI.selectPictureRandom();
    } else {
        // 缓存中有1张以上的图片，bjObj也有内容且图片存在
        debug(`[bgRender][applySettings] 缓存中有1张以上的图片，bjObj也有内容且图片存在`)
        let bgObj = configs.get('bgObj')
        let fileidx = configs.get('fileidx')
        // 没有开启启动自动更换图片，则直接显示该图片
        if (bgObj.hash in fileidx && !configs.get('autoRefresh')) {
            debug(`[bgRender][applySettings] 没有开启启动自动更换图片，则直接显示当前图片`)
            changeBackgroundContent(bgObj.path, bgObj.mode)
        } else {
            // 当bjObj找不到404 | 用户选择随机图片，则随机调一张作为bjObj
            debug(`[bgRender][applySettings] 用户选择随机图片，则随机调一张作为bjObj`)
            await topbarUI.selectPictureRandom();
        }
    }

    changeOpacity(configs.get('opacity'), configs.get('transMode'), configs.get('adaptMode'))
    changeBlur(configs.get('blur'))
    if (configs.get('bgObj') === undefined){
        changeBgPosition(null, null)
    }else{
        changeBgPosition(configs.get('bgObj').offx, configs.get('bgObj').offy)
    }
    
    settingsUI.updateSettingPanelElementStatus()
}