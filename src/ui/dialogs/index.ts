import { classifyFileType } from "../../constants"
import { getFileUrl } from "../../utils/fs"
import { putFile } from "../../utils/api"
import { svelteDialog, confirmDialog } from "../../libs/dialog"
import { devLog } from "../../utils/logger"

import LocalDirDialog from "./LocalDirDialog.svelte"
import AssetPicker from "./AssetPicker.svelte"
import UrlDialog from "./UrlDialog.svelte"

const i18n = () => (window as any).bgCoverPlugin?.i18n ?? {}

export function showLocalDirDialog(onConfirm: (path: string) => void) {
    const dlg = svelteDialog({
        title: i18n().addLocalDirTitle,
        component: LocalDirDialog,
        width: "520px",
        height: "auto",
        props: {
            onConfirm: (path: string) => {
                dlg.close()
                onConfirm(path)
            },
        },
    })
}

export function showAssetsDirDialog(onConfirm: (paths: string[]) => void) {
    const dlg = svelteDialog({
        title: i18n().addAssetsDirTitle,
        component: AssetPicker,
        width: "520px",
        height: "auto",
        props: {
            onConfirm: (paths: string[]) => {
                dlg.close()
                onConfirm(paths)
            },
        },
    })
}

export function showUrlDialog(onSuccess: (uploadUrl?: string) => void) {
    devLog("[bgCover] dialogs: showUrlDialog")
    const dlg = svelteDialog({
        title: i18n().addUrlTitle,
        component: UrlDialog,
        width: "520px",
        height: "auto",
        props: {
            onSuccess: (uploadUrl?: string) => {
                dlg.close()
                onSuccess(uploadUrl)
            },
        },
    })
}

async function uploadSingleFileForm(file: File): Promise<string | null> {
    const apiPath = `data/public/siyuan-plugin-background-cover/${file.name}`
    const ok = await putFile(apiPath, file)
    return ok ? getFileUrl(apiPath, 'upload') : null
}

export async function pickMultipleFiles(onDone?: (lastUrl: string) => void) {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = 'image/*,video/*'
    input.style.display = 'none'
    document.body.appendChild(input)

    input.addEventListener('change', async () => {
        const files = input.files
        if (!files || files.length === 0) {
            document.body.removeChild(input)
            return
        }

        const results = await Promise.all(
            Array.from(files).map(f =>
                uploadSingleFileForm(f).catch(() => null)
            )
        )

        document.body.removeChild(input)
        const lastUrl = results.filter(Boolean).pop()
        if (lastUrl) onDone?.(lastUrl)
    })
    input.click()
}

export async function pickFolderFiles(onDone?: (lastUrl: string) => void) {
    const input = document.createElement('input')
    input.type = 'file'
    input.setAttribute('webkitdirectory', '')
    input.style.display = 'none'
    document.body.appendChild(input)

    input.addEventListener('change', async () => {
        const files = input.files
        if (!files || files.length === 0) {
            document.body.removeChild(input)
            return
        }

        const validFiles = Array.from(files).filter(f => classifyFileType(f.name) !== null)

        if (validFiles.length === 0) {
            document.body.removeChild(input)
            return
        }

        if (validFiles.length >= 30) {
            const confirmed = await new Promise<boolean>((resolve) => {
                confirmDialog({
                    title: i18n().bulkUploadTitle,
                    content: i18n().bulkUploadWarning.replace('{count}', String(validFiles.length)),
                    confirm: () => resolve(true),
                    cancel: () => resolve(false),
                    width: "420px",
                })
            })
            if (!confirmed) {
                document.body.removeChild(input)
                return
            }
        }

        const results = await Promise.all(
            validFiles.map(async (file) => {
                const apiPath = `data/public/siyuan-plugin-background-cover/${file.name}`
                const ok = await putFile(apiPath, file).catch(() => false)
                return ok ? getFileUrl(apiPath, 'upload') : null
            })
        )

        document.body.removeChild(input)
        const lastUrl = results.filter(Boolean).pop()
        if (lastUrl) onDone?.(lastUrl)
    })
    input.click()
}

async function uploadFilteredFiles(files: FileList, input: HTMLInputElement) {
    await Promise.all(
        Array.from(files)
            .filter(f => classifyFileType(f.name))
            .map(f =>
                putFile(
                    `data/public/siyuan-plugin-background-cover/${f.name}`,
                    f,
                )
            )
    )
    document.body.removeChild(input)
}

export function setupMultipleFilePicker(onDone?: () => void) {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = 'image/*,video/*'
    input.style.display = 'none'
    document.body.appendChild(input)
    input.addEventListener('change', async () => {
        const files = input.files
        if (!files || files.length === 0) {
            document.body.removeChild(input)
            return
        }
        await uploadFilteredFiles(files, input)
        onDone?.()
    })
    input.click()
}

export function setupFolderFilePicker(onDone?: () => void) {
    const input = document.createElement('input')
    input.type = 'file'
    input.setAttribute('webkitdirectory', '')
    input.style.display = 'none'
    document.body.appendChild(input)
    input.addEventListener('change', async () => {
        const files = input.files
        if (!files || files.length === 0) {
            document.body.removeChild(input)
            return
        }
        await uploadFilteredFiles(files, input)
        onDone?.()
    })
    input.click()
}
