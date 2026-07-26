/** Compose native event handlers in order until one cancels the event. */
export function composeEventHandlers<EventType extends Event>(
  ...handlers: ReadonlyArray<((event: EventType) => void) | undefined>
): (event: EventType) => void {
  return (event) => {
    for (const handler of handlers) {
      handler?.(event);

      if (event.defaultPrevented) return;
    }
  };
}
