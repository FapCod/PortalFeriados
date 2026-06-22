import React, { useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import './BackToTop.css';

/**
 * BackToTop button component
 * Uses ScrollTrigger to show/hide and ScrollToPlugin for smooth scrolling
 */
export const BackToTop: React.FC = () => {
    const buttonRef = useRef<HTMLButtonElement>(null);

    useGSAP(() => {
        if (!buttonRef.current) return;

        // Set initial state
        gsap.set(buttonRef.current, { scale: 0, opacity: 0 });

        // Animate scale on scroll trigger
        gsap.to(buttonRef.current, {
            scale: 1,
            opacity: 1,
            duration: 0.35,
            ease: 'back.out(1.7)',
            scrollTrigger: {
                trigger: document.body,
                start: 'top -300px', // When scrolled down 300px
                toggleActions: 'play none none reverse',
                fastScrollEnd: true
            }
        });
    }, { scope: buttonRef });

    const handleScrollToTop = () => {
        gsap.to(window, {
            scrollTo: { y: 0 },
            duration: 0.6,
            ease: 'power3.inOut'
        });
    };

    return (
        <button
            ref={buttonRef}
            onClick={handleScrollToTop}
            className="back-to-top-btn glass-panel"
            aria-label="Volver arriba"
            title="Volver arriba"
        >
            <ArrowUp size={22} />
        </button>
    );
};
