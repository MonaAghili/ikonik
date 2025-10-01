import * as React from "react";

export interface HomeProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
  size?: number;
  strokeWidth?: number;
}

const Home = React.memo(
  React.forwardRef<SVGSVGElement, HomeProps>(
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
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M9 22V12h6v10" />
        </svg>
      );
    },
  ),
);

Home.displayName = "Home";
export default Home;
