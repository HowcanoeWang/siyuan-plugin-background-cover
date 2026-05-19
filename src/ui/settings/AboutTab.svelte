<script lang="ts">
    import { getFrontend, getBackend } from "siyuan"
    import { packageVersion, packageName } from "../../constants"

    const i18n = (window as any).bgCoverPlugin?.i18n ?? {}
    const frontEnd = getFrontend()
    const backEnd = getBackend()
    const isMobileLayout = (window as any).bgCoverPlugin?.isMobileLayout ?? false
    const isBrowser = frontEnd === "browser"
    const isAndroid = frontEnd === "browser-mobile"
</script>

<div class="config__tab-container" data-name="about" style="display: flex; flex-direction: column; height: 100%;">
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 12px;">
        <img src="plugins/{packageName}/icon.png" alt="icon" style="width: 128px; height: 128px; border-radius: 12px;" />
        <div class="b3-label fn__flex-center">
            Background Cover Plugin v{packageVersion}
        </div>
        <div class="ft__breakword" style="text-align: center;">
            {i18n.aboutDesc}
        </div>
        <div class="ft__breakword" style="text-align: center; font-size: 0.8em; color: var(--b3-theme-on-surface);">
            FrontEnd: <code class="fn__code">{frontEnd}</code> •
            BackEnd: <code class="fn__code">{backEnd}</code> •
            isMobileLayout: <code class="fn__code">{String(isMobileLayout)}</code> •
            isBrowser: <code class="fn__code">{String(isBrowser)}</code> •
            isAndroid: <code class="fn__code">{String(isAndroid)}</code>
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
