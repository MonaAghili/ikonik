import * as React from "react";

export interface HeartProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
  size?: number;
  strokeWidth?: number;
}

const Heart = React.memo(
  React.forwardRef<SVGSVGElement, HeartProps>(
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
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78" />
        </svg>
      );
    },
  ),
);

Heart.displayName = "Heart";
export default Heart;
