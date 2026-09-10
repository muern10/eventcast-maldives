import { ArrowUpRight } from "lucide-react";

/** Two strokes pass through a fixed frame; the action's hit area never moves. */
export default function MotionArrow({ size = 18 }: { size?: number }) {
  return <span className="motion-arrow" style={{ width: size, height: size }} aria-hidden="true">
    <ArrowUpRight size={size} />
    <ArrowUpRight size={size} />
  </span>;
}
