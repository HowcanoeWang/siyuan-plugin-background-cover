import * as cst from './constants'

export const noAdaptThemes: string[] = [
    "daylight", "midnight",
    "pink-room", "Zhihu", 
    "siyuan-themes-vscodelite",
    "z-acrylic", "sy-dark-purple",
    "Dark+", "Tsundoku", "toy", "P-Book"
]

export const toAdaptThemes: cst.toAdaptThemes = {
    "Savor": {
        // element id : [LightMode color, Darkmode Color]
        // ${opacity} is the weighted transparency
        // ${alpha} is not weighted transparency
        // This varalbes will automatically adjust to transparency settings later
        "toolbar":    ['rgba(237, 236, 233, ${opacity})', 'rgba(65, 70, 72, ${opacity})'],
        "dockBottom": ['rgba(255, 255, 255, 0)',          'rgba(255, 255, 255, 0)'],
        "status":     ['rgba(255, 255, 255, 0)',          'rgba(255, 255, 255, 0)']
    },
    "Rem Craft": {
        "layouts":    ['rgb(247, 248, 250)',    'rgb(30, 34, 39)'],
        "toolbar":    ['rgb(247, 248, 250)',    'rgb(30, 34, 39)'],
        "dockLeft":   ['rgb(247, 248, 250)',    'rgb(30, 34, 39)'],
        "dockRight":  ['rgb(247, 248, 250)',    'rgb(30, 34, 39)'],
        "dockBottom": ['rgb(247, 248, 250)',    'rgb(30, 34, 39)'],
        "status":     ['rgba(255, 255, 255, 0)','rgba(255, 255, 255, 0)'],
    },
    "mini-vlook": {
        "status":     ['rgba(255, 255, 255, 0)','rgba(255, 255, 255, 0)']
    },
    "Light-Blue": {
        // Only light theme
        "layouts":    ['rgba(255, 255, 255, ${0.7/opacity})', ''],
        "toolbar":    ['rgba(255, 255, 255, ${0.7})',           ''],
        "dockLeft":   ['rgba(255, 255, 255, ${0.7})',           ''],
        "dockRight":  ['rgba(255, 255, 255, ${0.7})',           ''],
        "dockBottom": ['rgba(255, 255, 255, ${0.7})',           ''],
        "status":     ['rgba(255, 255, 255, ${0.7})',           '']
    },
    "Dark-Blue": {
        // only dark theme
        "layouts":    ['', 'rgba(30, 34, 39, ${0.7/opacity})'],
        "toolbar":    ['', 'rgba(30, 34, 39, ${0.7})'],
        "dockLeft":   ['', 'rgba(30, 34, 39, ${0.7})'],
        "dockRight":  ['', 'rgba(30, 34, 39, ${0.7})'],
        "dockBottom": ['', 'rgba(30, 34, 39, ${0.7})'],
        "status":     ['', 'rgba(30, 34, 39, ${0.7})']
    },
    "Odyssey": {
        // only light theme
        "layouts":    ['rgba(220, 228, 220, ${0.7/opacity})', ''],
        "toolbar":    ['rgba(220, 228, 220, ${0.7})', ''],
        "dockLeft":   ['rgba(220, 228, 220, ${0.7})', ''],
        "dockRight":  ['rgba(220, 228, 220, ${0.7})', ''],
        "dockBottom": ['rgba(220, 228, 220, ${0.7})', ''],
        "status":     ['rgba(220, 228, 220, ${0.7})', '']
    },
    "StarDust": {
        // only dark theme
        "toolbar":    ['', 'rgb(29, 70, 94)'],
        "dockLeft":   ['', 'rgb(29, 70, 94)'],
        "dockRight":  ['', 'rgb(29, 70, 94)'],
        "dockBottom": ['', 'rgb(29, 70, 94)'],
        "layouts":    ['', 'rgb(29, 70, 94)'],
        "status":     ['', 'rgb(29, 70, 94)']
    }
}