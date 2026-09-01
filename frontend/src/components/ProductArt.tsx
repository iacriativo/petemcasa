type Props = { kind: ProductKind }

export type ProductKind = 'racao' | 'petisco' | 'brinquedo' | 'higiene'

export default function ProductArt({ kind }: Props) {
  switch (kind) {
    case 'racao':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="14" y="8" width="36" height="48" rx="8" fill="#cde9d8" />
          <rect x="20" y="22" width="24" height="28" rx="6" fill="#a6d7bc" />
          <path d="M18 14c2-3 4-4 8-4" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          <circle cx="24" cy="12.5" r="2" fill="#fff" opacity="0.9" />
          <path d="M24 32l4 6 5-9 5 8" stroke="#2f9e63" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'petisco':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="18" y="10" width="28" height="44" rx="10" fill="#f6e2c4" />
          <rect x="24" y="18" width="16" height="6" rx="3" fill="#e7c695" />
          <path d="M26 36c0 4 3 5 3 6 0 0 3-1 3-6s-3-5-3-6c0 1-3 3-3 6Zm9 0c0 4 3 5 3 6 0 0 3-1 3-6s-3-5-3-6c0 1-3 3-3 6Z" fill="#c48a4b" />
          <path d="M32 32c0 2-2 3-2 5 0 2 2 3 2 5" stroke="#a96f2f" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'brinquedo':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M22 20c8-8 14-9 20-8 6 1 8 7 6 14-2 6-10 8-18 8-8 0-12 2-14 6-3-10 1-16 6-20Z" stroke="#d98f4e" strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx="42" cy="40" r="12" fill="#e19a5e" />
          <circle cx="42" cy="40" r="12" fill="none" stroke="#c47432" strokeWidth="3" />
          <path d="M42 34l3 6 6 .7-4.6 4 .2 6-4.6-3-4.6 3 .2-6-4.6-4 6-.7z" fill="#fff3e0" />
        </svg>
      )
    case 'higiene':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="22" y="6" width="20" height="6" rx="3" fill="#bfe3cf" />
          <path d="M24 14h16l2 20 10 12c-8 6-20 6-28 0l10-12z" fill="#8ed0ae" />
          <rect x="18" y="42" width="28" height="12" rx="5" fill="#6fc09a" />
          <path d="M26 26h12" stroke="#3f9c74" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M24 32h14" stroke="#3f9c74" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      )
  }
}