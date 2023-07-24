import BgCoverPlugin from "./index"

import { Dialog } from "siyuan";
import { configs } from "./configs";

import * as cst from './constants'

import {
    error, warn, info, debug,
    CloseCV, MD5, OS, Numpy,
    getThemeInfo
} from './utils';

export const toAdaptThemes: cst.toAdaptThemes = {
    "Savor": {
        // element id : [LightMode color, Darkmode Color]
        // ${opacity} is the weighted transparency
        // ${alpha} is not weighted transparency
        // This varalbes will automatically adjust to transparency settings later
        'toolbar':    ['rgba(237, 236, 233, ${opacity})', 'rgba(65, 70, 72, ${opacity})'],
        'dockBottom': ['rgba(255, 255, 255, 0)',          'rgba(255, 255, 255, 0)'],
        'status':     ['rgba(255, 255, 255, 0)',          'rgba(255, 255, 255, 0)']
    },
    "Rem Craft": {
        "layouts": [
            'rgb(247, 248, 250, ${0.7/opacity})', 
            'rgba(30, 34, 39, ${0.7/opacity})'
        ],
        'toolbar': [
            'rgb(247, 248, 250)',    
            'rgb(30, 34, 39)'
        ],
        'dockLeft': [
            'rgb(247, 248, 250)',    
            'rgb(30, 34, 39)'
        ],
        'dockRight': [
            'rgb(247, 248, 250)',
            'rgb(30, 34, 39)'
        ],
        'dockBottom':[
            'rgb(247, 248, 250)',    
            'rgb(30, 34, 39)'
        ],
        'status': [
            'rgba(255, 255, 255, 0)',
            'rgba(255, 255, 255, 0)'
        ],
        ".layout-tab-bar": [
            'rgba(247, 248, 250, 0.3)', 
            'rgba(30, 34, 39, 0.3)'
        ],
        '.layout-tab-container': [
            'rgba(247, 248, 250, 0.3)', 
            'rgba(30, 34, 39, 0.3)'
        ],
        '.block__icons': [
            'rgba(247, 248, 250, 0.3)',
            'rgba(30, 34, 39, 0.3)'
        ],
        '.b3-list-item': [
            'rgba(247, 248, 250, 0.3)',
        ],
        '.layout__dockl > .fn__flex > div[data-type="wnd"], .layout__dockr > .fn__flex > div[data-type="wnd"]':[
            'rgba(247, 248, 250, 0.3)', 'rgba(30, 34, 39, 0.3)'
        ],
    },
    "mini-vlook": {
        'status':     [
            'rgba(255, 255, 255, 0)',
            'rgba(255, 255, 255, 0)'
        ],
        '.fn__flex-1.fn__flex-column.file-tree': [
            'rgba(252, 249, 242, 0)', 
            'rgba(244, 248, 242, 0)'
        ], // 不起作用，因为是cssimport，后续需要增加这个功能
    },
    "Light-Blue": {
        // Only light theme
        "layouts":         ['rgba(255, 255, 255, ${0.7/opacity})', ''],
        'toolbar':         ['rgba(255, 255, 255, ${0.7/opacity})', ''],
        'dockLeft':        ['rgba(255, 255, 255, ${0.7/opacity})', ''],
        'dockRight':       ['rgba(255, 255, 255, ${0.7/opacity})', ''],
        'dockBottom':      ['rgba(255, 255, 255, ${0.7/opacity})', ''],
        'status':          ['rgba(255, 255, 255, ${0.7/opacity})', ''],
        ".layout-tab-bar": ['rgba(255, 255, 255, 0.3)', ''],
        '.layout-tab-container': ['rgba(255, 255, 255, 0)', ''],
        '.fn__flex-1.fn__flex [data-type="wnd"]': [
            'rgba(255, 255, 255, 0.3)', '']
    },
    "Dark-Blue": {
        // only dark theme
        "layouts":               ['', 'rgba(30, 34, 39, ${0.7/opacity})'],
        'toolbar':               ['', 'rgba(30, 34, 39, ${0.7/opacity})'],
        'dockLeft':              ['', 'rgba(30, 34, 39, ${0.7/opacity})'],
        'dockRight':             ['', 'rgba(30, 34, 39, ${0.7/opacity})'],
        'dockBottom':            ['', 'rgba(30, 34, 39, ${0.7/opacity})'],
        'status':                ['', 'rgba(30, 34, 39, ${0.7/opacity})'],
        '.layout-tab-container': ['', 'rgba(0,0,0,0)']
    },
    "Odyssey": {
        // only light theme
        "layouts":                     ['rgba(220, 228, 220, ${0.5/opacity})', ''],
        'toolbar':                     ['rgba(220, 228, 220, ${0.5/opacity})', ''],
        'dockLeft':                    ['rgba(220, 228, 220, ${0.5/opacity})', ''],
        'dockRight':                   ['rgba(220, 228, 220, ${0.5/opacity})', ''],
        'dockBottom':                  ['rgba(220, 228, 220, ${0.5/opacity})', ''],
        'status':                      ['rgba(220, 228, 220, ${0.5/opacity})', ''],
        '.layout-tab-container':       ['rgba(244, 248, 242, ${0.5/opacity})', ''],
        '.layout__dockl > .fn__flex-1, .layout__dockr > .fn__flex-1':  [
            'rgba(244, 248, 242, 0)', ''
        ],
    },
    "StarDust": {
        // only dark theme
        'toolbar':    ['', 'rgb(29, 70, 94)'],
        'dockLeft':   ['', 'rgb(29, 70, 94)'],
        'dockRight':  ['', 'rgb(29, 70, 94)'],
        'dockBottom': ['', 'rgb(29, 70, 94)'],
        "layouts":    ['', 'rgb(29, 70, 94)'],
        'status':     ['', 'rgb(29, 70, 94)']
    },
    "Tsundoku": {
        '.fn__flex-column.fn__flex-1': [
            'rgba(241,245,248,0)', 'rgba(22,35,47,0)'
        ],
    },
    "Zhihu": {
        '.layout-tab-bar': [
            'rgba(244,244,244,${0.7/opacity})', 'rgba(18,18,18,${opacity})'
        ]
    },
    "pink-room":{
        'layouts': ['rgba(255,224,224, ${opacity})', ''],
        '.layout-tab-container':[
            'rgba(255,255,255, ${0.3/opacity})', ''
        ]
    }
}

