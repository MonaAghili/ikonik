import * as React from "react";

export interface StarProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
  size?: number;
  strokeWidth?: number;
}

const Star = React.memo(
  React.forwardRef<SVGSVGElement, StarProps>(
    ({ title, titleId, size = 24, strokeWidth = 1.5, ...props }, ref) => {
      return (
        <svg
          ref={ref}
          width={size}
          height={size}
          aria-hidden={title ? undefined : "true"}
          aria-labelledby={title ? titleId : undefined}
          role={title ? "img" : "presentation"}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          {...props}
        >
          {title ? <title id={titleId}>{title}</title> : null}
          <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
        </svg>
      );
    },
  ),
);

Star.displayName = "Star";
export default Star;
