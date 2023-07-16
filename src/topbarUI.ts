import {
    Plugin,
    showMessage,
    confirm,
    Dialog,
    Menu,
    // openTab,
    // adaptHotkey,
    getFrontend,
    getBackend,
    // IModel,
    // Setting, fetchPost
} from "siyuan";

import {
    error, warn, info, debug,
    CloseCV, MD5, OS, Numpy,
    getThemeInfo
} from './utils';

import BgCoverPlugin from "./index"
import { configs } from './configs';
import * as noticeUI from "./noticeUI";
import * as bugreportUI from "./bugreportUI";
import * as settingsUI from "./settingsUI";

/**
 * 顶栏按钮UI
 */
export async function initTopbar(pluginInstance: BgCoverPlugin) {

    const topBarElement = pluginInstance.addTopBar({
        icon: "iconLogo",
        title: pluginInstance.i18n.addTopBarIcon,
        position: "right",
        callback: () => {
            debug(`[topbarUI.ts][initTopbar] click and open toolbar`);
        }
    });

    topBarElement.addEventListener("click", async () => {
        if (pluginInstance.isMobile) {
            noticeUI.showMobileTodo();
            // pluginInstance.addMenu();
        } else {
            let rect = topBarElement.getBoundingClientRect();
            // 如果被隐藏，则使用更多按钮
            if (rect.width === 0) {
                rect = document.querySelector("#barMore").getBoundingClientRect();
            }
            if (rect.width === 0) {
                rect = document.querySelector("#barPlugins").getBoundingClientRect();
            }

            const menu = new Menu("topBarSample", () => { });
            menu.addItem({
                icon: "iconIndent",
                label: `${pluginInstance.i18n.selectPictureLabel}`,
                type: "submenu",
                submenu: [
                    {
                        icon: "iconHand",
                        label: `${pluginInstance.i18n.selectPictureManualLabel}`,
                        accelerator: pluginInstance.commands[0].customHotkey,
                        click: () => {
                            pluginInstance.selectPictureByHand();
                        }
                    }, 
                    {
                        icon: "iconMark",
                        label: `${pluginInstance.i18n.selectPictureRandomLabel}`,
                        accelerator: pluginInstance.commands[1].customHotkey,
                        click: () => {
                            pluginInstance.selectPictureRandom(true);
                        }
                    },
                ]
            });
            menu.addItem({
                icon: "iconAdd",
                label: `${pluginInstance.i18n.addImageLabel}`,
                type: "submenu",
                submenu: [
                    {
                        icon: "iconImage",
                        label: `${pluginInstance.i18n.addSingleImageLabel}`,
                        click: () => {
                            pluginInstance.addSingleLocalImageFile();
                        }
                    },
                    {
                        icon: "iconFolder",
                        label: `${pluginInstance.i18n.addDirectoryLabel}`,
                        click: () => {
                            pluginInstance.addDirectory();
                        }
                    },
                ]
            });
            menu.addItem({
                id: 'pluginOnOffMenu',
                icon: `${configs.get('activate') ? 'iconClose' : 'iconSelect'}`,
                label: `${configs.get('activate') ? pluginInstance.i18n.closeBackgroundLabel : pluginInstance.i18n.openBackgroundLabel}`,
                accelerator: pluginInstance.commands[2].customHotkey,
                click: () => {
                    pluginInstance.pluginOnOff();
                }
            });
    
            menu.addSeparator();
    
            menu.addItem({
                icon: "iconGithub",
                label: `${pluginInstance.i18n.bugReportLabel}`,
                click: () => {
                    bugreportUI.bugReportDialog(pluginInstance);
                }
            });
            menu.addItem({
                icon: "iconSettings",
                label: `${pluginInstance.i18n.settingLabel}`,
                click: () => {
                    settingsUI.openSettingDialog(pluginInstance);
                }
            });
    
            if (pluginInstance.isMobile) {
                menu.fullscreen();
            } else {
                menu.open({
                    x: rect.right,
                    y: rect.bottom,
                    isLeft: true,
                });
            };
        };
    });
};