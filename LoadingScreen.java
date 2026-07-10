package com.vynix.client.ui.screen;

import com.vynix.client.VynixClient;
import com.vynix.client.theme.ThemeManager;
import net.minecraft.client.MinecraftClient;
import net.minecraft.client.gui.DrawContext;
import net.minecraft.client.gui.screen.Screen;
import net.minecraft.text.Text;

/**
 * Custom loading screen displayed during Minecraft startup.
 * <p>
 * Features:
 * <ul>
 *   <li>Animated Vynix logo fade-in</li>
 *   <li>Progress bar with accent color</li>
 *   <li>Loading status messages</li>
 *   <li>Version display</li>
 *   <li>Smooth transition to the main menu</li>
 * </ul>
 */
public class LoadingScreen extends Screen {

    private static final Text TITLE = Text.literal("Vynix Client — Loading");

    private final ThemeManager themeManager;

    // Animation state
    private long startTime;
    private String statusMessage = "Initializing Vynix Client...";
    private float progress = 0f;       // 0.0 to 1.0

    // Color pulse animation
    private float pulsePhase = 0f;

    // Transition state
    private boolean transitioning = false;
    private float transitionAlpha = 0f;

    public LoadingScreen() {
        super(TITLE);
        this.themeManager = VynixClient.getInstance().getThemeManager();
    }

    @Override
    protected void init() {
        startTime = System.currentTimeMillis();
    }

    /**
     * Updates the loading progress and status message.
     */
    public void setProgress(float progress, String message) {
        this.progress = Math.clamp(progress, 0f, 1f);
        this.statusMessage = message;
    }

    /**
     * Marks the loading screen for transition to the main menu.
     */
    public void completeLoading() {
        this.transitioning = true;
    }

    @Override
    public void render(DrawContext context, int mouseX, int mouseY, float delta) {
        long elapsed = System.currentTimeMillis() - startTime;
        float animProgress = Math.min(elapsed / 600f, 1f);

        // ── Full-screen dark background ──
        context.fill(0, 0, width, height, themeManager.bg());

        // ── Pulse effect ──
        pulsePhase += delta * 2f;
        if (pulsePhase > Math.PI * 2) pulsePhase -= Math.PI * 2;

        // ── Center area ──
        int centerX = width / 2;
        int centerY = height / 2;

        // ── Logo ──
        float logoScale = 2.5f * animProgress;
        String logoText = "Vynix Client";
        int logoWidth = textRenderer.getWidth(logoText);

        context.getMatrices().push();
        context.getMatrices().translate(centerX, centerY - 50, 0);
        context.getMatrices().scale(logoScale, logoScale, 1f);
        context.getMatrices().translate(-logoWidth / 2f, -textRenderer.fontHeight / 2f, 0);

        context.drawTextWithShadow(
                textRenderer, logoText,
                0, 0,
                themeManager.accentLight()
        );
        context.getMatrices().pop();

        // ── Progress bar ──
        int barWidth = 300;
        int barHeight = 4;
        int barX = centerX - barWidth / 2;
        int barY = centerY + 20;

        // Bar background
        context.fill(barX, barY, barX + barWidth, barY + barHeight, 0x30FFFFFF);

        // Bar fill
        int fillWidth = (int) (barWidth * progress);

        // Animated shimmer on the progress bar
        int shimmerOffset = (int) ((elapsed / 50) % barWidth);
        int gradientAlpha = (int) ((Math.sin(pulsePhase) * 0.3 + 0.7) * 0xFF);
        int fillColor = (gradientAlpha << 24) | (themeManager.accent() & 0x00FFFFFF);

        context.fill(barX, barY, barX + fillWidth, barY + barHeight, fillColor);

        // Shimmer highlight
        if (fillWidth > 10) {
            int shimmerWidth = 30;
            int shimmerX = barX + shimmerOffset % fillWidth;
            shimmerX = Math.min(shimmerX, barX + fillWidth - shimmerWidth);
            context.fill(shimmerX, barY, shimmerX + shimmerWidth, barY + barHeight, 0x40FFFFFF);
        }

        // ── Status message ──
        String displayMessage = statusMessage + (transitioning ? "..." : "");
        int msgWidth = textRenderer.getWidth(displayMessage);
        context.drawTextWithShadow(
                textRenderer, displayMessage,
                centerX - msgWidth / 2,
                barY + 12,
                0xFFA0A0B0
        );

        // ── Version ──
        String version = "v" + VynixClient.VERSION.toDisplayString();
        int versionWidth = textRenderer.getWidth(version);
        context.drawTextWithShadow(
                textRenderer, version,
                centerX - versionWidth / 2,
                barY + 30,
                0x60606070
        );

        // ── Fade to black for transition ──
        if (transitioning) {
            transitionAlpha = Math.min(transitionAlpha + delta * 2f, 1f);
            int fadeColor = ((int)(transitionAlpha * 0xFF) << 24) | 0x000000;
            context.fill(0, 0, width, height, fadeColor);

            // Switch to main menu once fully faded
            if (transitionAlpha >= 1f) {
                MinecraftClient.getInstance().setScreen(new com.vynix.client.ui.VynixMainMenu());
            }
        }
    }

    @Override
    public boolean shouldPause() {
        return false;
    }

    @Override
    public boolean shouldCloseOnEsc() {
        return false;
    }
}
