import { component$, Slot } from "@builder.io/qwik";

/**
 * App Header with brand, navigation area, and actions slot.
 */
// PUBLIC_INTERFACE
export const Header = component$(() => {
  return (
    <header class="app-header">
      <div class="inner">
        <div class="brand">
          <div class="logo" aria-hidden="true" />
          <div class="title">Notes</div>
        </div>
        <nav class="header-actions">
          <Slot />
        </nav>
      </div>
    </header>
  );
});

export default Header;
