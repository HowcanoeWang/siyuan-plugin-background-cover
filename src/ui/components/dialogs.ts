import { Dialog } from "siyuan";

import BgCoverPlugin from "../../index";

import { createConfirmDialogTemplate, createNoticeDialogTemplate } from "./templates"; // 假设模板在新文件中

/**
 * 显示正在开发中的提示对话框
 */
interface NoticeOptions {
    title: string;
    message: string;
}
export function showNoticeDialog(options: NoticeOptions): void {
    const contentHTML = createNoticeDialogTemplate(options);

    const dialog = new Dialog({
        title: options.title,
        content: contentHTML,
        width: BgCoverPlugin.instance.isMobile ? "92vw" : "520px",
    });
}

/**
 * 显示一个通用的确认对话框
 * @param options 对话框的配置项
 */
interface ConfirmationOptions {
    title: string;
    message: string;
    cancelText?: string; // 设为可选，可以提供默认值
    confirmText?: string; // 设为可选
    onConfirm: () => void; // 这是关键：一个回调函数
    onCancel?: () => void; // 可选的取消回调
}
export function showConfirmationDialog(options: ConfirmationOptions): void {
    let i18n = BgCoverPlugin.i18n;
    
    // 1. 提供默认值
    const finalOptions = {
        cancelText: options.cancelText || i18n.cancel,
        confirmText: options.confirmText || i18n.confirm,
        ...options
    };

    // 2. 使用模板生成HTML
    const contentHTML = createConfirmDialogTemplate(finalOptions);

    // 3. 创建Dialog实例
    const dialog = new Dialog({
        title: finalOptions.title,
        content: contentHTML,
        width: BgCoverPlugin.instance.isMobile ? "92vw" : "520px",
    });

    // 4. 绑定逻辑
    const btns = dialog.element.querySelectorAll(".b3-button");
    const cancelButton = btns[0];
    const confirmButton = btns[1];

    // 取消按钮的逻辑
    cancelButton.addEventListener("click", () => {
        if (options.onCancel) {
            options.onCancel();
        }
        dialog.destroy();
    });

    // 确认按钮的逻辑
    confirmButton.addEventListener("click", () => {
        // 调用传入的回调函数，执行具体操作
        options.onConfirm(); 
        dialog.destroy();
    });
}
