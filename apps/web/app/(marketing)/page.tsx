import HeroSection from "@/components/landing/hero-section";
import Particles from "@/components/magicui/particles";

/**
 * Qorium homepage — section ladder per REDESIGN-BRIEF.md section 4 (eleven sections).
 *
 * Shipped now (P0-1):
 *   1. Hero
 *
 * In flight (P0-2 → P0-5, then P1):
 *   2. Trust bar              (P1)
 *   3. The pain               (P1)
 *   4. Mechanism x3           (P0-3)
 *   5. How it works           (P1)
 *   6. Proof                  (P1)
 *   7. Comparison table       (P1)
 *   8. Pricing teaser         (P1)
 *   9. FAQ                    (P1)
 *  10. Final CTA strip        (P0-4)
 *  11. Footer                 (in layout)
 */
export default function Page() {
  return (
    <>
      <HeroSection />
      <Particles
        className="absolute inset-0 -z-10"
        quantity={50}
        ease={70}
        size={0.05}
        staticity={40}
        color="#8B5CF6"
      />
    </>
  );
}