export async function adaptConfigEditor(pluginInstance: BgCoverPlugin) {
    const [themeMode, themeName] = getThemeInfo();

    const configEditor = new Dialog({
        title: window.bgCoverPlugin.i18n.themeAdaptContentDes,
        width: pluginInstance.isMobile ? "92vw" : "520px",
        height: "75vh",
        content: `
        <div class="fn__flex-column" style="height:100%; overflow: auto; box-sizing: border-box;">

            <div class="b3-label file-tree config-keymap" id="keymapList" style="height:100%;">
                <div class="fn__flex config__item">
                    <a href="https://github.com/HowcanoeWang/siyuan-plugin-background-cover/discussion">${window.bgCoverPlugin.i18n.themeAdaptEditorShare}</a>
                </div>

                <div class="fn__hr"></div>

                <div class="fn__flex config__item">
                    <span>${window.bgCoverPlugin.i18n.themeAdaptEditorDes1}</span>

                    <span class="fn__space"></span>
                    
                    <code style="color:red;">${themeName}</code> 

                    <span class="fn__space"></span>

                    <span>${window.bgCoverPlugin.i18n.themeAdaptEditorDes2}</span>
                    
                    <span class="fn__space"></span>
                    
                    <code style="color:red;">${themeMode === 0 ? window.bgCoverPlugin.i18n.themeAdaptEditorMode0 : window.bgCoverPlugin.i18n.themeAdaptEditorMode1}</code>
                </div>
                
                <div class="fn__hr"></div>

                <div class="fn__flex config__item">
                    <span>${window.bgCoverPlugin.i18n.themeAdaptEditorDes3}</span>
                </div>

                <div class="fn__hr"></div>

                <!-- Top menu -->
                <div class="b3-list b3-list--border b3-list--background">

                    <!-- 第一级菜单 start -->
                    <div class="b3-list-item b3-list-item--narrow b3-list-item--hide-action toggle">
                        <span class="b3-list-item__toggle b3-list-item__toggle--hl">
                            <svg class="b3-list-item__arrow b3-list-item__arrow--open"><use xlink:href="#iconRight"></use></svg>
                        </span>
                        <span class="b3-list-item__text ft__on-surface">${window.bgCoverPlugin.i18n.transparentModeOpacity}</span>
                        <span data-type="clear" class="b3-list-item__action b3-tooltips b3-tooltips__w" aria-label="${window.bgCoverPlugin.i18n.addElement}">
                            <svg>
                                <use xlink:href="#iconAdd"></use>
                            </svg>
                        </span>
                    </div>

                    <div class="b3-list__panel">

                        <!-- 第二级菜单 start -->
                        <div class="b3-list-item b3-list-item--narrow b3-list-item--hide-action toggle">
                            <span class="b3-list-item__toggle b3-list-item__toggle--hl">
                                <svg class="b3-list-item__arrow b3-list-item__arrow--open"><use xlink:href="#iconRight"></use></svg>
                            </span>
                            <span class="b3-list-item__text ft__on-surface">$toolbar</span>
                            <span data-type="clear" class="b3-list-item__action b3-tooltips b3-tooltips__w" aria-label="${window.bgCoverPlugin.i18n.addStyle}">
                                <svg>
                                    <use xlink:href="#iconAdd"></use>
                                </svg>
                            </span>
                            <span data-type="clear" class="b3-list-item__action b3-tooltips b3-tooltips__w" aria-label="${window.bgCoverPlugin.i18n.delete}">
                                <svg>
                                    <use xlink:href="#iconTrashcan"></use>
                                </svg>
                            </span>
                        </div>

                        <div class="b3-list__panel">

                            <!-- 第三级菜单 start -->
                            <label class="b3-list-item b3-list-item--narrow b3-list-item--hide-action">
                                <span class="b3-list-item__text"><code>background-color</code></span>
                                <span data-type="clear" class="b3-list-item__action b3-tooltips b3-tooltips__w" aria-label="${window.bgCoverPlugin.i18n.delete}">
                                    <svg>
                                        <use xlink:href="#iconTrashcan"></use>
                                    </svg>
                                </span>
                                <span data-type="update" class="config-keymap__key">rgba(237, 236, 233, \${opacity})</span>
                                <input data-key="editor​general​alignCenter" data-value="⌥C" data-default="⌥C"
                                    class="b3-text-field fn__none" value="rgba(237, 236, 233, \${opacity})" spellcheck="false">
                            </label>
                            <!-- 第三级菜单 end -->

                        </div>
                        <!-- 第二级菜单 end -->

                    </div>
                    <!-- 第一级菜单 end -->

                </div>
                <!-- Top menu -->

                <div class="b3-list b3-list--border b3-list--background">

                    <div class="b3-list-item b3-list-item--narrow b3-list-item--hide-action toggle">
                        <span class="b3-list-item__toggle b3-list-item__toggle--hl">
                            <svg class="b3-list-item__arrow"><use xlink:href="#iconRight"></use></svg>
                        </span>
                        <span class="b3-list-item__text ft__on-surface">${window.bgCoverPlugin.i18n.transparentModeCss}</span>
                        <span data-type="clear" class="b3-list-item__action b3-tooltips b3-tooltips__w" aria-label="${window.bgCoverPlugin.i18n.addElement}">
                        <svg>
                            <use xlink:href="#iconAdd"></use>
                        </svg>
                    </span>
                    </div>

                </div>


            </div>

            <!--label class="b3-label fn__flex">
                <div class="fn__flex-1">
                    <a href="https://github.com/HowcanoeWang/siyuan-plugin-background-cover/discussion">${window.bgCoverPlugin.i18n.themeAdaptEditorShare}</a>
                </div>
            </label-->

            <div class="b3-dialog__action">
                <button class="b3-button b3-button--cancel">${window.bgCoverPlugin.i18n.cancel}</button>
                <div class="fn__space"></div>
                <button class="b3-button b3-button--text">${window.bgCoverPlugin.i18n.import}</button>
                <div class="fn__space"></div>
                <button class="b3-button b3-button--text">${window.bgCoverPlugin.i18n.save}</button>
                <div class="fn__space"></div>
                <button class="b3-button b3-button--text">${window.bgCoverPlugin.i18n.export}</button>
            </div>
        </div>`
    });
};