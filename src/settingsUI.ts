import packageInfo from '../plugin.json'
import BgCoverPlugin from "./index"

import { Dialog, getBackend, getFrontend, showMessage} from "siyuan";
import { confmngr } from "./configs";

import * as cst from "./constants";
import * as fileManagerUI from "./fileManagerUI";
import * as topbarUI from "./topbarUI";
import * as bgRender from "./bgRender";

import { 
    debug,
    CloseCV, OS,
    getCurrentThemeInfo, getInstalledThemes
} from './utils';

// pythonic style
let os = new OS();
let cv2 = new CloseCV();

/**
 * 设置面板的主函数
 * @param pluginInstance 
 */

export function openSettingDialog(pluginInstance: BgCoverPlugin) {
    const cacheImgNum = fileManagerUI.getCacheImgNum();

    const dialog = new Dialog({
        title: `${window.bgCoverPlugin.i18n.addTopBarIcon}(v${packageInfo.version}) ${window.bgCoverPlugin.i18n.settingLabel}`,
        width: window.bgCoverPlugin.isMobileLayout ? "92vw" : "max(520px, 50vw)",
        height: "max(520px, 90vh)",
        content: `
        <div class="config__tab-container" style="background-color: var(--b3-theme-background)">
        <!--
        // info panel part
        -->
        <label class="fn__flex b3-label">
            <div class="fn__flex-1">
                ${window.bgCoverPlugin.i18n.imgPathLabel}
                <div class="b3-label__text">
                    <code id="crtImgName" class="fn__code">${confmngr.get('crtBgObj') === undefined ? cst.demoImgURL : confmngr.get('crtBgObj').name}</code>
                </div>
            </div>
            <div class="fn__flex-center">  
                <div>
                    <label for="cx">X</label> 
                    <input id="cx" class="b3-slider fn__size50"  max="100" min="0" step="5" type="range" value=${confmngr.get('crtBgObj') === undefined ? '50' : confmngr.get('crtBgObj').offx}>
                </div>
                <div>
                    <label for="cy">Y</label> 
                    <input id="cy" class="b3-slider fn__size50"  max="100" min="0" step="5" type="range" value=${confmngr.get('crtBgObj') === undefined ? '50' : confmngr.get('crtBgObj').offy}>
                </div>
            </div>
        </label>
        <label class="fn__flex b3-label config__item">
            <div class="fn__flex-1">
                <div class="fn__flex">
                    ${window.bgCoverPlugin.i18n.cacheDirectoryLabel}
                    <span class="fn__space"></span>
                    <span style="color: var(--b3-theme-on-surface)">${window.bgCoverPlugin.i18n.cacheDirectoryDes}</span>
                    <span id="cacheImgNumElement" class="selected" style="color: rgb(255,0,0)">
                        [ ${cacheImgNum} ]
                    </span>
                </div>
                <div class="b3-label__text">
                    <a href="file:///${cst.pluginAssetsDirOS}/" style="word-break: break-all">${cst.pluginAssetsDirOS}</a>
                </div>
            </div>
            <span class="fn__space"></span>
            <button id="cacheManagerBtn" class="b3-button b3-button--outline fn__flex-center fn__size100" id="appearanceRefresh">
                <svg><use xlink:href="#iconDatabase"></use></svg>
                ${window.bgCoverPlugin.i18n.cacheManager}
            </button>
        </label>

        <!--
        // onoff switch part
        -->

        <label class="fn__flex b3-label config__item">
            <div class="fn__flex-1">
                ${window.bgCoverPlugin.i18n.openBackgroundLabel}
                <div class="b3-label__text">
                    ${window.bgCoverPlugin.i18n.openBackgroundLabelDes}
                </div>
            </div>
            <span class="fn__flex-center" />
            <input
                id="onoffInput"
                class="b3-switch fn__flex-center"
                type="checkbox"
                value="${confmngr.get('activate')}"
            />
        </label>

        
        <!--
        // theme black list
        -->

        <div class="b3-label config__item">
            ${window.bgCoverPlugin.i18n.blockThemeTitle}
            <!-- light theme block -->
            <div class="b3-label__text">${window.bgCoverPlugin.i18n.themeAdaptEditorMode0}</div>
            <div class="b3-label">
                <div class="config-query" id="lightThemeBlockContainer">

                    <!-- label item add by for loop -->

                </div>
            </div>

            <!-- dark theme block -->
            <div class="b3-label__text">${window.bgCoverPlugin.i18n.themeAdaptEditorMode1}</div>
            <div class="b3-label">
                <div class="config-query" id="darkThemeBlockContainer">
                    
                    <!-- label item add by for loop -->

                </div>
            </div>
            
        </div>

        
        <!--
        // 自动更新按钮
        -->

        <label class="fn__flex b3-label config__item">
            <div class="fn__flex-1">
                ${window.bgCoverPlugin.i18n.autoRefreshLabel}
                <div class="b3-label__text">
                    ${window.bgCoverPlugin.i18n.autoRefreshDes}
                </div>
            </div>
            <span class="fn__flex-center" />
            <input
                id="autoRefreshInput"
                class="b3-switch fn__flex-center"
                type="checkbox"
                value="${confmngr.get('autoRefresh')}"
            />
        </label>

        <!--
        // slider part Input[4] - Input [5]
        -->

        <label class="fn__flex b3-label config__item">
            <div class="fn__flex-1">
                ${window.bgCoverPlugin.i18n.opacityLabel}
                <div class="b3-label__text">
                    ${window.bgCoverPlugin.i18n.opacityDes}
                </div>
            </div>
            <div class="b3-tooltips b3-tooltips__n fn__flex-center" aria-label="${confmngr.get('opacity')}">   
                <input id="opacityInput" class="b3-slider fn__size200" max="1" min="0" step="0.05" type="range" value="${confmngr.get('opacity')}">
            </div>
        </label>
        <label class="fn__flex b3-label config__item">
            <div class="fn__flex-1">
                ${window.bgCoverPlugin.i18n.blurLabel}
                <div class="b3-label__text">
                    ${window.bgCoverPlugin.i18n.blurDes}
                </div>
            </div>
            <div class="b3-tooltips b3-tooltips__n fn__flex-center" aria-label="${confmngr.get('blur')}">   
                <input id="blurInput" class="b3-slider fn__size200" max="10" min="0" step="1" type="range" value="${confmngr.get('blur')}">
            </div>
        </label>

        <!--
        // reset panel part, Button[0]
        -->

        <label class="b3-label config__item fn__flex">
            <div class="fn__flex-1">
            ${window.bgCoverPlugin.i18n.resetConfigLabel}
                <div class="b3-label__text">
                    ${window.bgCoverPlugin.i18n.resetConfigDes}<span class="selected" style="color:rgb(255,0,0)">${window.bgCoverPlugin.i18n.resetConfigDes2}
                    </span>
                </div>
            </div>
            <span class="fn__space"></span>
            <button id="resetBtn" class="b3-button b3-button--outline fn__flex-center fn__size100" id="appearanceRefresh">
                <svg><use xlink:href="#iconRefresh"></use></svg>
                ${window.bgCoverPlugin.i18n.reset}
            </button>
        </label>

        <!--
        // debug panel part
        -->

        <label class="fn__flex b3-label config__item">
            <div class="fn__flex-1">
                ${window.bgCoverPlugin.i18n.inDevModeLabel}
                <div class="b3-label__text">
                    ${window.bgCoverPlugin.i18n.inDevModeDes} • 
                    FrontEnd: <code class="fn__code">${getFrontend()}</code> • BackEnd: <code class="fn__code">${getBackend()}</code> • 
                    isMobileLayout: <code class="fn__code">${window.bgCoverPlugin.isMobileLayout}</code> • 
                    isBrowser: <code class="fn__code">${window.bgCoverPlugin.isBrowser}</code> • 
                    isAndroid: <code class="fn__code">${window.bgCoverPlugin.isAndroid}</code>
                </div>
            </div>
            <span class="fn__flex-center" />
            <input
                id="devModeInput"
                class="b3-switch fn__flex-center"
                type="checkbox"
                value="${confmngr.get('inDev')}"
            />
        </label>

        <!--
        Donations Section
        -->
         <label class="fn__flex b3-label config__item"> 
             <div class="fn__flex-1"> 
                 ${window.bgCoverPlugin.i18n.donationTitle} 
                  <div class="b3-abel__text" style="text-align: center;"> 
                      <table style="width: 50%; margin-left: auto; margin-right: auto;"> 
                         <thead> 
                             <tr> 
                                 <th>${window.bgCoverPlugin.i18n.donationAlipay}</th> 
                                 <th>${window.bgCoverPlugin.i18n.donationWechat}</th> 
                             </tr> 
                         </thead> 
                         <tbody> 
                             <tr> 
                                 <td style="text-align: center;"> 
                                     <img width="256px" alt="" src="./plugins/siyuan-plugin-background-cover/static/ali.jpg"> 
                                 </td> 
                                 <td style="text-align: center;"> 
                                     <img width="256px" alt="" src="./plugins/siyuan-plugin-background-cover/static/wechat.png"> 
                                 </td> 
                             </tr> 
                         </tbody> 
                     </table> 
                 </div> 
             </div> 
         </label>

        </div>`
    });

    // image position slider
    const cxElement = document.getElementById('cx') as HTMLInputElement;
    const cyElement = document.getElementById('cy') as HTMLInputElement;

    updateOffsetSwitch()
    window.addEventListener('resize', updateOffsetSwitch)

    let elementsArray = [cxElement, cyElement]
    // 用循环给两个element绑定相同的函数功能
    for (let i = 0; i < 2; i++) {
        // 拖动的时候，修改图片的位置
        elementsArray[i].addEventListener("input", () => {
            debug(elementsArray, cxElement.value, cyElement.value)
            bgRender.changeBgPosition(cxElement.value, cyElement.value)
        })
        // 停止拖动的时候，保存图片的位置
        elementsArray[i].addEventListener("change", () => {
            //
            let bgObj = confmngr.get('crtBgObj')

            // 使用默认的了了图，此时bgObj为undefined，没有下面这些属性，跳过
            if (bgObj !== undefined) {

                bgObj.offx = cxElement.value
                bgObj.offy = cyElement.value

                confmngr.set('bgObj', bgObj)

                let fileidx = confmngr.get('fileidx')
                fileidx[bgObj.hash] = bgObj

                confmngr.set('fileidx', fileidx)

                confmngr.save('[settingsUI][openSettingDialog][cxyElement.change]');
            }

        })
    }

    // cacheManger button
    const cacheManagerElement = document.getElementById('cacheManagerBtn') as HTMLButtonElement;
    cacheManagerElement.addEventListener("click", async () => {
        dialog.destroy();
        topbarUI.selectPictureByHand();
    })

    // plugin onoff switch
    const activateElement = document.getElementById('onoffInput') as HTMLInputElement;
    activateElement.checked = confmngr.get('activate');

    activateElement.addEventListener("click", () => {
        confmngr.set('activate', !confmngr.get('activate'));
        activateElement.value = confmngr.get('activate');
        confmngr.save('[settingsUI][openSettingDialog][activateElement.change]');
        bgRender.applySettings();
    })

    // block theme
    generateBlockThemeElement();

    // the Auto refresh switch
    const autoRefreshElement = document.getElementById('autoRefreshInput') as HTMLInputElement;
    autoRefreshElement.checked = confmngr.get('autoRefresh');

    autoRefreshElement.addEventListener("click", () => {
        confmngr.set('autoRefresh', !confmngr.get('autoRefresh'));
        autoRefreshElement.value = `${confmngr.get('autoRefresh')}`;
        confmngr.save('[settingsUI][openSettingDialog][autoRefreshElement.change]');
    })

    // transparency/opacity slider
    const opacityElement = document.getElementById('opacityInput') as HTMLInputElement;
    opacityElement.addEventListener("change", () => {
        confmngr.set('opacity', parseFloat(opacityElement.value));
        if (confmngr.get('activate')) {
            bgRender.changeOpacity(confmngr.get('opacity'));
        }
        confmngr.save('[settingsUI][openSettingDialog][opacityElement.change]');
    })
    opacityElement.addEventListener("input", () => {
        // update the aira-label value
        opacityElement.parentElement.setAttribute('aria-label', opacityElement.value);
    })

    // blur slider
    const blurElement =  document.getElementById('blurInput') as HTMLInputElement;
    blurElement.addEventListener("change", () => {
        confmngr.set('blur', parseFloat(blurElement.value));
        if (confmngr.get('activate')) {
            bgRender.changeBlur(confmngr.get('blur'));
        }
        confmngr.save('[settingsUI][openSettingDialog][blurElement.change]');
    })
    blurElement.addEventListener("input", () => {
        // update the aira-label value
        blurElement.parentElement.setAttribute('aria-label', blurElement.value);
    })

    // reset panel
    const resetSettingElement = document.getElementById('resetBtn') as HTMLButtonElement;
    resetSettingElement.addEventListener("click", async () => {
        os.rmtree(cst.pluginImgDataDir);
        confmngr.reset();
        await confmngr.save('[settingsUI][openSettingDialog][resetSettingElement.click]');
        await bgRender.applySettings();
    })

    // the dev mode settings
    const devModeElement = document.getElementById('devModeInput') as HTMLInputElement;
    devModeElement.checked = confmngr.get('inDev');

    devModeElement.addEventListener("click", () => {
        confmngr.set('inDev', !confmngr.get('inDev'));
        devModeElement.value = `${confmngr.get('inDev')}`;
        confmngr.save('[settingsUI][openSettingDialog][devModeElement.change]');
    })

    // const inputElement = dialog.element.querySelector("textarea");
    // inputElement.value = pluginInstance.data[STORAGE_NAME].imgPath;

    // const btnsElement = dialog.element.querySelectorAll(".b3-button");
    // dialog.bindInput(inputElement, () => {
    //     (btnsElement[1] as HTMLButtonElement).click();
    // });

    // inputElement.focus();

    // btnsElement[0].addEventListener("click", () => {
    //     dialog.destroy();
    // });
    // btnsElement[1].addEventListener("click", () => {
    //     pluginInstance.saveData(STORAGE_NAME, {readonlyText: inputElement.value});
    //     dialog.destroy();
    // });
}

