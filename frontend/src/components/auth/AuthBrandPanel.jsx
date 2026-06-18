import { Icon } from "../Icon";

const meshNodes = [
  { cx: 40, cy: 40, r: 1.5, delay: "0s" },
  { cx: 160, cy: 60, r: 1, delay: "1s" },
  { cx: 100, cy: 100, r: 2, delay: "2s" },
  { cx: 50, cy: 150, r: 1, delay: "0.5s" },
  { cx: 150, cy: 160, r: 1.5, delay: "1.5s" },
];

const meshConnections = [
  [40, 40, 100, 100],
  [160, 60, 100, 100],
  [50, 150, 100, 100],
  [150, 160, 100, 100],
  [40, 40, 160, 60],
];

function AuthMeshVisual() {
  return (
    <div className="auth-mesh-container">
      <div className="auth-flowing-gradient" />

      <svg
        className="auth-mesh-svg opacity-70"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        {meshNodes.map((node) => (
          <circle
            className="auth-node"
            cx={node.cx}
            cy={node.cy}
            key={`${node.cx}-${node.cy}`}
            r={node.r}
            style={{ animationDelay: node.delay }}
          />
        ))}

        {meshConnections.map(([x1, y1, x2, y2]) => (
          <line
            className="auth-connection"
            key={`${x1}-${y1}-${x2}-${y2}`}
            x1={x1}
            x2={x2}
            y1={y1}
            y2={y2}
          />
        ))}
      </svg>
    </div>
  );
}

function AuthImageVisual({ imageUrl }) {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-auth-primary/25 via-transparent to-transparent opacity-50" />

      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url("${imageUrl}")` }}
      />
    </>
  );
}

export function AuthBrandPanel({
  description,
  icon,
  imageUrl = "",
  minHeightClassName = "min-h-[620px]",
  title,
  visual = "mesh",
}) {
  return (
    <section
      className={`relative hidden ${minHeightClassName} w-1/2 flex-col items-center justify-center overflow-hidden bg-auth-surface-container-lowest md:flex`}
    >
      <div className="absolute inset-0 z-0">
        {visual === "image" ? <AuthImageVisual imageUrl={imageUrl} /> : <AuthMeshVisual />}

        <div className="absolute inset-0 bg-gradient-to-br from-auth-primary/10 via-auth-background/50 to-auth-background/95" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-12 text-center">
        <div className="mb-7 flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur">
          <Icon className="text-[64px] text-auth-primary" fill>
            {icon}
          </Icon>
        </div>

        <h1 className="mb-3 font-auth-display text-auth-display-lg leading-none text-auth-on-surface">
          {title}
        </h1>

        <p className="font-auth-label text-auth-label-sm uppercase tracking-[0.38em] text-auth-on-surface-variant">
          Knowledge
        </p>

        <p className="mt-6 max-w-[320px] font-auth-body text-auth-body-sm leading-relaxed text-auth-on-surface-variant/80">
          {description}
        </p>
      </div>

      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-auth-primary/60 to-transparent" />
    </section>
  );
}
