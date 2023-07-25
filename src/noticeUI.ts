import {
    // Plugin,
    showMessage,
    // confirm,
    Dialog,
    // Menu,
    // openTab,
    // adaptHotkey,
    // getFrontend,
    // getBackend,
    // IModel,
    // Setting, fetchPost
} from "siyuan";


export function showMobileTodo() {
    showMessage(`${window.bgCoverPlugin.i18n.mobileNotSupported}`, 1000, "info")
}

export function showIndev(msg: string = '') {
    const dialog = new Dialog({
        title: `${window.bgCoverPlugin.i18n.inDevTitle}`,
        content: `<div class="b3-dialog__content">${window.bgCoverPlugin.i18n.inDev}<span>${msg}</span></div>`,
        width: window.bgCoverPlugin.isMobile ? "92vw" : "520px",
    });
}