export function generateBlockThemeElement(){
    const [themeMode, themeName] = getCurrentThemeInfo();

    const installedThemes = getInstalledThemes();
    /** 
     in siyan 2.1.30, theme data structure changed to:
     不需要加载缓存就能直接获取主题字段和对应的名字了
     installedThemes = [lightThemes, darkThemes]
     lightThemes = [
        {
            "name": "daylight",
            "label": "daylight（默认主题）"
        },
        ...
    ]
    **/

    const ThemeBlockContainer = [
        document.getElementById('lightThemeBlockContainer') as HTMLDivElement,
        document.getElementById('darkThemeBlockContainer') as HTMLDivElement,
    ]

    var blockThemeConfig = confmngr.get('blockTheme');
    const themeModeText = ['light', 'dark']
    debug('[settingsUI][generateBlockThemeElement] Current block theme config:', blockThemeConfig)
    
    // i==0 -> light; i == 1 -> dark
    for (var i = 0; i < installedThemes.length; i++) {
        var iThemes = installedThemes[i];

        // iter each mode themes
        for (var j = 0; j < iThemes.length; j++) {
            /**
             *  检查config里面的设置
             */ 
            var itheme = iThemes[j] // 安装的某个 dark|light theme
            // itheme = {"name": "daylight", "label": "daylight（默认主题）"}

            var btnOnOffValue: boolean;  // 该主题是否屏蔽

            // if "dark+" in 'blockTheme.light' keys
            var ithemeConfig = blockThemeConfig[themeModeText[i]]
            if (itheme["name"] in ithemeConfig) {
                // 在设置中存在，直接读取之前的设置值
                btnOnOffValue = ithemeConfig[itheme["name"]];
            } else {
                // 在设置中不存在，添加然后设置值为false
                btnOnOffValue = false;
                ithemeConfig[itheme["name"]] = btnOnOffValue;
            }

            /**
             *  添加设置中的按钮
             */ 
            let parser = new DOMParser();
            var blockLabelItem = parser.parseFromString(`
            <label class="fn__flex">
                <div class="fn__flex-1">
                    ${itheme['label']}
                </div>
                <span class="fn__space"></span>
                <input class="b3-switch" data-mode="${themeModeText[i]}" data-theme="${itheme['name']}" type="checkbox">
            </label>`, 
            'text/html').body.firstChild as HTMLDivElement
            
            ThemeBlockContainer[i].appendChild(blockLabelItem);

            // 高亮当前主题
            if (themeMode === i && itheme["name"] === themeName) {
                let textItem = blockLabelItem.querySelectorAll('div')[0]

                textItem.style.setProperty('color', 'var(--b3-theme-primary)');
                textItem.textContent += `[${window.bgCoverPlugin.i18n.crtThemeText}]`
            }

            /**
             * 绑定开关
             */
            let onOffBtn = blockLabelItem.querySelectorAll('input')[0]
            onOffBtn.checked = btnOnOffValue;

            onOffBtn.addEventListener('click', async () => {
                var blockThemeCfg = confmngr.get('blockTheme');

                let mode = onOffBtn.getAttribute('data-mode');
                let theme = onOffBtn.getAttribute('data-theme');

                blockThemeCfg[mode][theme] = !blockThemeCfg[mode][theme]
                debug(`[settingsUI] User changed blockTheme ${theme} in ${mode} mode`)
                
                confmngr.set('blockTheme', blockThemeCfg);
                confmngr.save('[settingsUI][generateBlockThemeElement][onOffBtn.click]');

                await bgRender.applySettings();
            })
        }
    }
    confmngr.set('blockTheme', blockThemeConfig);
    confmngr.save('[settingsUI][generateBlockThemeElement]');
}

