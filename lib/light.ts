// Where the "studio light" is, -1..1 on each axis: the cursor on desktop, the phone's tilt on mobile.
// One shared object, read every frame by whoever needs it (no React state per move). Listeners start
// on first use and stay off for visitors who prefer reduced motion.

export const light = { x: 0, y: -0.3 };

let started = false;
export function startLight() {
  if (started || typeof window === "undefined") return;
  started = true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      light.x = (e.clientX / innerWidth) * 2 - 1;
      light.y = (e.clientY / innerHeight) * 2 - 1;
    },
    { passive: true },
  );
  // Phone held upright reads beta ≈ 45–60°; tilting moves the light ±30° around that.
  // ponytail: iOS only sends tilt after a permission prompt, so iPhones keep the default light.
  window.addEventListener("deviceorientation", (e) => {
    if (e.beta == null || e.gamma == null) return;
    light.x = Math.max(-1, Math.min(1, e.gamma / 30));
    light.y = Math.max(-1, Math.min(1, (e.beta - 50) / 30));
  });
}
