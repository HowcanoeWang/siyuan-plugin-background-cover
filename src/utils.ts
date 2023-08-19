import { KernelApi } from './siyuanAPI';
import { configs } from './configs'

import * as cst from './constants';

import themesJson from './themes.json';
import { showMessage } from 'siyuan';

// simple logging functions
export function info(...msg: any[]): void {
    console.log(`[BgCover Plugin][INFO] ${msg}`);
}

export function debug(...msg: any[]): void {
    if (configs.get('inDev')) {
        console.log(`[BgCover Plugin][DEBUG]`, ...msg);
    }
}

export function error(...msg: any[]): void {
    console.error(`[BgCover][ERROR] ${msg}`);
}

export function warn(...msg: any[]): void {
    console.warn(`[BgCover][WARN] ${msg}`);
}

/**
 * 获取当前主题名字和模式
 */
export function getCurrentThemeInfo() {
    // 0 -> light, 1 -> dark
    const themeMode = (window as any).siyuan.config.appearance.mode
    let themeName = ''
    
    if (themeMode === 0 ) {
        themeName = (window as any).siyuan.config.appearance.themeLight
    }else{
        themeName = (window as any).siyuan.config.appearance.themeDark
    }

    return [themeMode, themeName]
}

export function getInstalledThemes() {
    const lightThemes = (window as any).siyuan.config.appearance.lightThemes;
    const darkThemes = (window as any).siyuan.config.appearance.darkThemes;

    return [lightThemes, darkThemes]
}

export async function getGithubThemeJson(): Promise<cst.themeJson> {
    const url = "https://raw.githubusercontent.com/siyuan-note/bazaar/main/stage/themes.json"

    try {
        const response = await fetch(url);
        const data = await response.json() as cst.themeJson;
        return data;
    } catch (error) {
        debug('[utiles][getGithubThemeJson] Failed to fetch data from Github:', error);
        showMessage(`[${window.bgCoverPlugin.i18n.addTopBarIcon}]${window.bgCoverPlugin.i18n.failConnectGithubJson}`, 4000, 'info')
        return undefined;
    }
}

export function parseThemesJson(themeRepos: cst.themeJsonItem[]): cst.installedThemeNames {
    var themeReturn: cst.installedThemeNames = {'daylight': 'daylight', 'midnight': 'midnight'};

    const Lang = (window as any).siyuan.config.lang;

    for (var i = 0; i < themeRepos.length; i++ ) {
        var themeObj = themeRepos[i] as cst.themeJsonItem;

        let displayName = themeObj.package.displayName[Lang];
        if (displayName === undefined || displayName === null || displayName === '') {
            displayName = themeObj.package.displayName['default'];
        }

        themeReturn[themeObj.package.name] = displayName;
    }

    return themeReturn
}

export async function themeName2DisplayName() {
    // source code: https://github.com/frostime/sy-theme-change/blob/7792635b34c993f428a5e27bc8218bee9730550c/src/index.ts#L13-L43


    const [lightThemes, darkThemes] = getInstalledThemes();
    const installedThemes = [...new Set([...lightThemes ,...darkThemes])];

    let name2displayName: cst.installedThemeNames = parseThemesJson(themesJson["repos"]);

    debug(`[utils][themeName2DisplayName] cached theme info:`, name2displayName, 'Installed themes:', installedThemes);

    // check if the cached themes.json contains all installed themes
    var needDownload = false;
    // var needDownload = true;  // debug testing
    for (var key of installedThemes) {
        if (!name2displayName.hasOwnProperty(key)) {
            needDownload = true;
            debug(`[utils][themeName2DisplayName] the installed theme ${key} does not in the cached them info`);
        }
    }
    // 缓存的themes.json不包括最新安装的主题
    if (needDownload) {
        debug(`[utils][themeName2DisplayName] try to update theme info from Github`);
        var istThemeRtn = await getGithubThemeJson();
        if (istThemeRtn) {
            name2displayName = parseThemesJson(istThemeRtn["repos"]);
        }
    }

    // 更新之后，再次检查是否存在，如果还不存在，则直接把主题key作为显示名，而不是i18n里面翻译的主题名
    for (var key of installedThemes) {
        if (!name2displayName.hasOwnProperty(key)) {
            debug(`[utils][themeName2DisplayName] Still not find theme info of [${key}], use it as theme name directly`);
            name2displayName[key] = key;
        }
    }

    return name2displayName;
}

// Array merging function
export class Numpy {

    public merge(array1:any[], array2:any[]) {
        let mergedElement = [...new Set([...array1 ,...array2 ])]
        return mergedElement
    }

}

// color processing functions
export class CloseCV {

    public addAlpha(rgb:string, alpha:number) {
        return rgb.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
    }

    public removeAlpha(rgba:string) {
        let split = rgba.split(',');
        console.log(split);
        return split[0].replace('rgba', 'rgb') + split[1] + split[2] + ')';
    }

