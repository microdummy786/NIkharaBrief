
import { GoogleGenAI } from "@google/genai";
import type { GeneratorFormData, Brief } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Using a mock service.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "mock_key" });

const generateBriefId = (): string => {
    const d = new Date();
    const YYYY = d.getUTCFullYear();
    const MM = String(d.getUTCMonth() + 1).padStart(2, '0');
    const DD = String(d.getUTCDate()).padStart(2, '0');
    const HH = String(d.getUTCHours()).padStart(2, '0');
    const MIN = String(d.getUTCMinutes()).padStart(2, '0');
    const SS = String(d.getUTCSeconds()).padStart(2, '0');
    const XXX = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `BRF${YYYY}${MM}${DD}${HH}${MIN}${SS}${XXX}`;
};

const parseBriefText = (text: string): Partial<Omit<Brief, 'id' | 'keywords' | 'category' | 'niche' | 'industry' | 'visibility' | 'createdAt' | 'fullText'>> => {
    const sections: { [key: string]: string } = {};
    const lines = text.split('\n');
    let currentSection = '';

    const sectionHeaders = ["Company Name", "Company Description", "Project Description", "Deadline"];

    for (const line of lines) {
        const foundHeader = sectionHeaders.find(h => line.toLowerCase().startsWith(h.toLowerCase()));
        if (foundHeader) {
            currentSection = foundHeader.replace(/\s/g, ''); // e.g., CompanyDescription
            sections[currentSection] = line.substring(foundHeader.length).replace(':', '').trim();
        } else if (currentSection && sections[currentSection] !== undefined) {
            sections[currentSection] += `\n${line.trim()}`;
        }
    }
    
    return {
        companyName: sections['CompanyName']?.trim(),
        companyDescription: sections['CompanyDescription']?.trim(),
        projectDescription: sections['ProjectDescription']?.trim(),
        deadline: sections['Deadline']?.trim(),
    };
};

export const generateCreativeBrief = async (formData: GeneratorFormData): Promise<Brief> => {
    const deadlineInstruction = formData.deadline
        ? `The project deadline is strictly set to ${formData.deadline}. Design a project with a scope, complexity, and set of deliverables that are realistically achievable within this exact timeframe.`
        : `Based on the project's category, niche, industry, and keywords (especially considering any difficulty keywords like 'Easy', 'Medium', or 'Hard'), determine and provide a realistic project deadline.`;
    
    const prompt = `
        You are a creative director. Generate a detailed and unique creative brief.
        The brief is for a fictional company. Ensure the company name is unique and creative.
        The project is in the category of "${formData.category}", with a niche of "${formData.niche}" for the "${formData.industry}" industry.
        Incorporate these keywords for inspiration: ${formData.keywords.join(", ")}.
        Use Markdown for emphasis, specifically using double asterisks (**) for bolding important terms.
        ${deadlineInstruction}

        Structure your response *exactly* as follows, with each title on a new line:

        Company Name: [Fictional Company Name]
        Company Description: [A paragraph describing the company.]
        Project Description: [A detailed paragraph describing the project, goals, and deliverables.]
        Deadline: [The determined or provided deadline, e.g., "3 Weeks", "1 Month"]
    `;

    // Mock API for environments without a key
    if (!process.env.API_KEY || process.env.API_KEY === "mock_key") {
        await new Promise(res => setTimeout(res, 1500)); // Simulate network delay
        const mockText = `
            Company Name: Quantum Weavers
            Company Description: Quantum Weavers is a forward-thinking tech startup specializing in creating **immersive educational experiences** using augmented reality. They target young learners, making complex subjects like *quantum physics* and biology engaging and accessible through interactive storytelling.
            Project Description: Design a complete brand identity for Quantum Weavers. This includes a modern, memorable logo, a versatile color palette, and typography guidelines. The brand should feel **innovative**, **friendly**, and **trustworthy**, appealing to both educators and students. The final deliverable should be a comprehensive brand style guide.
            Deadline: 3 Weeks
        `;
        const parsed = parseBriefText(mockText);
         return {
            id: generateBriefId(),
            ...formData,
            companyName: parsed.companyName || "Mock Company",
            companyDescription: parsed.companyDescription || "A mock description.",
            projectDescription: parsed.projectDescription || "A mock project description.",
            deadline: formData.deadline || "3 Weeks (Mock)",
            visibility: 'public',
            createdAt: new Date().toISOString(),
            fullText: mockText,
        };
    }
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text;
        const parsed = parseBriefText(text);
        
        if (!parsed.companyName || !parsed.companyDescription || !parsed.projectDescription || !parsed.deadline) {
            throw new Error("Failed to parse the brief from AI response. It may be incomplete.");
        }

        return {
            id: generateBriefId(),
            ...formData,
            companyName: parsed.companyName,
            companyDescription: parsed.companyDescription,
            projectDescription: parsed.projectDescription,
            deadline: parsed.deadline,
            visibility: 'public',
            createdAt: new Date().toISOString(),
            fullText: text,
        };

    } catch (error) {
        console.error("Error generating brief:", error);
        throw new Error("Failed to generate brief. The AI service may be temporarily unavailable.");
    }
};