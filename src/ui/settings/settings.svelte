<script lang="ts">
    import ConfigTab from "./config-tab.svelte"
    import SourcesTab from "./sources-tab.svelte"
    import ThemeTab from "./theme-tab.svelte"
    import AdvancedTab from "./advanced-tab.svelte"
    import AboutTab from "./about-tab.svelte"

    interface Props {
        activeTab?: string
    }

    let { activeTab = "config" }: Props = $props()

    let currentTab = $state(activeTab)

    const tabs = [
        { name: "config",   icon: "#iconEdit",     label: "全局设置" },
        { name: "sources",  icon: "#iconImage",    label: "数据管理" },
        { name: "theme",    icon: "#iconTheme",    label: "屏蔽主题" },
        { name: "advanced", icon: "#iconRiffCard", label: "高级设置" },
        { name: "about",    icon: "#iconInfo",     label: "关于" },
    ]
</script>

<div class="fn__flex-1 fn__flex config__panel" style="overflow: hidden; position: relative;">
    <ul class="b3-tab-bar b3-list b3-list--background">
        {#each tabs as tab}
            <li
                data-name={tab.name}
                class="b3-list-item"
                class:b3-list-item--focus={currentTab === tab.name}
                onclick={() => currentTab = tab.name}
                onkeydown={undefined}
            >
                <svg class="b3-list-item__graphic">
                    <use xlink:href={tab.icon}></use>
                </svg>
                <span class="b3-list-item__text">{tab.label}</span>
            </li>
        {/each}
    </ul>

    <div class="config__tab-wrap" style="flex: 1; overflow-y: auto; padding: 8px 12px;">
        {#if currentTab === "config"}
            <ConfigTab />
        {:else if currentTab === "sources"}
            <SourcesTab />
        {:else if currentTab === "theme"}
            <ThemeTab />
        {:else if currentTab === "advanced"}
            <AdvancedTab />
        {:else if currentTab === "about"}
            <AboutTab />
        {/if}
    </div>
</div>
