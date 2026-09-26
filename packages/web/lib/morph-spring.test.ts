import { describe, expect, test } from "bun:test"

import { SPRING_LEAD, SPRING_TRAIL, SpringTrack, settleTime, springStep } from "./morph-spring"

describe("springStep", () => {
  test("#given the lead spring #when sampled #then it starts at rest, overshoots slightly and settles at 1", () => {
    const samples = Array.from({ length: 200 }, (_, i) => springStep(i / 100, SPRING_LEAD))

    expect(springStep(0, SPRING_LEAD)).toBe(0)
    expect(Math.max(...samples)).toBeGreaterThan(1)
    expect(Math.max(...samples)).toBeLessThan(1.05)
    expect(springStep(settleTime(SPRING_LEAD), SPRING_LEAD)).toBeCloseTo(1, 3)
  })

  test("#given the trail spring #when compared with the lead at the same instant #then it lags behind", () => {
    expect(springStep(0.12, SPRING_TRAIL)).toBeLessThan(springStep(0.12, SPRING_LEAD))
  })

  test("#given an overdamped spring #when sampled #then it never overshoots", () => {
    const creep = { omega: 8, zeta: 1.4 }
    const samples = Array.from({ length: 300 }, (_, i) => springStep(i / 100, creep))

    expect(Math.max(...samples)).toBeLessThanOrEqual(1)
    expect(samples.at(-1)).toBeCloseTo(1, 2)
  })
})

describe("SpringTrack", () => {
  test("#given a retarget mid-flight #when sampled #then the value is continuous and reaches the final target", () => {
    const track = new SpringTrack(0)
    track.retarget(100, 0, SPRING_LEAD)
    const beforeRetarget = track.valueAt(0.1)
    track.retarget(40, 0.1, SPRING_LEAD)
    const atRetarget = track.valueAt(0.1)

    expect(atRetarget).toBeCloseTo(beforeRetarget, 6)
    expect(track.valueAt(5)).toBeCloseTo(40, 3)
    expect(track.isSettled(5)).toBe(true)
  })

  test("#given a retarget to the current target #when sampled #then nothing moves", () => {
    const track = new SpringTrack(12)
    track.retarget(12, 0, SPRING_LEAD)

    expect(track.valueAt(0.05)).toBe(12)
    expect(track.isSettled(0)).toBe(true)
  })
})
