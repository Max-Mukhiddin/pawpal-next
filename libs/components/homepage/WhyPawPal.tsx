/**
 * Why PawPal — Matches reference layout:
 * Label → Title (italic orange second line) → Image → Features grid with descriptions
 */

import React from 'react';

const ICONS = {
    expert: (
        <svg className="why-pawpal__icon-svg" width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 10l8-4 8 4-8 4-8-4Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
            <path
                d="M6 11.5V16c0 1 2.5 2.5 6 2.5s6-1.5 6-2.5v-4.5"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    ),
    safe: (
        <svg className="why-pawpal__icon-svg" width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
                d="M12 3l7.5 3.4v5.1c0 4.8-3.2 9.2-7.5 10.1C7.7 20.7 4.5 16.3 4.5 11.5V6.4L12 3Z"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinejoin="round"
            />
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    personalized: (
        <svg className="why-pawpal__icon-svg" width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx={12} cy={8} r={4} stroke="currentColor" strokeWidth={1.8} />
            <path
                d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
            />
            <path d="M17 11l1.5 1.5L21 10" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    easy: (
        <svg className="why-pawpal__icon-svg" width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x={4} y={5} width={16} height={15} rx={2} stroke="currentColor" strokeWidth={1.8} />
            <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
            <path d="M9 14h2M13 14h2M9 17h6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
        </svg>
    ),
} as const;

const FEATURES = [
    {
        id: 'expert',
        iconKey: 'expert' as const,
        title: 'Expert pet specialists',
        description: 'Vetted professionals dedicated to your pet\'s unique temperament.',
    },
    {
        id: 'safe',
        iconKey: 'safe' as const,
        title: 'Safe & trusted care',
        description: 'Comprehensive insurance and safety protocols for total peace of mind.',
    },
    {
        id: 'personalized',
        iconKey: 'personalized' as const,
        title: 'Personalized services',
        description: 'Tailored routines that respect your pet\'s existing schedule and needs.',
    },
    {
        id: 'easy',
        iconKey: 'easy' as const,
        title: 'Convenient booking',
        description: 'Seamlessly manage appointments through our boutique digital platform.',
    },
] as const;

const STORY_IMAGE = '/images/hero/pawpal-hero.jpg';

export default function WhyPawPal() {
    return (
        <section className="pawpal-home-section why-pawpal animate-on-scroll" aria-labelledby="why-pawpal-title">
            {/* Subtle dot/paw pattern overlay */}
            <div className="why-pawpal__pattern" aria-hidden />

            <div className="why-pawpal__inner">
                {/* Header: label + title */}
                <header className="why-pawpal__head">
                    <p className="why-pawpal__label">WHY PAWPAL</p>
                    <h2 id="why-pawpal-title" className="why-pawpal__title">
                        Care You Can Trust,{' '}
                        <em className="why-pawpal__title-em">Love They Can Feel</em>
                    </h2>
                </header>

                {/* Image — sits between title and features */}
                <div className="why-pawpal__story">
                    <div className="why-pawpal__story-frame">
                        <img
                            className="why-pawpal__story-img"
                            src={STORY_IMAGE}
                            alt="Pet parent spending time with their dog"
                            width={1200}
                            height={560}
                            loading="lazy"
                            onError={(e) => { e.currentTarget.src = '/img/banner/about.jpg'; }}
                        />
                    </div>
                </div>

                {/* Features grid — below image */}
                <ul className="why-pawpal__features" role="list">
                    {FEATURES.map((item) => (
                        <li key={item.id} className="why-pawpal__feature">
                            <div className="why-pawpal__icon-wrap" aria-hidden>
                                {ICONS[item.iconKey]}
                            </div>
                            <h3 className="why-pawpal__feature-title">{item.title}</h3>
                            <p className="why-pawpal__feature-desc">{item.description}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}