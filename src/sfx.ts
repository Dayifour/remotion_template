import { CART_TAP } from "./scenes/Cart";
import { CONFIRM_EVENTS } from "./scenes/Confirm";
import { CTA_EVENTS } from "./scenes/Cta";
import { PAY_EVENTS } from "./scenes/Pay";
import { SHOP_TAPS } from "./scenes/Shop";
import { STEP_BARS } from "./scenes/Track";
import { WA_TAP } from "./scenes/WhatsApp";
import { bar, line, SCENES, word } from "./timing";
import { FPS } from "./theme";

/** Bruitages calés sur les gestes à l'image (frames absolues). La musique et la voix sont dans audio/mix.wav. */
export const SFX: { at: number; src: string; vol: number }[] = (() => {
  const out: { at: number; src: string; vol: number }[] = [];
  const add = (at: number, src: string, vol: number) => out.push({ at, src, vol });

  // accroche : chaque message envoyé, puis la montée jusqu'au drop
  [0.3, 1.6, 2.35, 2.9, 3.4].forEach((b) => add(bar(b), "sfx/pop.wav", 0.35));
  add(bar(4) - Math.round(1.8 * FPS), "sfx/riser.wav", 0.45);
  add(bar(4), "sfx/impact.wav", 0.75);

  // un souffle à chaque raccord
  (Object.keys(SCENES) as (keyof typeof SCENES)[]).slice(2).forEach((id, i) => add(SCENES[id][0] - 9, i % 2 ? "sfx/whoosh.wav" : "sfx/whoosh-soft.wav", 0.4));

  // boutique : appuis, la vignette atterrit dans le panier
  SHOP_TAPS().forEach((t) => {
    add(t, "sfx/tap.wav", 0.6);
    add(t + 17, "sfx/pop.wav", 0.45);
  });
  // panier : le tampon GRATUITE, puis « Finaliser »
  add(word("cart", "gratuite"), "sfx/impact.wav", 0.35);
  add(word("cart", "gratuite") + 6, "sfx/check.wav", 0.55);
  add(CART_TAP(), "sfx/tap.wav", 0.6);
  // WhatsApp : envoi
  add(WA_TAP(), "sfx/tap.wav", 0.6);
  add(word("whatsapp", "numero") + 2, "sfx/pop.wav", 0.4);

  // confirmation : clic, notification (le son est gardé, brief), appui, étape verte
  const ev = CONFIRM_EVENTS();
  add(ev.click, "sfx/tap.wav", 0.7);
  add(ev.banner, "sfx/tick.wav", 0.4);
  add(ev.notif, "sfx/notif.wav", 0.9);
  add(ev.openTap, "sfx/tap.wav", 0.6);
  add(ev.stepGreen, "sfx/check.wav", 0.55);

  // suivi : une coche par étape franchie
  STEP_BARS.forEach((b, i) => add(Math.round(line(`step${i + 1}`).start * FPS) - 2, i < 2 ? "sfx/tick.wav" : "sfx/check.wav", i < 2 ? 0.35 : 0.5));

  // livraison : le colis se pose, les moyens de paiement arrivent
  const pay = PAY_EVENTS();
  add(pay.drop + 4, "sfx/impact.wav", 0.4);
  pay.cards.forEach((t) => add(t - 4, "sfx/whoosh-soft.wav", 0.35));

  // fin
  const cta = CTA_EVENTS();
  add(cta.logo, "sfx/success.wav", 0.4);
  return out.sort((a, b) => a.at - b.at);
})();