    public editAlpha(rgba:string, alpha:number){
        // https://stackoverflow.com/questions/16065998/replacing-changing-alpha-in-rgba-javascript
        return rgba.replace(/[\d\.]+\)$/g, `${alpha})`)
    }

    public getAlpha(rgba:string) {
        if (rgba.slice(0,4) !== 'rgba') {
            return null;
        }else{
            return parseFloat(rgba.split(',')[3]);
        }
    }

    public hex2rgba(hex:string, alpha:number=-1) {
        // https://stackoverflow.com/a/44870045/7766665
        hex   = hex.replace('#', '');
        var r = parseInt(hex.length == 3 ? hex.slice(0, 1).repeat(2) : hex.slice(0, 2), 16);
        var g = parseInt(hex.length == 3 ? hex.slice(1, 2).repeat(2) : hex.slice(2, 4), 16);
        var b = parseInt(hex.length == 3 ? hex.slice(2, 3).repeat(2) : hex.slice(4, 6), 16);
        if ( alpha >= 0 ) {
           return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
        }
        else {
           return 'rgb(' + r + ', ' + g + ', ' + b + ')';
        }
    }

    public hsl2rgb(hsl:string) {

        function hueToRgb(p:number, q:number, t:number) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        // 去除 HSL 字符串中的空格并拆分为数组
        var hslArray = hsl.replace(/ /g, '').split(',');
      
        // 提取 H、S、L 值
        var h = parseFloat(hslArray[0]);
        var s = parseFloat(hslArray[1].slice(0, -1)) / 100;
        var l = parseFloat(hslArray[2].slice(0, -1)) / 100;
      
        // 将 H 值转换为 0-1 范围
        h = (h % 360) / 360;
      
        // 根据 HSL-to-RGB 转换公式计算 RGB 值
        var r, g, b;
        if (s === 0) {
          r = g = b = l; // HSL 是灰色
        } else {
          var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          var p = 2 * l - q;
          r = hueToRgb(p, q, h + 1 / 3);
          g = hueToRgb(p, q, h);
          b = hueToRgb(p, q, h - 1 / 3);
        }
      
        // 将 RGB 值转换为 0-255 范围并返回字符串
        return 'rgb(' + Math.round(r * 255) + ', ' + Math.round(g * 255) + ', ' + Math.round(b * 255) + ')';
      }

    public changeColorOpacity(colorString:string, alpha:number) {
        let changedColor = '';
        let cssVarColors = getComputedStyle(document.querySelector(':root'));
  
        // --> 如果当前元素为#开头，则hex转rgb后，再修改透明度
        if (colorString.slice(0,1) === '#') {
            changedColor = this.hex2rgba(colorString, alpha);
        // --> 如果当前元素为var开头，则先转换为RGB，再修改透明度
        //     var(--b3-theme-background)
        }else if (colorString.slice(0,4) === 'var(') {  // e.g.  var(--b3-theme-background)
            let cssvar_name = colorString.slice(4,-1);
            let originalColor = cssVarColors.getPropertyValue(cssvar_name);
            debug(`[utils][CV2.changeColorOpacity] input colorStr = ${colorString}, extract css variable ${cssvar_name} and obtained value as ${originalColor}`)
            changedColor = this.changeColorOpacity(originalColor, alpha)
        // --> 透明色
        }else if (colorString === 'transparent' || 
                  colorString.replaceAll(' ', '') === 'rgb(0,0,0)' ||
                  colorString.replaceAll(' ', '') === 'rgb(0,0,0,0)' ||
                  colorString.replaceAll(' ', '') === 'rgba(0,0,0,0)'){
            const [themeMode, themeName] = getCurrentThemeInfo();
            if (themeMode === 'light') {
                changedColor = `rgba(255, 255, 255, ${alpha})`
            }else{
                changedColor = `rgba(0, 0, 0, ${alpha})`
            }
        // --> 如果当前元素为正常的rgb开头
        }else if (colorString.slice(0,4) === 'rgb(' && 
                  colorString.split(',').length === 3) {
            changedColor = this.addAlpha(colorString, alpha);
        // --> 如果当前元素为正常的rgb开头，但rgb(0,0,0,0)有四位
        }else if (colorString.slice(0,4) === 'rgb(' && 
                  colorString.split(',').length === 4) {
            colorString = colorString.replace('rgb(', 'rgba(')
            changedColor = this.editAlpha(colorString, alpha);
            // --> 如果当前元素为rgba开头
        }else if (colorString.slice(0,4) === 'rgba') {
            // 若透明度不为0，则修改透明度
            changedColor = this.editAlpha(colorString, alpha); 
        }else if (colorString.slice(0,4) === 'hsl('){
            let rgbColor = this.hsl2rgb(colorString);
            changedColor = this.addAlpha(rgbColor, alpha);
        }else{
            error(`Unable to parse the color string [${colorString}], not 'var(--xxx)', 'rgb(xxx)', 'rgba(xxx)', '#hex'`)
        }
        return changedColor;
    }

    public getImageSize(imgPath:string): Promise<{ width: number; height: number }> {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = imgPath;
      
          img.onload = () => {
            const { naturalWidth, naturalHeight } = img;
            resolve({ width: naturalWidth, height: naturalHeight });
          };
      
          img.onerror = () => {
            reject(new Error('无法加载图像'));
          };
        });
    }

    public getFullSide(container_w:number, container_h:number, img_w:number, img_h:number) {
        const container_ratio = container_w / container_h
        const img_ratio = img_w / img_h

        let fullside = ''

        if (container_ratio > img_ratio) {
            fullside = 'X'
        }else{
            fullside = 'Y'
        }

        debug(`container W:H = [${container_w} / ${container_h} = ${container_ratio}], image W:H = [${img_w} / ${img_h} = ${img_ratio}], fullsize = ${fullside}`)

        return fullside
    }

}

