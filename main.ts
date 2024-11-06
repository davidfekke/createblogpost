import { DallEAPIWrapper } from "npm:@langchain/openai";
import { PromptTemplate } from "npm:@langchain/core/prompts";
import { toKebabCase } from "@std/text";
import { Buffer } from 'node:buffer';
import process from 'node:process';

// import * as readline from 'node:readline/promises';
// import { stdin as input, stdout as output } from 'node:process';

// const rl = readline.createInterface({ input, output });

// const answer = await rl.question('What is the headline for the blog post? ');
// rl.close();

const answer = prompt("What is the headline for the blog post? ");

// Use this Headline for the Prompt
const headline = answer;
const kebabname = toKebabCase(headline);
const imagename = `${kebabname}.png`;
const filename = `${kebabname}.md`;

const imagePrompt = PromptTemplate.fromTemplate(`
  To generate a creative header image using Dall-E based on your blog post's headline and body text, we can design a flexible prompt that incorporates key elements of your blog. Here's how you can structure your prompt, making it adaptable to any blog post by substituting your specific headlines and text:
  
  ### Dall-E Prompt Template
  
  **Title of the Blog Post**: {headline}
  
  **Preferred Color Scheme and Art Style**: Bright and vibrant colors to emphasize growth and sustainability; a blend of digital art and watercolor styles for a modern yet organic feel
  
  **Mood or Atmosphere of the Image**: Inspiring and uplifting, showcasing harmony between urban life and nature
  
  Make sure to not include the Title of the Blog Post in the image. The image should be a visual representation of the blog post's content and theme.
`);

// create a Date in the following format from now
// 2024-10-22
function createDate(): string {
  const date = new Date();
  return date.toISOString().split('T')[0];
}

function createFrontMatter(title: string, image: string): string {
  return `---
title: "${title}"
tags: ["Node.js"]
description: "${title}"
category:
date: ${createDate()}
cover_image: "./${image}"
---

`;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {

  const tool = new DallEAPIWrapper({
      n: 1, // Default
      modelName: "dall-e-3", // Default
      openAIApiKey: process.env.OPENAI_API_KEY, 
      size: "1792x1024"
  });
    
  const prompt = await imagePrompt.format({ headline }); 
  
  const folderPath = `src/content/blog/${createDate()}`;
  try {
    const fileInfo = await Deno.stat(folderPath);
    console.log(fileInfo);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      await Deno.mkdir(folderPath, { recursive: true });
      console.log('Folder does not exist');
    } else {
      console.error(error);
    }
  }
  const imageURL = await tool.invoke(prompt);
  const arrayBuf = await fetch(imageURL).then(res => res.arrayBuffer());
  const markdownFilepath = `./src/content/blog/${createDate()}/${filename}`;
  const imageFilepath = `./src/content/blog/${createDate()}/${imagename}`;
  await Deno.writeFile(imageFilepath, Buffer.from(arrayBuf));
  await Deno.writeTextFile(markdownFilepath, createFrontMatter(headline, imagename));
}
