import { Resend } from "resend";

// Instanciation différée : le SDK Resend lève une erreur si la clé est absente,
// ce qui casserait le build (collecte des données de page) si créé au chargement du module.
let resendInstance: Resend | null = null;

export function getResend(): Resend {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}
