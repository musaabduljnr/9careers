"""
Nigeria Career Insights Data Module
====================================
Curated, research-backed data on Nigeria's job market across 7 key industries.
Sources: NBS Labour Force Reports, Jobberman Salary Index, PwC Nigeria Talent Survey,
         LinkedIn Emerging Jobs Nigeria, Glassdoor NG estimates (2024-2025).

Data structure per industry:
  - in_demand_skills: skills with demand level and trend
  - salary_ranges: NGN and USD ranges by seniority
  - top_employers: leading hirers in Nigeria
  - certifications: recommended certs with cost guidance
  - visa_friendly_roles: roles with strong visa pathway potential
  - job_search_tips: Nigeria-specific insider tips
"""

from typing import Dict, Any, List

NIGERIA_CAREER_INSIGHTS: Dict[str, Any] = {
    "fintech": {
        "id": "fintech",
        "name": "Fintech",
        "tagline": "Africa's fastest-growing tech sector",
        "description": (
            "Nigeria's fintech ecosystem is the largest in Africa, valued at over $600M. "
            "Lagos is home to unicorns like Flutterwave and Paystack (acquired by Stripe). "
            "The sector is driven by financial inclusion goals — over 40% of Nigerians remain unbanked. "
            "Demand for engineering, product, and data talent is extremely high."
        ),
        "market_size": "$600M+ ecosystem",
        "talent_demand": "Very High",
        "growth_outlook": "↑ Explosive (35% YoY headcount growth)",
        "color": "emerald",
        "in_demand_skills": [
            {"skill": "Python (Django/FastAPI)", "demand": "Very High", "trend": "rising", "note": "Core for backend APIs and data pipelines"},
            {"skill": "React / Next.js", "demand": "Very High", "trend": "rising", "note": "Most fintech frontends are React-based"},
            {"skill": "Node.js", "demand": "High", "trend": "stable", "note": "Widely used in payment APIs and microservices"},
            {"skill": "PostgreSQL / MySQL", "demand": "High", "trend": "stable", "note": "Primary databases for transaction records"},
            {"skill": "AWS / GCP Cloud", "demand": "High", "trend": "rising", "note": "Paystack, Flutterwave on AWS"},
            {"skill": "Cybersecurity / PCI-DSS", "demand": "Very High", "trend": "rising", "note": "CBN mandates strict data security compliance"},
            {"skill": "Kotlin / Swift (Mobile)", "demand": "High", "trend": "rising", "note": "Mobile-first financial products dominate"},
            {"skill": "Data Science / ML", "demand": "High", "trend": "rising", "note": "Fraud detection and credit scoring"},
            {"skill": "Product Management", "demand": "Very High", "trend": "rising", "note": "Strong PMF culture, very few good PMs"},
            {"skill": "DevOps / Kubernetes", "demand": "Medium", "trend": "rising", "note": "Scale-up phase driving infrastructure demand"},
            {"skill": "Blockchain / Web3", "demand": "Medium", "trend": "volatile", "note": "Active but regulatory uncertainty from CBN"},
            {"skill": "API Integration", "demand": "Very High", "trend": "stable", "note": "USSD, Interswitch, Remita integrations"},
        ],
        "salary_ranges": {
            "Junior Engineer (0-2 yrs)": {"ngn_min": 1_200_000, "ngn_max": 2_400_000, "usd_remote": None},
            "Mid-level Engineer (2-5 yrs)": {"ngn_min": 2_400_000, "ngn_max": 5_000_000, "usd_remote": None},
            "Senior Engineer (5+ yrs)": {"ngn_min": 5_000_000, "ngn_max": 10_000_000, "usd_remote": None},
            "Engineering Manager": {"ngn_min": 9_000_000, "ngn_max": 18_000_000, "usd_remote": None},
            "Product Manager": {"ngn_min": 4_000_000, "ngn_max": 12_000_000, "usd_remote": None},
            "Remote (International)": {"ngn_min": None, "ngn_max": None, "usd_remote": (60_000, 180_000)},
        },
        "top_employers": [
            {"name": "Paystack", "note": "Stripe-owned, strong benefits"},
            {"name": "Flutterwave", "note": "Unicorn, rapid expansion"},
            {"name": "Moniepoint", "note": "Fastest-growing SME bank in Africa"},
            {"name": "OPay", "note": "Chinese-backed, strong mobile focus"},
            {"name": "Cowrywise", "note": "Investment & savings platform"},
            {"name": "Carbon (OneFi)", "note": "Digital lending"},
            {"name": "TeamApt / Moniepoint", "note": "Merchant payments"},
            {"name": "Piggyvest", "note": "Savings, strong product culture"},
        ],
        "certifications": [
            {"name": "AWS Certified Developer – Associate", "relevance": "Very High", "cost_usd": 300, "provider": "Amazon", "note": "Most fintech hiring managers expect cloud knowledge"},
            {"name": "Google Cloud Professional Data Engineer", "relevance": "High", "cost_usd": 200, "provider": "Google", "note": "GCP commonly used for analytics workloads"},
            {"name": "Certified Information Systems Security Professional (CISSP)", "relevance": "High", "cost_usd": 699, "provider": "ISC²", "note": "Critical for security roles — CBN compliance"},
            {"name": "Product Management Certification (PMC)", "relevance": "High", "cost_usd": 500, "provider": "Product School", "note": "Top PMs in Nigeria commonly hold this"},
            {"name": "Kubernetes Application Developer (CKAD)", "relevance": "Medium", "cost_usd": 395, "provider": "CNCF", "note": "Container orchestration is maturing in Lagos fintechs"},
        ],
        "visa_friendly_roles": [
            {"role": "Senior Software Engineer", "countries": ["UK", "Canada", "Germany", "Netherlands"], "visa_types": ["Global Talent (UK)", "Express Entry (CA)", "EU Blue Card"], "notes": "Tech shortage worldwide means very strong visa success rate for 5+ yr experienced engineers"},
            {"role": "Product Manager", "countries": ["UK", "USA", "Canada"], "visa_types": ["Global Talent (UK)", "H-1B (USA)", "Express Entry (CA)"], "notes": "Nigeria fintech PM experience is globally respected"},
            {"role": "Data Scientist", "countries": ["Germany", "Netherlands", "UK", "UAE"], "visa_types": ["EU Blue Card", "Global Talent (UK)", "Golden Visa (UAE)"], "notes": "High demand for ML/AI talent globally"},
        ],
        "job_search_tips": [
            "Apply directly on company career pages — Paystack, Flutterwave, and Moniepoint hire aggressively without agencies.",
            "LinkedIn is the #1 platform for fintech roles. Optimize your profile with keywords like 'payment APIs', 'PCI-DSS', 'distributed systems'.",
            "Open-source contributions dramatically increase your chances at engineering-led companies like Paystack.",
            "For remote roles, target YC-backed startups that have a global-remote-first culture.",
            "Build and showcase a side project that integrates a Nigerian payment gateway (Paystack/Flutterwave) — this resonates deeply with hiring managers.",
        ],
    },

    "oil_gas": {
        "id": "oil_gas",
        "name": "Oil & Gas",
        "tagline": "Nigeria's largest export sector",
        "description": (
            "Nigeria is Africa's largest oil producer, with an estimated 37 billion barrels of proven reserves. "
            "The sector employs over 250,000 people directly. NNPCL's transition to a commercial entity and the "
            "Petroleum Industry Act (PIA 2021) are reshaping the talent landscape toward commercial and technical roles. "
            "The shift to deepwater, LNG, and indigenous company operations is creating new opportunities."
        ),
        "market_size": "$46B+ annual revenue",
        "talent_demand": "High",
        "growth_outlook": "→ Stable with PIA-driven restructuring",
        "color": "amber",
        "in_demand_skills": [
            {"skill": "Petroleum Engineering", "demand": "Very High", "trend": "stable", "note": "Core discipline — always in demand"},
            {"skill": "Subsurface / Geoscience", "demand": "High", "trend": "stable", "note": "Reservoir characterization and seismic interpretation"},
            {"skill": "HSE (Health, Safety & Environment)", "demand": "Very High", "trend": "rising", "note": "Mandatory for all field and offshore roles"},
            {"skill": "Pipeline Engineering", "demand": "High", "trend": "rising", "note": "Infrastructure rehabilitation is a government priority"},
            {"skill": "Project Management (PMP)", "demand": "Very High", "trend": "rising", "note": "IOCs and indigenous companies demand PMPs"},
            {"skill": "Corrosion Engineering", "demand": "High", "trend": "stable", "note": "Aging infrastructure creates consistent demand"},
            {"skill": "Data Analytics / Petrel", "demand": "High", "trend": "rising", "note": "Schlumberger's Petrel is industry standard"},
            {"skill": "Commercial / Contracts Law", "demand": "High", "trend": "rising", "note": "PIA created massive demand for energy lawyers and commercial advisors"},
            {"skill": "Drilling Engineering", "demand": "High", "trend": "stable", "note": "Offshore deepwater drilling resurgence"},
            {"skill": "Mechanical Engineering", "demand": "High", "trend": "stable", "note": "Upstream and midstream maintenance roles"},
        ],
        "salary_ranges": {
            "Graduate Engineer (0-2 yrs)": {"ngn_min": 2_400_000, "ngn_max": 4_800_000, "usd_remote": None},
            "Engineer II (2-5 yrs)": {"ngn_min": 4_800_000, "ngn_max": 9_600_000, "usd_remote": None},
            "Senior Engineer (5-10 yrs)": {"ngn_min": 9_600_000, "ngn_max": 18_000_000, "usd_remote": None},
            "Principal / Lead Engineer": {"ngn_min": 18_000_000, "ngn_max": 36_000_000, "usd_remote": None},
            "Offshore (Premium)": {"ngn_min": 24_000_000, "ngn_max": 60_000_000, "usd_remote": None},
        },
        "top_employers": [
            {"name": "NNPCL (NNPC Ltd)", "note": "Largest employer, now commercial entity"},
            {"name": "Shell Petroleum (SPDC)", "note": "Major IOC, strong graduate programme"},
            {"name": "TotalEnergies", "note": "Deepwater specialist"},
            {"name": "Chevron Nigeria", "note": "Strong expat compensation packages"},
            {"name": "Seplat Energy", "note": "Indigenous company, fast-growing"},
            {"name": "Oando PLC", "note": "Pan-African energy, locally listed"},
            {"name": "Eroton Exploration", "note": "Emerging indigenous player"},
            {"name": "Schlumberger (SLB)", "note": "Top oilfield services, global exposure"},
        ],
        "certifications": [
            {"name": "Project Management Professional (PMP)", "relevance": "Very High", "cost_usd": 555, "provider": "PMI", "note": "Gold standard for project managers in oil & gas"},
            {"name": "NEBOSH International General Certificate", "relevance": "Very High", "cost_usd": 400, "provider": "NEBOSH", "note": "Required by most IOCs for HSE roles"},
            {"name": "COREN (Council for the Regulation of Engineering in Nigeria)", "relevance": "Very High", "cost_usd": 50, "provider": "COREN Nigeria", "note": "Mandatory for practicing engineers in Nigeria"},
            {"name": "Chartered Engineer (IChemE / IMechE)", "relevance": "High", "cost_usd": 300, "provider": "UK Institutions", "note": "Accelerates visa applications and IOC senior roles"},
            {"name": "Well Control (IWCF)", "relevance": "High", "cost_usd": 600, "provider": "IWCF", "note": "Mandatory for drilling engineers and rig supervisors"},
        ],
        "visa_friendly_roles": [
            {"role": "Petroleum Engineer", "countries": ["UK", "UAE", "Saudi Arabia", "USA", "Canada"], "visa_types": ["Skilled Worker (UK)", "UAE Work Permit", "H-1B (USA)", "Express Entry (CA)"], "notes": "One of the most globally portable engineering disciplines"},
            {"role": "HSE Manager", "countries": ["UAE", "Saudi Arabia", "UK", "Australia"], "visa_types": ["UAE Work Permit", "Skilled Worker (UK)", "TSS (AU)"], "notes": "NEBOSH + 5+ years experience is a fast-track to Gulf states"},
            {"role": "Reservoir Engineer", "countries": ["UK", "Norway", "Netherlands", "USA"], "visa_types": ["Global Talent (UK)", "EU Blue Card", "H-1B (USA)"], "notes": "Norway and Netherlands actively recruit petroleum engineers"},
        ],
        "job_search_tips": [
            "Register on NNPCL's career portal and set up alerts. They run graduate trainee schemes annually.",
            "Jobberman, MyJobMag, and EnergyJobline.com are the top platforms for O&G roles in Nigeria.",
            "Shell and TotalEnergies recruit heavily from University of Port Harcourt, FUTA, and UNILAG engineering departments.",
            "Join the Nigerian Association of Petroleum Explorationists (NAPE) — it's the best networking body for upstream roles.",
            "COREN registration is non-negotiable for senior technical roles. If you don't have it, prioritise it immediately.",
        ],
    },

    "telecom": {
        "id": "telecom",
        "name": "Telecom",
        "tagline": "Connecting 220 million Nigerians",
        "description": (
            "Nigeria's telecom sector is one of Africa's largest, with MTN, Airtel, Glo, and 9mobile serving over 220 million subscribers. "
            "The NCC's push for 5G rollout, broadband penetration targets, and the emergence of tower companies (IHS Towers) are creating "
            "strong demand for network, IT, and commercial talent. IHS Towers — the world's largest independent tower company — is headquartered in Lagos."
        ),
        "market_size": "$8B+ annual revenue",
        "talent_demand": "High",
        "growth_outlook": "↑ Growing (5G rollout + broadband expansion)",
        "color": "blue",
        "in_demand_skills": [
            {"skill": "Network Engineering (LTE/5G)", "demand": "Very High", "trend": "rising", "note": "5G rollout creating massive demand across all MNOs"},
            {"skill": "RF Planning & Optimization", "demand": "High", "trend": "stable", "note": "Core skill for all network operators"},
            {"skill": "Telecoms Billing Systems (Amdocs)", "demand": "High", "trend": "stable", "note": "Amdocs, Comverse are widely deployed in Nigeria"},
            {"skill": "VoIP / SIP Engineering", "demand": "Medium", "trend": "stable", "note": "Important for enterprise comms"},
            {"skill": "IT Infrastructure (CCNA/CCNP)", "demand": "Very High", "trend": "rising", "note": "Cisco certifications are industry standard"},
            {"skill": "Cybersecurity", "demand": "High", "trend": "rising", "note": "NCC mandates strict telecom security standards"},
            {"skill": "Data Analytics / BI", "demand": "High", "trend": "rising", "note": "Network analytics, customer churn prediction"},
            {"skill": "Project Management", "demand": "High", "trend": "stable", "note": "Tower rollout and network expansion projects"},
            {"skill": "Fibre Optic Technology", "demand": "Very High", "trend": "rising", "note": "Last-mile connectivity is a national priority"},
            {"skill": "Python / Automation", "demand": "Medium", "trend": "rising", "note": "Network automation increasingly adopted"},
        ],
        "salary_ranges": {
            "Graduate Trainee (0-2 yrs)": {"ngn_min": 1_800_000, "ngn_max": 3_000_000, "usd_remote": None},
            "Engineer (2-5 yrs)": {"ngn_min": 3_000_000, "ngn_max": 6_000_000, "usd_remote": None},
            "Senior Engineer (5+ yrs)": {"ngn_min": 6_000_000, "ngn_max": 12_000_000, "usd_remote": None},
            "Technical Manager": {"ngn_min": 12_000_000, "ngn_max": 24_000_000, "usd_remote": None},
            "Regional Director": {"ngn_min": 24_000_000, "ngn_max": 48_000_000, "usd_remote": None},
        },
        "top_employers": [
            {"name": "MTN Nigeria", "note": "Largest MNO, listed on NGX, strong L&D"},
            {"name": "Airtel Nigeria", "note": "Pan-African operator, competitive packages"},
            {"name": "IHS Towers", "note": "World's largest tower company, HQ in Lagos"},
            {"name": "Globacom (Glo)", "note": "Indigenous MNO, submarine cable operator"},
            {"name": "9mobile", "note": "Niche positions, enterprise focus"},
            {"name": "Ericsson Nigeria", "note": "Network vendor, global exposure"},
            {"name": "Nokia (Nigeria ops)", "note": "5G rollout partner"},
        ],
        "certifications": [
            {"name": "Cisco CCNA", "relevance": "Very High", "cost_usd": 330, "provider": "Cisco", "note": "Entry-level requirement for most network roles"},
            {"name": "Cisco CCNP Enterprise", "relevance": "Very High", "cost_usd": 400, "provider": "Cisco", "note": "Required for senior network engineering positions"},
            {"name": "Ericsson Certified Associate (5G)", "relevance": "High", "cost_usd": 250, "provider": "Ericsson", "note": "Specific to 5G deployment roles with Ericsson/MTN"},
            {"name": "PRINCE2 Foundation", "relevance": "High", "cost_usd": 350, "provider": "Axelos", "note": "Preferred project management framework in telecoms"},
            {"name": "CompTIA Network+", "relevance": "Medium", "cost_usd": 338, "provider": "CompTIA", "note": "Good entry-level foundation before CCNA"},
        ],
        "visa_friendly_roles": [
            {"role": "Network Engineer (5G)", "countries": ["UK", "Germany", "UAE", "Saudi Arabia"], "visa_types": ["Skilled Worker (UK)", "EU Blue Card", "UAE Work Permit"], "notes": "5G engineers are globally scarce — very strong demand across Europe and Gulf"},
            {"role": "RF Optimization Engineer", "countries": ["UK", "Ireland", "UAE", "Canada"], "visa_types": ["Skilled Worker (UK)", "Critical Skills (IE)", "Express Entry (CA)"], "notes": "Specialist skill with international transferability"},
        ],
        "job_search_tips": [
            "MTN, Airtel, and IHS Towers all run structured graduate trainee programmes — apply early in the year.",
            "LinkedIn is essential — follow telecom recruiters in Nigeria and engage with MTN/IHS posts.",
            "Get your CCNA before applying — it's non-negotiable for most network roles at MNOs.",
            "Experience with Huawei network equipment is a huge plus, as Huawei is MTN Nigeria's primary vendor.",
            "Consider roles at tower companies (IHS, American Tower) for faster career progression and global exposure.",
        ],
    },

    "government": {
        "id": "government",
        "name": "Government & Public Sector",
        "tagline": "Civil service, MDAs & public institutions",
        "description": (
            "Nigeria's public sector employs over 1.2 million federal civil servants across 800+ MDAs (Ministries, Departments & Agencies). "
            "While traditionally slow-moving, the Tinubu administration's push for digitisation, the IPPIS payroll reform, and growing investments "
            "in e-government services are creating demand for tech-savvy professionals. Agencies like NITDA, NCC, and FIRS offer better remuneration than traditional civil service."
        ),
        "market_size": "1.2M+ federal employees",
        "talent_demand": "Medium",
        "growth_outlook": "→ Restructuring (digitisation driving tech roles)",
        "color": "slate",
        "in_demand_skills": [
            {"skill": "Public Administration / Policy", "demand": "High", "trend": "stable", "note": "Core for MDA generalist roles"},
            {"skill": "IT / Systems Administration", "demand": "High", "trend": "rising", "note": "Digitisation of government services driving demand"},
            {"skill": "Data Analysis (Excel/Power BI)", "demand": "Very High", "trend": "rising", "note": "Budget analysis and M&E roles heavily use Excel and Power BI"},
            {"skill": "Legal / Regulatory Affairs", "demand": "High", "trend": "stable", "note": "Regulatory agencies (NCC, CBN, SEC) need lawyers"},
            {"skill": "Procurement (CIPS)", "demand": "High", "trend": "stable", "note": "BPP (Bureau of Public Procurement) regulated — CIPS valued"},
            {"skill": "Project Management (PMP)", "demand": "High", "trend": "rising", "note": "World Bank and donor-funded projects require PMPs"},
            {"skill": "Finance / Accounting (ICAN)", "demand": "Very High", "trend": "stable", "note": "ICAN is the gold standard for finance roles in government"},
            {"skill": "Cybersecurity", "demand": "High", "trend": "rising", "note": "NITDA driving public sector cybersecurity mandate"},
            {"skill": "Environmental Science", "demand": "Medium", "trend": "stable", "note": "NESREA and state environmental agencies"},
            {"skill": "Community Development", "demand": "Medium", "trend": "stable", "note": "Social investment programmes, IDP camps, rural development"},
        ],
        "salary_ranges": {
            "Grade Level 08-09 (Graduate Entry)": {"ngn_min": 600_000, "ngn_max": 1_200_000, "usd_remote": None},
            "Grade Level 10-12 (Mid-level)": {"ngn_min": 1_200_000, "ngn_max": 2_400_000, "usd_remote": None},
            "Grade Level 13-15 (Senior)": {"ngn_min": 2_400_000, "ngn_max": 4_800_000, "usd_remote": None},
            "Grade Level 16-17 (Director)": {"ngn_min": 4_800_000, "ngn_max": 9_600_000, "usd_remote": None},
            "MDA Tech Specialist Roles": {"ngn_min": 3_600_000, "ngn_max": 9_600_000, "usd_remote": None},
        },
        "top_employers": [
            {"name": "NITDA", "note": "National IT Development Agency — tech-focused"},
            {"name": "CBN (Central Bank of Nigeria)", "note": "Best-paying government employer"},
            {"name": "FIRS (Federal Inland Revenue)", "note": "Strong tech and finance talent demand"},
            {"name": "NCC (Nigerian Communications Commission)", "note": "Telecom regulator, specialist roles"},
            {"name": "SEC Nigeria", "note": "Capital markets regulator"},
            {"name": "PENCOM", "note": "Pension regulator, finance and actuarial roles"},
            {"name": "National Assembly (NASS)", "note": "Legislative support roles"},
        ],
        "certifications": [
            {"name": "ICAN (Institute of Chartered Accountants Nigeria)", "relevance": "Very High", "cost_usd": 200, "provider": "ICAN Nigeria", "note": "Non-negotiable for finance and accounting in public sector"},
            {"name": "CIPM (Chartered Institute of Personnel Management)", "relevance": "High", "cost_usd": 150, "provider": "CIPM Nigeria", "note": "Mandatory for HR/admin cadre in MDAs"},
            {"name": "CIPS (Chartered Institute of Procurement & Supply)", "relevance": "High", "cost_usd": 400, "provider": "CIPS UK", "note": "BPP-recognised — valued in all government procurement units"},
            {"name": "PMP (Project Management Professional)", "relevance": "High", "cost_usd": 555, "provider": "PMI", "note": "Essential for World Bank and ADB project management roles"},
            {"name": "NITDA e-Government Certification", "relevance": "Medium", "cost_usd": 50, "provider": "NITDA Nigeria", "note": "Specifically for MDA digital transformation roles"},
        ],
        "visa_friendly_roles": [
            {"role": "Development / Aid Sector Professional", "countries": ["UK", "USA", "UN postings"], "visa_types": ["Skilled Worker (UK)", "J-1 (USA)", "UN P-grade contracts"], "notes": "Public sector experience in Nigeria is highly valued by UN agencies, World Bank, and INGOs"},
            {"role": "Policy Analyst / Economist", "countries": ["UK", "Canada", "USA", "World Bank/IMF"], "visa_types": ["Global Talent (UK)", "Express Entry (CA)", "G-4 (UN/WB)"], "notes": "Nigerian economists from CBN/Finance Ministry are sought by global institutions"},
        ],
        "job_search_tips": [
            "Monitor the Federal Civil Service Commission (FCSC) website for vacancy announcements — many are published for only 2 weeks.",
            "CBN and FIRS are the best-paying agencies — their entrance exams are competitive; use past questions to prepare.",
            "Consider International NGOs and development organisations (USAID, FCDO, UN) which operate in Nigeria with government-adjacent work and better pay.",
            "ICAN and CIPM are the two certifications with the most direct impact on career progression in the civil service.",
            "Senate and House Committee Staff roles are often posted via party links — network within your constituency.",
        ],
    },

    "banking": {
        "id": "banking",
        "name": "Banking & Finance",
        "tagline": "Powering Nigeria's formal economy",
        "description": (
            "Nigeria's banking sector is regulated by the CBN and comprises 24 licensed commercial banks. "
            "With Nigeria's recapitalisation exercise (2024-2026), banks are raising capital and hiring aggressively "
            "for risk, compliance, and tech roles. The top-tier banks (GTCO, Zenith, Access, UBA) are pan-African "
            "institutions with presence in 20+ countries — creating significant regional career opportunities."
        ),
        "market_size": "₦140T+ total banking assets",
        "talent_demand": "High",
        "growth_outlook": "↑ Growing (recapitalisation driving new hiring)",
        "color": "indigo",
        "in_demand_skills": [
            {"skill": "Credit Analysis / Risk Management", "demand": "Very High", "trend": "rising", "note": "CBN's recapitalisation stress-testing demands strong credit analysts"},
            {"skill": "Compliance & AML (Anti-Money Laundering)", "demand": "Very High", "trend": "rising", "note": "EFCC and CBN compliance pressure at all-time high"},
            {"skill": "Investment Banking / Capital Markets", "demand": "High", "trend": "rising", "note": "Recapitalisation exercise driving investment banking mandates"},
            {"skill": "Retail Banking / SME Banking", "demand": "High", "trend": "stable", "note": "Financial inclusion targets drive SME banking growth"},
            {"skill": "Digital Banking / Core Banking Systems", "demand": "Very High", "trend": "rising", "note": "Temenos, Finacle, and T24 are widely deployed"},
            {"skill": "Treasury / FX Management", "demand": "High", "trend": "rising", "note": "Naira volatility makes treasury experts extremely valuable"},
            {"skill": "Data Analysis / Power BI", "demand": "High", "trend": "rising", "note": "Banks are investing heavily in data-driven decision-making"},
            {"skill": "Relationship Management", "demand": "High", "trend": "stable", "note": "Corporate banking relationship managers always in demand"},
            {"skill": "Financial Modelling (Excel/DCF)", "demand": "High", "trend": "stable", "note": "Critical for corporate finance and investment banking"},
            {"skill": "Cybersecurity / Fraud Prevention", "demand": "Very High", "trend": "rising", "note": "Card fraud and cybercrime are the sector's top threats"},
        ],
        "salary_ranges": {
            "Graduate Trainee / Analyst (0-2 yrs)": {"ngn_min": 1_800_000, "ngn_max": 3_600_000, "usd_remote": None},
            "Officer (2-4 yrs)": {"ngn_min": 3_600_000, "ngn_max": 6_000_000, "usd_remote": None},
            "Senior Officer / Manager (4-7 yrs)": {"ngn_min": 6_000_000, "ngn_max": 12_000_000, "usd_remote": None},
            "AGM / Deputy Manager": {"ngn_min": 12_000_000, "ngn_max": 24_000_000, "usd_remote": None},
            "GM / Executive Director": {"ngn_min": 36_000_000, "ngn_max": 120_000_000, "usd_remote": None},
        },
        "top_employers": [
            {"name": "GTBank (GTCO)", "note": "Premium employer — highly competitive process"},
            {"name": "Zenith Bank", "note": "Strong risk and treasury teams"},
            {"name": "Access Bank", "note": "Pan-African expansion, aggressive hiring"},
            {"name": "UBA (United Bank for Africa)", "note": "Largest African bank by presence (20+ countries)"},
            {"name": "First Bank of Nigeria", "note": "Oldest bank — strong corporate banking"},
            {"name": "Stanbic IBTC", "note": "Standard Bank subsidiary, investment banking"},
            {"name": "Citibank Nigeria", "note": "Global bank, best-in-class for international exposure"},
        ],
        "certifications": [
            {"name": "ICAN (Institute of Chartered Accountants Nigeria)", "relevance": "Very High", "cost_usd": 200, "provider": "ICAN", "note": "Gold standard for finance roles in Nigerian banks"},
            {"name": "CFA (Chartered Financial Analyst)", "relevance": "Very High", "cost_usd": 1_000, "provider": "CFA Institute", "note": "Top pick for investment banking, treasury, and portfolio management"},
            {"name": "ACI Dealing Certificate (ACIFC)", "relevance": "High", "cost_usd": 400, "provider": "ACI Financial Markets", "note": "Preferred certification for FX dealers and treasury officers"},
            {"name": "ACIB (Associate of the Chartered Institute of Bankers)", "relevance": "Very High", "cost_usd": 150, "provider": "CIBN Nigeria", "note": "Mandatory for career progression at many Nigerian banks"},
            {"name": "CAMS (Certified AML Specialist)", "relevance": "High", "cost_usd": 1_595, "provider": "ACAMS", "note": "Critical for compliance and AML roles — CBN requirement for some positions"},
        ],
        "visa_friendly_roles": [
            {"role": "Investment Banker / Analyst", "countries": ["UK", "USA", "UAE", "South Africa"], "visa_types": ["Skilled Worker (UK)", "H-1B (USA)", "UAE Work Permit"], "notes": "Nigerian banking analysts with CFA are highly sought by London and UAE-based banks"},
            {"role": "Compliance / AML Officer", "countries": ["UK", "UAE", "Canada"], "visa_types": ["Skilled Worker (UK)", "UAE Work Permit", "Express Entry (CA)"], "notes": "CAMS certification significantly boosts visa sponsorship chances"},
            {"role": "Credit Risk Analyst", "countries": ["UK", "Germany", "Canada"], "visa_types": ["Skilled Worker (UK)", "EU Blue Card", "Express Entry (CA)"], "notes": "Nigerian bank credit experience is transferable, especially at European subsidiaries of GTBank/UBA"},
        ],
        "job_search_tips": [
            "GTBank, Zenith, and Access Bank post graduate trainee applications in Q1 (January-March) each year. Set reminders.",
            "The CIBN examination is career-defining in banking — do not neglect it even if your bank doesn't immediately require it.",
            "Network on LinkedIn with bankers who share 'career journey' posts — they often share their application tips and internal referral info.",
            "UBA's pan-African presence (Ghana, UK, USA, France) makes it an excellent springboard for international relocation.",
            "For investment banking specifically, Coronation Merchant Bank, FSDH, and Stanbic IBTC recruit more specifically than commercial banks.",
        ],
    },

    "healthcare": {
        "id": "healthcare",
        "name": "Healthcare",
        "tagline": "Serving 220 million people",
        "description": (
            "Nigeria's healthcare sector serves the world's most populous Black nation yet remains severely underfunded. "
            "The Japa phenomenon (mass emigration of doctors and nurses) has created critical shortages domestically, "
            "but this paradoxically makes remaining Nigerian healthcare professionals extremely valuable to private hospitals. "
            "The private healthcare sector (Eko Hospitals, LASUTH privatisations) and health-tech startups (mDoc, Helium Health) "
            "represent the most promising opportunities."
        ),
        "market_size": "₦500B+ private healthcare market",
        "talent_demand": "Very High (critical shortage)",
        "growth_outlook": "↑ Critical shortage driving premium compensation",
        "color": "rose",
        "in_demand_skills": [
            {"skill": "Clinical Medicine (MBBS + postgraduate)", "demand": "Very High", "trend": "rising", "note": "Severe doctor shortage in Nigeria — private hospitals paying significant premiums"},
            {"skill": "Nursing (RN + midwifery)", "demand": "Very High", "trend": "rising", "note": "Nurse emigration has created acute shortages at public and private hospitals"},
            {"skill": "Pharmacy (B.Pharm)", "demand": "High", "trend": "stable", "note": "Community pharmacy is a strong entrepreneurship pathway"},
            {"skill": "Medical Laboratory Science", "demand": "High", "trend": "stable", "note": "Diagnostic labs are rapidly expanding in Lagos and Abuja"},
            {"skill": "Health Informatics / EMR Systems", "demand": "Very High", "trend": "rising", "note": "Helium Health EMR is widely deployed — HIS skills are critical"},
            {"skill": "Physiotherapy", "demand": "High", "trend": "rising", "note": "Growing demand for rehabilitation services post-COVID"},
            {"skill": "Public Health (MPH)", "demand": "High", "trend": "rising", "note": "NCDC and WHO Nigeria actively recruit public health professionals"},
            {"skill": "Mental Health / Psychiatry", "demand": "High", "trend": "rising", "note": "Severely underserved sector with growing awareness"},
            {"skill": "Biomedical Engineering", "demand": "Medium", "trend": "rising", "note": "Equipment maintenance for the growing private hospital sector"},
            {"skill": "Health Data Analytics", "demand": "Medium", "trend": "rising", "note": "NGOs, USAID, and PEPFAR programmes need health data analysts"},
        ],
        "salary_ranges": {
            "House Officer / Intern Nurse": {"ngn_min": 600_000, "ngn_max": 1_200_000, "usd_remote": None},
            "Medical Officer (post-NYSC)": {"ngn_min": 2_400_000, "ngn_max": 4_800_000, "usd_remote": None},
            "Senior Registrar / Specialist": {"ngn_min": 4_800_000, "ngn_max": 12_000_000, "usd_remote": None},
            "Consultant (Private Hospital)": {"ngn_min": 12_000_000, "ngn_max": 36_000_000, "usd_remote": None},
            "Health Informatics Specialist": {"ngn_min": 3_600_000, "ngn_max": 9_000_000, "usd_remote": None},
        },
        "top_employers": [
            {"name": "Eko Hospitals", "note": "Largest private hospital group in West Africa"},
            {"name": "Lagoon Hospitals", "note": "Premium private hospital, strong patient volumes"},
            {"name": "LASUTH / LUTH / UCH", "note": "Teaching hospitals — academic medicine pathways"},
            {"name": "Helium Health", "note": "Health-tech — EMR and digital health"},
            {"name": "mDoc", "note": "Telemedicine and chronic disease management"},
            {"name": "Africa Health Holdings", "note": "Pan-African hospital group"},
            {"name": "WHO Nigeria / UNICEF Nigeria", "note": "UN health agencies — international exposure"},
        ],
        "certifications": [
            {"name": "FWACP / FMC (Fellowship of West African/National Postgraduate Colleges)", "relevance": "Very High", "cost_usd": 500, "provider": "WACP / NPMCN", "note": "The gold standard for specialist medical doctors in Nigeria — mandatory for consultant status"},
            {"name": "ATLS / ACLS (Advanced Life Support)", "relevance": "Very High", "cost_usd": 300, "provider": "American College of Surgeons", "note": "Required by most private hospitals for emergency medicine"},
            {"name": "PLAB (Professional and Linguistic Assessments Board)", "relevance": "Very High", "cost_usd": 700, "provider": "GMC UK", "note": "Gateway to NHS — the single most impactful cert for UK emigration of Nigerian doctors"},
            {"name": "USMLE (Steps 1-3)", "relevance": "Very High", "cost_usd": 1_500, "provider": "ECFMG/NBME", "note": "For USA medical licensure — significant time investment but life-changing outcome"},
            {"name": "CPHIMS (Health Informatics)", "relevance": "High", "cost_usd": 499, "provider": "HIMSS", "note": "For health IT professionals — globally recognised"},
        ],
        "visa_friendly_roles": [
            {"role": "Medical Doctor (MBBS)", "countries": ["UK (NHS)", "Canada", "Australia", "USA", "Ireland"], "visa_types": ["Skilled Worker (UK NHS)", "Express Entry (CA)", "TSS (AU)", "J-1/H-1B (USA)"], "notes": "PLAB 1+2 → GMC registration → UK Skilled Worker visa. Strongest single career pathway to UK for Nigerian professionals"},
            {"role": "Registered Nurse / Midwife", "countries": ["UK (NHS)", "Ireland", "Canada", "Australia", "Germany"], "visa_types": ["Skilled Worker (UK NHS)", "Critical Skills (IE)", "Express Entry (CA)", "TSS (AU)"], "notes": "UK NHS is actively recruiting Nigerian nurses. OSCE exam + NMC registration is the process"},
            {"role": "Public Health / Epidemiologist", "countries": ["USA", "UK", "Canada", "WHO/UN"], "visa_types": ["H-1B (USA)", "Skilled Worker (UK)", "Express Entry (CA)", "G-4 (UN)"], "notes": "NCDC/WHO Nigeria experience + MPH is a strong combination for international health organisations"},
        ],
        "job_search_tips": [
            "For NHS emigration: the PLAB route is the most straightforward. MDF and Doctors in Training UK Facebook groups have Nigerian doctor communities with practical advice.",
            "Eko Hospitals and Lagoon Hospitals are the highest-paying private employers — target them after completing your NYSC and primary posting.",
            "Helium Health and mDoc are hiring health-tech professionals (non-clinical) — strong growth and remote-flexible roles.",
            "PEPFAR-funded programmes (through APIN, Excellence & Friends) pay significantly above public sector rates and give international exposure.",
            "Join NPMCN or WACP as early as possible — fellowship examinations take 2-5 years to complete and are required for consultant status.",
        ],
    },

    "remote_tech": {
        "id": "remote_tech",
        "name": "Remote Tech (Global)",
        "tagline": "Earn in dollars, live in Lagos",
        "description": (
            "Remote tech is the fastest-growing income source for Nigerian professionals. "
            "With the Naira depreciation, remote USD/EUR salaries are 10-20x equivalent local compensation. "
            "Platforms like Andela, Turing, and Deel have legitimised the remote work pathway. "
            "Nigerian engineers now work at Stripe, Google, Meta, Figma, and hundreds of YC-backed startups globally. "
            "This sector requires the highest skill level but offers transformational earning potential."
        ),
        "market_size": "Unlimited (global market)",
        "talent_demand": "Very High (if skills match global standards)",
        "growth_outlook": "↑ Explosive — AI is creating new remote roles faster than supply",
        "color": "violet",
        "in_demand_skills": [
            {"skill": "Full-Stack Development (React + Node/Python)", "demand": "Very High", "trend": "rising", "note": "The most hireable combination for remote roles — T-shaped engineers preferred"},
            {"skill": "Machine Learning / AI Engineering", "demand": "Very High", "trend": "explosive", "note": "Fastest growing remote category globally in 2024-2025"},
            {"skill": "DevOps / SRE / Platform Engineering", "demand": "Very High", "trend": "rising", "note": "Every startup needs DevOps — Terraform, AWS, GitHub Actions"},
            {"skill": "TypeScript", "demand": "Very High", "trend": "rising", "note": "The new JavaScript standard — vanilla JS is no longer enough"},
            {"skill": "System Design", "demand": "Very High", "trend": "stable", "note": "Critical for FAANG and senior remote roles — study 'Designing Data-Intensive Applications'"},
            {"skill": "Go (Golang)", "demand": "High", "trend": "rising", "note": "Increasingly preferred for high-performance backend services"},
            {"skill": "Rust", "demand": "Medium", "trend": "rising", "note": "Emerging for systems programming — differentiated skill"},
            {"skill": "LLM / RAG Engineering (AI)", "demand": "Very High", "trend": "explosive", "note": "LangChain, LlamaIndex, RAG pipelines — the hottest skill in 2025"},
            {"skill": "Solidity / Web3", "demand": "Medium", "trend": "volatile", "note": "Cyclical with crypto markets — high upside in bull cycles"},
            {"skill": "Product Design (Figma)", "demand": "High", "trend": "rising", "note": "Nigerian designers are globally competitive and often undervalued"},
            {"skill": "Technical Writing", "demand": "Medium", "trend": "stable", "note": "Remote-friendly, underrated career — $60-120K/yr for senior writers"},
            {"skill": "Cyber Security / Penetration Testing", "demand": "High", "trend": "rising", "note": "Bug bounty + pentesting is a global remote career with no ceiling"},
        ],
        "salary_ranges": {
            "Junior Remote Engineer (0-2 yrs)": {"ngn_min": None, "ngn_max": None, "usd_remote": (25_000, 60_000)},
            "Mid-level Remote Engineer (2-5 yrs)": {"ngn_min": None, "ngn_max": None, "usd_remote": (60_000, 120_000)},
            "Senior Remote Engineer (5+ yrs)": {"ngn_min": None, "ngn_max": None, "usd_remote": (120_000, 200_000)},
            "Staff / Principal Engineer": {"ngn_min": None, "ngn_max": None, "usd_remote": (180_000, 350_000)},
            "FAANG / Top Tier": {"ngn_min": None, "ngn_max": None, "usd_remote": (250_000, 600_000)},
        },
        "top_employers": [
            {"name": "Andela", "note": "Lagos HQ — places Nigerian engineers at global companies"},
            {"name": "Turing.com", "note": "AI-powered remote matching platform"},
            {"name": "Toptal", "note": "Top 3% network — highly selective, premium rates"},
            {"name": "Gun.io", "note": "Curated freelance network for senior engineers"},
            {"name": "YC-backed startups (ycombinator.com/jobs)", "note": "Best source for remote roles at fast-growing US startups"},
            {"name": "Remote.co / We Work Remotely", "note": "Top remote job boards"},
            {"name": "Deel / Rippling (EOR companies)", "note": "Enable Nigerian engineers to receive USD salaries legally"},
        ],
        "certifications": [
            {"name": "AWS Certified Solutions Architect – Professional", "relevance": "Very High", "cost_usd": 300, "provider": "Amazon", "note": "The single most impactful cert for remote cloud/backend roles — signals senior-level cloud expertise"},
            {"name": "Google Cloud Professional ML Engineer", "relevance": "Very High", "cost_usd": 200, "provider": "Google", "note": "Essential for remote AI/ML engineering roles"},
            {"name": "HashiCorp Terraform Associate", "relevance": "High", "cost_usd": 70, "provider": "HashiCorp", "note": "IaC is expected by most remote DevOps hiring managers"},
            {"name": "Certified Kubernetes Administrator (CKA)", "relevance": "High", "cost_usd": 395, "provider": "CNCF", "note": "Expected for DevOps/SRE roles at tech companies"},
            {"name": "GitHub Actions / GitLab CI Specialization", "relevance": "High", "cost_usd": 0, "provider": "GitHub/GitLab (free)", "note": "CI/CD expertise is tested in most senior engineering interviews"},
            {"name": "DeepLearning.AI Specialisation (Coursera)", "relevance": "Very High", "cost_usd": 49, "provider": "Andrew Ng / DeepLearning.AI", "note": "Best foundation for ML/AI remote roles — globally respected"},
        ],
        "visa_friendly_roles": [
            {"role": "Senior Software Engineer", "countries": ["Canada", "Germany", "Netherlands", "UK", "Portugal"], "visa_types": ["Express Entry (CA)", "EU Blue Card", "Highly Skilled (NL)", "Global Talent (UK)", "D8 Digital Nomad (PT)"], "notes": "Senior engineers with 5+ years get visa sponsorship from international employers. Andela alumni have a strong track record"},
            {"role": "AI/ML Engineer", "countries": ["USA", "UK", "Canada", "UAE", "Singapore"], "visa_types": ["H-1B (USA)", "Global Talent (UK)", "Express Entry (CA)", "Tech.Pass (SG)"], "notes": "AI engineers are the most visa-sponsored profession globally in 2024-2025"},
            {"role": "Product Designer (Figma)", "countries": ["UK", "Netherlands", "Germany", "Canada"], "visa_types": ["Global Talent (UK)", "Highly Skilled (NL)", "EU Blue Card", "Express Entry (CA)"], "notes": "Design is overlooked — talented Nigerian Figma designers have exceptional visa success rates in the UK"},
            {"role": "DevOps / Platform Engineer", "countries": ["Germany", "Netherlands", "Ireland", "UK", "Canada"], "visa_types": ["EU Blue Card", "Skilled Worker (UK)", "Critical Skills (IE)", "Express Entry (CA)"], "notes": "Cloud and DevOps engineers are among the easiest to sponsor — every company needs them"},
        ],
        "job_search_tips": [
            "Build a portfolio on GitHub with at least 3 pinned projects — international companies look at your GitHub before your CV.",
            "Apply to Andela's network for your first remote placement — they handle compliance, payments, and employer trust.",
            "Use Deel or Payoneer to receive USD salaries in Nigeria — set up accounts before you start the job search.",
            "Target Series A-C startups (not FAANG) for your first remote role — they move faster and value impact over pedigree.",
            "Contribute to open-source (React, FastAPI, or a Nigerian-relevant project) — it signals both skill and initiative to global employers.",
            "Use the 'Open to Work' feature on LinkedIn with '#opentoremotework' and target international tech recruiters directly.",
            "For AI roles, build a publicly visible RAG or LLM project using LangChain — it's the current fastest way to get noticed.",
        ],
    },
}


def get_all_industries() -> List[Dict[str, Any]]:
    """Return a summary list of all industries (no detailed data) for the industry picker."""
    summaries = []
    for key, data in NIGERIA_CAREER_INSIGHTS.items():
        summaries.append({
            "id": data["id"],
            "name": data["name"],
            "tagline": data["tagline"],
            "talent_demand": data["talent_demand"],
            "growth_outlook": data["growth_outlook"],
            "color": data["color"],
            "top_skills_preview": [s["skill"] for s in data["in_demand_skills"][:4]],
        })
    return summaries


def get_industry_detail(industry_id: str) -> Dict[str, Any]:
    """Return full detailed data for a specific industry."""
    data = NIGERIA_CAREER_INSIGHTS.get(industry_id)
    if not data:
        return {}
    return data


def get_visa_opportunities() -> List[Dict[str, Any]]:
    """Return all visa-friendly roles across all industries."""
    all_visas = []
    for industry_id, data in NIGERIA_CAREER_INSIGHTS.items():
        for opp in data.get("visa_friendly_roles", []):
            all_visas.append({
                "industry": data["name"],
                "industry_id": industry_id,
                "industry_color": data["color"],
                **opp,
            })
    return all_visas
