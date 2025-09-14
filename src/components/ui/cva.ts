// Simple class-variance-authority replacement
export type ClassValue = string | number | boolean | undefined | null | ClassValue[] | { [key: string]: any };

export function clsx(...classes: ClassValue[]): string {
  return classes
    .flat()
    .filter(Boolean)
    .join(' ');
}

export interface VariantProps<T extends (...args: any) => any> {
  [key: string]: any;
}

export function cva(
  base: string,
  options?: {
    variants?: Record<string, Record<string, string>>;
    defaultVariants?: Record<string, string>;
  }
) {
  return (props?: Record<string, any>) => {
    if (!props || !options?.variants) return clsx(base, props?.className);
    
    let classes = [base];
    
    Object.entries(options.variants).forEach(([key, variants]) => {
      const value = props[key] || options.defaultVariants?.[key];
      if (value && variants[value]) {
        classes.push(variants[value]);
      }
    });
    
    if (props.className) {
      classes.push(props.className);
    }
    
    return clsx(...classes);
  };
}