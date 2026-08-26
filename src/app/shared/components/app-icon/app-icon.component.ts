import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type AppIconName =
  | 'activity'
  | 'alert'
  | 'arrow-left'
  | 'arrow-right'
  | 'bell'
  | 'building'
  | 'check'
  | 'chevron-down'
  | 'dashboard'
  | 'key'
  | 'logout'
  | 'menu'
  | 'plans'
  | 'refresh'
  | 'search'
  | 'shield'
  | 'users'
  | 'x';

@Component({
  selector: 'app-icon',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.9"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @switch (name()) {
        @case ('dashboard') {
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        }
        @case ('users') {
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        }
        @case ('building') {
          <path d="M3 21h18M6 21V4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v17M15 8h3a1 1 0 0 1 1 1v12" />
          <path d="M9 7h2M9 11h2M9 15h2" />
        }
        @case ('activity') {
          <path d="M3 12h4l2.5-7 5 14 2.5-7h4" />
        }
        @case ('plans') {
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18M7 15h3" />
        }
        @case ('shield') {
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          <path d="m9 12 2 2 4-4" />
        }
        @case ('search') {
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        }
        @case ('bell') {
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        }
        @case ('logout') {
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="m16 17 5-5-5-5M21 12H9" />
        }
        @case ('menu') {
          <path d="M4 6h16M4 12h16M4 18h16" />
        }
        @case ('x') {
          <path d="M18 6 6 18M6 6l12 12" />
        }
        @case ('check') {
          <path d="m20 6-11 11-5-5" />
        }
        @case ('alert') {
          <path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0" />
          <path d="M12 9v4M12 17h.01" />
        }
        @case ('key') {
          <circle cx="7.5" cy="15.5" r="4.5" />
          <path d="m10.7 12.3 8.8-8.8M15 8l3 3M17 6l2 2" />
        }
        @case ('refresh') {
          <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5" />
        }
        @case ('chevron-down') {
          <path d="m6 9 6 6 6-6" />
        }
        @case ('arrow-left') {
          <path d="m15 18-6-6 6-6" />
        }
        @case ('arrow-right') {
          <path d="m9 18 6-6-6-6" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-grid;
      flex: 0 0 auto;
      line-height: 0;
      place-items: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppIconComponent {
  readonly name = input.required<AppIconName>();
}
