import "./BrandLoadingIndicator.css";

export default function BrandLoadingIndicator({ label }) {
  return (
    <div className="brand-loading" role="status" aria-label={label}>
      <span className="brand-loading__label">{label}</span>
      <span className="brand-loading__ring" aria-hidden="true">
        <svg
          viewBox="0 0 48 108"
          className="brand-loading__emblem"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="loadingGoldGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#ffe98e" />
              <stop offset="50%" stopColor="#f6c733" />
              <stop offset="100%" stopColor="#c88717" />
            </linearGradient>
            <linearGradient id="loadingGoldStem" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f8cf49" />
              <stop offset="100%" stopColor="#ba7b14" />
            </linearGradient>
          </defs>
          <path
            d="M24 4 C14.4 17, 8.9 25, 8.9 36 C8.9 48.2, 15.9 55, 24 55 C32.1 55, 39.1 48.2, 39.1 36 C39.1 25, 33.6 17, 24 4 Z"
            fill="url(#loadingGoldGradient)"
            stroke="#d59b21"
            strokeWidth="1.8"
          />
          <rect
            x="22.2"
            y="66"
            width="3.6"
            height="30"
            rx="1.8"
            fill="url(#loadingGoldStem)"
          />
          <path
            d="M14.8 30 H33.2 M15.8 34.3 H32.2 M16.8 38.6 H31.2"
            stroke="#fff7d1"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle
            cx="24"
            cy="34.4"
            r="2.6"
            fill="#ba2226"
            stroke="#f6d579"
            strokeWidth="1.1"
          />
          <path
            d="M20 55 C20 58, 17.7 59.7, 17.7 61.9 C17.7 64.3, 20.2 66.3, 24 66.3 C27.8 66.3, 30.3 64.3, 30.3 61.9 C30.3 59.7, 28 58, 28 55"
            fill="url(#loadingGoldStem)"
            stroke="#d59b21"
            strokeWidth="1"
          />
          <rect
            x="17.3"
            y="96"
            width="13.4"
            height="4.5"
            rx="2.2"
            fill="url(#loadingGoldStem)"
            stroke="#d59b21"
            strokeWidth="0.8"
          />
          <rect
            x="14.7"
            y="100.5"
            width="18.6"
            height="5.5"
            rx="2.7"
            fill="url(#loadingGoldStem)"
            stroke="#d59b21"
            strokeWidth="0.8"
          />
        </svg>
      </span>
    </div>
  );
}
