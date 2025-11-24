import { info, debug, error } from './logger'
import { KernelApi } from './api';

// Array merging function
export class Numpy {

    public merge(array1:any[], array2:any[]) {
        let mergedElement = [...new Set([...array1 ,...array2 ])]
        return mergedElement
    }

}

// color processing functions
export class CloseCV {

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
            debug(`[utils][pythonic.ts][OS.folderExists] 返回 out =>`, out)
            // 成功返回且code为0表示文件夹存在
            if (out && out.code === 0) {
                debug(`[utils][pythonic.ts][OS.folderExists] 成功返回且code为0表示文件夹存在 => true`)
                return true;
            }
            // 404错误表示文件夹不存在
            if (out && out.code === 404) {
                debug(`[utils][pythonic.ts][OS.folderExists] 404错误表示文件夹不存在 => false`)
                return false;
            }
            // 其他错误情况也视为不存在
            debug(`[utils][pythonic.ts][OS.folderExists] 遇到了其他错误 => false`)
            return false;
        } catch (error) {
            debug("[utils][pythonic.ts][OS.folderExists] 捕捉到报错:", error);
            return false;
        }
    }

    public async mkdir(dir:string) {
        // await this.ka.mkdir(dir)
        try {
            const out = await this.ka.putFolder(dir);
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