export function updateSliderElement(elementid:string, value:string, setAriaLabel:boolean=true) {
    let sliderElement = document.getElementById(elementid) as HTMLInputElement
    if (sliderElement === null || sliderElement=== undefined) {
        // debug(`Setting panel not open`) 
    } else {
        sliderElement.value = value;
        if (setAriaLabel) {
            sliderElement.parentElement.setAttribute('aria-label', value);
        }
    }
}

export function updateCheckedElement(elementid:string, value:boolean) {
    let checkedElement = document.getElementById(elementid) as HTMLInputElement
    if (checkedElement === null || checkedElement === undefined) {
        // debug(`Setting panel not open`) 
    } else {
        checkedElement.checked = value;
    }
}

export function opacityShortcut(isAdd:boolean) {
    var opacity = confmngr.get('opacity');
    if (isAdd) {
        opacity = Number((opacity + 0.1).toFixed(2));
    } else {
        opacity = Number((opacity - 0.1).toFixed(2));
    };

    if (opacity > 1 || opacity < 0) {
        showMessage(`[${window.bgCoverPlugin.i18n.addTopBarIcon}]${window.bgCoverPlugin.i18n.opacityShortcutOverflow}`, 4000, 'info')
        return;
    } else {
        confmngr.set('opacity', opacity);
        confmngr.save('[settingsUI][opacityShortcut]');
        if (confmngr.get('activate')) {
            bgRender.changeOpacity(opacity);
        }
        updateSliderElement('opacityInput', `${opacity}`);
    };

}

