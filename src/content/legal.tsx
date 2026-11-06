// Legal texts for /privacy (adatkezelési tájékoztató) and /legal (impresszum,
// copyright, terms of use), in Hungarian and English. Plain JSX on purpose: these
// change rarely and should be reviewed as a whole, not edited bit by bit.
//
// If the site starts doing something new with visitors' data (analytics, a
// contact form, embedded videos, newsletter...), the privacy policy must be
// updated before that goes live.

export type Lang = "hu" | "en";

export const OWNER = {
  name: { hu: "Rácz Péter", en: "Peter Rácz" },
  email: "peter.racz.rhr@gmail.com",
  phone: "+36 50 104 5007",
  phoneHref: "tel:+36501045007",
};

export const EFFECTIVE = { hu: "2026. november 6.", en: "6 November 2026" };

const Mail = () => (
  <a href={`mailto:${OWNER.email}`} className="underline underline-offset-4 hover:text-plum">
    {OWNER.email}
  </a>
);
const Phone = () => (
  <a href={OWNER.phoneHref} className="underline underline-offset-4 hover:text-plum">
    {OWNER.phone}
  </a>
);
const Ext = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-plum">
    {children}
  </a>
);

export type LegalSection = { title: string; body: React.ReactNode };
export type LegalDoc = { eyebrow: string; title: string; intro: React.ReactNode; sections: LegalSection[] };

/* ------------------------------------------------------------------ */
/* Privacy policy                                                      */
/* ------------------------------------------------------------------ */

