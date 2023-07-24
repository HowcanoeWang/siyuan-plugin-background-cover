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
    showMessage(`${this.i18n.mobileNotSupported}`, 1000, "info")
}

export function showIndev(msg: string = '') {
    const dialog = new Dialog({
        title: `${this.i18n.inDevTitle}`,
        content: `<div class="b3-dialog__content">${this.i18n.inDev}<span>${msg}</span></div>`,
        width: this.isMobile ? "92vw" : "520px",
    });
}