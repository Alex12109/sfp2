// @ts-nocheck
/**
 * Wildleder-Studie der Materialseite: Flor mit Maus, Finger oder Pfeiltasten streichen,
 * eigene Prägung setzen. Übernommen aus dem Bestand (Sites v31: suede-v19.js und
 * branding-motion-v20.js), nur als Modul verpackt. Die Logik ist unverändert.
 */

// ---- Prägeschrift (branding-motion-v20.js) ----
(() => {
  // Suede wordmark lettering. The canvas receives stampchange after every DOM edit.
  function mountStampLettering() {
    const field = document.querySelector("input#studio-mark");
    const study = document.querySelector("[data-suede]");
    const stamp = study?.querySelector("[data-stamp]");
    const lettering = stamp?.querySelector(".stamp-text");
    if (!field || !study || !stamp || !lettering) return () => {};

    const logo = stamp.querySelector(".stamp-logo");
    const logoSource = logo?.querySelector(".stamp-logo-source");
    if (logo && logoSource) {
      logo.style.setProperty(
        "--stamp-logo-mask",
        `url(${JSON.stringify(logoSource.src)})`,
      );
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const segmenter =
      typeof Intl.Segmenter === "function"
        ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
        : null;
    const split = (value) =>
      segmenter
        ? Array.from(segmenter.segment(value), (item) => item.segment)
        : Array.from(value);
    const timers = new Set();
    let nodes = [];
    let disposed = false;
    field.maxLength = 16;

    const changed = () => {
      if (!disposed) study.dispatchEvent(new CustomEvent("stampchange"));
    };
    const later = (callback, duration) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        callback();
      }, duration);
      timers.add(timer);
    };
    const updateState = () => {
      const focused = document.activeElement === field;
      stamp.classList.toggle("is-mark-focused", focused);
      stamp.classList.toggle("has-mark-text", nodes.length > 0);
      // This attribute drives the existing three-step sizing treatment.
      stamp.style.setProperty("--mark-length", Math.max(nodes.length, 3));
      logo?.setAttribute("aria-hidden", String(focused || nodes.length > 0));
    };
    const makeGlyph = (value) => {
      const node = document.createElement("span");
      node.className = "stamp-glyph";
      node.dataset.glyph = value;
      node.textContent = value;
      return node;
    };
    const render = () => {
      const next = split(field.value);
      let prefix = 0;
      while (
        prefix < nodes.length &&
        prefix < next.length &&
        nodes[prefix].dataset.glyph === next[prefix]
      )
        prefix++;
      let suffix = 0;
      while (
        suffix < nodes.length - prefix &&
        suffix < next.length - prefix &&
        nodes[nodes.length - 1 - suffix].dataset.glyph ===
          next[next.length - 1 - suffix]
      )
        suffix++;
      const removed = nodes.slice(prefix, nodes.length - suffix);
      const tail = suffix ? nodes.slice(nodes.length - suffix) : [];
      // Measure retiring glyphs before any layout mutation changes their positions.
      const placements = removed.map((node) => ({
        node,
        rect: node.getBoundingClientRect(),
      }));
      const anchor = study.getBoundingClientRect();
      for (const { node, rect } of placements) {
        if (!reduced.matches) {
          const ghost = node.cloneNode(true);
          ghost.className = "stamp-glyph stamp-glyph-ghost";
          ghost.setAttribute("aria-hidden", "true");
          Object.assign(ghost.style, {
            left: `${rect.left - anchor.left}px`,
            top: `${rect.top - anchor.top}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            font: getComputedStyle(node).font,
            letterSpacing: getComputedStyle(node).letterSpacing,
            color: getComputedStyle(node).color,
            textShadow: getComputedStyle(node).textShadow,
          });
          ghost.style.setProperty(
            "--retiring-opacity",
            getComputedStyle(node).opacity,
          );
          study.append(ghost);
          later(() => {
            ghost.remove();
            changed();
          }, 780);
        }
        node.remove();
      }
      const inserted = next.slice(prefix, next.length - suffix).map(makeGlyph);
      const fragment = document.createDocumentFragment();
      inserted.forEach((node) => fragment.append(node));
      lettering.insertBefore(fragment, tail[0] || null);
      nodes = [...nodes.slice(0, prefix), ...inserted, ...tail];
      lettering.setAttribute("aria-label", field.value);
      updateState();
      changed();
    };
    const onFocus = () => {
      updateState();
      changed();
    };
    const onBlur = () => {
      updateState();
      changed();
    };
    // Each composition input reflects the current IME value; keyed reconciliation
    // preserves unchanged graphemes and compositionend catches non-input commits.
    field.addEventListener("input", render);
    field.addEventListener("compositionend", render);
    field.addEventListener("focus", onFocus);
    field.addEventListener("blur", onBlur);
    render();
    return () => {
      disposed = true;
      field.removeEventListener("input", render);
      field.removeEventListener("compositionend", render);
      field.removeEventListener("focus", onFocus);
      field.removeEventListener("blur", onBlur);
      timers.forEach(clearTimeout);
      study
        .querySelectorAll(".stamp-glyph-ghost")
        .forEach((node) => node.remove());
    };
  }

  mountStampLettering();
})();

// ---- Wildlederflor (suede-v19.js) ----
(() => {
  "use strict";
  const en = document.documentElement.lang === "en";
  document.querySelectorAll("[data-studio]").forEach((root) => {
    const surface = root.querySelector("[data-suede]");
    if (!surface || surface.dataset.suedeReady) return;
    const photo = surface.querySelector("img");
    const canvas = surface.querySelector(".suede-nap");
    const status = root.querySelector(
      "[data-suede-status], [data-studio-status]",
    );
    if (!photo || !canvas) return;
    const output = canvas.getContext("2d");
    if (!output) return;
    surface.dataset.suedeReady = "true";
    const make = () => document.createElement("canvas");
    const lightMask = make(),
      darkMask = make();
    const lightPhoto = make(),
      darkPhoto = make(),
      layer = make(),
      exclusion = make();
    const lightCtx = lightMask.getContext("2d");
    const darkCtx = darkMask.getContext("2d");
    const layerCtx = layer.getContext("2d");
    const exclusionCtx = exclusion.getContext("2d");
    const observedImages = new WeakSet();
    let animationUntil = 0,
      inView = true;
    let width = 0,
      height = 0,
      ratio = 1,
      ready = false,
      frame = 0,
      seeded = false;
    let last = null,
      contact = null;
    const announce = (de, english) => {
      if (status) status.textContent = en ? english : de;
    };

    function compose() {
      frame = 0;
      if (!ready) return;
      output.globalCompositeOperation = "source-over";
      output.clearRect(0, 0, width, height);
      [
        [lightPhoto, lightMask],
        [darkPhoto, darkMask],
      ].forEach(([texture, mask]) => {
        layerCtx.globalCompositeOperation = "source-over";
        layerCtx.clearRect(0, 0, width, height);
        layerCtx.drawImage(texture, 0, 0);
        layerCtx.globalCompositeOperation = "destination-in";
        layerCtx.drawImage(mask, 0, 0);
        output.drawImage(layer, 0, 0);
      });
      drawExclusion();
      output.globalCompositeOperation = "destination-out";
      output.drawImage(exclusion, 0, 0);
      output.globalCompositeOperation = "source-over";
      if (canAnimate() && performance.now() < animationUntil) schedule();
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(compose);
    }
    function canAnimate() {
      return inView && !document.hidden;
    }
    function refreshStamp() {
      animationUntil = canAnimate() ? performance.now() + 2400 : 0;
      schedule();
    }
    function visibleAlpha(node) {
      let alpha = 1;
      for (
        let current = node;
        current && current !== surface;
        current = current.parentElement
      ) {
        const css = getComputedStyle(current);
        if (css.display === "none" || css.visibility === "hidden") return 0;
        alpha *= Number(css.opacity);
      }
      return alpha;
    }
    function drawExclusion() {
      exclusionCtx.clearRect(0, 0, width, height);
      const stamp = surface.querySelector("[data-stamp]");
      const surfaceRect = surface.getBoundingClientRect();
      if (!stamp || !surfaceRect.width || !surfaceRect.height) return;
      const sx = width / surfaceRect.width,
        sy = height / surfaceRect.height;
      const logo = stamp.querySelector(".stamp-logo");
      const source = logo?.querySelector("img.stamp-logo-source");
      if (source) {
        if (!observedImages.has(source)) {
          observedImages.add(source);
          source.addEventListener("load", refreshStamp);
        }
        // This image is intentionally opacity:0. Its SVG alpha is the exact
        // logo silhouette; the visible logo wrapper supplies visibility/opacity.
        const alpha = visibleAlpha(logo);
        const rect = source.getBoundingClientRect();
        if (
          alpha &&
          rect.width &&
          rect.height &&
          source.complete &&
          source.naturalWidth
        ) {
          exclusionCtx.globalAlpha = 1;
          exclusionCtx.drawImage(
            source,
            (rect.left - surfaceRect.left) * sx,
            (rect.top - surfaceRect.top) * sy,
            rect.width * sx,
            rect.height * sy,
          );
        }
      }
      surface.querySelectorAll(".stamp-glyph[data-glyph]").forEach((glyph) => {
        const text = glyph.dataset.glyph;
        const alpha = visibleAlpha(glyph);
        const rect = glyph.getBoundingClientRect();
        if (!text || !alpha || !rect.width || !rect.height) return;
        const css = getComputedStyle(glyph);
        exclusionCtx.save();
        exclusionCtx.font =
          css.font ||
          `${css.fontStyle} ${css.fontWeight} ${css.fontSize} ${css.fontFamily}`;
        if ("fontKerning" in exclusionCtx)
          exclusionCtx.fontKerning = css.fontKerning;
        if ("fontStretch" in exclusionCtx)
          exclusionCtx.fontStretch = /%$/.test(css.fontStretch)
            ? "normal"
            : css.fontStretch;
        if ("letterSpacing" in exclusionCtx)
          exclusionCtx.letterSpacing = css.letterSpacing;
        exclusionCtx.textAlign = "left";
        exclusionCtx.textBaseline = "alphabetic";
        const metrics = exclusionCtx.measureText(text);
        const fontSize = parseFloat(css.fontSize) || 16;
        const ascent =
          metrics.fontBoundingBoxAscent ??
          metrics.emHeightAscent ??
          metrics.actualBoundingBoxAscent;
        const descent =
          metrics.fontBoundingBoxDescent ??
          metrics.emHeightDescent ??
          metrics.actualBoundingBoxDescent;
        const paddingX =
          (parseFloat(css.paddingLeft) || 0) +
          (parseFloat(css.paddingRight) || 0);
        const paddingY =
          (parseFloat(css.paddingTop) || 0) +
          (parseFloat(css.paddingBottom) || 0);
        const borderX =
          (parseFloat(css.borderLeftWidth) || 0) +
          (parseFloat(css.borderRightWidth) || 0);
        const borderY =
          (parseFloat(css.borderTopWidth) || 0) +
          (parseFloat(css.borderBottomWidth) || 0);
        const cssWidth = parseFloat(css.width),
          cssHeight = parseFloat(css.height);
        const lineHeight =
          parseFloat(css.lineHeight) || ascent + descent || fontSize * 1.2;
        const layoutWidth = Number.isFinite(cssWidth)
          ? cssWidth + (css.boxSizing === "border-box" ? 0 : paddingX + borderX)
          : glyph.offsetWidth || metrics.width;
        const layoutHeight = Number.isFinite(cssHeight)
          ? cssHeight +
            (css.boxSizing === "border-box" ? 0 : paddingY + borderY)
          : glyph.offsetHeight || lineHeight + paddingY + borderY;
        if (!layoutWidth || !layoutHeight) {
          exclusionCtx.restore();
          return;
        }
        // Rect/layout ratios follow the live press/removal scale. Place the
        // alphabetic baseline using the font's measured ascent/descent and
        // CSS line leading, retaining real counters and gaps between letters.
        const contentHeight = layoutHeight - paddingY - borderY;
        const x =
          (parseFloat(css.borderLeftWidth) || 0) +
          (parseFloat(css.paddingLeft) || 0);
        const y =
          (parseFloat(css.borderTopWidth) || 0) +
          (parseFloat(css.paddingTop) || 0) +
          (contentHeight - ascent - descent) / 2 +
          ascent;
        exclusionCtx.translate(
          (rect.left - surfaceRect.left) * sx,
          (rect.top - surfaceRect.top) * sy,
        );
        exclusionCtx.scale(
          (rect.width / layoutWidth) * sx,
          (rect.height / layoutHeight) * sy,
        );
        exclusionCtx.globalAlpha = 1;
        exclusionCtx.fillStyle = "#000";
        exclusionCtx.fillText(text, x, y);
        exclusionCtx.restore();
      });
      exclusionCtx.globalAlpha = 1;
    }

    // Preserve existing strokes in normalized surface coordinates across resizing.
    function resizeMask(mask) {
      const copy = make();
      copy.width = mask.width;
      copy.height = mask.height;
      if (ready) copy.getContext("2d").drawImage(mask, 0, 0);
      mask.width = width;
      mask.height = height;
      if (ready) mask.getContext("2d").drawImage(copy, 0, 0, width, height);
    }
    function size(force = false) {
      if (!photo.naturalWidth) return;
      const rect = surface.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        1.5,
        1200 / rect.width,
        900 / rect.height,
      );
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (!force && w === width && h === height) return;
      width = w;
      height = h;
      ratio = width / rect.width;
      resizeMask(lightMask);
      resizeMask(darkMask);
      [canvas, lightPhoto, darkPhoto, layer, exclusion].forEach((c) => {
        c.width = width;
        c.height = height;
      });
      // Match object-fit:cover and object-position:50% 50% exactly.
      const scale = Math.max(
        width / photo.naturalWidth,
        height / photo.naturalHeight,
      );
      const dw = photo.naturalWidth * scale,
        dh = photo.naturalHeight * scale;
      [
        [lightPhoto, 1.25],
        [darkPhoto, 0.74],
      ].forEach(([target, brightness]) => {
        const ctx = target.getContext("2d");
        const supportsFilter = "filter" in ctx;
        if (supportsFilter) ctx.filter = `brightness(${brightness})`;
        ctx.drawImage(photo, (width - dw) / 2, (height - dh) / 2, dw, dh);
        if (supportsFilter) ctx.filter = "none";
        // Fallback still modifies the actual photo; it never paints a generic glow.
        if (!supportsFilter) {
          ctx.fillStyle =
            brightness > 1 ? "rgba(255,255,255,.13)" : "rgba(0,0,0,.26)";
          ctx.fillRect(0, 0, width, height);
        }
      });
      ready = true;
      last = null;
      contact = null;
      if (!seeded) {
        seeded = true;
        const trails = [
          {
            direction: 1,
            points: [
              [0.12, 0.28],
              [0.22, 0.26],
              [0.34, 0.29],
              [0.46, 0.27],
            ],
            strength: 0.4,
          },
          {
            direction: -1,
            points: [
              [0.86, 0.72],
              [0.74, 0.69],
              [0.6, 0.72],
            ],
            strength: 0.38,
          },
          {
            direction: 1,
            points: [
              [0.61, 0.21],
              [0.72, 0.24],
              [0.84, 0.2],
            ],
            strength: 0.3,
          },
        ];
        trails.forEach((trail) =>
          trail.points.slice(1).forEach((p, i) =>
            stroke(
              {
                x: trail.points[i][0] * width,
                y: trail.points[i][1] * height,
              },
              { x: p[0] * width, y: p[1] * height },
              trail.direction,
              trail.strength,
            ),
          ),
        );
      }
      schedule();
    }

    function dab(ctx, x, y, radius, operation, strength) {
      ctx.save();
      ctx.globalCompositeOperation = operation;
      ctx.translate(x, y);
      ctx.scale(1, 0.78);
      const grad = ctx.createRadialGradient(0, 0, radius * 0.15, 0, 0, radius);
      grad.addColorStop(0, `rgba(255,255,255,${strength})`);
      grad.addColorStop(0.62, `rgba(255,255,255,${strength * 0.8})`);
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
      ctx.restore();
    }
    function stroke(a, b, forcedDirection, strengthScale = 1) {
      if (!ready) return;
      const dx = b.x - a.x,
        dy = b.y - a.y;
      const distance = Math.hypot(dx, dy);
      if (!distance || (!forcedDirection && Math.abs(dx) < 0.4 * ratio)) return;
      const direction = forcedDirection || Math.sign(dx);
      const radius =
        Math.min(35, Math.max(24, (width / ratio) * 0.047)) * ratio;
      const steps = Math.max(1, Math.ceil(distance / (radius * 0.15)));
      // Strength follows travelled distance, making slow and fast strokes comparable.
      const strength =
        Math.min(0.24, (distance / steps / radius) * 1.5) * strengthScale;
      const add = direction > 0 ? lightCtx : darkCtx;
      const erase = direction > 0 ? darkCtx : lightCtx;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps,
          x = a.x + dx * t,
          y = a.y + dy * t;
        dab(
          erase,
          x,
          y,
          radius,
          "destination-out",
          Math.min(0.6, strength * 2.4),
        );
        dab(add, x, y, radius, "source-over", strength);
      }
      schedule();
    }
    function point(event) {
      const rect = surface.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * width,
        y: ((event.clientY - rect.top) / rect.height) * height,
      };
    }
    surface.addEventListener(
      "pointerdown",
      (event) => {
        if (
          !ready ||
          !event.isPrimary ||
          (event.pointerType === "mouse" && event.button !== 0)
        )
          return;
        const p = point(event);
        last = p;
        if (event.pointerType !== "mouse")
          contact = { id: event.pointerId, origin: p, axis: null };
      },
      { passive: true },
    );
    surface.addEventListener(
      "pointermove",
      (event) => {
        if (!ready || !event.isPrimary) return;
        const p = point(event);
        if (event.pointerType !== "mouse") {
          if (
            !contact ||
            contact.id !== event.pointerId ||
            contact.axis === "y"
          )
            return;
          if (!contact.axis) {
            const dx = Math.abs(p.x - contact.origin.x),
              dy = Math.abs(p.y - contact.origin.y);
            if (Math.max(dx, dy) < 8 * ratio) return;
            contact.axis = dx > dy * 1.25 ? "x" : "y";
            if (contact.axis === "y") {
              last = null;
              return;
            }
            // Pan-y stays available to the browser; pointercancel ends the stroke.
            try {
              surface.setPointerCapture(event.pointerId);
            } catch {}
          }
        }
        if (last) stroke(last, p);
        last = p;
      },
      { passive: true },
    );
    const end = () => {
      last = null;
      contact = null;
    };
    surface.addEventListener("pointerup", end, { passive: true });
    surface.addEventListener("pointercancel", end, { passive: true });
    surface.addEventListener("lostpointercapture", end, { passive: true });
    surface.addEventListener(
      "pointerleave",
      () => {
        if (!contact) last = null;
      },
      { passive: true },
    );
    function sample(direction) {
      stroke(
        { x: width * (direction > 0 ? 0.19 : 0.81), y: height * 0.59 },
        { x: width * (direction > 0 ? 0.81 : 0.19), y: height * 0.59 },
        direction,
      );
      announce(
        direction > 0
          ? "Flor nach rechts gestrichen."
          : "Flor nach links gestrichen.",
        direction > 0
          ? "Nap brushed to the right."
          : "Nap brushed to the left.",
      );
    }
    function reset() {
      lightCtx.clearRect(0, 0, width, height);
      darkCtx.clearRect(0, 0, width, height);
      end();
      schedule();
      announce("Flor zurückgesetzt.", "Texture reset.");
    }
    surface.addEventListener("keydown", (event) => {
      if (
        event.target !== surface ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      )
        return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        sample(event.key === "ArrowRight" ? 1 : -1);
      } else if (event.key === "Home") {
        event.preventDefault();
        reset();
      }
    });
    root.querySelectorAll("[data-suede-sample]").forEach((button) =>
      button.addEventListener("click", () => {
        sample(Number(button.dataset.suedeSample));
      }),
    );
    root.querySelector("[data-suede-reset]")?.addEventListener("click", reset);
    // A single bounded refresh follows each stamp edit; pointer painting still
    // composes on demand. No animation frames are kept alive off screen.
    surface.addEventListener("stampchange", refreshStamp);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        inView = entries.some((entry) => entry.isIntersecting);
        if (!inView) animationUntil = 0;
        else schedule();
      }).observe(surface);
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) animationUntil = 0;
      else schedule();
    });
    if (document.fonts) {
      document.fonts.ready.then(refreshStamp);
      document.fonts.addEventListener("loadingdone", refreshStamp);
    }
    photo.addEventListener("load", () => size(true));
    if (photo.complete && photo.naturalWidth) size(true);
    new ResizeObserver(() => {
      size();
      schedule();
    }).observe(surface);
    window.addEventListener("resize", () => size(), { passive: true });
  });
})();
