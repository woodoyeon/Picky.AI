// /routes/runway-fitting.js
import express from 'express';
import dotenv from 'dotenv';
import RunwayML, { TaskFailedError } from '@runwayml/sdk';

dotenv.config();
const router = express.Router();

// Ensure the API key is loaded
if (!process.env.RUNWAYML_API_SECRET) {
  throw new Error("RUNWAYML_API_SECRET is not set in the environment variables.");
}
const client = new RunwayML({ apiKey: process.env.RUNWAYML_API_SECRET });

router.use(express.json());

// Helper function to create a dynamic prompt
function createDynamicPrompt(meta) {
  const { category, size, position, background } = meta;
  let prompt = `A model is wearing a ${size} ${category}.`;
  if (position) {
    prompt += ` The model is ${position}.`;
  }
  if (background) {
    prompt += ` The background is a ${background} setting.`;
  }
  prompt += ' High-quality, fashion catalog style, full body shot.';
  return prompt;
}

router.post('/', async (req, res) => {
  const { modelImageUrl, styleImageUrl, fittingMeta } = req.body;

  try {
    if (!modelImageUrl || !styleImageUrl || !fittingMeta) {
      return res.status(400).json({ error: 'modelImageUrl, styleImageUrl, and fittingMeta are required.' });
    }

    // Ensure URLs are not blob URLs
    if (modelImageUrl.startsWith('blob:') || styleImageUrl.startsWith('blob:')) {
        return res.status(400).json({ error: 'Invalid image URL format. Cannot use blob URLs on the server.' });
    }

    const dynamicPrompt = createDynamicPrompt(fittingMeta);
    console.log('🤖 Generated Dynamic Prompt:', dynamicPrompt);

    const taskPayload = {
        model: 'gen4_image', // Changed to 'gen4_image'
        ratio: '1024:1024', 
        promptText: dynamicPrompt, // The text prompt to guide the transformation
        referenceImages: [ { uri: modelImageUrl, tag: 'model' }, { uri: styleImageUrl, tag: 'style' } ], // Provide the style image as a reference
    };

    console.log("Sending payload to Runway:", taskPayload);

    const task = await client.textToImage.create(taskPayload).waitForTaskOutput();

    console.log("Full task object:", task);
    console.log("Task outputs:", task?.outputs); // This will still be undefined, but kept for debugging if needed
    console.log("First task output:", task?.output?.[0]); // Corrected access

    const imageUrl = task?.output?.[0]; // Corrected access
    if (!imageUrl) throw new Error('Runway image generation failed, no URL returned.');

    res.json({ imageUrl });

  } catch (err) {
    console.error("❌ Runway Fitting Error:", err);
    if (err instanceof TaskFailedError) {
      res.status(500).json({ error: 'Runway task failed', detail: err.detail || err.message });
    } else {
      res.status(500).json({ error: err.message || 'An unknown error occurred during Runway processing.' });
    }
  }
});

export default router;