export function blurShortcut(isAdd:boolean) {
    var blur = confmngr.get('blur');
    if (isAdd) {
        blur = Number((blur + 1).toFixed(0));
    } else {
        blur = Number((blur - 1).toFixed(0));
    };

    if (blur > 10 || blur < 0) {
        showMessage(`[${window.bgCoverPlugin.i18n.addTopBarIcon}]${window.bgCoverPlugin.i18n.blurShortcutOverflow}`, 4000, 'info')
        return;
    } else {
        confmngr.set('blur', blur);
        confmngr.save('[settingsUI][blurShortcut]');
        if (confmngr.get('activate')) {
            bgRender.changeBlur(blur);
        }
        updateSliderElement('blurInput', `${blur}`);
    };
}

export function updateSettingPanelElementStatus() {
    // update current image URL
    let crtImageNameElement = document.getElementById('crtImgName')
    if (crtImageNameElement === null || crtImageNameElement === undefined) {
        // debug(`Setting panel not open`) 
    } else {
        let bgObj = confmngr.get('crtBgObj')
        if (confmngr.get('crtBgObj') === undefined) {
            crtImageNameElement.textContent = cst.demoImgURL.toString()
        } else {
            crtImageNameElement.textContent = bgObj.name
        }
    }

    updateOffsetSwitch()

    // 更新setting中的[imgNum]数字
    let cacheImgNumEle = document.getElementById('cacheImgNumElement')
    if (cacheImgNumEle === null || cacheImgNumEle === undefined) {
        // debug(`Setting panel not open`) 
    } else {
        const cacheImgNum = fileManagerUI.getCacheImgNum()
        cacheImgNumEle.textContent = `[ ${cacheImgNum} ]`
    }

    // update onoff switch button
    updateCheckedElement('onoffInput', confmngr.get('activate'))

    // 更新autorefresh按钮
    updateCheckedElement('autoRefreshInput', confmngr.get('autoRefresh'))

    // 更新opacity滑动条
    updateSliderElement('opacityInput', confmngr.get('opacity'))

    // 更新blur滑动条
    updateSliderElement('blurInput', confmngr.get('blur'))

    // 更新开发者模式按钮
    updateCheckedElement('devModeInput', confmngr.get('inDev'))

}

