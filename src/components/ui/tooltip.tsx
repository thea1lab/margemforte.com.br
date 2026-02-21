import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";

// Provider stays the same; harmless when using Popover internally
const TooltipProvider = TooltipPrimitive.Provider;

// Context to signal when to render Popover instead of Tooltip (mobile/touch)
const TooltipModeContext = React.createContext<{ isTouch: boolean }>({
  isTouch: false,
});

const useIsTouch = () => {
  const [isTouch, setIsTouch] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia
      ? window.matchMedia("(pointer: coarse)")
      : null;
    const touchPoints = (navigator as Navigator).maxTouchPoints || 0;
    const check = () => setIsTouch(!!(mq?.matches || touchPoints > 0));
    check();
    mq?.addEventListener?.("change", check);
    return () => mq?.removeEventListener?.("change", check);
  }, []);
  return isTouch;
};

// Root that switches between Tooltip and Popover on touch devices
const Tooltip: React.FC<
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>
> = ({ children, ...props }) => {
  const isTouch = useIsTouch();
  if (isTouch) {
    return (
      <TooltipModeContext.Provider value={{ isTouch }}>
        <Popover>{children}</Popover>
      </TooltipModeContext.Provider>
    );
  }
  return (
    <TooltipModeContext.Provider value={{ isTouch }}>
      <TooltipPrimitive.Root {...props}>{children}</TooltipPrimitive.Root>
    </TooltipModeContext.Provider>
  );
};

// Trigger that maps to the correct primitive
const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const { isTouch } = React.useContext(TooltipModeContext);
  if (isTouch) {
    return (
      <PopoverTrigger
        ref={ref as React.Ref<HTMLButtonElement>}
        className={className}
        {...(props as React.ComponentPropsWithoutRef<typeof PopoverTrigger>)}
      />
    );
  }
  return (
    <TooltipPrimitive.Trigger ref={ref} className={className} {...props} />
  );
});
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName;

// Content that maps to the correct primitive
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
  const { isTouch } = React.useContext(TooltipModeContext);
  if (isTouch) {
    // Force top side on touch to avoid going off-screen near edges
    const side = "top";
    return (
      <PopoverContent
        ref={ref as React.Ref<HTMLDivElement>}
        align="center"
        side={side}
        sideOffset={sideOffset}
        avoidCollisions
        collisionPadding={8}
        className={cn(
          "z-50 mx-2 overflow-hidden rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md w-auto max-w-[calc(100vw-2rem)] sm:w-72 break-words whitespace-normal",
          className
        )}
        {...(props as React.ComponentPropsWithoutRef<typeof PopoverContent>)}
      />
    );
  }
  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  );
});
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
