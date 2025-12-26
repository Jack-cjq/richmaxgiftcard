import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap } from 'gsap'

interface ProcessStep {
  title: string
  description: string
  icon: string
}

interface Props {
  steps?: ProcessStep[]
}

export default function ProcessGuide({ steps = [] }: Props) {
  const { t } = useTranslation()
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (steps.length > 0) {
      cardRefs.current.forEach((ref, index) => {
        if (ref) {
          gsap.fromTo(
            ref,
            { opacity: 0, y: 30, scale: 0.9, rotation: -5 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              rotation: 0,
              duration: 0.6,
              delay: index * 0.15,
              ease: 'back.out(1.7)',
            }
          )
        }
      })
    }
  }, [steps.length])

  if (!steps || steps.length === 0) {
    return null
  }

  return (
    <div>
      <h2 className="section-title text-2xl md:text-4xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-6 md:mb-12 text-center relative">
        <span className="absolute left-1/2 -translate-x-1/2 -top-2 w-16 md:w-24 h-0.5 md:h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent dark-mode:via-gold-500 rounded-full"></span>
        {t('processGuide.title')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
        {steps.map((step, index) => (
          <div
            key={index}
            ref={(el) => (cardRefs.current[index] = el)}
            className="text-center card-item bg-surface dark-mode:bg-black rounded-md p-4 md:p-8 shadow-card hover:shadow-dialog transition-all duration-300 border border-silver-200 dark-mode:border-gold-500/30 hover:border-blue-500/30 dark-mode:hover:border-gold-500/50 transform hover:-translate-y-2 relative overflow-hidden group"
            style={{ opacity: 0 }}
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, {
                y: -8,
                scale: 1.05,
                rotation: 2,
                duration: 0.3,
                ease: 'power2.out',
              })
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                y: 0,
                scale: 1,
                rotation: 0,
                duration: 0.3,
                ease: 'power2.out',
              })
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-green-500/0 dark-mode:from-gold-500/0 dark-mode:to-gold-400/0 group-hover:from-blue-500/10 group-hover:to-green-500/10 dark-mode:group-hover:from-gold-500/20 dark-mode:group-hover:to-gold-400/20 transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="text-3xl md:text-5xl mb-2 md:mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                {step.icon || '📋'}
              </div>
              <h3 className="text-base md:text-2xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-2 md:mb-4 group-hover:text-blue-600 dark-mode:group-hover:text-gold-400 transition-colors">
                {step.title || '步骤'}
              </h3>
              <p className="text-xs md:text-base font-medium text-neutral-600 dark-mode:text-gold-500/80 leading-relaxed">
                {step.description || ''}
              </p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 text-blue-600 dark-mode:text-gold-500 text-2xl transform group-hover:translate-x-2 transition-transform duration-300">
                  →
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

