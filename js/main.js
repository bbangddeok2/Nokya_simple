// 배경/헤더 전환: hero-spacer(=100vh) - headerH 지점부터 헤더 배경 ON
function setupBgSwitch() {
  const spacer = document.querySelector(".hero-spacer");
  const header = document.querySelector(".header");
  if (!spacer || !header) return;

  const getThreshold = () => {
    const h = spacer.getBoundingClientRect().height;
    const headerH = header.offsetHeight || 0;
    return Math.max(0, h - headerH);
  };

  const onScroll = () => {
    const on = window.scrollY >= getThreshold();
    header.classList.toggle("is-bg", on);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
}

// 앵커 스크롤 (헤더 높이 고려)
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

// 인스타 무한루프
function setupInstaLoop() {
  const wrap = document.querySelector(".turn-wrap");
  const track = document.getElementById("instaTurn");
  if (!wrap || !track) return;

  const baseItems = Array.from(track.querySelectorAll(".turn_con"));
  if (baseItems.length < 2) return;

  if (!track.__baseHTML) {
    track.__baseHTML = baseItems.map((el) => el.outerHTML).join("");
  }

  track.innerHTML = track.__baseHTML + track.__baseHTML;

  const gap = parseFloat(getComputedStyle(track).gap || "0");

  const measureSetWidth = () => {
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

  requestAnimationFrame(() => {
    const setWidth = measureSetWidth();
    const wrapWidth = wrap.getBoundingClientRect().width;

    while (track.scrollWidth < setWidth + wrapWidth) {
      track.insertAdjacentHTML("beforeend", track.__baseHTML);
    }

    track.style.setProperty("--loop-dist", `${setWidth}px`);
    track.style.setProperty("--loop-speed", "20s");
  });
}

// EN 토글
function setupLangToggle() {
  const btn = document.getElementById("langToggle");
  if (!btn) return;

  let isEN = false;

  const dict = {
    KR: {
      "menu.about": "About",
      "menu.archive": "Archive",
      "menu.shop": "Shop",
      "about.desc":
        "녹야는 말없이 타는 작은 양초도깨비입니다.<br />낮은 온도의 위로를 이곳에 남기고,<br />감정에 흔들려도 쉽게 꺼지지 않는 순간들을 기록합니다.",
      "title.archive": "도깨비즈의 기록",
      "btn.instaMore": "인스타에서 더 보기",
      "title.shop": "도깨비즈 상점",
      "goods.item1": "작은 물건들",
      "goods.item2": "카페의 시간",
      "goods.item3": "반짝이는 순간",
      "goods.item4": "부드러운 하루",
    },
    EN: {
      "menu.about": "About",
      "menu.archive": "Archive",
      "menu.shop": "Shop",
      "about.desc":
        "Nokya is a small candle goblin that burns quietly.<br />Leaving gentle warmth here,<br />Recording moments that do not easily fade.",
      "title.archive": "Archive",
      "btn.instaMore": "See more on Instagram",
      "title.shop": "Shop",
      "goods.item1": "Goods",
      "goods.item2": "Cafe",
      "goods.item3": "Jewellery",
      "goods.item4": "Cosmetics",
    },
  };

  const applyLang = (langKey) => {
    const map = dict[langKey];
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = map[key];
      if (val == null) return;

      if (key === "about.desc") el.innerHTML = val;
      else el.textContent = val;
    });

    btn.textContent = langKey === "EN" ? "KR" : "EN";
  };

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    isEN = !isEN;
    applyLang(isEN ? "EN" : "KR");
  });

  applyLang("KR");
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
