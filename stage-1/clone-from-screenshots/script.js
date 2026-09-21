/**
 * United Carriers - Services Showcase Interactions
 */

document.addEventListener("DOMContentLoaded", () => {
  const pageWrapper = document.getElementById("pageWrapper");
  const speedometer = document.getElementById("speedometer");
  const truckStage = document.getElementById("truckStage");
  const interactiveDial = document.getElementById("interactiveDial");
  const bgSvg = document.querySelector(".services-bg-svg");

  let isDragging = false;
  let startX = 0;
  let currentTranslateX = 0;
  let targetTranslateX = 0;
  let lastX = 0;
  let lastTime = performance.now();
  let currentSpeed = 0;
  let targetSpeed = 0;

  // Formatting helper for speedometer (e.g. 0 -> '00', 8 -> '08')
  function formatSpeed(val) {
    const rounded = Math.round(val);
    return rounded < 10 ? `0${rounded}` : `${rounded}`;
  }

  // Pointer / Mouse Down
  function onPointerDown(e) {
    isDragging = true;
    startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    lastX = startX;
    lastTime = performance.now();
  }

  // Pointer / Mouse Move
  function onPointerMove(e) {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    const now = performance.now();
    const dt = Math.max(now - lastTime, 1); // avoid divide by zero

    if (isDragging) {
      const dx = clientX - lastX;
      targetTranslateX += dx * 0.6;

      // Calculate speed based on movement velocity
      const velocity = Math.abs(dx) / dt; // pixels per ms
      targetSpeed = Math.min(Math.round(velocity * 120), 98); // Max speed ~98 km/h
    } else {
      // Gentle parallax with mouse move even when not dragging
      const normX = clientX / window.innerWidth - 0.5;
      targetTranslateX = normX * 25;
    }

    // Interactive dial subtle reaction to pointer
    if (interactiveDial && !isDragging) {
      const dialNormX = clientX / window.innerWidth - 0.5;
      interactiveDial.style.transform = `translate(${dialNormX * 12}px, 0)`;
    }

    lastX = clientX;
    lastTime = now;
  }

  // Pointer / Mouse Up
  function onPointerUp() {
    isDragging = false;
    targetSpeed = 0;
  }

  // Bind mouse / touch events
  window.addEventListener("mousedown", onPointerDown);
  window.addEventListener("mousemove", onPointerMove, { passive: true });
  window.addEventListener("mouseup", onPointerUp);

  window.addEventListener("touchstart", onPointerDown, { passive: true });
  window.addEventListener("touchmove", onPointerMove, { passive: true });
  window.addEventListener("touchend", onPointerUp, { passive: true });

  // Wheel scroll interaction
  window.addEventListener(
    "wheel",
    (e) => {
      targetTranslateX -= e.deltaX || e.deltaY * 0.5;
      targetSpeed = Math.min(Math.abs(e.deltaY || e.deltaX) * 0.8, 85);
    },
    { passive: true },
  );

  // Main animation loop (60 FPS smooth interpolation)
  function animate() {
    // Smooth translation of truck and background text
    currentTranslateX += (targetTranslateX - currentTranslateX) * 0.08;

    // Bounds clamping so the truck doesn't drift off screen
    const maxBound = window.innerWidth * 0.15;
    targetTranslateX = Math.max(
      -maxBound,
      Math.min(maxBound, targetTranslateX),
    );

    if (truckStage) {
      truckStage.style.transform = `translateX(${currentTranslateX}px)`;
    }

    if (bgSvg) {
      // Parallax in opposite direction for depth
      bgSvg.style.transform = `translateX(${-currentTranslateX * 0.35}px)`;
    }

    // Speedometer decay / easing
    currentSpeed += (targetSpeed - currentSpeed) * (isDragging ? 0.2 : 0.06);
    if (currentSpeed < 0.2) currentSpeed = 0;

    if (speedometer) {
      speedometer.textContent = formatSpeed(currentSpeed);
    }

    // Interactive dial rotation based on movement
    if (interactiveDial && isDragging) {
      const rot = currentTranslateX * 1.5;
      interactiveDial.style.transform = `rotate(${rot}deg)`;
    }

    requestAnimationFrame(animate);
  }

  animate();
});
