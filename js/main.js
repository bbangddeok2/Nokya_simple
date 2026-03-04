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

/* ✅ TOBISCORE: modal + simple scoring */
function setupTobiScore() {
  const modalBack = document.getElementById("tobiModal");
  const openBtn = document.getElementById("openTobiModal");
  const closeBtn = document.getElementById("closeTobiModal");

  if (!modalBack || !openBtn || !closeBtn) return;

  const energy = document.getElementById("energy");
  const stress = document.getElementById("stress");
  const urge = document.getElementById("urge");

  const vEnergy = document.getElementById("vEnergy");
  const vStress = document.getElementById("vStress");
  const vUrge = document.getElementById("vUrge");

  const calcBtn = document.getElementById("calcTobi");
  const copyBtn = document.getElementById("copyTobi");

  const modalScore = document.getElementById("modalScore");
  const modalLevel = document.getElementById("modalLevel");
  const modalBar = document.getElementById("modalBar");
  const modalTalismans = document.getElementById("modalTalismans");
  const urgeWarn = document.getElementById("urgeWarn");

  const previewNum = document.getElementById("tobiScoreNum");
  const previewLevel = document.getElementById("tobiLevelText");
  const previewBar = document.getElementById("tobiBarFill");

  const getRoutineCount = () =>
    Array.from(document.querySelectorAll(".rt")).filter((x) => x.checked)
      .length;

  const getLevelKey = (score) => {
    if (score >= 80) return "flex";
    if (score >= 60) return "tobi";
    if (score >= 40) return "routine";
    return "seed";
  };

  const computeScore = () => {
    const e = Number(energy.value); // 1..5
    const s = Number(stress.value); // 1..5
    const u = Number(urge.value); // 1..5
    const r = getRoutineCount(); // 0..4

    // 설명 가능한 단순 점수(0..100)
    const energyPts = ((e - 1) / 4) * 30; // 0..30
    const stressPts = ((5 - s) / 4) * 25; // 25..0
    const urgePts = ((5 - u) / 4) * 15; // 15..0
    const routinePts = (r / 4) * 30; // 0..30

    return Math.max(
      0,
      Math.min(100, Math.round(energyPts + stressPts + urgePts + routinePts)),
    );
  };

  const renderSliderVals = () => {
    vEnergy.textContent = energy.value;
    vStress.textContent = stress.value;
    vUrge.textContent = urge.value;
  };

  const renderResult = () => {
    const score = computeScore();
    const levelKey = getLevelKey(score);

    modalScore.textContent = score;
    modalBar.style.width = `${score}%`;

    // 부적(간단 룰)
    const r = getRoutineCount();
    const s = Number(stress.value);
    const u = Number(urge.value);

    const tal = [];
    if (r >= 3 && s <= 3) tal.push("안정 부적");
    if (u >= 4 && r >= 1) tal.push("충동 방어 부적");
    if (s >= 4 && r >= 2) tal.push("회복 부적");
    if (score >= 80) tal.push("플렉스 부적");

    modalTalismans.innerHTML = tal.length
      ? tal.map((t) => `<span class="tobi_talisman">${t}</span>`).join("")
      : `<span class="tobi_talisman">아직 부적 없음</span>`;

    urgeWarn.textContent =
      u >= 4
        ? "지금은 ‘소비 욕구’가 높은 상태예요. 잠깐 멈추고 체크인하면 도움돼요."
        : "";

    // Preview 반영(메인 프리뷰도 같이 바뀌게)
    if (previewNum) previewNum.textContent = score;
    if (previewBar) previewBar.style.width = `${score}%`;

    // 레벨 텍스트는 i18n이 덮어쓸 수 있어서 data-i18n 키를 바꾸는 방식으로 처리
    if (modalLevel)
      modalLevel.setAttribute("data-i18n", `tobi.level.${levelKey}`);
    if (previewLevel)
      previewLevel.setAttribute("data-i18n", `tobi.level.${levelKey}`);

    // 현재 언어 상태 반영(버튼에 따라 텍스트 재적용)
    const langBtn = document.getElementById("langToggle");
    if (langBtn && langBtn.textContent === "KR") applyLang("EN");
    else applyLang("KR");
  };

  const open = () => {
    modalBack.classList.add("on");
    modalBack.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    renderSliderVals();
    renderResult();
  };

  const close = () => {
    modalBack.classList.remove("on");
    modalBack.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  modalBack.addEventListener("click", (e) => {
    if (e.target === modalBack) close();
  });

  [energy, stress, urge].forEach((el) => {
    el.addEventListener("input", () => {
      renderSliderVals();
    });
  });

  document.querySelectorAll(".rt").forEach((cb) => {
    cb.addEventListener("change", () => {
      // no-op (계산 버튼 누르면 반영)
    });
  });

  calcBtn.addEventListener("click", renderResult);

  copyBtn.addEventListener("click", async () => {
    const score = computeScore();
    const r = getRoutineCount();
    const txt = `오늘의 TobiScore: ${score}/100\n루틴: ${r}/4\n#TobiScore`;
    try {
      await navigator.clipboard.writeText(txt);
      copyBtn.textContent = "복사됨";
      setTimeout(() => (copyBtn.textContent = "결과 복사"), 900);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = txt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  });
}

/* ✅ EN 토글 + i18n (토비스코어 포함) */
let applyLang; // setupTobiScore에서 재사용하려고 밖으로 뺌

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
      "insta.from": "From Instagram",
      "btn.instaMore": "인스타에서 더 보기",

      "title.shop": "도깨비즈 상점",
      "goods.item1": "작은 물건들",
      "goods.item2": "카페의 시간",
      "goods.item3": "반짝이는 순간",
      "goods.item4": "부드러운 하루",

      // ✅ TOBI
      "tobi.title": "TobiScore",
      "tobi.desc": "하루 10초 체크로 오늘의 생활 안정 점수를 기록해요.",
      "tobi.kicker": "오늘의 프리뷰",
      "tobi.small": "생활 안정성 점수",
      "tobi.tag1": "충동 방어",
      "tobi.tag2": "루틴",
      "tobi.tag3": "회복",
      "tobi.open": "10초 체크 열어보기",
      "tobi.link": "토비스코어 자세히 보기 →",
      "tobi.note": "메인 톤을 해치지 않도록, 여기서는 ‘프리뷰’만 보여줘요.",

      "tobi.modal.title": "10초 체크",
      "tobi.modal.desc":
        "오늘 상태를 간단히 체크하면 점수/레벨/부적이 계산돼요.",
      "tobi.modal.state": "상태",
      "tobi.modal.energy": "에너지",
      "tobi.modal.stress": "스트레스",
      "tobi.modal.urge": "소비 욕구",
      "tobi.modal.routine": "루틴",
      "tobi.modal.r1": "지출을 아꼈어요",
      "tobi.modal.r2": "충동구매를 참았어요",
      "tobi.modal.r3": "루틴/수면을 지켰어요",
      "tobi.modal.r4": "마음을 정리했어요",
      "tobi.modal.calc": "점수 계산",
      "tobi.modal.copy": "결과 복사",
      "tobi.modal.result": "결과",

      // 레벨
      "tobi.level.seed": "씨앗",
      "tobi.level.routine": "루틴러",
      "tobi.level.tobi": "토비",
      "tobi.level.flex": "플렉서",
    },

    EN: {
      "menu.about": "About",
      "menu.archive": "Archive",
      "menu.shop": "Shop",

      "about.desc":
        "Nokya is a small candle goblin that burns quietly.<br />Leaving gentle warmth here,<br />Recording moments that do not easily fade.",

      "title.archive": "Archive",
      "insta.from": "From Instagram",
      "btn.instaMore": "See more on Instagram",

      "title.shop": "Shop",
      "goods.item1": "Goods",
      "goods.item2": "Cafe",
      "goods.item3": "Jewellery",
      "goods.item4": "Cosmetics",

      // ✅ TOBI
      "tobi.title": "TobiScore",
      "tobi.desc": "A 10-second check-in for today’s stability score.",
      "tobi.kicker": "Today’s preview",
      "tobi.small": "Stability score",
      "tobi.tag1": "Impulse shield",
      "tobi.tag2": "Routine",
      "tobi.tag3": "Recovery",
      "tobi.open": "Open 10-sec check",
      "tobi.link": "Learn more about TobiScore →",
      "tobi.note": "This is a preview only, to keep the homepage minimal.",

      "tobi.modal.title": "10-sec check-in",
      "tobi.modal.desc":
        "Quick check → score, level and talisman are calculated.",
      "tobi.modal.state": "State",
      "tobi.modal.energy": "Energy",
      "tobi.modal.stress": "Stress",
      "tobi.modal.urge": "Spending urge",
      "tobi.modal.routine": "Routine",
      "tobi.modal.r1": "I saved small expenses",
      "tobi.modal.r2": "I resisted an impulse buy",
      "tobi.modal.r3": "I kept my sleep/routine",
      "tobi.modal.r4": "I calmed myself down",
      "tobi.modal.calc": "Calculate",
      "tobi.modal.copy": "Copy result",
      "tobi.modal.result": "Result",

      // levels
      "tobi.level.seed": "Seed",
      "tobi.level.routine": "Routine",
      "tobi.level.tobi": "Tobi",
      "tobi.level.flex": "Flex",
    },
  };

  applyLang = (langKey) => {
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
  setupTobiScore();
});

window.addEventListener("resize", () => {
  clearTimeout(window.__instaLoopTimer);
  window.__instaLoopTimer = setTimeout(setupInstaLoop, 150);
});
