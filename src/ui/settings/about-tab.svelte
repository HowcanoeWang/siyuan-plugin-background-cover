<script lang="ts">
    import { packageVersion } from "../../constants"

    const i18n = (window as any).bgCoverPlugin?.i18n ?? {}
</script>

<div class="config__tab-container" data-name="about" style="display: flex; flex-direction: column; gap: 8px;">
    <div class="b3-label fn__flex-center">
        Background Cover Plugin v{packageVersion}
    </div>
    <div class="ft__breakword" style="text-align: center;">
        {i18n.aboutDesc ?? "添加一张你喜欢的图片铺满整个思源笔记"}
    </div>
    <div class="fn__hr"></div>
    <div class="ft__breakword" style="text-align: center;">
        <a href="https://github.com/HowcanoeWang/siyuan-plugin-background-cover"
           target="_blank" rel="noopener">
            GitHub Repository
        </a>
    </div>
    <div class="ft__breakword" style="text-align: center; font-size: 0.85em; color: var(--b3-theme-on-surface);">
        {i18n.aboutAuthor ?? "Author: HowcanoeWang | MIT License"}
    </div>
</div>