export class OS {

    private ka = new KernelApi()

    // public async copyfile(source_file:any, dest_file:string) {

    //     if (source_file instanceof File) {
    //         const uploadResult = await this.ka.putFile(dest_file, source_file)
    //     }else if(source_file instanceof String) {
    //         warn("rename file function has not been implemented")
    //     }else{
    //         error(`Can not handle source_file ${source_file} and dist_file ${dest_file}`, )
    //     }

    //     if (uploadResult.code === 0) {
    //         return true
    //     }else{
    //         error('fail to upload file')
    //         return false
    //     }
    // }

    public async rmtree(dir:string) {
        let out = await this.listdir(dir)

        for (let i in out) {
            let item = out[i]

            if (item.isDir) {
                // 如果是文件夹，则递归删除
                this.rmtree(`${dir}/${item.name}/`)
            }else{
                let full_path = `${dir}/${item.name}`
                await this.ka.removeFile(full_path)
            }
        }

        // 删除文件夹本身
        if (dir.slice(-1) === '/') {
            await this.ka.removeFile(dir)
        }else{
            await this.ka.removeFile(dir + '/')
        }
    }

    public async listdir(dir:string) {
        interface outArray {
            isDir: number; name: string
        }
        interface outArray extends Array<outArray>{}

        var outArray: outArray
        let out = await this.ka.readDir(dir);
        if (out !== null || out !== undefined) {
            debug("[os.listdir] out.data ->", out.data)
            outArray = out.data as outArray
        }
        
        return outArray
    }

    public splitext(filename:string) {
        let suffix = filename.substring(filename.lastIndexOf('.')+1, filename.length) || filename
        let prefix = filename.substring(0, filename.lastIndexOf('.')) || filename

        return [prefix, suffix]
    }

    /**
     * The function to open a localhost file url to File object
     * @param url 
     * @param fileName 
     * @param fileType 
     * @returns File
     * Example:
     * >>> const url = 'https://example.com/path/to/file.txt'; // Replace with your desired URL
     * >>> const fileName = 'file.txt'; // Replace with the desired file name
     * >>> const fileType = 'text/plain'; // Replace with the desired file type
     * 
     * openFile(url, fileName, fileType)
        .then((file) => {
            if (file) {
            // File-like object is created, you can now use it
            console.log('File:', file);
            } else {
            console.log('File could not be fetched.');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
     */
    public async openFile(url:string, fileName:string, fileType:string) {
        try {
            const response = await fetch(url);
            const data = await response.blob();
        
            // Create a File-like object
            const file = new File([data], fileName, { type: fileType });
        
            return file;
        } catch (error) {
            console.error('Error fetching the file:', error);
            return null;
        }
    }

    /**
     * 
     * @param acceptedFileTypes : '.jpg,.png'
     * @returns 
     */
    public async openFilePicker(acceptedFileTypes?: string): Promise<File[] | null> {
        return new Promise((resolve, reject) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.multiple = false;
          input.value = '';

          if (acceptedFileTypes) {
            input.accept = acceptedFileTypes;
          }
      
          input.addEventListener('change', () => {
            if (input.files) {
              resolve(Array.from(input.files));
            } else {
              reject(new Error('No file selected'));
            }
          });
      
          input.click();
        });
    };

    public async openFolderPicker(): Promise<File[] | null> {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.webkitdirectory = true;
            input.multiple = true;
            input.value = '';
        
            input.addEventListener('change', () => {
                if (input.files && input.files.length > 0) {
                    const file = input.files[0];
                    //   resolve(file.webkitRelativePath as any);
                    resolve(Array.from(input.files));
                } else {
                    reject(new Error('No folder selected'));
                }
            });
      
            input.click();
        });
    }

}



// MD5 has function
// source: https://stackoverflow.com/questions/14733374/how-to-generate-an-md5-file-hash-in-javascript-node-js
export function MD5(d){var r = M(V(Y(X(d),8*d.length)));return r.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_}