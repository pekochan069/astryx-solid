import { describe, expect, it } from "bun:test";

import { composeEventHandlers } from "../../src/index";

describe("composeEventHandlers", () => {
  it("calls defined handlers in order with original event", () => {
    const calls: string[] = [];
    const received: Event[] = [];
    const event = new Event("click", { cancelable: true });
    const first = (receivedEvent: Event) => {
      calls.push("first");
      received.push(receivedEvent);
    };
    const second = (receivedEvent: Event) => {
      calls.push("second");
      received.push(receivedEvent);
    };

    composeEventHandlers(first, undefined, second)(event);

    expect(calls).toEqual(["first", "second"]);
    expect(received[0]).toBe(event);
    expect(received[1]).toBe(event);
  });

  it("stops when a handler cancels event", () => {
    const calls: string[] = [];
    const event = new Event("click", { cancelable: true });

    composeEventHandlers(
      (receivedEvent) => {
        calls.push("first");
        receivedEvent.preventDefault();
      },
      () => calls.push("second"),
    )(event);

    expect(calls).toEqual(["first"]);
  });

  it("accepts no handlers", () => {
    expect(() => composeEventHandlers()(new Event("click"))).not.toThrow();
  });
});
