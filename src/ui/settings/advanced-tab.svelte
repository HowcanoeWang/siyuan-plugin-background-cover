<script lang="ts">
    import { configStore } from "../../stores/config"

    async function handleReset() {
        if (!confirm("确认重置所有设置？这将清除所有配置和缓存图片。")) return
        await configStore.reset()
        window.location.reload()
    }
</script>

<div class="config__tab-container" data-name="advanced" style="display: flex; flex-direction: column; gap: 8px;">
    <div class="b3-label">
        <div class="fn__flex">
            <span class="fn__flex-1">重置所有设置</span>
            <button class="b3-button b3-button--outline" onclick={handleReset}>
                重置
            </button>
        </div>
        <div class="ft__breakword" style="font-size: 0.85em; color: var(--b3-theme-on-surface);">
            将所有设置恢复到插件初始值 (包括所有缓存的图片)
        </div>
    </div>
</div>
