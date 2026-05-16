<script lang="ts">
    import { onMount } from "svelte"

    interface Props {
        onConfirm?: (selectedPaths: string[]) => void
    }

    let { onConfirm }: Props = $props()

    let selectedDirs = $state<string[]>([])
    let newDirName = $state("")

    function addDir() {
        const name = newDirName.trim()
        if (!name) return
        if (selectedDirs.includes(name)) return
        selectedDirs.push(name)
        newDirName = ""
    }

    function removeDir(i: number) {
        selectedDirs.splice(i, 1)
        selectedDirs = selectedDirs
    }

    function confirm() {
        onConfirm?.([...selectedDirs])
    }
</script>

<div style="display: flex; flex-direction: column; gap: 8px; padding: 8px;">
    <div class="b3-label">选择 data/assets/ 下的子文件夹作为图片源</div>

    <div class="fn__flex" style="gap: 8px;">
        <input class="b3-text-field fn__flex-1" type="text"
            placeholder="输入子文件夹名称，如 wallpaper"
            bind:value={newDirName}
            onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && addDir()}
        />
        <button class="b3-button b3-button--outline" onclick={addDir}>添加</button>
    </div>

    <div class="fn__hr"></div>

    <div class="b3-list b3-list--background">
        {#each selectedDirs as dir, i}
            <div class="b3-list-item">
                <span class="b3-list-item__text fn__flex-1">assets/{dir}</span>
                <span class="b3-list-item__action" onclick={() => removeDir(i)}>✕</span>
            </div>
        {/each}
        {#if selectedDirs.length === 0}
            <div style="color: var(--b3-theme-on-surface); padding: 8px;">
                尚未选择任何文件夹
            </div>
        {/if}
    </div>

    <div class="fn__flex" style="gap: 8px; justify-content: flex-end;">
        <button class="b3-button b3-button--cancel">取消</button>
        <button class="b3-button b3-button--text" onclick={confirm}
            disabled={selectedDirs.length === 0}>
            确认
        </button>
    </div>
</div>
