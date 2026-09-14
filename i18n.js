const I18n = (() => {

  const STRINGS = {
    en: {
      app_title: "Calculator",
      install_button: "Install",
      safe_header_title: "Emergency Contacts \uD83D\uDEA8",
      country_label: "Select your country",
      country_placeholder: "Choose a country",
      country_kenya: "Kenya",
      country_namibia: "Namibia",
      country_netherlands: "Netherlands",
      close_safe_btn: "\u2715 Close",
      close_safe_aria: "Close emergency screen",
      language_label: "Language",
      language_en: "English",
      language_sw: "Swahili",

      country_prompt: "Please select your country above to see local emergency contacts.",
      safe_hint: "\u26A0\uFE0F Tap a contact to call or message. Emergency services will be notified.",
      add_contact_toggle: "+ Add a contact",
      add_contact_name_placeholder: "Name",
      add_contact_number_placeholder: "Phone number",
      add_contact_call: "Call",
      add_contact_sms: "SMS",
      add_contact_save: "Save contact",
      add_contact_error: "Please enter both a name and a number.",
      custom_contact_desc: "Custom contact",

      sos_label: "SOS",
      sos_aria: "SOS Emergency Call",
      sos_alert: "EMERGENCY SOS\nPlease call emergency services at {number} immediately!",

      contact_call_confirm: "Please call {name} at {number}",
      contact_message_confirm: "Please message {name} at {number}",
      contact_call_aria: "Call {name} at {number}",
      contact_message_aria: "Message {name} at {number}",
      remove_contact_aria: "Remove {name}",

      contacts: {
        namibia_police: { name: "Police", description: "Namibian Police Force" },
        namibia_ambulance: { name: "Ambulance", description: "24/7 Emergency Ambulance" },
        namibia_lifeline: { name: "Lifeline Namibia", description: "Crisis counselling helpline" },
        namibia_childline: { name: "Childline", description: "Children in danger" },
        namibia_sms: { name: "SMS Line", description: "If you cannot speak safely" },

        kenya_police: { name: "Police", description: "Kenya Police Service" },
        kenya_ambulance: { name: "Ambulance", description: "Kenya Ambulance" },
        kenya_befrienders: { name: "Befrienders Kenya", description: "Crisis line" },
        kenya_childline: { name: "Childline Kenya", description: "Children in danger" },
        kenya_gbv: { name: "Gender Violence Helpline", description: "GBV support, 24/7" },

        netherlands_emergency: { name: "Emergency Services", description: "Police, Fire & Ambulance" },
        netherlands_police: { name: "Police (non-urgent)", description: "Non-emergency police line" },
        netherlands_crisis: { name: "Crisis Helpline", description: "Suicide & crisis prevention" },
        netherlands_veiligthuis: { name: "Veilig Thuis", description: "Domestic violence support" },
        netherlands_kindertelefoon: { name: "Kindertelefoon", description: "Helpline for children" }
      }
    },

    sw: {
      app_title: "Kikokotoo",
      install_button: "Sakinisha",
      safe_header_title: "Anwani za Dharura \uD83D\uDEA8",
      country_label: "Chagua nchi yako",
      country_placeholder: "Chagua nchi",
      country_kenya: "Kenya",
      country_namibia: "Namibia",
      country_netherlands: "Netherlands",
      close_safe_btn: "\u2715 Funga",
      close_safe_aria: "Funga skrini ya dharura",
      language_label: "Lugha",
      language_en: "Kiingereza",
      language_sw: "Kiswahili",

      country_prompt: "Tafadhali chagua nchi yako hapo juu ili kuona anwani za dharura za eneo lako.",
      safe_hint: "\u26A0\uFE0F Gusa anwani kupiga simu au kutuma ujumbe. Huduma za dharura zitajulishwa.",
      add_contact_toggle: "+ Ongeza anwani",
      add_contact_name_placeholder: "Jina",
      add_contact_number_placeholder: "Nambari ya simu",
      add_contact_call: "Piga simu",
      add_contact_sms: "SMS",
      add_contact_save: "Hifadhi anwani",
      add_contact_error: "Tafadhali jaza jina na nambari.",
      custom_contact_desc: "Anwani maalum",

      sos_label: "SOS",
      sos_aria: "Simu ya Dharura ya SOS",
      sos_alert: "DHARURA SOS\nTafadhali piga huduma za dharura kwa {number} mara moja!",

      contact_call_confirm: "Tafadhali piga simu {name} kwa {number}",
      contact_message_confirm: "Tafadhali tuma ujumbe kwa {name} kwa {number}",
      contact_call_aria: "Piga simu {name} kwa {number}",
      contact_message_aria: "Tuma ujumbe kwa {name} kwa {number}",
      remove_contact_aria: "Ondoa {name}",

      contacts: {
        namibia_police: { name: "Polisi", description: "Jeshi la Polisi la Namibia" },
        namibia_ambulance: { name: "Gari la Wagonjwa", description: "Huduma ya dharura ya saa 24" },
        namibia_lifeline: { name: "Lifeline Namibia", description: "Simu ya ushauri wakati wa dharura" },
        namibia_childline: { name: "Childline", description: "Watoto walio hatarini" },
        namibia_sms: { name: "Njia ya SMS", description: "Kama huwezi kuongea kwa usalama" },

        kenya_police: { name: "Polisi", description: "Huduma ya Polisi ya Kenya" },
        kenya_ambulance: { name: "Gari la Wagonjwa", description: "Gari la Wagonjwa la Kenya" },
        kenya_befrienders: { name: "Befrienders Kenya", description: "Simu ya dharura" },
        kenya_childline: { name: "Childline Kenya", description: "Watoto walio hatarini" },
        kenya_gbv: { name: "Simu ya Unyanyasaji wa Kijinsia", description: "Msaada wa GBV, saa 24" },

        netherlands_emergency: { name: "Huduma za Dharura", description: "Polisi, Zimamoto na Gari la Wagonjwa" },
        netherlands_police: { name: "Polisi (isiyo ya dharura)", description: "Simu ya polisi isiyo ya dharura" },
        netherlands_crisis: { name: "Simu ya Dharura", description: "Kuzuia kujiua na dharura" },
        netherlands_veiligthuis: { name: "Veilig Thuis", description: "Msaada wa unyanyasaji wa nyumbani" },
        netherlands_kindertelefoon: { name: "Kindertelefoon", description: "Simu ya msaada kwa watoto" }
      }
    }
  };

  const FALLBACK_LOCALE = "en";
  let currentLocale = FALLBACK_LOCALE;

  function detectLocale() {
    const lang = (navigator.language || FALLBACK_LOCALE).split("-")[0];
    return STRINGS[lang] ? lang : FALLBACK_LOCALE;
  }

  function setLocale(lang) {
    currentLocale = STRINGS[lang] ? lang : FALLBACK_LOCALE;
    applyStaticTranslations();
    if (typeof SafeScreen !== 'undefined' && typeof SafeScreen.render === 'function') {
      SafeScreen.render();
    }
  }

  function getLocale() {
    return currentLocale;
  }

  function getAvailableLocales() {
    return Object.keys(STRINGS);
  }


  function t(key, params = {}) {
    const dict = STRINGS[currentLocale] || STRINGS[FALLBACK_LOCALE];
    let str = dict[key] !== undefined ? dict[key] : STRINGS[FALLBACK_LOCALE][key] || key;
    Object.keys(params).forEach(p => {
      str = str.replace(`{${p}}`, params[p]);
    });
    return str;
  }

  function tContact(key) {
    const dict = STRINGS[currentLocale] || STRINGS[FALLBACK_LOCALE];
    return (dict.contacts && dict.contacts[key])
      || STRINGS[FALLBACK_LOCALE].contacts[key]
      || { name: key, description: "" };
  }

  function applyStaticTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(el => {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });
    document.documentElement.setAttribute("lang", currentLocale);
    document.title = t("app_title");
  }

  function init() {
    currentLocale = detectLocale();
    applyStaticTranslations();
  }

  return { init, t, tContact, setLocale, getLocale, getAvailableLocales };
})();