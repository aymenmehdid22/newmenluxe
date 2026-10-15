// Minimal in-house i18n (no dependency). `fr` is the source of truth; `ar` is
// typed against it so a missing key is a compile error.
// NOTE: the product name is never translated — it comes from data/products.ts.

export type Lang = "fr" | "ar";
export const DEFAULT_LANG: Lang = "ar";
export const LANG_COOKIE = "lang";

export function parseLang(value: string | undefined | null): Lang {
  return value === "fr" || value === "ar" ? value : DEFAULT_LANG;
}

export const fr = {
  langLabel: "Langue",
  quantity: "Quantité",
  decreaseQty: "Diminuer la quantité",
  increaseQty: "Augmenter la quantité",
  color: "Couleur",
  colors: { noir: "Noir", bleu: "Bleu", rouge: "Rouge", vert: "Vert" } as Record<string, string>,
  imageN: (n: number) => "Image " + n,
  ratingOutOf5: (n: number) => n + " sur 5",
  save: (amount: string) => "Économisez " + amount,
  description: "Description",
  mobileImageAlt: "Présentation du produit",

  orderTitle: "COMMANDER",
  fullName: "Nom complet",
  phone: "Numéro de téléphone",
  wilaya: "Wilaya",
  delivery: "Livraison",
  wilayaPlaceholder: "Sélectionner votre wilaya",
  wilayaSearch: "Rechercher (ex : Oran)…",
  wilayaNone: "Aucune wilaya trouvée.",
  unavailable: "Indisponible",
  home: { title: "À DOMICILE", sub: "Recevez chez vous" },
  stopdesk: { title: "STOPDESK", sub: "Retrait en agence" },
  summaryProduct: "Produit",
  summaryDelivery: "Livraison",
  summaryTotal: "Total",
  pickWilaya: "Choisissez votre wilaya",
  onlyHomeNote: "Livraison au bureau (Stopdesk) non disponible pour cette wilaya : livraison à domicile uniquement.",
  onlyStopdeskNote: "Livraison à domicile non disponible pour cette wilaya : retrait au bureau uniquement.",
  payOnReceipt: "Paiement à la réception de la commande.",
  submit: "COMMANDER",
  submitting: "ENVOI EN COURS…",
  stickyTotal: "Total",
  stickyProduct: "Produit",

  success: {
    title: "COMMANDE ENREGISTRÉE",
    thanks: "Merci pour votre commande.",
    order: "Commande",
    color: "Couleur",
    quantity: "Quantité",
    delivery: "Livraison",
    total: "Total",
    contact: "Nous allons vous contacter prochainement pour confirmer votre commande.",
  },

  errors: {
    name: "Veuillez saisir votre nom complet (3 caractères minimum).",
    phone: "Numéro de téléphone invalide.",
    wilaya: "Veuillez sélectionner votre wilaya.",
    deliveryUnavailable: "Ce mode de livraison n'est pas disponible pour cette wilaya.",
    ratesUnavailable: "Les tarifs de livraison sont momentanément indisponibles. Réessayez dans un instant.",
    network: "Erreur réseau. Vérifiez votre connexion et réessayez.",
    generic: "Une erreur est survenue. Réessayez.",
    byCode: {
      rate_limited: "Trop de requêtes, réessayez dans une minute.",
      invalid_data: "Données invalides.",
      invalid_phone: "Numéro de téléphone invalide.",
      product_not_found: "Produit introuvable.",
      variant_not_found: "Variante introuvable.",
      variant_unavailable: "Cette couleur est actuellement indisponible.",
      wilaya_invalid: "Veuillez sélectionner votre wilaya.",
      delivery_unavailable: "Ce mode de livraison n'est pas disponible pour cette wilaya.",
      rates_unavailable: "Les tarifs de livraison sont momentanément indisponibles. Réessayez dans un instant.",
      price_changed: "Les tarifs de livraison ont changé. Rechargez la page puis réessayez.",
      server_error: "Erreur serveur, veuillez réessayer.",
    } as Record<string, string>,
  },
};

