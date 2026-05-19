<script lang="ts">
    import { packageVersion, packageName } from "../../constants"

    const i18n = (window as any).bgCoverPlugin?.i18n ?? {}
</script>

<div class="config__tab-container" data-name="about" style="display: flex; flex-direction: column; height: 100%;">
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 12px;">
        <img src="plugins/{packageName}/icon.png" alt="icon" style="width: 64px; height: 64px; border-radius: 12px;" />
        <div class="b3-label fn__flex-center">
            Background Cover Plugin v{packageVersion}
        </div>
        <div class="ft__breakword" style="text-align: center;">
            {i18n.aboutDesc}
        </div>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; padding-bottom: 8px;">
        <div class="ft__breakword" style="text-align: center;">
            <a href="https://github.com/HowcanoeWang/siyuan-plugin-background-cover"
               target="_blank" rel="noopener">
                GitHub Repository
            </a>
        </div>
        <div class="ft__breakword" style="text-align: center; font-size: 0.85em; color: var(--b3-theme-on-surface);">
            {i18n.aboutAuthor}
        </div>
    </div>
</div>
