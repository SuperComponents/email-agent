declare module 'lucide-react' {
  import * as React from 'react';

  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    color?: string;
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  }

  export type LucideIcon = React.FC<LucideProps>;

  // The package exports a map of icon components; we model it as an indexable record.
  const icons: Record<string, LucideIcon>;

  export default icons;
  export = icons;
}