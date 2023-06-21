// simple logging functions
export function info(...msg: any[]): void {
    console.log(`[BgCover Plugin][INFO] ${msg}`);
}

export function error(...msg: any[]): void {
    console.error(`[BgCover][ERROR] ${msg}`);
}

export function warn(...msg: any[]): void {
    console.warn(`[BgCover][WARN] ${msg}`);
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
        if ( alpha > 0 ) {
           return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
        }
        else {
           return 'rgb(' + r + ', ' + g + ', ' + b + ')';
        }
    }

    public changeColorOpacity(colorString:string, alpha:number) {
        let changedColor = '';
  
        // --> 如果当前元素为#开头，则hex转rgb后，再修改透明度
        if (colorString.slice(0,1) === '#') {
            changedColor = this.hex2rgba(colorString, alpha);
        // --> 如果当前元素为var开头，则先转换为RGB，再修改透明度
        //     var(--b3-theme-background)
        }else if (colorString.slice(0,4) === 'var(') {  // e.g.  var(--b3-theme-background)
            let cssvar_name = colorString.slice(4,-1);
            let originalColor = this.cssVarColors.getPropertyValue(cssvar_name);
            changedColor = this.changeColorOpacity(originalColor, alpha)
        // --> 如果当前元素为正常的rgb开头
        }else if (colorString.slice(0,4) === 'rgb(') {
            changedColor = this.addAlpha(colorString, alpha);
        // --> 如果当前元素为rgba开头
        }else if (colorString.slice(0,4) === 'rgba') {
            // 若透明度不为0，则修改透明度
            changedColor = this.editAlpha(colorString, alpha); 
        }else{
            console.log(`Unable to parse the color string [${colorString}}], not 'var(--xxx)', 'rgb(xxx)', 'rgba(xxx)', '#hex'`)
        }
        return changedColor;
    }
}