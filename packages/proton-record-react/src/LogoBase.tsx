import type { ComponentPropsWithoutRef, CSSProperties } from "react";

type IconSize = "small" | "medium" | "large";
import clsx from "clsx";

const getLogoWidthRem = (width: number) => width / 16;
// const getLogoWidthStyles = (width: number): CSSProperties => ({ inlineSize: `${getLogoWidthRem(width)}rem` });
const getLogoWidthStyles = (width: number): CSSProperties => ({});

export type LogoVariant = "with-wordmark" | "glyph-only" | "wordmark-only";

export interface LogoProps extends Omit<ComponentPropsWithoutRef<"svg">, "size"> {
  size?: IconSize;
  variant?: LogoVariant;
  hasTitle?: boolean;
  scale?: number;
}

type Props = ComponentPropsWithoutRef<"svg"> & {
  logoWidth: number;
  logoHeight: number;
  title?: string;
  uid: string;
  variant: LogoVariant;
  size?: IconSize;
  scale?: number;
};

const LogoBase = ({ title, logoWidth, logoHeight, className, variant, size, uid, children, scale = 1, ...rest }: Props) => {
  const logoWidthScaled = Math.ceil(logoWidth * scale);
  const logoHeightScaled = Math.ceil(logoHeight * scale);

  const hasIconSize = size && variant === "glyph-only";
  // this ensure logo scales properly with text zoom
  const logoWidthStyles = !hasIconSize && variant === "with-wordmark" ? getLogoWidthStyles(logoWidthScaled) : undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      // viewBox={`0 0 ${logoWidth} ${logoHeight}`}
      viewBox={`0 0 36 36`}
      width={logoWidthScaled}
      height={logoHeightScaled}
      fill="none"
      role="img"
      className={clsx("logo", hasIconSize && `icon-size-${size}`, variant, className)}
      aria-labelledby={`${uid}-title`}
      {...rest}
      style={logoWidthStyles || rest?.style ? { ...logoWidthStyles, ...rest?.style } : undefined}
    >
      {title && <title id={`${uid}-title`}>{title}</title>}
      {children}
    </svg>
  );
};

export default LogoBase;
