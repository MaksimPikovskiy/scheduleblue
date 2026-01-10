import { ChevronsLeft, ChevronsRight, Minus, Send, Square, X } from "lucide-react";
import Link from "next/link";

interface WindowTitleBarProps {
    title: string;
    link: string;
    linkText: string;
    isNext: boolean;
}

// Windows XP style window title bar component
const WindowTitleBar = ({ title, link, linkText, isNext }: WindowTitleBarProps) => {
    return (
        <div className="window-title-bar">
            <div className="window-title-left">
                <div className="window-icon"><Send className="icon-small" /></div>
                <span className="window-title-text">{title}</span>
                <Link href={link} className="window-title-link">
                    (
                    <span>
                        {!isNext && <ChevronsLeft className="icon-inline icon-inline-left" />}
                        <span className={isNext ? "link-icon-right" : "link-icon-left"}>{linkText}</span>
                        {isNext && <ChevronsRight className="icon-inline icon-inline-right" />}
                    </span>
                    )
                </Link>
            </div>

            <div className="window-controls">
                <button className="window-control-btn minimize"><Minus className="icon-xs icon-minus" /></button>
                <button className="window-control-btn maximize"><Square className="icon-xs" /></button>
                <button className="window-control-btn close"><X className="icon-xs" /></button>
            </div>
        </div>
    )
}

export { WindowTitleBar };