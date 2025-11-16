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

    // 当前显示的bgOb信息
    let crtBgObj = confmngr.get('crtBgObj')

    var crtBgObjName: string = cst.demoImgURL
    if (crtBgObj !== undefined) {
        crtBgObjName = crtBgObj.name
    }

    let crtBgObjCfg = confmngr.get('bgObjCfg')
    var crtOffx = '50'
    var crtOffy = '50'
    if (crtBgObjCfg[crtBgObj.hash] !== undefined) {
        crtOffx = crtBgObjCfg[crtBgObj.hash].offx
        crtOffy = crtBgObjCfg[crtBgObj.hash].offy
    }

    const dialog = new Dialog({
        // title: `${window.bgCoverPlugin.i18n.addTopBarIcon}(v${packageInfo.version}) ${window.bgCoverPlugin.i18n.settingLabel}`,
        width: window.bgCoverPlugin.isMobileLayout ? "92vw" : "max(520px, 60vw)",
        height: "max(520px, 60vh)",
        content: `
        <div class="fn__flex-1 fn__flex config__panel" style="overflow: hidden;position: relative">
            <ul class="b3-tab-bar b3-list b3-list--background">

                <li data-name="config" class="b3-list-item b3-list-item--focus">
                    <svg class="b3-list-item__graphic"><use xlink:href="#iconEdit"></use></svg>
                    <span class="b3-list-item__text">${window.bgCoverPlugin.i18n.tabConfigLabel}</span>
                </li>

                <li data-name="assets" class="b3-list-item">
                    <svg class="b3-list-item__graphic"><use xlink:href="#iconImage"></use></svg>
                    <span class="b3-list-item__text">${window.bgCoverPlugin.i18n.tabAssetsLabel}</span>
                </li>

                <li data-name="theme" class="b3-list-item">
                    <svg class="b3-list-item__graphic"><use xlink:href="#iconTheme"></use></svg>
                    <span class="b3-list-item__text">${window.bgCoverPlugin.i18n.tabThemeLabel}</span>
                </li>

                <li data-name="advance" class="b3-list-item">
                    <svg class="b3-list-item__graphic"><use xlink:href="#iconRiffCard"></use></svg>
                    <span class="b3-list-item__text">${window.bgCoverPlugin.i18n.tabAdvanceLabel}</span>
                </li>

                <li data-name="about" class="b3-list-item">
                    <svg class="b3-list-item__graphic"><use xlink:href="#iconInfo"></use></svg>
                    <span class="b3-list-item__text">${window.bgCoverPlugin.i18n.tabAboutLabel}</span>
                </li>

            </ul>

            <div class="config__tab-wrap">

                <!-- 全局配置Tab -->
                <div class="config__tab-container" data-name="config">
                
                    <!--
                    // info panel part
                    -->
                    
                    <label class="fn__flex b3-label">
                        <div class="fn__flex-1">
                            ${window.bgCoverPlugin.i18n.imgPathLabel}
                            <div class="b3-label__text">
                                <code id="crtImgName" class="fn__code">${crtBgObjName}</code>
                            </div>
                        </div>
                        <div class="fn__flex-center">  
                            <div>
                                <label for="cx">X</label> 
                                <input id="cx" class="b3-slider fn__size50"  max="100" min="0" step="5" type="range" value=${crtOffx}>
                            </div>
                            <div>
                                <label for="cy">Y</label> 
                                <input id="cy" class="b3-slider fn__size50"  max="100" min="0" step="5" type="range" value=${crtOffy}>
                            </div>
                        </div>
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
                    // 自动更换背景按钮
                    -->
                    <div class="b3-label">
                        <div>${window.bgCoverPlugin.i18n.autoRefreshLabel}</div>
                        <div class="fn__hr"></div>

                        <div class="fn__flex config__item">
                            <div class="fn__flex-center fn__flex-1 ft__on-surface">${window.bgCoverPlugin.i18n.autoRefreshDes}</div>
                            <span class="fn__space"></span>
                            <input
                                id="autoRefreshInput"
                                class="b3-switch fn__flex-center"
                                type="checkbox"
                                value="${confmngr.get('autoRefresh')}"
                            />
                        </div>

                        <div class="fn__hr"></div>

                        <div class="fn__flex config__item">
                            <div class="fn__flex-center fn__flex-1 ft__on-surface">${window.bgCoverPlugin.i18n.autoRefreshTimeDes}</div>
                            <span class="fn__space"></span>
                            <input class="b3-text-field fn__flex-center fn__size200" id="autoRefreshTimeInput" type="number" min="0" max="36000" value="${confmngr.get('autoRefreshTime')}">
                            <span class="fn__space"></span>
                            <span class="ft__on-surface fn__flex-center">${window.bgCoverPlugin.i18n.autoRefreshTimeUnit}</span>
                        </div>

                    </div>

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
                </div>

                <!-- 数据目录Tab -->

                <div class="config__tab-container fn__none" data-name="assets">

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
                
                </div>


                <!-- 屏蔽主题Tab -->

                <div class="config__tab-container fn__none" data-name="theme">

                    <div class="config-bazaar__panel">
                    
                        <div class="fn__flex config-bazaar__title">

                            <div>${window.bgCoverPlugin.i18n.themeAdaptEditorMode0}</div>
                        
                        </div>

                        <div class="config-bazaar__content">

                            <div class="b3-cards" id="lightThemeBlockContainer">

                                <!-- label item add by for loop -->
                            
                            </div>
                        
                        </div>

                        <div class="fn__flex config-bazaar__title">

                            <div>${window.bgCoverPlugin.i18n.themeAdaptEditorMode1}</div>
                        
                        </div>

                        <div class="config-bazaar__content">

                            <div class="b3-cards" id="darkThemeBlockContainer">

                                <!-- label item add by for loop -->
                            
                            </div>
                        
                        </div>

                    </div>

                </div>


                <!-- 高级设置Tab -->

                <div class="config__tab-container fn__none" data-name="advance">
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

                </div>

                <!-- 关于Tab -->

                <div class="config__tab-container fn__none" data-name="about">

                    <label class="fn__flex b3-label config__item"> 
                        <div class="fn__flex-1"> 
                            ${window.bgCoverPlugin.i18n.crtVersion} 
                            <div class="b3-abel__text"> 
                                v${packageInfo.version}
                            </div> 
                        </div> 
                    </label>

                    <!--
                    Donations Section
                    -->
                    <label class="fn__flex b3-label config__item"> 
                        <div class="fn__flex-1"> 
                            ${window.bgCoverPlugin.i18n.donationTitle} 
                            <div class="b3-abel__text" style="text-align: center;"> 
                                <table style="width: 75%; margin-left: auto; margin-right: auto;"> 
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

                </div>
            </div>
        
        </div>`
    });

    // Tab switching logic
    const tabBar = dialog.element.querySelector('.b3-tab-bar');
    tabBar.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const tabElement = target.closest('li');

        if (tabElement && !tabElement.classList.contains('b3-list-item--focus')) {
            const tabName = tabElement.getAttribute('data-name');
            
            // Update tab buttons state
            tabBar.querySelectorAll('li').forEach(item => {
                item.classList.remove('b3-list-item--focus');
            });
            tabElement.classList.add('b3-list-item--focus');

            // Update tab containers visibility
            dialog.element.querySelectorAll('.config__tab-container').forEach((container: HTMLElement) => {
                container.classList.add('fn__none');
            });
            dialog.element.querySelector(`.config__tab-container[data-name="${tabName}"]`).classList.remove('fn__none');
        }
    });

    //=================
    // 图片偏移的相关设置
    //=================
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
            let crtBgObj = confmngr.get('crtBgObj')

            // 使用默认的了了图，此时bgObj为undefined，没有下面这些属性，跳过
            if (crtBgObj !== undefined) {

                // 0.5.0版本后数据结构重构，放弃直接修改crtBgObj的.offx offy
                // 因为需要考虑到不同的设备有不同的设置，而这个设置不应该同步
                // 所以使用存在local配置中的'bgObjCfg' -> [img.hash].offx offy来进行记录和控制
                let crtbgObjHash = crtBgObj.hash

                let bgObjCfg = confmngr.get('bgObjCfg')
                let crtBjObjCfg = bgObjCfg[crtbgObjHash]

                if (crtBjObjCfg === undefined) {
                    crtBjObjCfg = {
                        offx: '50',
                        offy: '50',
                    }
                }

                crtBjObjCfg.offx = cxElement.value
                crtBjObjCfg.offy = cyElement.value

                bgObjCfg[crtbgObjHash] = crtBjObjCfg

                confmngr.set('bgObjCfg', bgObjCfg)

                confmngr.save('[settingsUI][openSettingDialog][cxyElement.change]');
            }

        })
    }

    //==============================
    // cacheManger button弹出管理面板
    //==============================
    const cacheManagerElement = document.getElementById('cacheManagerBtn') as HTMLButtonElement;
    cacheManagerElement.addEventListener("click", async () => {
        dialog.destroy();
        topbarUI.selectPictureByHand();
    })

    //=====================
    // plugin onoff switch
    //=====================
    const activateElement = document.getElementById('onoffInput') as HTMLInputElement;
    activateElement.checked = confmngr.get('activate');

    activateElement.addEventListener("click", () => {
        confmngr.set('activate', !confmngr.get('activate'));
        activateElement.value = confmngr.get('activate');
        confmngr.save('[settingsUI][openSettingDialog][activateElement.change]');
        bgRender.applySettings();
    })

    //=========
    // 屏蔽主题
    //=========
    generatedisabledThemeElement();

    //============
    // 自动刷新设置
    //============
    const autoRefreshElement = document.getElementById('autoRefreshInput') as HTMLInputElement;
    autoRefreshElement.checked = confmngr.get('autoRefresh');

    // 自动更新时间
    const autoRefreshTimeElement = document.getElementById('autoRefreshTimeInput') as HTMLInputElement;
    autoRefreshTimeElement.value = `${confmngr.get('autoRefreshTime')}`;
    updateAutoFreshStatus();  // 更新disabled

    // 自动刷新开关
    autoRefreshElement.addEventListener("click", () => {
        confmngr.set('autoRefresh', !confmngr.get('autoRefresh'));
        autoRefreshElement.value = `${confmngr.get('autoRefresh')}`;
        confmngr.save('[settingsUI][openSettingDialog][autoRefreshElement.change]');
        updateAutoFreshStatus();
        bgRender.applySettings();
    })

    // 自动更新时间输入栏
    autoRefreshTimeElement.addEventListener("change", () => {
        confmngr.set('autoRefreshTime', autoRefreshTimeElement.value);
        confmngr.save('[settingsUI][openSettingDialog][autoRefreshTimeElement.change]');
        bgRender.applySettings();
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
        os.rmtree(cst.pluginAssetsDir);
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

export function generatedisabledThemeElement(){
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

    var disabledThemeConfig = confmngr.get('disabledTheme');
    const themeModeText = ['light', 'dark']
    debug('[settingsUI][generatedisabledThemeElement] Current block theme config:', disabledThemeConfig)
    
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

            // if "dark+" in 'disabledTheme.light' keys
            var ithemeConfig = disabledThemeConfig[themeModeText[i]]
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
            <div class="b3-card b3-card--wrap">
                <div class="fn__flex-1 fn__flex-column">
                    <div class="b3-card__info b3-card__info--left fn__flex-1">
                        <span class="crt_plugin-placeholder">${itheme['name']}</span>
                        <!-- span class="ft__on-surface ft__smaller"></span -->
                        <div class="b3-card__desc">
                            ${itheme['label']}
                        </div>
                    </div>
                </div>
                <div class="b3-card__actions b3-card__actions--right">
                    <span class="fn__space"></span>
                    <input class="b3-switch fn__flex-center" data-mode="${themeModeText[i]}" data-theme="${itheme['name']}" type="checkbox"></input>
                </div>
            </div>
            `, 'text/html').body.firstChild as HTMLDivElement
            
            ThemeBlockContainer[i].appendChild(blockLabelItem);

            // 高亮当前主题
            debug(`添加当前主题的蓝色高亮`, itheme["name"], themeName)
            if (themeMode === i && itheme["name"] === themeName) {
                debug(`      => 匹配到一致的主题`)
                let textSpan = blockLabelItem.querySelector('span.crt_plugin-placeholder') as HTMLElement;

                textSpan.style.setProperty('color', 'var(--b3-theme-primary)');
                textSpan.textContent += `[${window.bgCoverPlugin.i18n.crtThemeText}]`
            }

            /**
             * 绑定开关
             */
            let onOffBtn = blockLabelItem.querySelectorAll('input')[0]
            onOffBtn.checked = btnOnOffValue;

            onOffBtn.addEventListener('click', async () => {
                var disabledThemeCfg = confmngr.get('disabledTheme');

                let mode = onOffBtn.getAttribute('data-mode');
                let theme = onOffBtn.getAttribute('data-theme');

                disabledThemeCfg[mode][theme] = !disabledThemeCfg[mode][theme]
                debug(`[settingsUI] User changed disabledTheme ${theme} in ${mode} mode`)
                
                confmngr.set('disabledTheme', disabledThemeCfg);
                confmngr.save('[settingsUI][generatedisabledThemeElement][onOffBtn.click]');

                await bgRender.applySettings();
            })
        }
    }
    confmngr.set('disabledTheme', disabledThemeConfig);
    confmngr.save('[settingsUI][generatedisabledThemeElement]');
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

    // 更新autorefresh相关按钮
    updateAutoFreshStatus()

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

export function updateAutoFreshStatus() {
    updateCheckedElement('autoRefreshInput', confmngr.get('autoRefresh'))

    // 如果auto refresh 是 off的情况，需要更新一下定时切换时间的状态为disabled
    const autoRefreshTimeElement = document.getElementById('autoRefreshTimeInput') as HTMLInputElement;
    if (autoRefreshTimeElement === null || autoRefreshTimeElement === undefined) {
        // debug(`Setting panel not open`) 
    } else {
        if (!confmngr.get('autoRefresh')) {
            autoRefreshTimeElement.disabled = true;
            autoRefreshTimeElement.style.setProperty('background-color', 'var(--b3-theme-surface-lighter)');
            autoRefreshTimeElement.style.setProperty('color', 'var(--b3-theme-disabled)');
        } else {
            autoRefreshTimeElement.disabled = false;
            autoRefreshTimeElement.style.removeProperty('background-color');
            autoRefreshTimeElement.style.removeProperty('color');
        }
    }
}