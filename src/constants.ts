import pluginJson from "../plugin.json"

export const packageName = "siyuan-plugin-background-cover"

export const packageVersion = pluginJson.version

export const IMAGE_EXTS = new Set([
    '.png', '.jpg', '.jpeg', '.jfif', '.gif', '.webp', '.bmp', '.svg', '.avif',
])

export const VIDEO_EXTS = new Set([
    '.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv',
])

export const pluginAssetsDir = `/data/public/${packageName}/`

export const DEFAULT_BACKGROUNDS = [
    `plugins/${packageName}/default/av71658201.mp4`,
    `plugins/${packageName}/default/FyBE0bUakAELfeF.jpg`,
]

export const DYNAMIC_BG_PRESETS: { id: string; name: string; url: string }[] = [
    { id: 'bing_1920',       name: '必应每日壁纸 (1920x1080)',      url: 'https://api.dujin.org/bing/1920.php' },
    { id: 'unsplash_random', name: 'Unsplash 随机图片 (1600x900)',  url: 'https://unsplash.it/1600/900?random' },
    { id: 'imgapi_scenic',   name: 'imgapi 随机风景',              url: 'https://imgapi.cn/api.php?fl=fengjing&gs=images' },
    { id: 'acg_sx',          name: '后宫漫图',                     url: 'https://acg.sx/images?utm_source=ld246.com' },
    { id: 'img_xjh',         name: '岁月小筑随机动漫图片',          url: 'https://img.xjh.me/random_img.php' },
]

export const DYNAMIC_BG_FALLBACK_URL = `plugins/${packageName}/default/404.jpg`

export function pickDefaultBackground(): string {
    return DEFAULT_BACKGROUNDS[Math.floor(Math.random() * DEFAULT_BACKGROUNDS.length)]
}

export function classifyFileType(filename: string): 'image' | 'video' | null {
    const ext = filename.includes('.')
        ? '.' + filename.split('.').pop()!.toLowerCase()
        : ''

    if (IMAGE_EXTS.has(ext)) return 'image'
    if (VIDEO_EXTS.has(ext)) return 'video'
    return null
}

export function isDynamicUrl(url: string): boolean {
    const clean = url.split('?')[0]
    const ext = '.' + (clean.split('.').pop()?.toLowerCase() ?? '')
    return !IMAGE_EXTS.has(ext) && !VIDEO_EXTS.has(ext) && url.startsWith('http')
}

export const pluginTopIcon = {
    iconLogo: `<symbol id="iconLogo" viewBox="0 0 32 32">
    <path d="M26 28h-20v-4l6-10 8.219 10 5.781-4v8z"></path>
    <path d="M26 15c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3c1.657 0 3 1.343 3 3z"></path>
    <path d="M28.681 7.159c-0.694-0.947-1.662-2.053-2.724-3.116s-2.169-2.030-3.116-2.724c-1.612-1.182-2.393-1.319-2.841-1.319h-15.5c-1.378 0-2.5 1.121-2.5 2.5v27c0 1.378 1.122 2.5 2.5 2.5h23c1.378 0 2.5-1.122 2.5-2.5v-19.5c0-0.448-0.137-1.23-1.319-2.841zM24.543 5.457c0.959 0.959 1.712 1.825 2.268 2.543h-4.811v-4.811c0.718 0.556 1.584 1.309 2.543 2.268zM28 29.5c0 0.271-0.229 0.5-0.5 0.5h-23c-0.271 0-0.5-0.229-0.5-0.5v-27c0-0.271 0.229-0.5 0.5-0.5 0 0 15.499-0 15.5 0v7c0 0.552 0.448 1 1 1h7v19.5z"></path>
    </symbol>`
}