export type Dictionary = typeof fr;

export const ar: Dictionary = {
  langLabel: "اللغة",
  quantity: "الكمية",
  decreaseQty: "تقليل الكمية",
  increaseQty: "زيادة الكمية",
  color: "اللون",
  colors: { noir: "أسود", bleu: "أزرق", rouge: "أحمر", vert: "أخضر" },
  imageN: (n) => "صورة " + n,
  ratingOutOf5: (n) => n + " من 5",
  save: (amount) => "وفّر " + amount,
  description: "الوصف",
  mobileImageAlt: "عرض المنتج",

  orderTitle: "اطلب الآن",
  fullName: "الاسم الكامل",
  phone: "رقم الهاتف",
  wilaya: "الولاية",
  delivery: "التوصيل",
  wilayaPlaceholder: "اختر ولايتك",
  wilayaSearch: "ابحث (مثال: وهران)…",
  wilayaNone: "لم يتم العثور على ولاية.",
  unavailable: "غير متوفر",
  home: { title: "التوصيل للمنزل", sub: "استلم طلبك في منزلك" },
  stopdesk: { title: "التوصيل للمكتب", sub: "استلام من مكتب شركة التوصيل" },
  summaryProduct: "المنتج",
  summaryDelivery: "التوصيل",
  summaryTotal: "المجموع",
  pickWilaya: "اختر ولايتك أولاً",
  onlyHomeNote: "التوصيل للمكتب غير متاح لهذه الولاية: التوصيل للمنزل فقط.",
  onlyStopdeskNote: "التوصيل للمنزل غير متاح لهذه الولاية: التوصيل للمكتب فقط.",
  payOnReceipt: "الدفع عند استلام الطلب.",
  submit: "اطلب الآن",
  submitting: "جارٍ الإرسال…",
  stickyTotal: "المجموع",
  stickyProduct: "المنتج",

  success: {
    title: "تم تسجيل طلبك",
    thanks: "شكرًا لثقتك بنا.",
    order: "الطلب",
    color: "اللون",
    quantity: "الكمية",
    delivery: "التوصيل",
    total: "المجموع",
    contact: "سنتصل بك قريبًا لتأكيد طلبك.",
  },

  errors: {
    name: "الرجاء إدخال الاسم الكامل (3 أحرف على الأقل).",
    phone: "رقم الهاتف غير صالح.",
    wilaya: "الرجاء اختيار الولاية.",
    deliveryUnavailable: "طريقة التوصيل هذه غير متوفرة لهذه الولاية.",
    ratesUnavailable: "أسعار التوصيل غير متاحة حاليًا. أعد المحاولة بعد لحظات.",
    network: "خطأ في الاتصال. تحقق من الإنترنت وأعد المحاولة.",
    generic: "حدث خطأ. أعد المحاولة.",
    byCode: {
      rate_limited: "عدد كبير من الطلبات، أعد المحاولة بعد دقيقة.",
      invalid_data: "بيانات غير صالحة.",
      invalid_phone: "رقم الهاتف غير صالح.",
      product_not_found: "المنتج غير موجود.",
      variant_not_found: "اللون غير موجود.",
      variant_unavailable: "هذا اللون غير متوفر حاليًا.",
      wilaya_invalid: "الرجاء اختيار الولاية.",
      delivery_unavailable: "طريقة التوصيل هذه غير متوفرة لهذه الولاية.",
      rates_unavailable: "أسعار التوصيل غير متاحة حاليًا. أعد المحاولة بعد لحظات.",
      price_changed: "تغيّرت أسعار التوصيل. أعد تحميل الصفحة ثم حاول مجددًا.",
      server_error: "خطأ في الخادم، أعد المحاولة.",
    },
  },
};

export const DICTIONARIES: Record<Lang, Dictionary> = { fr, ar };
export const DIR: Record<Lang, "ltr" | "rtl"> = { fr: "ltr", ar: "rtl" };
