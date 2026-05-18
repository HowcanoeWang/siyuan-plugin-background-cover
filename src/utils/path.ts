/**
 * 将 assets 路径归一化为规范存储格式 "assets/xxx"
 *
 * 仅接受两种合法格式:
 *   /data/assets/xxx  → assets/xxx   (内核 API 路径)
 *   assets/xxx         → assets/xxx   (已是规范格式)
 */
export function toAssetRelPath(path: string): string {
    const prefix = '/data/assets/'
    return path.startsWith(prefix) ? 'assets/' + path.slice(prefix.length) : path
}