export const PRIVACY: Record<Lang, LegalDoc> = {
  hu: {
    eyebrow: "Adatvédelem",
    title: "Adatkezelési tájékoztató",
    intro: (
      <p>
        Ez a tájékoztató elmondja, milyen személyes adatok keletkeznek, amikor meglátogatod ezt az oldalt, ki fér hozzájuk, és
        milyen jogaid vannak. Az Európai Unió általános adatvédelmi rendelete (GDPR, (EU) 2016/679 rendelet) és az
        információs önrendelkezési jogról szóló 2011. évi CXII. törvény (Infotv.) alapján készült. Röviden: az oldalon nincs
        analitika, nincs hirdetés, nincs követő süti, és nem kérek tőled semmilyen adatot.
      </p>
    ),
    sections: [
      {
        title: "1. Ki kezeli az adataidat?",
        body: (
          <>
            <p>Adatkezelő: {OWNER.name.hu}, magánszemély, az oldal üzemeltetője.</p>
            <p>
              E-mail: <Mail /> · Telefon: <Phone />
            </p>
            <p>Adatvédelmi tisztviselő kijelölésére nem vagyok köteles, ezért ilyen nincs.</p>
          </>
        ),
      },
      {
        title: "2. Tárhely és szervernaplók (Netlify)",
        body: (
          <>
            <p>
              Az oldalt a Netlify, Inc. (101 2nd Street, San Francisco, CA 94105, USA) szolgálja ki. Amikor megnyitod az oldalt,
              a böngésződ technikai adatokat küld a szervernek: IP-cím, a kérés időpontja, a megnyitott oldal címe, a
              böngésző és az operációs rendszer típusa, a hivatkozó oldal. Ezek nélkül weboldal nem jeleníthető meg.
            </p>
            <p>
              Cél: az oldal kiszolgálása, a működés és a biztonság (például túlterheléses támadások kivédése). Jogalap: jogos
              érdek, GDPR 6. cikk (1) f) pont. Ezeket a naplókat a Netlify kezeli adatfeldolgozóként, a saját megőrzési ideje
              szerint; én nem nézem és nem mentem el őket.
            </p>
            <p>
              Mivel a Netlify amerikai cég, az adatok az Egyesült Államokba kerülhetnek. A továbbítás alapja az EU–USA
              adatvédelmi keretrendszer és/vagy az Európai Bizottság általános szerződési feltételei (GDPR 45–46. cikk).
              Részletek: <Ext href="https://www.netlify.com/privacy/">netlify.com/privacy</Ext>.
            </p>
          </>
        ),
      },
      {
        title: "3. Kamera a főoldalon",
        body: (
          <>
            <p>
              A főoldal tetején a kamerád képét pixeles effektként lehet megjeleníteni. Ehhez a böngésződ engedélyt kér; ha
              nem adod meg, egy fotó jelenik meg helyette. A gombbal bármikor kikapcsolhatod.
            </p>
            <p>
              A videó kizárólag a te eszközödön, a böngésző memóriájában kerül feldolgozásra. Nem kerül feltöltésre, nem
              kerül rögzítésre, és sem én, sem más nem fér hozzá. Hozzám tehát ebből semmilyen személyes adat nem jut el.
            </p>
          </>
        ),
      },
      {
        title: "4. Spotify zenelista",
        body: (
          <>
            <p>
              Az „On repeat” rész az én Spotify-hallgatási adataimat mutatja, amelyeket a szerver kér le a Spotifytól.
              Rólad ehhez semmilyen adatot nem küldök a Spotifynak.
            </p>
            <p>
              Az albumborítókat viszont a böngésződ közvetlenül a Spotify szervereiről tölti be, ezért a Spotify AB
              (Regeringsgatan 19, 111 53 Stockholm, Svédország) látja az IP-címedet és a böngésződ adatait, ahogy bármely
              kép betöltésekor. Jogalap: jogos érdek (GDPR 6. cikk (1) f)), az oldal tartalmának megjelenítése. A Spotify
              adatkezeléséről: <Ext href="https://www.spotify.com/hu/legal/privacy-policy/">spotify.com/legal/privacy-policy</Ext>.
            </p>
          </>
        ),
      },
      {
        title: "5. Ha írsz vagy telefonálsz nekem",
        body: (
          <>
            <p>
              Ha e-mailt küldesz vagy felhívsz, a nevedet, az elérhetőségedet és az üzenetedet arra használom, hogy
              válaszoljak. Jogalap: jogos érdek a megkeresésed megválaszolásához (GDPR 6. cikk (1) f)). Az üzenetet addig
              őrzöm, amíg a beszélgetés tart, utána legfeljebb egy évig, hacsak nem kéred korábban a törlését.
            </p>
            <p>
              Az e-mailjeimet a Google (Gmail) tárolja, amely ehhez adatfeldolgozóként jár el. Adatot másnak nem adok át.
            </p>
          </>
        ),
      },
      {
        title: "6. Sütik és helyi tárolás",
        body: (
          <>
            <p>
              Az oldal a látogatóknál nem használ sütit. Egyetlen jelzőt ment a böngésződ munkamenet-tárolójába
              (sessionStorage), hogy a nyitóanimáció egy látogatás alatt csak egyszer jelenjen meg. Ez nem tartalmaz személyes
              adatot, nem jut el hozzám, és a böngészőfül bezárásakor törlődik. Mivel ez a kért szolgáltatáshoz szükséges,
              nem kell hozzá hozzájárulás, és ezért nincs sütisáv sem.
            </p>
            <p>
              Az oldal szerkesztőfelülete (/admin) csak nekem érhető el, és a bejelentkezésemhez egy szükséges sütit használ.
              Ez a látogatókat nem érinti.
            </p>
          </>
        ),
      },
      {
        title: "7. Külső linkek",
        body: (
          <p>
            Az oldalon linkek vannak más szolgáltatásokra (GitHub, Instagram, Ko-fi, Spotify). Ha rájuk kattintasz, már az
            ő oldalukon vagy, és az ő adatkezelési szabályaik érvényesek. Ezekért nem vállalok felelősséget.
          </p>
        ),
      },
      {
        title: "8. Amit nem csinálok",
        body: (
          <p>
            Nem használok analitikát, hirdetést, követő pixelt vagy közösségimédia-beépülőt. Nem hozok rólad automatizált
            döntést, nem profilozlak, és nem adom el vagy adom át az adataidat senkinek.
          </p>
        ),
      },
      {
        title: "9. A jogaid",
        body: (
          <>
            <p>A GDPR 15–22. cikke alapján jogod van:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>tájékoztatást kérni arról, milyen adatot kezelek rólad, és másolatot kapni róla;</li>
              <li>kérni a pontatlan adatok helyesbítését;</li>
              <li>kérni az adataid törlését;</li>
              <li>kérni az adatkezelés korlátozását;</li>
              <li>tiltakozni a jogos érdeken alapuló adatkezelés ellen;</li>
              <li>kérni az adataid géppel olvasható formában való kiadását (adathordozhatóság).</li>
            </ul>
            <p>
              Ehhez írj a <Mail /> címre. Legkésőbb egy hónapon belül válaszolok, és ez ingyenes.
            </p>
          </>
        ),
      },
      {
        title: "10. Panasz",
        body: (
          <>
            <p>
              Ha úgy érzed, megsértettem a jogaidat, kérlek, előbb írj nekem, hátha gyorsan rendezni tudjuk. Panaszt tehetsz a
              Nemzeti Adatvédelmi és Információszabadság Hatóságnál is:
            </p>
            <p>
              NAIH · 1055 Budapest, Falk Miksa utca 9–11. · Postacím: 1363 Budapest, Pf. 9. · Telefon: +36 1 391 1400 ·
              E-mail: ugyfelszolgalat@naih.hu · <Ext href="https://naih.hu">naih.hu</Ext>
            </p>
            <p>Bírósághoz is fordulhatsz; a pert a lakóhelyed szerinti törvényszék előtt is megindíthatod.</p>
          </>
        ),
      },
      {
        title: "11. Változások",
        body: (
          <p>
            Ha az oldal működése változik, ezt a tájékoztatót frissítem, és a dátumot is átírom. Hatályos: {EFFECTIVE.hu}
          </p>
        ),
      },
    ],
  },

  en: {
    eyebrow: "Privacy",
    title: "Privacy policy",
    intro: (
      <p>
        This policy explains what personal data comes up when you visit this site, who can see it, and what rights you
        have. It follows the EU General Data Protection Regulation (GDPR, Regulation (EU) 2016/679) and Hungarian Act CXII
        of 2011. In short: there are no analytics, no ads and no tracking cookies here, and I don&apos;t ask you for any
        data.
      </p>
    ),
    sections: [
      {
        title: "1. Who is responsible",
        body: (
          <>
            <p>Controller: {OWNER.name.en}, private individual and operator of this site.</p>
            <p>
              Email: <Mail /> · Phone: <Phone />
            </p>
            <p>I am not required to appoint a data protection officer, so there isn&apos;t one.</p>
          </>
        ),
      },
      {
        title: "2. Hosting and server logs (Netlify)",
        body: (
          <>
            <p>
              The site is served by Netlify, Inc. (101 2nd Street, San Francisco, CA 94105, USA). When you open a page, your
              browser sends technical data to the server: IP address, time of the request, the page address, browser and
              operating system type, and the referring page. A website can&apos;t be shown without these.
            </p>
            <p>
              Purpose: delivering the site, keeping it running and secure (for example against denial-of-service attacks).
              Legal basis: legitimate interest, Art. 6(1)(f) GDPR. Netlify keeps these logs as a processor for its own
              retention period; I don&apos;t look at or store them.
            </p>
            <p>
              Netlify is a US company, so data may be transferred to the United States. The transfer relies on the EU–US
              Data Privacy Framework and/or the European Commission&apos;s standard contractual clauses (Art. 45–46 GDPR).
              Details: <Ext href="https://www.netlify.com/privacy/">netlify.com/privacy</Ext>.
            </p>
          </>
        ),
      },
      {
        title: "3. Camera on the home page",
        body: (
          <>
            <p>
              The top of the home page can show your camera as a pixel effect. Your browser asks for permission first; if
              you say no, a photo is shown instead. You can switch it off any time with the button.
            </p>
            <p>
              The video is processed only on your device, in your browser&apos;s memory. It is never uploaded or recorded,
              and nobody, including me, can see it. No personal data reaches me from this.
            </p>
          </>
        ),
      },
      {
        title: "4. Spotify list",
        body: (
          <>
            <p>
              The “On repeat” section shows my own Spotify listening, fetched by the server from Spotify. Nothing about you
              is sent to Spotify for this.
            </p>
            <p>
              The album covers, however, are loaded by your browser straight from Spotify&apos;s servers, so Spotify AB
              (Regeringsgatan 19, 111 53 Stockholm, Sweden) sees your IP address and browser details, as with any image
              load. Legal basis: legitimate interest (Art. 6(1)(f) GDPR) in showing the site&apos;s content. Spotify&apos;s
              policy: <Ext href="https://www.spotify.com/legal/privacy-policy/">spotify.com/legal/privacy-policy</Ext>.
            </p>
          </>
        ),
      },
      {
        title: "5. If you email or call me",
        body: (
          <>
            <p>
              If you email or call me, I use your name, contact details and message to reply. Legal basis: legitimate
              interest in answering you (Art. 6(1)(f) GDPR). I keep the message while we&apos;re talking and for up to one
              year after, unless you ask me to delete it sooner.
            </p>
            <p>My email is stored by Google (Gmail), acting as a processor. I don&apos;t pass your data on to anyone else.</p>
          </>
        ),
      },
      {
        title: "6. Cookies and local storage",
        body: (
          <>
            <p>
              The site sets no cookies for visitors. It saves one flag in your browser&apos;s session storage so the intro
              animation only plays once per visit. It holds no personal data, never reaches me, and is cleared when you
              close the tab. As it is needed for the service you asked for, it needs no consent, which is why there is no
              cookie banner.
            </p>
            <p>
              The site&apos;s editor (/admin) is only for me and uses one necessary cookie for my login. It doesn&apos;t
              affect visitors.
            </p>
          </>
        ),
      },
      {
        title: "7. Links to other sites",
        body: (
          <p>
            The site links to other services (GitHub, Instagram, Ko-fi, Spotify). Once you click through, you are on their
            site and their privacy rules apply. I am not responsible for them.
          </p>
        ),
      },
      {
        title: "8. What I don't do",
        body: (
          <p>
            No analytics, ads, tracking pixels or social media plugins. No automated decisions or profiling, and I never
            sell or hand your data to anyone.
          </p>
        ),
      },
      {
        title: "9. Your rights",
        body: (
          <>
            <p>Under Articles 15–22 GDPR you can:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>ask what data I hold about you and get a copy;</li>
              <li>have inaccurate data corrected;</li>
              <li>have your data deleted;</li>
              <li>ask me to restrict processing;</li>
              <li>object to processing based on legitimate interest;</li>
              <li>receive your data in a machine-readable format (portability).</li>
            </ul>
            <p>
              Just email <Mail />. I reply within one month, free of charge.
            </p>
          </>
        ),
      },
      {
        title: "10. Complaints",
        body: (
          <>
            <p>
              If you think I&apos;ve breached your rights, please write to me first so we can sort it out quickly. You can
              also complain to the Hungarian data protection authority, or to the authority in your own EU country:
            </p>
            <p>
              NAIH (Nemzeti Adatvédelmi és Információszabadság Hatóság) · Falk Miksa utca 9–11, 1055 Budapest, Hungary ·
              Postal: 1363 Budapest, Pf. 9. · Phone: +36 1 391 1400 · Email: ugyfelszolgalat@naih.hu ·{" "}
              <Ext href="https://naih.hu">naih.hu</Ext>
            </p>
            <p>You can also go to court.</p>
          </>
        ),
      },
      {
        title: "11. Changes",
        body: (
          <p>
            If the site changes how it works, I&apos;ll update this policy and its date. Effective from {EFFECTIVE.en}.
          </p>
        ),
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Legal notice: impresszum, copyright, terms of use                  */
/* ------------------------------------------------------------------ */

export const NOTICE: Record<Lang, LegalDoc> = {
  hu: {
    eyebrow: "Jogi információk",
    title: "Impresszum",
    intro: (
      <p>
        Ez egy személyes, nem kereskedelmi portfólióoldal. Nem árulok rajta semmit, és nem nyújtok rajta fizetős
        szolgáltatást.
      </p>
    ),
    sections: [
      {
        title: "Üzemeltető",
        body: (
          <>
            <p>{OWNER.name.hu}, magánszemély</p>
            <p>
              E-mail: <Mail /> · Telefon: <Phone />
            </p>
          </>
        ),
      },
      {
        title: "Tárhelyszolgáltató",
        body: (
          <p>
            Netlify, Inc. · 101 2nd Street, San Francisco, CA 94105, USA · privacy@netlify.com ·{" "}
            <Ext href="https://www.netlify.com">netlify.com</Ext>
          </p>
        ),
      },
      {
        title: "Szerzői jog",
        body: (
          <>
            <p>
              Az oldalon lévő saját fotók, szövegek, a dizájn és a saját projektek a szerzői jogról szóló 1999. évi LXXVI.
              törvény védelme alatt állnak, és {OWNER.name.hu} tulajdonát képezik, hacsak nincs külön jelölve. Előzetes
              írásbeli engedélyem nélkül nem másolhatók, nem tehetők közzé máshol, és nem használhatók kereskedelmi célra.
              Linkelni és rövid részletet idézni a forrás megjelölésével szabad.
            </p>
            <p>
              Az albumborítók és a zenei adatok a Spotifytól és a jogtulajdonosaiktól származnak. A GitHub, Instagram, Ko-fi
              és Spotify név és logó a tulajdonosaik védjegye. Az oldal egyes interakcióit a Skiper UI és az Aceternity UI
              ihlette; a betűtípusok SIL Open Font License alatt használhatók.
            </p>
          </>
        ),
      },
      {
        title: "Fotók és képmás",
        body: (
          <p>
            Ha valaki magára ismer egy fotón, és nem szeretné, hogy szerepeljen rajta, írjon a <Mail /> címre, és a képet
            haladéktalanul eltávolítom.
          </p>
        ),
      },
      {
        title: "Felhasználási feltételek",
        body: (
          <>
            <p>
              Az oldal tartalma tájékoztató jellegű, úgy, ahogy van. Igyekszem pontos lenni, de a tartalom helyességéért és
              az oldal folyamatos elérhetőségéért nem vállalok felelősséget, a jogszabályok által megengedett mértékben.
            </p>
            <p>
              A külső oldalakra mutató linkek tartalmáért nem felelek. Ha egy link jogsértő tartalomra mutat, szólj, és
              eltávolítom.
            </p>
            <p>
              Tilos az oldalt vagy a szerkesztőfelületét feltörni, túlterhelni vagy jogosulatlanul elérni megpróbálni.
            </p>
          </>
        ),
      },
      {
        title: "Ko-fi támogatás",
        body: (
          <p>
            A Ko-fi link önkéntes támogatásra szolgál. A támogatás ajándék: nem jár érte termék, szolgáltatás vagy
            ellenszolgáltatás. A fizetést a Ko-fi és a fizetési szolgáltatója kezeli, nem én.
          </p>
        ),
      },
      {
        title: "Alkalmazandó jog",
        body: (
          <p>
            Az oldalra a magyar jog vonatkozik, a fogyasztóvédelmi és adatvédelmi szabályok által biztosított jogaid
            érintetlenül hagyásával. Hatályos: {EFFECTIVE.hu}
          </p>
        ),
      },
    ],
  },

  en: {
    eyebrow: "Legal",
    title: "Legal notice",
    intro: (
      <p>
        This is a personal, non-commercial portfolio site. I don&apos;t sell anything on it or offer any paid service.
      </p>
    ),
    sections: [
      {
        title: "Operator",
        body: (
          <>
            <p>{OWNER.name.en}, private individual</p>
            <p>
              Email: <Mail /> · Phone: <Phone />
            </p>
          </>
        ),
      },
      {
        title: "Hosting provider",
        body: (
          <p>
            Netlify, Inc. · 101 2nd Street, San Francisco, CA 94105, USA · privacy@netlify.com ·{" "}
            <Ext href="https://www.netlify.com">netlify.com</Ext>
          </p>
        ),
      },
      {
        title: "Copyright",
        body: (
          <>
            <p>
              My own photos, texts, design and projects on this site are protected by copyright (Hungarian Act LXXVI of
              1999) and belong to {OWNER.name.en} unless marked otherwise. Don&apos;t copy, republish or use them
              commercially without my written permission. Linking and short quotes with credit are fine.
            </p>
            <p>
              Album covers and music data come from Spotify and their rights holders. GitHub, Instagram, Ko-fi and Spotify
              names and logos are trademarks of their owners. Some interactions were inspired by Skiper UI and Aceternity
              UI; fonts are used under the SIL Open Font License.
            </p>
          </>
        ),
      },
      {
        title: "Photos of people",
        body: (
          <p>
            If you recognise yourself in a photo and don&apos;t want to be on it, email <Mail /> and I&apos;ll take it down
            right away.
          </p>
        ),
      },
      {
        title: "Terms of use",
        body: (
          <>
            <p>
              The content is for information only and provided as is. I try to keep it accurate, but to the extent the law
              allows I am not liable for errors or for the site being unavailable.
            </p>
            <p>
              I am not responsible for the content of external sites I link to. If a link points to something unlawful,
              tell me and I&apos;ll remove it.
            </p>
            <p>Don&apos;t try to hack, overload or get unauthorised access to the site or its editor.</p>
          </>
        ),
      },
      {
        title: "Ko-fi support",
        body: (
          <p>
            The Ko-fi link is for voluntary support. A tip is a gift: you don&apos;t get a product, service or anything else
            in return. Payments are handled by Ko-fi and its payment providers, not by me.
          </p>
        ),
      },
      {
        title: "Governing law",
        body: (
          <p>
            Hungarian law applies, without affecting the rights consumer and data protection law give you. Effective from{" "}
            {EFFECTIVE.en}.
          </p>
        ),
      },
    ],
  },
};
