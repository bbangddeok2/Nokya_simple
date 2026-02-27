// main.js

// ✅ 배경 전환: hero-spacer(=100vh) 지나면 배경색 ON
function setupBgSwitch() {
  const spacer = document.querySelector(".hero-spacer");
  if (!spacer) return;

  const h = spacer.offsetHeight;

  const onScroll = () => {
    if (window.scrollY >= h) document.body.classList.add("bg-on");
    else document.body.classList.remove("bg-on");
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// ✅ 앵커 스크롤 (헤더 높이 고려)
function setupAnchorScroll() {
  const header = document.querySelector(".header");
  const headerH = header ? header.offsetHeight : 0;

  document.querySelectorAll('.nav a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const id = a.getAttribute("href");
      const target = document.querySelector(id);
      if (!target) return;

      const y =
        target.getBoundingClientRect().top + window.pageYOffset - headerH;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });
}

// ✅ 인스타 무한루프: 화면보다 트랙이 짧으면 자동 복제해서 "빈공간" 제거
function setupInstaLoop() {
  const wrap = document.querySelector(".turn-wrap");
  const track = document.getElementById("instaTurn");
  if (!wrap || !track) return;

  // 원본 1세트: 현재 들어있는 것(5개) 기준
  const baseItems = Array.from(track.querySelectorAll(".turn_con"));
  if (baseItems.length < 2) return;

  // 원본 HTML 저장 (한 번만)
  if (!track.__baseHTML) {
    track.__baseHTML = baseItems.map((el) => el.outerHTML).join("");
  }

  // 일단 최소 2세트로 시작
  track.innerHTML = track.__baseHTML + track.__baseHTML;

  const gap = parseFloat(getComputedStyle(track).gap || "0");

  const measureSetWidth = () => {
    // 현재 track의 "첫 세트(원본 개수만큼)"만 측정
    const items = Array.from(track.querySelectorAll(".turn_con")).slice(
      0,
      baseItems.length,
    );
    let dist = 0;
    items.forEach((el, idx) => {
      dist += el.getBoundingClientRect().width;
      if (idx !== items.length - 1) dist += gap;
    });
    return dist;
  };

  // 다음 프레임에서 실제 크기 측정 (이미지 로딩 안정화)
  requestAnimationFrame(() => {
    const setWidth = measureSetWidth();
    const wrapWidth = wrap.getBoundingClientRect().width;

    // totalWidth >= setWidth + wrapWidth 될 때까지 복제
    while (track.scrollWidth < setWidth + wrapWidth) {
      track.insertAdjacentHTML("beforeend", track.__baseHTML);
    }

    track.style.setProperty("--loop-dist", `${setWidth}px`);
    track.style.setProperty("--loop-speed", "20s"); // 속도 여기만 바꾸면 됨
  });
}

// ✅ EN 토글(원하면). 문제 생기면 이 함수 호출만 지워도 됨.
function setupLangToggle() {
  const btn = document.getElementById("langToggle");
  if (!btn) return;

  let isEN = false;

  const setKR = () => {
    document.querySelector('[data-i18n="menu.about"]').textContent = "About";
    document.querySelector('[data-i18n="menu.archive"]').textContent =
      "Archive";
    document.querySelector('[data-i18n="menu.shop"]').textContent = "Shop";
    btn.textContent = "EN";

    document.querySelector('[data-i18n="about.desc"]').innerHTML =
      "녹야는 말없이 타는 작은 양초도깨비입니다.<br />낮은 온도의 위로를 이곳에 남기고,<br />감정에 흔들려도 쉽게 꺼지지 않는 순간들을 기록합니다.";
  };

  const setEN = () => {
    document.querySelector('[data-i18n="menu.about"]').textContent = "About";
    document.querySelector('[data-i18n="menu.archive"]').textContent =
      "Archive";
    document.querySelector('[data-i18n="menu.shop"]').textContent = "Shop";
    btn.textContent = "KR";

    document.querySelector('[data-i18n="about.desc"]').innerHTML =
      "Nokya is a small candle goblin that burns quietly.<br />Leaving gentle warmth here,<br />Recording moments that do not easily fade.";
  };

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    isEN = !isEN;
    if (isEN) setEN();
    else setKR();
  });
}

// init
window.addEventListener("load", () => {
  setupBgSwitch();
  setupAnchorScroll();
  setupInstaLoop();
  setupLangToggle();
});

window.addEventListener("resize", () => {
  clearTimeout(window.__instaLoopTimer);
  window.__instaLoopTimer = setTimeout(setupInstaLoop, 150);
});
