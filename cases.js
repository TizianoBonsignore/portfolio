/* ==========================================================================
   Dati dei case study. Ogni progetto è un oggetto con:
   - title, eyebrow, meta, cover, links (bottoni opzionali sotto i meta)
   - sections: array ordinato. L'ordine dell'array è l'ordine in pagina.
     Tipi disponibili: intro, image, split, gallery, stats, quote, steps
     "body" può essere una stringa o un array di paragrafi.
   - next: slug del progetto successivo (la sezione "next" viene aggiunta in fondo)
   Testi ripresi dalle pagine vecchie (old_pages/).
   ========================================================================== */

const hl = (t) => `<span class="accent">${t}</span>`;

window.CASES = {
  mediline: {
    title: "Mediline Supported Living",
    eyebrow: "UX · UI · WordPress Development",
    cover: "assets/mediline/med1.webp",
    coverAlt: "Mediline Supported Living",
    meta: [
      ["Company", "Mediline Supported Living Ltd"],
      ["Sector", "Care and health, supported living"],
      ["Year", "2026"],
      ["Services", "User Experience Design<br>User Interface Design<br>WordPress Design & Build"],
      ["Built with", "WordPress, Elementor<br>Custom child theme<br>Custom post types"],
      ["Team", "In collaboration with another developer<br>Brand identity by an external studio"],
    ],
    links: [{ label: "Visit website", href: "https://www.medilinesupportedliving.co.uk/" }],
    sections: [
      {
        type: "intro",
        label: "Description",
        lead: `Mediline is a ${hl("supported living provider")} for adults with learning disabilities, autism, and complex needs across the North West of England.`,
        body: `I designed the ${hl("UX and UI")} of the new website and built it in ${hl("WordPress")} together with another collaborator, bringing the new brand identity online.`,
      },
      { type: "image", src: "assets/mediline/mockup.webp", alt: "Mediline website on desktop, tablet and mobile", ratio: "wide" },
      {
        type: "split",
        label: "Brief",
        title: "Reassure families. Show the people. Stay easy to update.",
        body: [
          `Mediline, part of a ${hl("private equity backed group")}, needed a site that reassured families and showcased the people and homes behind the service.`,
          `It also had to be easy for a ${hl("non-technical team")} to keep current, without calling a developer every time something changed.`,
        ],
        src: "assets/mediline/med6.webp",
        alt: "Mediline, Our Story page",
      },
      {
        type: "intro",
        label: "UX",
        lead: `One website, two audiences, ${hl("two clear paths")}: For Families and For Professionals.`,
        body: [
          `${hl("Families")} arrive worried, looking for a safe place for someone they love: they find how Mediline supports them, funding and eligibility, and answers to common questions. ${hl("Professionals")} (social workers, brokerage teams, commissioners) arrive with a checklist and little time: they get specialisms, the referral process with response times, and information for commissioners, without digging.`,
          "Shared content (About Us, Careers, News & Resources) sits alongside, so both audiences can go deeper when they need to.",
        ],
      },
      { type: "image", src: "assets/mediline/mockup-mobile.webp", alt: "Mediline website on mobile", ratio: "wide" },
      {
        type: "split",
        label: "UI",
        title: "Turning a brand identity into an interface.",
        body: [
          `The visual identity was created by an ${hl("external studio")}. My job was to make it work on screen: the deep navy, the warm palette, the Bounded and Creato Display typefaces, and the line icons became a consistent set of components.`,
          `Rounded buttons, soft color fields, and value tags like ${hl("Empowering")} and ${hl("Inclusive")} keep the tone friendly, while generous spacing and clear hierarchy keep the content easy to scan.`,
        ],
        src: "assets/mediline/med7.webp",
        alt: "Mediline, Success Stories section",
        reverse: true,
      },
      {
        type: "steps",
        label: "What we did",
        items: [
          { title: "Custom WordPress build", text: "A lightweight custom child theme on WordPress and Elementor, shaped around the brand system, with a bespoke mobile navigation." },
          { title: "Success stories", text: "Custom post types so the team can publish stories about the people and homes behind the service." },
          { title: "Resources and handover", text: "A useful links resource page and a written CMS guide, so the team can keep the site current on their own." },
        ],
      },
      {
        type: "intro",
        label: "Delivery",
        lead: `We managed the ${hl("full delivery lifecycle")}, working with stakeholders on both the client and the investor side.`,
        body: `The site ${hl("launched on time")} with a full handover. Today the team publishes their own stories ${hl("without developer help")}.`,
      },
    ],
    next: "food-book",
  },

  "food-book": {
    title: "Food Book",
    eyebrow: "UX / UI & React",
    cover: "assets/food_book/food_book.webp",
    coverAlt: "Food Book, UI-UX web app",
    meta: [
      ["Client", "Personal project"],
      ["Activities", "Front End Web Development with React.js<br>User Interface Design<br>User Experience Design"],
      ["Tools", "Figma, React.js"],
    ],
    links: [{ label: "Try demo", href: "https://test.tizianobonsignore.com/foodbook/" }],
    sections: [
      {
        type: "intro",
        label: "Description",
        lead: `Food Book was born out of pure frustration with how clunky most food delivery apps are. What started as a ${hl("UX/UI exploration")} evolved into a functional ${hl("React application")}.`,
        body: `It's wrapped in the bold ${hl("orange & purple gradients")} that give the brand its edge.`,
      },
      {
        type: "split",
        label: "Challenge",
        title: "Cluttered menus and messy flows. I knew I could make it better.",
        body: [
          `The starting point was mapping common points of friction. To kill the cognitive load, I stripped the architecture down to ${hl("3 main macro-categories")} with a persistent navigation menu, so you never feel lost in the app.`,
          `I prioritized speed: a ${hl("prominent search bar")}, categories front and center for quick scanning, and a dedicated section for ${hl("daily deals")} to guide the user naturally. Every choice was about giving the user back a sense of control.`,
        ],
        src: "assets/food_book/3.webp",
        alt: "Food Book, navigation and categories",
      },
      {
        type: "split",
        label: "Design & code",
        title: "Design and code, from the same perspective.",
        body: [
          `Working across the full stack forced me to think about how visual choices directly shape component architecture in ${hl("React")}. It's not just about looks; it's about making the experience feel "light" for the person using it.`,
          "Interactions, animations, and state logic weren't just bolted on at the end: they were designed alongside the UI to ensure everything feels snappy and intentional.",
        ],
        src: "assets/food_book/4.webp",
        alt: "Food Book, interface detail",
        reverse: true,
      },
      {
        type: "intro",
        label: "Learnings",
        lead: "What building this actually taught me.",
        body: [
          `More than just a technical exercise, Food Book was a test: could I solve a real-world problem alone, from A to Z? Yes, but it took plenty of pivots and "back to the drawing board" moments.`,
          `I learned that design alone isn't enough. Understanding what's happening under the hood in the code helps you make smarter decisions. I realized that ${hl("shipping something imperfect")} and iterating beats waiting for a "perfect" plan that never launches.`,
        ],
      },
    ],
    next: "wa-my",
  },

  "wa-my": {
    title: "WhatsApp Material You",
    eyebrow: "UX · UI · React",
    cover: "assets/wa_my/wa_my.webp",
    coverAlt: "WhatsApp Material You redesign",
    meta: [
      ["Client", "Personal project"],
      ["Activities", "User Experience Design on Figma<br>User Interface Design on Figma<br>Front End Web Development with React.js"],
      ["Tools", "Figma, React.js"],
    ],
    links: [
      { label: "View demo", href: "https://test.tizianobonsignore.com/whatsapp-my-demo/" },
      { label: "Behance", href: "https://www.behance.net/gallery/176296061/Whatsapp-Material-You-Redesign-Concept-UX-UI-DEV" },
    ],
    sections: [
      {
        type: "intro",
        label: "Description",
        lead: `A redesign of WhatsApp using ${hl("Material You")}, Google's design language for colorful, adaptive, and intuitive interfaces.`,
        body: `Designed in ${hl("Figma")}, then built as a fully responsive ${hl("React application")} for desktop and mobile.`,
      },
      {
        type: "split",
        label: "Context",
        title: "What if WhatsApp actually felt like an Android app?",
        body: [
          "WhatsApp on Android has always felt slightly out of place. A design frozen in time while the operating system moved forward. Material You introduced dynamic color, expressive components, and a new visual language. I wanted to see what WhatsApp could look like if it actually embraced it.",
          `I studied current Material You apps and design principles to build something that felt ${hl("native")} (not just reskinned) while keeping all the core functionality intact. The process started in Figma, where I worked out UX flows and UI screens before touching any code.`,
          `Once the design was solid, I translated it into a working ${hl("React.js application")}, a fully responsive demo adapted for both desktop and mobile.`,
        ],
        src: "assets/wa_my/2.webp",
        bg: "#fff",
        alt: "WhatsApp Material You, chat screen",
      },
      {
        type: "gallery",
        items: [
          { src: "assets/wa_my/3.webp", alt: "WhatsApp Material You, screen", bg: "#fff", ratio: 1038 / 682 },
          { src: "assets/wa_my/4.webp", alt: "WhatsApp Material You, screen", bg: "#fff", ratio: 1040 / 683 },
          { src: "assets/wa_my/5.webp", alt: "WhatsApp Material You, screen", bg: "#fff", ratio: 1038 / 682 },
          { src: "assets/wa_my/6.webp", alt: "WhatsApp Material You, screen", bg: "#fff", ratio: 692 / 682 },
        ],
      },
      {
        type: "split",
        label: "Design",
        title: "Dynamic color, better typography, modern patterns.",
        body: [
          `The redesign applies Material You's ${hl("dynamic color system")} so the interface adapts to the user's wallpaper. Typography and spacing were tightened, and components were rebuilt to match current platform standards.`,
          `The goal wasn't to make it prettier. It was to make it feel like it ${hl("belonged on the platform")} it runs on.`,
        ],
        src: "assets/wa_my/9.webp",
        alt: "WhatsApp Material You, dynamic color",
        reverse: true,
      },
      {
        type: "gallery",
        items: [
          { src: "assets/wa_my/8.webp", alt: "WhatsApp Material You, desktop" },
          { src: "assets/wa_my/7.webp", alt: "WhatsApp Material You, mobile" },
        ],
      },
    ],
    next: "hexaease",
  },

  hexaease: {
    title: "Hexaease",
    eyebrow: "UX · UI · Interaction Design",
    cover: "assets/hexaease/hexaease.webp",
    coverAlt: "Hexaease, UI-UX and interaction design",
    meta: [
      ["Client", "Design Flows Competition 2025"],
      ["Activities", "User Interface Design<br>User Experience Design<br>Interaction Design"],
      ["Year", "2025"],
    ],
    sections: [
      {
        type: "intro",
        label: "Description",
        lead: `HEXAEASE is a ${hl("mobile app interface")} designed for the Design Flows 2025 competition.`,
        body: `It manages ${hl("Hexabot multi-purpose robots")} in a lunar colony, letting pioneers ${hl("assign tasks")} and ${hl("track progress")}.`,
      },
      { type: "image", src: "assets/hexaease/2.webp", alt: "Hexaease, wireframes", ratio: "wide" },
      {
        type: "split",
        label: "Brief",
        title: "Managing robots on the Moon. The brief was as wild as it sounds.",
        body: [
          "The challenge: design an interface for families and exploration teams using versatile robots in a lunar colony. The users are real people doing real work: mining resources, growing crops, exploring craters. And the app needs to get out of their way.",
          `I built the full ${hl("UX/UI concept in Figma")}, mapping the key interactions and user flows that would make robot management feel intuitive rather than technical.`,
        ],
        src: "assets/hexaease/3.webp",
        alt: "Hexaease, user flow",
        bg: "#fff",
      },
      {
        type: "gallery",
        items: [
          { src: "assets/hexaease/4.webp", alt: "Hexaease, screens", bg: "#fff" },
          { src: "assets/hexaease/5.webp", alt: "Hexaease, screens", bg: "#fff" },
        ],
      },
      {
        type: "split",
        label: "Modes",
        title: "Two modes, two very different users.",
        body: [
          `${hl("Family Mode")} handles everyday tasks: maintenance, crop care, domestic routines. ${hl("Explorer Mode")} is for professional teams running crater expeditions and resource mining, with advanced tracking and mission controls.`,
          "Keeping both modes under one roof without making either feel compromised was the core design challenge and the most interesting part of the project.",
        ],
        src: "assets/hexaease/6.webp",
        alt: "Hexaease, Family and Explorer modes",
        bg: "#fff",
        reverse: true,
      },
      { type: "image", src: "assets/hexaease/7.webp", alt: "Hexaease, final screens", ratio: "wide" },
    ],
    next: "termoli",
  },

  termoli: {
    title: "Termoli Rebranding",
    eyebrow: "Brand Identity. TerraViva finalist 2025",
    cover: "assets/termoli/12.webp",
    coverAlt: "Termoli rebranding",
    meta: [
      ["Client", "TerraViva Competitions"],
      ["Activities", "Brand Identity Design<br>Logo Design & Development<br>Visual System Creation<br>Color Palette & Typography<br>Brand Guidelines<br>Brand Applications"],
      ["Recognition", "TerraViva, finalist 2025"],
    ],
    links: [{ label: "Competition results", href: "https://www.terravivacompetitions.com/rebranding-termoli-competition-results-2025/" }],
    sections: [
      {
        type: "intro",
        label: "Description",
        lead: `Comprehensive brand guidelines for Termoli, a coastal city rich in ${hl("authenticity, traditions, and everyday life")}.`,
        body: "The project builds a clear and distinctive visual identity that reflects the soul of Termoli: its authenticity, hospitality, and connection to the sea.",
      },
      { type: "image", src: "assets/termoli/1.webp", alt: "Termoli brand guidelines", ratio: "wide" },
      {
        type: "split",
        label: "Context",
        title: "A city that needed its identity made visible.",
        body: [
          "Termoli blends the beauty of its old town and seafront with a vibrant community proud of its roots. More than a tourist destination, it represents the Adriatic spirit: warm, accessible, and rooted in history.",
          "The rebranding was about making that identity legible, visible, memorable, and consistent across every surface it appears on.",
        ],
        src: "assets/termoli/4.webp",
        alt: "Termoli, logo",
        bg: "#fff",
      },
      {
        type: "split",
        label: "Logo",
        title: "Two symbols, one city.",
        body: [
          `The ${hl("seahorse")}, symbol of Termoli's sports teams, carries the city's connection to the sea: a sign of luck, strength, and local pride. The ${hl("Svevo Castle")}, a bold 13th-century fortress, tells the story of Termoli's medieval strength and heritage.`,
          "These two icons became the foundation of the logo, giving it depth and meaning beyond decoration.",
        ],
        src: "assets/termoli/5.webp",
        alt: "Termoli, seahorse and Svevo Castle symbols",
        bg: "#fff",
        reverse: true,
      },
      { type: "image", src: "assets/termoli/3.webp", alt: "Termoli, logo construction", ratio: "wide", bg: "#fff" },
      {
        type: "intro",
        label: "Color",
        lead: "A color system built around the city's themes.",
        body: [
          `Six themed categories, each with its own palette. ${hl("Maritime Identity")} uses Royal Blue and Soft Sky Blue for the sea. ${hl("Historic Center")} uses Sunset and Peach Cream for the old town's stone and warmth.`,
          "Each palette is designed to work independently or together, keeping the system flexible without losing coherence.",
        ],
      },
      {
        type: "gallery",
        items: [
          { src: "assets/termoli/8.webp", alt: "Termoli, color palettes", bg: "#fff" },
          { src: "assets/termoli/9.webp", alt: "Termoli, color palettes", bg: "#fff" },
        ],
      },
      {
        type: "intro",
        label: "Applications",
        lead: "Applications across the city.",
        body: "From posters and signage to city cards, stamps, and merchandise: the visual system was designed to work at every scale and context, creating a coherent presence throughout the city.",
      },
      {
        type: "gallery",
        items: [10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map((n) => ({
          src: `assets/termoli/${n}.webp`,
          alt: "Termoli, brand application",
        })),
      },
    ],
    next: "drype",
  },

  drype: {
    title: "Drype Rebranding",
    eyebrow: "Cocktail Milano Brand Identity. TerraViva finalist 2024",
    cover: "assets/drype/2.webp",
    coverAlt: "Drype rebranding",
    meta: [
      ["Client", "TerraViva Competition"],
      ["Activities", "Brand Identity Design<br>Logo Design & Development<br>Packaging Design<br>Label Customization<br>Website Design & Development<br>Social Media Content"],
      ["Recognition", "TerraViva, finalist 2024"],
    ],
    links: [{ label: "Competition results", href: "https://www.terravivacompetitions.com/drype-logo-competition-results-2024/" }],
    sections: [
      {
        type: "intro",
        label: "Description",
        lead: `Drype turns a glass of water into a ${hl("sustainable cocktail")} by concentrating cocktail flavours into a small bottle.`,
        body: `It cuts ${hl("CO2 emissions")} and simplifies the logistics chain for bars.`,
      },
      { type: "image", src: "assets/drype/1.webp", alt: "Drype, brand identity", ratio: "wide", bg: "#fff" },
      {
        type: "split",
        label: "Brief",
        title: "A brand built around a genuinely new idea.",
        body: [
          `The brief was to build a visual identity that matched the product's ambition: a ${hl("sustainable drinking experience")} that doesn't ask people to compromise on taste. The brand needed to feel fresh, modern, and ingredient-led.`,
          "We explored the values behind the cocktails: creativity, quality, minimalism, and built a visual language that could carry all of them without feeling overdesigned.",
        ],
        src: "assets/drype/3.webp",
        alt: "Drype, concept",
        bg: "#fff",
      },
      {
        type: "split",
        label: "Identity",
        title: "Logo and visual system.",
        body: [
          `The logo combines fluid, organic shapes representing cocktail flavours with modern geometric elements, creating a ${hl("youthful and engaging identity")} that works across bottles, labels, and digital.`,
          `The visual system uses vibrant colors and ${hl("ingredient-inspired illustrations")} to communicate freshness and transparency at every touchpoint.`,
          `The mark is built from three elements. The ${hl('letter "D"')} (drawn in a flowing, rounded style to embody fluidity and a lively character) becomes the container for two negative-space ${hl("drops of different sizes")}, representing ingredient quantities and the act of mixing. A ${hl("small star")} sits alongside it: for cocktails it signals the alcohol component; for non-alcoholic ranges it shifts to represent the hero mocktail ingredient, keeping the mark adaptable across the full product line.`,
        ],
        src: "assets/drype/4.webp",
        alt: "Drype, logo construction",
        reverse: true,
      },
      {
        type: "gallery",
        stack: true,
        items: [
          { src: "assets/drype/5.webp", alt: "Drype, visual system", bg: "#fff" },
          { src: "assets/drype/6.webp", alt: "Drype, bottles" },
          { src: "assets/drype/9.webp", alt: "Drype, illustrations" },
          { src: "assets/drype/11.webp", alt: "Drype, packaging" },
        ],
      },
      {
        type: "split",
        label: "Flavours",
        title: "Each flavor has its own palette.",
        body: [
          `${hl("Clover")} features warm orange tones with raspberry and juniper illustrations. ${hl("Mule")} brings fresh greens for ginger, lime, and mint. Every flavor tells its own ingredient story through color and illustration.`,
          `Packaging uses aluminum bottles and minimal graphics, keeping the environmental impact low while maintaining a ${hl("premium shelf presence")}.`,
        ],
        src: "assets/drype/12.webp",
        alt: "Drype, flavour palettes",
      },
      {
        type: "split",
        label: "Packaging",
        title: "Labels, packaging, and beyond.",
        body: `The label system pairs ${hl("ingredient illustrations")} with clean typography, making each flavor instantly recognizable while keeping the overall range coherent.`,
        src: "assets/drype/13.webp",
        alt: "Drype, labels",
        reverse: true,
      },
      {
        type: "gallery",
        items: [
          { src: "assets/drype/14.webp", alt: "Drype, packaging", ratio: 1500 / 591 },
          { src: "assets/drype/15.webp", alt: "Drype, packaging", ratio: 1328 / 717 },
        ],
      },
      {
        type: "split",
        label: "Digital",
        title: "Digital and social.",
        body: `The website brings the brand's ${hl("vibrant personality online")}, making it easy to explore flavors and build custom cocktail kits. Social content uses bold typography and color to keep the feed consistent and recognizable.`,
        src: "assets/drype/20-1.webp",
        alt: "Drype, website",
      },
      { type: "image", src: "assets/drype/20-2.webp", alt: "Drype, social media content", ratio: "wide" },
    ],
    next: "mediline",
  },
};
