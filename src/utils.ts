import { KernelApi } from './siyuanAPI';
import { confmngr } from './configs'

// simple logging functions
export function info(...msg: any[]): void {
    console.log(`[BgCover Plugin][INFO] ${msg}`);
}

export function debug(...msg: any[]): void {
    if (confmngr.get('inDev')) {
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

    /**
     * 判断文件夹是否存在
     * @param dir 文件夹路径
     * @returns 存在返回true，不存在返回false
     */
    public async folderExists(dir: string): Promise<boolean> {
        try {
            const out = await this.ka.readDir(dir);
            // 成功返回且code为0表示文件夹存在
            if (out && out.code === 0) {
                return true;
            }
            // 404错误表示文件夹不存在
            if (out && out.code === 404) {
                return false;
            }
            // 其他错误情况也视为不存在
            return false;
        } catch (error) {
            debug("[os.pathExists] error:", error);
            return false;
        }
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
    public async openFilePicker(acceptedFileTypes?: string, multipleSelect = false): Promise<File[] | null> {
        return new Promise((resolve, reject) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.multiple = multipleSelect;
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