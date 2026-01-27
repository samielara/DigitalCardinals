/**
 * Advanced Knowledge Base - Digital Cardinal
 * A persuasive, in-depth data store for the AI Assistant.
 */

const KNOWLEDGE_BASE = {
  greetings: {
    keywords: ["hello", "hi", "hey", "greetings", "start", "who are you"],
    response:
      "Hello! I'm the Digital Cardinal Strategy Assistant. I'm here to show you how we combine design, engineering, and AI to scale small businesses. <br><br>Would you like to learn about our <b>24/7 AI Agents</b>, our <b>Premium Web Development</b>, or how we dominate <b>SEO</b>?",
  },

  ai_agents: {
    keywords: [
      "ai agent",
      "robot",
      "bot",
      "automation",
      "automate",
      "24/7",
      "lead",
      "qualification",
      "booking",
    ],
    response: `
      <b>What is an AI Agent?</b><br>
      Think of an AI Agent as a tireless, 24/7 digital employee. Unlike basic chatbots that just follow a script, our agents are trained on your specific business data to handle complex interactions.<br><br>
      
      <b>Problems we resolve:</b><br>
      • <b>Missed Leads:</b> Never miss a 2 AM inquiry again. We respond in seconds.<br>
      • <b>Hiring Costs:</b> Get the output of an SDR or CS rep at a fraction of the cost.<br>
      • <b>Lead Quality:</b> Our agents qualify leads by asking the right questions before they even reach your calendar.<br><br>
      
      <b>The Digital Cardinal Edge:</b><br>
      We don't just "install" a bot. We build custom logic that integrates with your CRM and calendar, ensuring a seamless bridge between AI and your human team. <br><br>
      <a href='ai-agents.html' class='text-cyan border-b border-cyan/30 hover:border-cyan'>Explore AI Agent Solutions</a>
    `,
  },

  seo: {
    keywords: [
      "seo",
      "rank",
      "google",
      "search",
      "found",
      "visibility",
      "traffic",
      "leads",
    ],
    response: `
      <b>SEO: More than just keywords.</b><br>
      Most SEO agencies talk about "rankings." We talk about <b>revenue</b>. SEO is the art of showing up precisely when your customer is looking for a solution.<br><br>
      
      <b>Common pain points we fix:</b><br>
      • <b>Invisible Sites:</b> If you aren't on page 1, you don't exist to 90% of your market.<br>
      • <b>High Ad Spend:</b> We build organic authority to reduce your reliance on expensive paid ads.<br>
      • <b>Bad Traffic:</b> We target "buyer-intent" keywords, not just random visitors.<br><br>
      
      <b>Why we're the best:</b><br>
      We combine technical "under-the-hood" cleanup with local SEO dominance and a content roadmap that positions you as the authority in your niche. <br><br>
      <a href='seo.html' class='text-cyan border-b border-cyan/30 hover:border-cyan'>Dominate Search Results</a>
    `,
  },

  web_dev: {
    keywords: [
      "web",
      "website",
      "design",
      "development",
      "code",
      "dev",
      "site",
      "custom",
      "portal",
    ],
    response: `
      <b>Premium Web Engineering</b><br>
      A website is your 24/7 storefront. If it's slow, generic, or confusing, you are losing money every single minute.<br><br>
      
      <b>The Problems we solve:</b><br>
      • <b>Low Conversion:</b> We use design-first UI/UX to lead customers directly to your "Buy" or "Book" button.<br>
      • <b>Technical Debt:</b> No generic templates. We build high-performance systems using .NET Core and modern JS.<br>
      • <b>Scaling Issues:</b> Our sites are built to handle traffic spikes and complex backend needs like client portals.<br><br>
      
      <b>The Best in the Business:</b><br>
      Digital Cardinal delivers agency-level strategy without the agency bloat. You get direct access to engineers who build for growth. <br><br>
      <a href='web-development.html' class='text-cyan border-b border-cyan/30 hover:border-cyan'>Build Your Digital Storefront</a>
    `,
  },

  ads: {
    keywords: [
      "ads",
      "advertising",
      "google ads",
      "meta",
      "facebook",
      "instagram",
      "marketing",
      "campaign",
      "roi",
    ],
    response: `
      <b>High-ROI Digital Ads</b><br>
      Digital advertising is a gamble if you don't have the right tracking. We turn it into a predictable math equation for your business.<br><br>
      
      <b>Stop Wasting Budget on:</b><br>
      • <b>Vanity Metrics:</b> We don't care about "likes." We care about <i>qualified calls</i>.<br>
      • <b>Random Clicks:</b> We use hyper-local targeting and intent-based keywords.<br>
      • <b>Stale Creative:</b> We continuously optimize your ads to keep your cost-per-lead as low as possible.<br><br>
      <a href='digital-ads.html' class='text-cyan border-b border-cyan/30 hover:border-cyan'>Start Scaling with Ads</a>
    `,
  },

  pricing: {
    keywords: [
      "price",
      "cost",
      "package",
      "how much",
      "rate",
      "quote",
      "money",
    ],
    response: `
      <b>Investment for Growth</b><br>
      We don't offer generic "flat fees." We offer performance-based packages designed to fit your current stage of growth.<br><br>
      
      • <b>Launch:</b> For startups needing a solid foundation.<br>
      • <b>Growth:</b> SEO + Ads to scale your lead flow.<br>
      • <b>Elite:</b> The full digital suite including custom AI Agents.<br><br>
      <a href='packages.html' class='text-cyan border-b border-cyan/30 hover:border-cyan'>View Detailed Packages</a>
    `,
  },

  general_help: {
    keywords: [
      "how can you help",
      "what do you do",
      "services",
      "offer",
      "help me",
    ],
    response: `
      <b>How Digital Cardinal Transforms Your Business:</b><br>
      We specialize in turning local businesses into digital leaders. Here is exactly how we help you scale:<br><br>
      
      • <b>Automate Communication:</b> Our <b>AI Agents</b> handle your leads 24/7 so you never miss a sale.<br>
      • <b>Dominate Search:</b> Our <b>SEO</b> strategies put you in front of customers exactly when they are ready to buy.<br>
      • <b>Scale Fast:</b> Our <b>Digital Ads</b> deliver a predictable flow of qualified leads every month.<br>
      • <b>Professional Presence:</b> Our <b>Web Development</b> ensures your first impression is premium and high-converting.<br><br>
      
      Which of these pillars would you like to strengthen first?
    `,
  },

  contact: {
    keywords: [
      "contact",
      "email",
      "phone",
      "call",
      "reach",
      "talk",
      "human",
      "consultation",
      "discuss",
    ],
    response:
      "Ready to take your business to the next level? You can reach our strategy team at <a href='mailto:contact@digitalcardinals.com' class='text-cardinal-glow font-bold'>contact@digitalcardinals.com</a> or book a direct consultation through our <a href='contact.html' class='text-cardinal-glow font-bold'>Contact Page</a>. <br><br>We usually respond within 2 hours during business days.",
  },

  default: {
    response:
      "I'm here to help you scale your business! I can give you detailed insights on our <b>AI Agents</b>, <b>SEO strategy</b>, <b>High-ROI Ads</b>, or <b>Premium Web Development</b>. <br><br>What would you like to discuss first?",
  },
};
