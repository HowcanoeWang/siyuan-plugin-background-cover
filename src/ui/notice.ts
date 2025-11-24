import { 
    showConfirmationDialog, 
    showNoticeDialog 
} from "./components/dialogs";

export function showNotImplementDialog() {
    showNoticeDialog({
        title: window.bgCoverPlugin.i18n.notImplementTitle,
        message: window.bgCoverPlugin.i18n.notImplementMsg,
    });
}

export function bugReportDialog() {
    showConfirmationDialog({
        title: window.bgCoverPlugin.i18n.bugReportLabel,
        message: window.bgCoverPlugin.i18n.bugReportConfirmText,
        confirmText: window.bgCoverPlugin.i18n.confirmBugReport,
        onConfirm: () => {
            // 这里是这个对话框独有的逻辑
            window.open('https://github.com/HowcanoeWang/siyuan-plugin-background-cover/issues', '_blank');
        }
    });
}

export function themeRefreshDialog() {
    showConfirmationDialog({
        title: window.bgCoverPlugin.i18n.themeOnChangeTitle,
        message: window.bgCoverPlugin.i18n.themeOnChangeMsg,
        confirmText: window.bgCoverPlugin.i18n.themeRefresh,
        onConfirm: () => {
            // 这里是这个对话框独有的逻辑
            window.location.reload();
        }
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