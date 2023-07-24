import { Dialog } from "siyuan";
import BgCoverPlugin from "./index"

export function bugReportDialog(pluginInstance: BgCoverPlugin) {
    const dialog = new Dialog({
        title: `${window.bgCoverPlugin.i18n.bugReportLabel}`,
        content: `
        <div class="b3-dialog__content">${window.bgCoverPlugin.i18n.bugReportConfirmText}</div>
        <div class="b3-dialog__action">
            <button class="b3-button b3-button--cancel">${window.bgCoverPlugin.i18n.cancel}</button><div class="fn__space"></div>
            <button class="b3-button b3-button--text">${window.bgCoverPlugin.i18n.confirm}</button>
        </div>
        <div class="b3-dialog__action">
        `,
        width: pluginInstance.isMobile ? "92vw" : `520px`,
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