import {cn} from "@/renderer/lib/utils";
import {Command as CommandPrimitive} from "cmdk";
import * as React from "react";

export const Button = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(function Button(props, ref): React.ReactElement {
    return (
        <button
            ref={ref}
            {...props}
            className={cn(
                "inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white shadow-[0_0_25px_rgba(34,197,94,.10)] transition hover:bg-emerald-400/10 hover:text-emerald-100",
                props.className,
            )}
        />
    );
});

export const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(function Card(props, ref): React.ReactElement {
    return (
        <div
            ref={ref}
            {...props}
            className={cn(
                "rounded-xl border border-white/10 bg-zinc-950/70 p-4 shadow-2xl shadow-emerald-950/20 backdrop-blur",
                props.className,
            )}
        />
    );
});

export const Command = CommandPrimitive;
export const CommandInput = CommandPrimitive.Input;
export const CommandList = CommandPrimitive.List;
export const CommandItem = CommandPrimitive.Item;
export const CommandGroup = CommandPrimitive.Group;
