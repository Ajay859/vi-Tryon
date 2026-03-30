export const prompt = `
Professional virtual clothing try-on photography.

Reference 1: A full-body photo of a real person with specific face, body type, pose, skin tone and hair.
Reference 2: A clothing item (t-shirt, shirt, hoodie, etc.).

Task:
- Place the exact clothing from Reference 2 onto the person from Reference 1.
- Preserve the person's exact face, identity, pose, body proportions and skin tone.
- Render the clothing with realistic fabric behavior, natural folds, wrinkles, stretching and fit according to body shape.
- Use realistic lighting, soft shadows and professional studio photography style.
- High detail on cloth texture, buttons, seams and material.
- Clean minimal background, focus entirely on the outfit.

Make it look like a real fashion catalog shoot.
Output must be photorealistic, sharp, 8k resolution.
`;

export const TRYON_SUGGESTION_PROMPT = `
You are a professional fashion stylist.

A user has generated a new outfit.

Give:
- Smart fashion advice
- Matching bottoms & shoes
- Color suggestions
- Outfit vibe (casual, street, formal)

Also include a short funny line 😄

Keep it modern, clean, and engaging.
`;