export function updateOffsetSwitch() {
    let cxElement = document.getElementById('cx') as HTMLInputElement
    let cyElement = document.getElementById('cy') as HTMLInputElement

    if (cxElement === null || cxElement === undefined) {
        // debug(`Setting panel not open`) 
    } else {
        let bglayerElement = document.getElementById('bglayer')
        if (confmngr.get('activate')) {
            const container_h = parseInt(getComputedStyle(bglayerElement).height)  // -> '1280px'
            const container_w = parseInt(getComputedStyle(bglayerElement).width)

            let fullside: string
            // 使用默认的了了图
            if (confmngr.get('crtBgObj') === undefined) {
                fullside = cv2.getFullSide(
                    container_w, container_h,
                    2458, 1383 // 默认了了图的宽高
                )
                // 重新设置一下x和y的值
                cxElement.value = '50'
                cyElement.value = '50'
            }else{
                fullside = cv2.getFullSide(
                    container_w, container_h,
                    confmngr.get('crtBgObj').width, confmngr.get('crtBgObj').height
                )
            }

            if (fullside === 'X') {
                cxElement.disabled = true
                cyElement.disabled = false
                cxElement.style.setProperty('opacity', '0.1')
                cyElement.style.removeProperty('opacity')
            } else {
                cyElement.disabled = true
                cxElement.disabled = false
                cyElement.style.setProperty('opacity', '0.1')
                cxElement.style.removeProperty('opacity')
            }
        } else {
            cyElement.disabled = true
            cxElement.disabled = true
            cyElement.style.setProperty('opacity', '0.1')
            cxElement.style.setProperty('opacity', '0.1')
        }
    }
}