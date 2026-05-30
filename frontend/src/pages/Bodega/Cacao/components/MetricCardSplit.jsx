import React from 'react';

/**
 * MetricCardSplit - Reusable split layout statistics card for Cacao modules.
 * 
 * @param {string} title - Card header title.
 * @param {string} icon - Material symbols icon name.
 * @param {string} theme - Color theme for borders and icons bg ('emerald', 'purple', 'amber', 'blue', etc.).
 * @param {string} leftLabel - Category label for the left column (e.g. 'Libra').
 * @param {string|number} leftValue - Value displayed in the left column.
 * @param {string} rightLabel - Category label for the right column (e.g. 'Quintales').
 * @param {string|number} rightValue - Value displayed in the right column.
 */
const MetricCardSplit = ({
    title,
    icon,
    theme = 'amber',
    leftLabel,
    leftValue,
    rightLabel,
    rightValue
}) => {
    // Theme mapping for Tailwind classes
    const themeClasses = {
        emerald: {
            border: 'border-emerald-200/50 dark:border-emerald-800/30',
            iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
        },
        purple: {
            border: 'border-purple-200/50 dark:border-purple-800/30',
            iconBg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400'
        },
        amber: {
            border: 'border-amber-200/50 dark:border-amber-800/30',
            iconBg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
        },
        blue: {
            border: 'border-blue-200/50 dark:border-blue-800/30',
            iconBg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
        }
    };

    const colors = themeClasses[theme] || themeClasses.amber;

    return (
        <div className={`rounded-xl border ${colors.border} bg-white/60 dark:bg-background-dark/40 backdrop-blur-sm p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 flex flex-col justify-between`}>
            <div className="flex items-center gap-3 mb-3">
                <div className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg ${colors.iconBg}`}>
                    <span className="material-symbols-outlined text-xl">{icon}</span>
                </div>
                <h4 className="text-[10px] font-bold text-text-secondary dark:text-background-light/50 uppercase tracking-wider">
                    {title}
                </h4>
            </div>
            <div className="grid grid-cols-2 divide-x divide-primary/10 dark:divide-primary/20 text-center">
                <div className="pr-1 flex flex-col items-center justify-center">
                    <span className="text-[9px] font-bold text-text-secondary/70 dark:text-background-light/40 uppercase tracking-wider mb-0.5">
                        {leftLabel}
                    </span>
                    <span className="text-sm font-bold text-text-primary dark:text-background-light tabular-nums">
                        {leftValue}
                    </span>
                </div>
                <div className="pl-1 flex flex-col items-center justify-center">
                    <span className="text-[9px] font-bold text-text-secondary/70 dark:text-background-light/40 uppercase tracking-wider mb-0.5">
                        {rightLabel}
                    </span>
                    <span className="text-sm font-bold text-text-primary dark:text-background-light tabular-nums">
                        {rightValue}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MetricCardSplit;
