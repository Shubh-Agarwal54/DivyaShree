import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

/**
 * Custom hook for fade-up animation on scroll
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration (default: 0.8)
 * @param {number} options.delay - Animation delay (default: 0)
 * @param {number} options.yOffset - Y-axis starting offset (default: 40)
 * @param {string} options.start - ScrollTrigger start position (default: 'top 80%')
 */
export const useFadeUpScroll = (options = {}) => {
  const ref = useRef(null);
  const {
    duration = 0.8,
    delay = 0,
    yOffset = 40,
    start = 'top 80%',
    stagger = 0,
  } = options;

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const children = stagger > 0 ? element.children : [element];

    gsap.fromTo(
      children,
      {
        y: yOffset,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration,
        delay,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start,
          toggleActions: 'play none none none',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [duration, delay, yOffset, start, stagger]);

  return ref;
};

/**
 * Custom hook for fade-in animation on scroll
 * @param {Object} options - Animation options
 */
export const useFadeInScroll = (options = {}) => {
  const ref = useRef(null);
  const {
    duration = 0.8,
    delay = 0,
    start = 'top 80%',
  } = options;

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    gsap.fromTo(
      element,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start,
          toggleActions: 'play none none none',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [duration, delay, start]);

  return ref;
};

/**
 * Custom hook for scale animation on scroll
 * @param {Object} options - Animation options
 */
export const useScaleScroll = (options = {}) => {
  const ref = useRef(null);
  const {
    duration = 0.8,
    delay = 0,
    scale = 0.8,
    start = 'top 80%',
  } = options;

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    gsap.fromTo(
      element,
      {
        scale,
        opacity: 0,
      },
      {
        scale: 1,
        opacity: 1,
        duration,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start,
          toggleActions: 'play none none none',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [duration, delay, scale, start]);

  return ref;
};

/**
 * Custom hook for slide-in animation (left/right) on scroll
 * @param {Object} options - Animation options
 */
export const useSlideInScroll = (options = {}) => {
  const ref = useRef(null);
  const {
    duration = 0.8,
    delay = 0,
    direction = 'left', // 'left' or 'right'
    xOffset = 60,
    start = 'top 80%',
  } = options;

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const x = direction === 'left' ? -xOffset : xOffset;

    gsap.fromTo(
      element,
      {
        x,
        opacity: 0,
      },
      {
        x: 0,
        opacity: 1,
        duration,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start,
          toggleActions: 'play none none none',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [duration, delay, direction, xOffset, start]);

  return ref;
};

/**
 * Custom hook for parallax effect on scroll
 * @param {Object} options - Animation options
 */
export const useParallaxScroll = (options = {}) => {
  const ref = useRef(null);
  const {
    speed = 0.5, // Movement speed multiplier
    start = 'top bottom',
    end = 'bottom top',
  } = options;

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    gsap.to(element, {
      y: () => -100 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start,
        end,
        scrub: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [speed, start, end]);

  return ref;
};

/**
 * Custom hook for staggered children animation on scroll
 * @param {Object} options - Animation options
 */
export const useStaggerScroll = (options = {}) => {
  const ref = useRef(null);
  const {
    duration = 0.6,
    stagger = 0.1,
    yOffset = 30,
    start = 'top 80%',
  } = options;

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const children = element.children;

    if (children.length === 0) return;

    gsap.fromTo(
      children,
      {
        y: yOffset,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start,
          toggleActions: 'play none none none',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [duration, stagger, yOffset, start]);

  return ref;
};

export default {
  useFadeUpScroll,
  useFadeInScroll,
  useScaleScroll,
  useSlideInScroll,
  useParallaxScroll,
  useStaggerScroll,
};
