import packageInfo from '../plugin.json'
import BgCoverPlugin from "./index"

import { Dialog } from "siyuan";
import { configs } from "./configs";

import * as cst from "./constants";
import * as fileManagerUI from "./fileManagerUI";
import * as topbarUI from "./topbarUI";
import * as bgRender from "./bgRender";
import * as themeAdapterUI from "./themeAdapterUI";

import {
    error, warn, info, debug,
    CloseCV, MD5, OS, Numpy,
    getThemeInfo
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
        title: `${pluginInstance.i18n.addTopBarIcon}(v${packageInfo.version}) ${pluginInstance.i18n.settingLabel}`,
        width: pluginInstance.isMobile ? "92vw" : "max(520px, 50vw)",
        height: "max(520px, 90vh)",
        content: `
        <div class="config__tab-container">
        <!--
        // info panel part
        -->
        <label class="fn__flex b3-label">
            <div class="fn__flex-1">
                ${pluginInstance.i18n.imgPathLabel}
                <div class="b3-label__text">
                    <code id="crtImgName" class="fn__code">${configs.get('bgObj') === undefined ? cst.demoImgURL : configs.get('bgObj').name}</code>
                </div>
            </div>
            <div class="fn__flex-center">  
                <div>
                    <label for="cx">X</label> 
                    <input id="cx" class="b3-slider fn__size50"  max="100" min="0" step="5" type="range" value=${configs.get('bgObj') === undefined ? '50' : configs.get('bgObj').offx}>
                </div>
                <div>
                    <label for="cy">Y</label> 
                    <input id="cy" class="b3-slider fn__size50"  max="100" min="0" step="5" type="range" value=${configs.get('bgObj') === undefined ? '50' : configs.get('bgObj').offy}>
                </div>
            </div>
        </label>
        <label class="fn__flex b3-label">
            <div class="fn__flex-1">
                <div class="fn__flex">
                    ${pluginInstance.i18n.cacheDirectoryLabel}
                    <span class="fn__space"></span>
                    <span style="color: var(--b3-theme-on-surface)">${pluginInstance.i18n.cacheDirectoryDes}</span>
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
                ${pluginInstance.i18n.cacheManager}
            </button>
        </label>

        <!--
        // onoff switch part
        -->

        <label class="fn__flex b3-label">
            <div class="fn__flex-1">
                ${pluginInstance.i18n.openBackgroundLabel}
                <div class="b3-label__text">
                    ${pluginInstance.i18n.openBackgroundLabelDes}
                </div>
            </div>
            <span class="fn__flex-center" />
            <input
                id="onoffInput"
                class="b3-switch fn__flex-center"
                type="checkbox"
                value="${configs.get('activate')}"
            />
        </label>
        <label class="fn__flex b3-label">
            <div class="fn__flex-1">
                ${pluginInstance.i18n.autoRefreshLabel}
                <div class="b3-label__text">
                    ${pluginInstance.i18n.autoRefreshDes}
                </div>
            </div>
            <span class="fn__flex-center" />
            <input
                id="autoRefreshInput"
                class="b3-switch fn__flex-center"
                type="checkbox"
                value="${configs.get('autoRefresh')}"
            />
        </label>

        <!--
        // slider part Input[4] - Input [5]
        -->

        <label class="fn__flex b3-label config__item">
            <div class="fn__flex-1">
                ${pluginInstance.i18n.opacityLabel}
                <div class="b3-label__text">
                    ${pluginInstance.i18n.opacityDes}
                </div>
            </div>
            <div class="b3-tooltips b3-tooltips__n fn__flex-center" aria-label="${configs.get('opacity')}">   
                <input id="opacityInput" class="b3-slider fn__size200" max="1" min="0.1" step="0.05" type="range" value="${configs.get('opacity')}">
            </div>
        </label>
        <label class="fn__flex b3-label config__item">
            <div class="fn__flex-1">
                ${pluginInstance.i18n.blurLabel}
                <div class="b3-label__text">
                    ${pluginInstance.i18n.blurDes}
                </div>
            </div>
            <div class="b3-tooltips b3-tooltips__n fn__flex-center" aria-label="${configs.get('blur')}">   
                <input id="blurInput" class="b3-slider fn__size200" max="10" min="0" step="1" type="range" value="${configs.get('blur')}">
            </div>
        </label>

        <!--
        // theme mode and adapt configs
        -->

        <label class="fn__flex b3-label config__item">
            <div class="fn__flex-1">
                ${pluginInstance.i18n.transparentMode}
                <div class="b3-label__text">${pluginInstance.i18n.transparentModeDes}</div>
            </div>
            <span class="fn__space"></span>
            <select id="transModeSelect" class="b3-select fn__flex-center fn__size200">
                <option value="0" selected="">${pluginInstance.i18n.transparentModeOpacity}</option>
                <option value="1">${pluginInstance.i18n.transparentModeCss}</option>
            </select>
        </label>

        <label class="fn__flex b3-label config__item">
            <div class="fn__flex-1">
                <div class="fn__flex">
                    ${pluginInstance.i18n.themeAdaptLabel}
                    <span class="fn__space"></span>
                    <a id="adaptConfigEditorURL">${pluginInstance.i18n.themeAdaptContentDes}</a>
                </div>
                
                <div id="themeAdaptDes" class="b3-label__text">
                    ${pluginInstance.i18n.themeAdaptDes}
                </div>
            </div>

            <span class="fn__space"></span>
            <input
                id="themeAdaptInput"
                class="b3-switch fn__flex-center"
                type="checkbox"
                value="${configs.get('adaptMode')}"
            />
        </label>

        <!--
        // reset panel part, Button[0]
        -->

        <label class="b3-label config__item fn__flex">
            <div class="fn__flex-1">
            ${pluginInstance.i18n.resetConfigLabel}
                <div class="b3-label__text">
                    ${pluginInstance.i18n.resetConfigDes}<span class="selected" style="color:rgb(255,0,0)">${pluginInstance.i18n.resetConfigDes2}
                    </span>
                </div>
            </div>
            <span class="fn__space"></span>
            <button id="resetBtn" class="b3-button b3-button--outline fn__flex-center fn__size100" id="appearanceRefresh">
                <svg><use xlink:href="#iconRefresh"></use></svg>
                ${pluginInstance.i18n.reset}
            </button>
        </label>

        <!--
        // debug panel part
        -->

        <label class="fn__flex b3-label config__item">
            <div class="fn__flex-1">
                ${pluginInstance.i18n.inDevModeLabel}
                <div class="b3-label__text">
                    ${pluginInstance.i18n.inDevModeDes}
                </div>
            </div>
            <span class="fn__flex-center" />
            <input
                id="devModeInput"
                class="b3-switch fn__flex-center"
                type="checkbox"
                value="${configs.get('inDev')}"
            />
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
            let bgObj = configs.get('bgObj')

            // 使用默认的了了图，此时bgObj为undefined，没有下面这些属性，跳过
            if (bgObj !== undefined) {

                bgObj.offx = cxElement.value
                bgObj.offy = cyElement.value

                configs.set('bgObj', bgObj)

                let fileidx = configs.get('fileidx')
                fileidx[bgObj.hash] = bgObj

                configs.set('fileidx', fileidx)

                configs.save();
            }

        })
    }

    // cacheManger button
    const cacheManagerElement = document.getElementById('cacheManagerBtn') as HTMLButtonElement;
    cacheManagerElement.addEventListener("click", async () => {
        dialog.destroy();
        topbarUI.selectPictureByHand(pluginInstance);
    })

    // plugin onoff switch
    const activateElement = document.getElementById('onoffInput') as HTMLInputElement;
    activateElement.checked = configs.get('activate');

    activateElement.addEventListener("click", () => {
        configs.set('activate', !configs.get('activate'));
        activateElement.value = configs.get('activate');
        configs.save();
        bgRender.applySettings(pluginInstance);
    })

    // the Auto refresh switch
    const autoRefreshElement = document.getElementById('autoRefreshInput') as HTMLInputElement;
    autoRefreshElement.checked = configs.get('autoRefresh');

    autoRefreshElement.addEventListener("click", () => {
        configs.set('autoRefresh', !configs.get('autoRefresh'));
        autoRefreshElement.value = `${configs.get('autoRefresh')}`;
        configs.save();
    })

    // transparency/opacity slider
    const opacityElement = document.getElementById('opacityInput') as HTMLInputElement;
    opacityElement.addEventListener("change", () => {
        configs.set('opacity', parseFloat(opacityElement.value));
        if (configs.get('activate')) {
            bgRender.changeOpacity(pluginInstance, configs.get('opacity'), configs.get('transMode'), configs.get('adaptMode'));
        }
        configs.save();
    })
    opacityElement.addEventListener("input", () => {
        // update the aira-label value
        opacityElement.parentElement.setAttribute('aria-label', opacityElement.value);
    })

    // blur slider
    const blurElement =  document.getElementById('blurInput') as HTMLInputElement;
    blurElement.addEventListener("change", () => {
        configs.set('blur', parseFloat(blurElement.value));
        if (configs.get('activate')) {
            bgRender.changeBlur(configs.get('blur'));
        }
        configs.save();
    })
    blurElement.addEventListener("input", () => {
        // update the aira-label value
        blurElement.parentElement.setAttribute('aria-label', blurElement.value);
    })

    // the transparent mode selection
    const transModeElement = document.getElementById('transModeSelect') as HTMLSelectElement;

    transModeElement.value = configs.get('transMode');

    transModeElement.addEventListener('change', () => {
        configs.set('transMode', transModeElement.value);
        bgRender.changeOpacity(pluginInstance, configs.get('opacity'), configs.get('transMode'), configs.get('adaptMode'));
        configs.save();
    });

    const configEditorURL = document.getElementById('adaptConfigEditorURL') as HTMLLinkElement
    configEditorURL.addEventListener('click', () => {
        themeAdapterUI.adaptConfigEditor(pluginInstance);
    });

    // the theme adapt switches
    const themeAdaptElement = document.getElementById('themeAdaptInput') as HTMLInputElement;
    updateCheckedElement('themeAdaptInput',  configs.get('adaptMode'));

    themeAdaptElement.addEventListener("click", () => {
        configs.set('adaptMode', !configs.get('adaptMode'));
        themeAdaptElement.value = `${configs.get('adaptMode')}`;
        bgRender.changeOpacity(pluginInstance, configs.get('opacity'),  configs.get('transMode'), configs.get('adaptMode'));
        configs.save();
    });

    // reset panel
    const resetSettingElement = document.getElementById('resetBtn') as HTMLButtonElement;
    resetSettingElement.addEventListener("click", async () => {
        os.rmtree(cst.pluginImgDataDir);
        configs.reset();
        await configs.save();
        await bgRender.applySettings(pluginInstance);
    })

    // the dev mode settings
    const devModeElement = document.getElementById('devModeInput') as HTMLInputElement;
    devModeElement.checked = configs.get('inDev');

    devModeElement.addEventListener("click", () => {
        configs.set('inDev', !configs.get('inDev'));
        devModeElement.value = `${configs.get('inDev')}`;
        configs.save();
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


export function updateSettingPanelElementStatus() {
    // update current image URL
    let crtImageNameElement = document.getElementById('crtImgName')
    if (crtImageNameElement === null || crtImageNameElement === undefined) {
        // debug(`Setting panel not open`) 
    } else {
        let bgObj = configs.get('bgObj')
        if (configs.get('bgObj') === undefined) {
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
        const cacheImgNum = this.getCacheImgNum()
        cacheImgNumEle.textContent = `[ ${cacheImgNum} ]`
    }

    // update onoff switch button
    updateCheckedElement('onoffInput', configs.get('activate'))

    // 更新autorefresh按钮
    updateCheckedElement('autoRefreshInput', configs.get('autoRefresh'))

    // 更新opacity滑动条
    updateSliderElement('opacityInput', configs.get('opacity'))

    // 更新blur滑动条
    updateSliderElement('blurInput', configs.get('blur'))

    updateCheckedElement('themeAdaptInput', configs.get('adaptMode'))

    // 更新开发者模式按钮
    updateCheckedElement('devModeInput', configs.get('inDev'))

}

export function updateOffsetSwitch() {
    let cxElement = document.getElementById('cx') as HTMLInputElement
    let cyElement = document.getElementById('cy') as HTMLInputElement

    if (cxElement === null || cxElement === undefined) {
        // debug(`Setting panel not open`) 
    } else {
        let bglayerElement = document.getElementById('bglayer')
        if (configs.get('activate')) {
            const container_h = parseInt(getComputedStyle(bglayerElement).height)  // -> '1280px'
            const container_w = parseInt(getComputedStyle(bglayerElement).width)

            let fullside: string
            // 使用默认的了了图
            if (configs.get('bgObj') === undefined) {
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
                    configs.get('bgObj').width, configs.get('bgObj').height
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