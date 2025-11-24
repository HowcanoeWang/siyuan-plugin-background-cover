// 存放html的模板

interface DialogNoticeOptions {
    message: string
}
export function createNoticeDialogTemplate(options: DialogNoticeOptions): string {
    return `
        <div class="b3-dialog__content">${options.message}</div>
    `
}

/**
 * 生成一个标准的确认对话框HTML模板
 * @param options 包含所有动态文本的对象
 * @returns HTML字符串
 */
interface DialogTemplateOptions {
    message: string;
    cancelText: string;
    confirmText: string;
}
export function createConfirmDialogTemplate(options: DialogTemplateOptions): string {
    return `
        <div class="b3-dialog__content">${options.message}</div>
        <div class="b3-dialog__action">
            <button class="b3-button b3-button--cancel">${options.cancelText}</button>
            <div class="fn__space"></div>
            <button class="b3-button b3-button--text">${options.confirmText}</button>
        </div>
    `;
}
