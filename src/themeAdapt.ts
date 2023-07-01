import * as cst from './constants'

export const toAdaptThemes: cst.toAdaptThemes = {
    "Savor": {
        // element id : [LightMode color, Darkmode Color]
        // ${opacity} is the weighted transparency
        // ${alpha} is not weighted transparency
        // This varalbes will automatically adjust to transparency settings later
        'toolbar':    ['rgba(237, 236, 233, ${opacity})', 'rgba(65, 70, 72, ${opacity})'],
        'dockBottom': ['rgba(255, 255, 255, 0)',          'rgba(255, 255, 255, 0)'],
        'status':     ['rgba(255, 255, 255, 0)',          'rgba(255, 255, 255, 0)']
    },
    "Rem Craft": {
        "layouts": [
            'rgb(247, 248, 250, ${0.7/opacity})', 
            'rgba(30, 34, 39, ${0.7/opacity})'
        ],
        'toolbar': [
            'rgb(247, 248, 250)',    
            'rgb(30, 34, 39)'
        ],
        'dockLeft': [
            'rgb(247, 248, 250)',    
            'rgb(30, 34, 39)'
        ],
        'dockRight': [
            'rgb(247, 248, 250)',
            'rgb(30, 34, 39)'
        ],
        'dockBottom':[
            'rgb(247, 248, 250)',    
            'rgb(30, 34, 39)'
        ],
        'status': [
            'rgba(255, 255, 255, 0)',
            'rgba(255, 255, 255, 0)'
        ],
        ".layout-tab-bar": [
            'rgba(247, 248, 250, 0.3)', 
            'rgba(30, 34, 39, 0.3)'
        ],
        '.layout-tab-container': [
            'rgba(247, 248, 250, 0.3)', 
            'rgba(30, 34, 39, 0.3)'
        ],
        '.block__icons': [
            'rgba(247, 248, 250, 0.3)',
            'rgba(30, 34, 39, 0.3)'
        ],
        '.b3-list-item': [
            'rgba(247, 248, 250, 0.3)',
        ],
        '.layout__dockl > .fn__flex > div[data-type="wnd"], .layout__dockr > .fn__flex > div[data-type="wnd"]':[
            'rgba(247, 248, 250, 0.3)', 'rgba(30, 34, 39, 0.3)'
        ],
    },
    "mini-vlook": {
        'status':     [
            'rgba(255, 255, 255, 0)',
            'rgba(255, 255, 255, 0)'
        ],
        '.fn__flex-1.fn__flex-column.file-tree': [
            'rgba(252, 249, 242, 0)', 
            'rgba(244, 248, 242, 0)'
        ], // 不起作用，因为是cssimport，后续需要增加这个功能
    },
    "Light-Blue": {
        // Only light theme
        "layouts":         ['rgba(255, 255, 255, ${0.7/opacity})', ''],
        'toolbar':         ['rgba(255, 255, 255, ${0.7/opacity})', ''],
        'dockLeft':        ['rgba(255, 255, 255, ${0.7/opacity})', ''],
        'dockRight':       ['rgba(255, 255, 255, ${0.7/opacity})', ''],
        'dockBottom':      ['rgba(255, 255, 255, ${0.7/opacity})', ''],
        'status':          ['rgba(255, 255, 255, ${0.7/opacity})', ''],
        ".layout-tab-bar": ['rgba(255, 255, 255, 0.3)', ''],
        '.layout-tab-container': ['rgba(255, 255, 255, 0)', ''],
        '.fn__flex-1.fn__flex [data-type="wnd"]': [
            'rgba(255, 255, 255, 0.3)', '']
    },
    "Dark-Blue": {
        // only dark theme
        "layouts":               ['', 'rgba(30, 34, 39, ${0.7/opacity})'],
        'toolbar':               ['', 'rgba(30, 34, 39, ${0.7/opacity})'],
        'dockLeft':              ['', 'rgba(30, 34, 39, ${0.7/opacity})'],
        'dockRight':             ['', 'rgba(30, 34, 39, ${0.7/opacity})'],
        'dockBottom':            ['', 'rgba(30, 34, 39, ${0.7/opacity})'],
        'status':                ['', 'rgba(30, 34, 39, ${0.7/opacity})'],
        '.layout-tab-container': ['', 'rgba(0,0,0,0)']
    },
    "Odyssey": {
        // only light theme
        "layouts":                     ['rgba(220, 228, 220, ${0.5/opacity})', ''],
        'toolbar':                     ['rgba(220, 228, 220, ${0.5/opacity})', ''],
        'dockLeft':                    ['rgba(220, 228, 220, ${0.5/opacity})', ''],
        'dockRight':                   ['rgba(220, 228, 220, ${0.5/opacity})', ''],
        'dockBottom':                  ['rgba(220, 228, 220, ${0.5/opacity})', ''],
        'status':                      ['rgba(220, 228, 220, ${0.5/opacity})', ''],
        '.layout-tab-container':       ['rgba(244, 248, 242, ${0.5/opacity})', ''],
        '.layout__dockl > .fn__flex-1, .layout__dockr > .fn__flex-1':  [
            'rgba(244, 248, 242, 0)', ''
        ],
    },
    "StarDust": {
        // only dark theme
        'toolbar':    ['', 'rgb(29, 70, 94)'],
        'dockLeft':   ['', 'rgb(29, 70, 94)'],
        'dockRight':  ['', 'rgb(29, 70, 94)'],
        'dockBottom': ['', 'rgb(29, 70, 94)'],
        "layouts":    ['', 'rgb(29, 70, 94)'],
        'status':     ['', 'rgb(29, 70, 94)']
    },
    "Tsundoku": {
        '.fn__flex-column.fn__flex-1': [
            'rgba(241,245,248,0)', 'rgba(22,35,47,0)'
        ],
    },
    "Zhihu": {
        '.layout-tab-bar': [
            'rgba(244,244,244,${0.7/opacity})', 'rgba(18,18,18,${opacity})'
        ]
    },
    "pink-room":{
        'layouts': ['rgba(255,224,224, ${opacity})', ''],
        '.layout-tab-container':[
            'rgba(255,255,255, ${0.3/opacity})', ''
        ]
    }
}