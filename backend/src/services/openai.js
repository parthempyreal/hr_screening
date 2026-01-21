import OpenAI from 'openai';

// Lazy initialization of OpenAI client
let openaiClient = null;

function getOpenAIClient() {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openaiClient;
}

/**
 * Extract skills and tech stack from a job description using OpenAI
 * @param {string} description - The job description text
 * @returns {Promise<{skills: string[], techStack: string[], requirements: string[]}>}
 */
export async function extractSkillsFromJobDescription(description) {
  const client = getOpenAIClient();
  
  // If no API key, return mock data for development
  if (!client) {
    console.log('⚠️ OpenAI API key not configured, using mock extraction');
    return mockExtractSkills(description);
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert HR analyst. Extract skills, tech stack, and requirements from job descriptions.
Return ONLY a valid JSON object with this exact structure:
{
  "skills": ["skill1", "skill2", ...],
  "techStack": ["tech1", "tech2", ...],
  "requirements": ["requirement1", "requirement2", ...]
}

Guidelines:
- Skills: Technical and soft skills (e.g., "React", "Team Leadership", "Problem Solving")
- Tech Stack: Specific technologies, frameworks, tools (e.g., "React 18", "Node.js", "AWS")
- Requirements: Experience requirements, certifications, education (e.g., "5+ years experience", "Bachelor's degree")
- Limit each category to 10 items maximum
- Be specific and concise`
        },
        {
          role: 'user',
          content: `Extract skills, tech stack, and requirements from this job description:\n\n${description}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    // Parse JSON response
    const parsed = JSON.parse(content);
    
    return {
      skills: Array.isArray(parsed.skills) ? parsed.skills.slice(0, 10) : [],
      techStack: Array.isArray(parsed.techStack) ? parsed.techStack.slice(0, 10) : [],
      requirements: Array.isArray(parsed.requirements) ? parsed.requirements.slice(0, 10) : []
    };
  } catch (error) {
    console.error('OpenAI extraction error:', error.message);
    // Fallback to mock extraction
    return mockExtractSkills(description);
  }
}

/**
 * Mock skill extraction for development without API key
 */
function mockExtractSkills(description) {
  const descLower = description.toLowerCase();
  
  const skillKeywords = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js', 'Vue.js', 'Angular',
    'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'Redis',
    'Machine Learning', 'AI', 'Data Science', 'DevOps', 'CI/CD', 'Agile', 'Scrum',
    'Problem Solving', 'Team Leadership', 'Communication', 'REST API', 'GraphQL',
    'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'SQL', 'NoSQL', 'Git'
  ];

  const techKeywords = [
    'React 18', 'Next.js', 'Express.js', 'Django', 'Flask', 'Spring Boot',
    'AWS Lambda', 'AWS S3', 'EC2', 'RDS', 'Terraform', 'Jenkins', 'GitHub Actions',
    'Prometheus', 'Grafana', 'Elasticsearch', 'Kafka', 'RabbitMQ', 'GraphQL',
    'Tailwind CSS', 'Material UI', 'Figma', 'Jira', 'Confluence'
  ];

  const skills = skillKeywords.filter(skill => 
    descLower.includes(skill.toLowerCase())
  ).slice(0, 8);

  const techStack = techKeywords.filter(tech => 
    descLower.includes(tech.toLowerCase().split(' ')[0])
  ).slice(0, 7);

  // Add some defaults if none found
  if (skills.length === 0) {
    skills.push('Problem Solving', 'Communication', 'Team Collaboration');
  }

  const requirements = [];
  if (descLower.includes('experience')) requirements.push('Relevant experience required');
  if (descLower.includes('degree') || descLower.includes('bachelor')) requirements.push('Bachelor\'s degree preferred');
  if (descLower.includes('senior')) requirements.push('5+ years experience');
  if (descLower.includes('junior') || descLower.includes('entry')) requirements.push('0-2 years experience');

  return { skills, techStack, requirements };
}

export default { extractSkillsFromJobDescription };
