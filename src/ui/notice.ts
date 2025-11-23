import { Dialog } from "siyuan";

export function showIndev(msg: string = '') {
    const dialog = new Dialog({
        title: `${window.bgCoverPlugin.i18n.inDevTitle}`,
        content: `<div class="b3-dialog__content">${window.bgCoverPlugin.i18n.inDev}<span>${msg}</span></div>`,
        width: window.bgCoverPlugin.isMobileLayout ? "92vw" : "520px",
    });
}

export function bugReportDialog() {
    const dialog = new Dialog({
        title: `${window.bgCoverPlugin.i18n.bugReportLabel}`,
        content: `
        <div class="b3-dialog__content">${window.bgCoverPlugin.i18n.bugReportConfirmText}</div>
        <div class="b3-dialog__action">
            <button class="b3-button b3-button--cancel">${window.bgCoverPlugin.i18n.cancel}</button><div class="fn__space"></div>
            <button class="b3-button b3-button--text">${window.bgCoverPlugin.i18n.confirmBugReport}</button>
        </div>
        <div class="b3-dialog__action">
        `,
        width: window.bgCoverPlugin.isMobileLayout ? "92vw" : `520px`,
    });

    const btnsElement = dialog.element.querySelectorAll(".b3-button");

    // cancel button
    btnsElement[0].addEventListener("click", () => {
        dialog.destroy();
    });

    // still report
    btnsElement[1].addEventListener("click", () => {
        window.open('https://github.com/HowcanoeWang/siyuan-plugin-background-cover/issues', '_blank');
        dialog.destroy();
    });
}

export function themeRefreshDialog() {
    const dialog = new Dialog({
        title: `${window.bgCoverPlugin.i18n.themeOnChangeTitle}`,
        content: `
        <div class="b3-dialog__content">${window.bgCoverPlugin.i18n.themeOnChangeMsg}</div>
        <div class="b3-dialog__action">
            <button class="b3-button b3-button--cancel">${window.bgCoverPlugin.i18n.cancel}</button><div class="fn__space"></div>
            <button class="b3-button b3-button--text">${window.bgCoverPlugin.i18n.themeRefresh}</button>
        </div>
        <div class="b3-dialog__action">
        `,
        width: window.bgCoverPlugin.isMobileLayout ? "92vw" : `520px`,
    });

    const btnsElement = dialog.element.querySelectorAll(".b3-button");

    // cancel button
    btnsElement[0].addEventListener("click", () => {
        dialog.destroy();
    });

    // still report
    btnsElement[1].addEventListener("click", () => {
        dialog.destroy();
        window.location.reload();
    });
}

export function removeThemeRefreshDialog(){

    let dialog = document.getElementsByClassName('b3-dialog__container')[0];
    /**
     * 这边必须只能到b3-dialog__container;
     * 加载的时候，也会生成一个dialog：直接销毁会导致笔记加载白屏
     * 然后用两级追溯parementElement.parenetElement，去获取dialog的Element
     * <div class="b3-dialog--open">
     *   <div class="b3-dialog">
     *      <div class="b3-dialog__scrim"></div>
     *   => <div class="b3-dialog__container" ...
     */
    if (dialog !== undefined) {
        dialog.parentElement.parentElement.remove();
    }
}