<script lang="ts">
    import { onMount } from "svelte"
    import { configStore } from "../../stores/config"
    import { isDesktop } from "../../utils/fs"

    let localFolders = $state<string[]>([])
    let assetDirs = $state<string[]>([])
    let showLocalInput = $state(false)
    let localInputPath = $state("")

    onMount(() => {
        refresh()
    })

    function refresh() {
        localFolders = [...configStore.get("localFolders")]
        assetDirs = [...configStore.get("assetDirs")]
    }

    function addLocalFolder() {
        const path = localInputPath.trim()
        if (!path) return
        const folders = [...configStore.get("localFolders"), path]
        configStore.set("localFolders", folders)
        configStore.save()
        localInputPath = ""
        showLocalInput = false
        refresh()
    }

    function removeLocalFolder(i: number) {
        const folders = [...configStore.get("localFolders")]
        folders.splice(i, 1)
        configStore.set("localFolders", folders)
        configStore.save()
        refresh()
    }

    function removeAssetDir(i: number) {
        const dirs = [...configStore.get("assetDirs")]
        dirs.splice(i, 1)
        configStore.set("assetDirs", dirs)
        configStore.save()
        refresh()
    }
</script>

<div class="config__tab-container" data-name="sources" style="display: flex; flex-direction: column; gap: 8px;">
    <div class="fn__hr"></div>

    {#if isDesktop()}
        <div class="b3-label">📁 本地目录</div>
        {#each localFolders as folder, i}
            <div class="b3-list-item">
                <span class="b3-list-item__text fn__flex-1">{folder}</span>
                <span class="b3-list-item__action" onclick={() => removeLocalFolder(i)}>✕ 移除</span>
            </div>
        {/each}
        {#if showLocalInput}
            <div class="fn__flex" style="gap: 8px; padding: 4px;">
                <input class="b3-text-field fn__flex-1" type="text"
                    placeholder="/home/user/Pictures/wallpaper"
                    bind:value={localInputPath}
                    onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && addLocalFolder()}
                />
                <button class="b3-button b3-button--outline" onclick={addLocalFolder}>确认</button>
                <button class="b3-button b3-button--cancel" onclick={() => showLocalInput = false}>取消</button>
            </div>
        {:else}
            <button class="b3-button b3-button--outline" onclick={() => showLocalInput = true}>
                + 添加本地目录
            </button>
        {/if}
    {/if}

    <div class="fn__hr"></div>

    <div class="b3-label">📁 Assets 子目录</div>
    {#each assetDirs as dir, i}
        <div class="b3-list-item">
            <span class="b3-list-item__text fn__flex-1">assets/{dir}</span>
            <span class="b3-list-item__action" onclick={() => removeAssetDir(i)}>✕ 移除</span>
        </div>
    {/each}
</div>
