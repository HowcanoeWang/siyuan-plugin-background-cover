<script lang="ts">
    import { packageVersion } from "../../constants"

    const i18n = (window as any).bgCoverPlugin?.i18n ?? {}
</script>

<div class="config__tab-container" data-name="about" style="display: flex; flex-direction: column; gap: 8px;">
    <div class="b3-label fn__flex-center">
        Background Cover Plugin v{packageVersion}
    </div>
    <div class="ft__breakword" style="text-align: center;">
        {i18n.aboutDesc}
    </div>
    <div class="fn__hr"></div>
    <div class="ft__breakword" style="text-align: center;">
        <a href="https://github.com/HowcanoeWang/siyuan-plugin-background-cover"
           target="_blank" rel="noopener">
            GitHub Repository
        </a>
    </div>
    <div class="ft__breakword" style="text-align: center; font-size: 0.85em; color: var(--b3-theme-on-surface);">
        {i18n.aboutAuthor}
    </div>
    <div class="fn__hr"></div>
    <div class="b3-label">
        {i18n.videoBgRecommend || '视频背景素材推荐'}
        <div class="b3-label__text">{i18n.videoBgRecommendDesc || '动态订阅源仅支持图片背景。如需视频背景，请从以下网站下载后通过本地上传添加。'}</div>
    </div>
    <div class="ft__breakword" style="font-size: 0.85em;">
        • Pexels Videos — pexels.com/videos<br>
        • Pixabay Videos — pixabay.com/videos<br>
        • Videezy — videezy.com<br>
        • Coverr — coverr.co
    </div>
</div>
