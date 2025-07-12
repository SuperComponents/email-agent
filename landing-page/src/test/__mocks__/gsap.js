const gsap = {
  to: jest.fn(),
  from: jest.fn(),
  fromTo: jest.fn(),
  set: jest.fn(),
  timeline: jest.fn(() => ({
    to: jest.fn(),
    from: jest.fn(),
    set: jest.fn(),
  })),
  registerPlugin: jest.fn(),
};

const ScrollTrigger = {
  create: jest.fn(),
  refresh: jest.fn(),
  getAll: jest.fn(() => []),
  maxScroll: jest.fn(() => 1000),
};

module.exports = {
  gsap,
  ScrollTrigger,
};
