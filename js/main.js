// main.js
(function () {
  const body = document.body;

  // 섹션1(=100vh) 스크롤 후 배경색 적용
  function onScroll() {
    const threshold = window.innerHeight; // hero 100vh 기준
    if (window.scrollY >= threshold) body.classList.add("is-scrolled");
    else body.classList.remove("is-scrolled");
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  // EN 토글(가능한 범위만)
  const langBtn = document.getElementById("langToggle");

  const dict = {
    ko: {
      "nav.about": "About",
      "nav.archive": "Archive",
      "nav.shop": "Shop",
      "archive.title": "도깨비즈의 기록",
      "shop.title": "도깨비즈 상점",
      "insta.from": "From Instagram",
      "insta.more": "인스타에서 더 보기",
      "about.text":
        "녹야는 말없이 타는 작은 양초도깨비입니다.<br/>" +
        "낮은 온도의 위로를 이곳에 남기고,<br/>" +
        "감정에 흔들려도 쉽게 꺼지지 않는 순간들을 기록합니다.",
      langBtn: "EN",
    },
    en: {
      "nav.about": "About",
      "nav.archive": "Archive",
      "nav.shop": "Shop",
      "archive.title": "Dokkaebiz Archive",
      "shop.title": "Dokkaebiz Shop",
      "insta.from": "From Instagram",
      "insta.more": "View more on Instagram",
      "about.text":
        "Nokya is a small candle goblin who burns in silence.<br/>" +
        "Leaving low-temperature comfort here,<br/>" +
        "and recording moments that won’t easily go out— even when feelings sway.",
      langBtn: "KR",
    },
  };

  let lang = "ko";

  function applyLang(next) {
    const pack = dict[next];
    if (!pack) return;

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.getAttribute("data-i18n");
      if (!key || pack[key] == null) return;

      if (key === "about.text") node.innerHTML = pack[key];
      else node.textContent = pack[key];
    });

    if (langBtn) langBtn.textContent = pack.langBtn;
    lang = next;
    document.documentElement.lang = next === "ko" ? "ko" : "en";
  }

  if (langBtn) {
    langBtn.addEventListener("click", () => {
      applyLang(lang === "ko" ? "en" : "ko");
    });
  }

  applyLang("ko");
})();
