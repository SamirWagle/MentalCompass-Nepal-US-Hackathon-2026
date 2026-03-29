import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

console.log("=== Azure OpenAI Connection Test ===\n");
console.log(`Endpoint: ${endpoint}`);
console.log(`Deployment: ${deployment}`);
console.log(`API Key: ${apiKey ? "✓ Set" : "✗ Missing"}\n`);

if (!endpoint || !apiKey || !deployment) {
  console.error("ERROR: Missing required environment variables!");
  console.error("  - AZURE_OPENAI_ENDPOINT");
  console.error("  - AZURE_OPENAI_API_KEY");
  console.error("  - AZURE_OPENAI_DEPLOYMENT\n");
  process.exit(1);
}

const client = new OpenAI({
  baseURL: endpoint,
  apiKey: apiKey,
});

async function testConnection() {
  try {
    console.log("Sending test request to Azure OpenAI...\n");

    const completion = await client.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say 'Azure OpenAI connection successful!' in 1 sentence." }
      ],
      model: deployment,
      temperature: 0.2,
      max_tokens: 100,
    });

    console.log("✓ SUCCESS: Connection established!\n");
    console.log("Response:");
    console.log(completion.choices[0].message.content);
    console.log("\n=== Test Complete ===");
    process.exit(0);
  } catch (error) {
    console.error("✗ ERROR: Connection failed!\n");
    console.error("Details:");
    console.error(error.message);
    if (error.error) {
      console.error(error.error);
    }
    console.error("\nNext steps:");
    console.error("1. Verify AZURE_OPENAI_ENDPOINT is correct");
    console.error("2. Verify AZURE_OPENAI_API_KEY is valid");
    console.error("3. Verify AZURE_OPENAI_DEPLOYMENT matches your Azure deployment name");
    process.exit(1);
  }
}

testConnection();
