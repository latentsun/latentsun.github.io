// /hls-init.js
document.addEventListener('DOMContentLoaded', () => {
    const videos = document.querySelectorAll('video');
    videos.forEach(v => {
      v.volume = 0.5; // 0.0 (mute) → 1.0 (full)
    });
  });

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("video[data-hls]").forEach(video => {
    const src = video.dataset.hls;

    // ---- initial attach ----
    if (video.canPlayType("application/vnd.apple.mpegURL")) {
      // Safari / iOS native HLS
      video.src = src;
      video._usesNativeHls = true;
    } else if (window.Hls && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      video._hls = hls;
      video._usesNativeHls = false;
    } else {
      console.error("HLS not supported:", src);
    }

    // ---- on end: reset to start, keep source attached so Play is enabled ----
    video.addEventListener("ended", () => {
      // Go back to the beginning and show the poster again
      video.pause();
      // Seek to 0; wait for it to land before pausing again to avoid autoplay quirks
      const seekBack = () => {
        video.removeEventListener("seeked", seekBack);
        // Ensure paused state and controls are active
        video.pause();
        video.controls = true;

        // Keep the source attached so Play isn't greyed out
        if (video._usesNativeHls) {
          // Reload metadata so browsers reliably show the poster at time 0
          // (keeps src; controls remain active)
          video.load();
        } else if (video._hls) {
          // Keep hls.js attached; just stop loading further segments
          try { video._hls.stopLoad(); } catch {}
          // Restart loader from the beginning so first play is instant
          try { video._hls.startLoad(0); } catch {}
        }
      };

      try {
        // Some browsers need a tiny delay to accept the backwards seek after 'ended'
        video.currentTime = 0;
        // If the seek fires, finish the reset there
        video.addEventListener("seeked", seekBack, { once: true });
        // Fallback: if seeked never fires, force a tiny async settle then do housekeeping
        setTimeout(() => {
          if (!video.paused) video.pause();
          video.controls = true;
        }, 50);
      } catch {
        // Safety net: at least keep controls active
        video.pause();
        video.controls = true;
      }
    });

    // ---- when user hits Play after ending: ensure loader is running ----
    video.addEventListener("play", () => {
      if (!video._usesNativeHls && video._hls) {
        // Make sure loading is started in case we stopped it
        try { video._hls.startLoad(0); } catch {}
      }
    });
  });
});
