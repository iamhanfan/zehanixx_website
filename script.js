(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const hasGSAP = Boolean(gsap);
  const hasScrollTrigger = Boolean(ScrollTrigger);
  const header = document.querySelector("[data-header]");
  const loader = document.querySelector(".page-loader");
  const loaderMark = document.querySelector(".loader-mark");
  const progressBar = document.querySelector(".scroll-progress__bar");
  const heroContainer = document.querySelector("#hero .container");
  let lenis = null;

  if (hasGSAP && hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  const setScrolledHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  const initScrollEngine = () => {
    if (reduceMotion || !hasGSAP || !hasScrollTrigger || !window.Lenis) {
      return;
    }

    lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  };

  const initProgressBar = () => {
    if (!progressBar) {
      return;
    }

    if (hasGSAP && hasScrollTrigger && !reduceMotion) {
      gsap.to(progressBar, {
        width: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.2,
        },
      });
      return;
    }

    const updateProgress = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight || 1;
      const progress = Math.min(window.scrollY / maxScroll, 1) * 100;
      progressBar.style.width = `${progress}%`;
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  };

  const initMenu = () => {
    const toggle = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-mobile-menu]");
    const links = menu?.querySelectorAll("a") ?? [];

    if (!toggle || !menu) {
      return;
    }

    const setMenuOpen = (open) => {
      toggle.classList.toggle("is-active", open);
      menu.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute(
        "aria-label",
        open ? "Close navigation menu" : "Open navigation menu"
      );
      menu.setAttribute("aria-hidden", String(!open));
      menu.inert = !open;
    };

    setMenuOpen(false);

    toggle.addEventListener("click", () => {
      setMenuOpen(!menu.classList.contains("is-open"));
    });

    links.forEach((link) => {
      link.addEventListener("click", () => {
        setMenuOpen(false);
      });
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    });
  };

  const initAnchorScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetSelector = link.getAttribute("href");

        if (!targetSelector || targetSelector === "#") {
          return;
        }

        const target = document.querySelector(targetSelector);

        if (!target) {
          return;
        }

        event.preventDefault();

        if (lenis && !reduceMotion) {
          lenis.scrollTo(target, { offset: -48 });
        } else {
          target.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start",
          });
        }
      });
    });
  };

  const initReveals = () => {
    const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));

    if (!revealItems.length || !hasGSAP || !hasScrollTrigger || reduceMotion) {
      revealItems.forEach((item) => {
        item.style.opacity = "1";
        item.style.transform = "none";
        item.style.filter = "none";
      });
      return;
    }

    revealItems.forEach((item, index) => {
      const delay = Number(item.dataset.delay || index * 60) / 1000;

      gsap.fromTo(
        item,
        {
          opacity: 0,
          y: 24,
          filter: "blur(8px)",
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.9,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 84%",
            once: true,
          },
        }
      );
    });
  };

  const initMagneticButtons = () => {
    if (!hasGSAP || reduceMotion) {
      return;
    }

    document.querySelectorAll("[data-magnetic]").forEach((element) => {
      const xTo = gsap.quickTo(element, "x", {
        duration: 0.35,
        ease: "power3.out",
      });
      const yTo = gsap.quickTo(element, "y", {
        duration: 0.35,
        ease: "power3.out",
      });

      element.addEventListener("mousemove", (event) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        xTo(gsap.utils.clamp(-6, 6, x * 0.2));
        yTo(gsap.utils.clamp(-6, 6, y * 0.2));
      });

      element.addEventListener("mouseleave", () => {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.4,
          ease: "power3.out",
        });
      });
    });
  };

  const initTiltCards = () => {
    if (!hasGSAP || reduceMotion) {
      return;
    }

    document.querySelectorAll("[data-tilt]").forEach((card) => {
      const rotateXTo = gsap.quickTo(card, "rotateX", {
        duration: 0.45,
        ease: "power3.out",
      });
      const rotateYTo = gsap.quickTo(card, "rotateY", {
        duration: 0.45,
        ease: "power3.out",
      });

      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        const rotateY = (px - 0.5) * 12;
        const rotateX = (0.5 - py) * 12;

        card.style.setProperty("--tilt-x", `${px * 100}%`);
        card.style.setProperty("--tilt-y", `${py * 100}%`);
        rotateXTo(gsap.utils.clamp(-6, 6, rotateX));
        rotateYTo(gsap.utils.clamp(-6, 6, rotateY));
      });

      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.45,
          ease: "power3.out",
        });
      });
    });
  };

  const initCursor = () => {
    const cursor = document.querySelector(".cursor-dot");
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (!cursor || !hasGSAP || reduceMotion || !canHover) {
      cursor?.remove();
      return;
    }

    const xTo = gsap.quickTo(cursor, "x", {
      duration: 0.24,
      ease: "power3.out",
    });
    const yTo = gsap.quickTo(cursor, "y", {
      duration: 0.24,
      ease: "power3.out",
    });

    window.addEventListener("mousemove", (event) => {
      cursor.classList.add("is-visible");
      xTo(event.clientX);
      yTo(event.clientY);
    });

    document.querySelectorAll("[data-magnetic], a, button").forEach((element) => {
      element.addEventListener("mouseenter", () => {
        cursor.classList.add("is-hovering");
      });
      element.addEventListener("mouseleave", () => {
        cursor.classList.remove("is-hovering");
      });
    });
  };

  const runIntro = () => {
    if (!hasGSAP || reduceMotion) {
      loader?.remove();
      header?.classList.add("is-ready");
      if (heroContainer) {
        heroContainer.style.opacity = "1";
        heroContainer.style.transform = "none";
        heroContainer.style.filter = "none";
      }
      return;
    }

    gsap.set(header, { opacity: 0, y: -8 });

    if (heroContainer) {
      gsap.set(heroContainer, { opacity: 0, y: 24, filter: "blur(8px)" });
    }

    const loaderTimeline = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        loader?.remove();
      },
    });

    loaderTimeline
      .to(loaderMark, {
        opacity: 1,
        duration: 0.38,
      })
      .to(loaderMark, {
        y: -12,
        duration: 0.28,
      })
      .to(
        loader,
        {
          opacity: 0,
          duration: 0.24,
          ease: "power2.inOut",
        },
        0.66
      );

    const master = gsap.timeline({
      delay: 0.9,
      defaults: { ease: "power3.out" },
    });

    master.to(header, {
      opacity: 1,
      y: 0,
      duration: 0.55,
      onStart: () => header?.classList.add("is-ready"),
    });

    if (heroContainer) {
      master.to(
        heroContainer,
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.9,
        },
        "-=0.26"
      );
    }
  };

  const init = () => {
    setScrolledHeader();
    initScrollEngine();
    initProgressBar();
    initMenu();
    initAnchorScroll();
    initReveals();
    initMagneticButtons();
    initTiltCards();
    initCursor();
    runIntro();

    window.addEventListener("scroll", setScrolledHeader, { passive: true });
    window.addEventListener("resize", () => window.ScrollTrigger?.refresh?.());
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
