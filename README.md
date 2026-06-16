# My Next Spot

An AI-powered recommendation platform that helps users discover restaurants, bars, cafes, and activities around Melbourne based on their preferences and interests.

👉 **[Live Demo](https://melbourne-picks-03.vercel.app/)**

## Why I built this
I wanted to see how AI could create a more personalized alternative to traditional review and directory sites (like Google Maps, Broadsheet, or TimeOut) where you usually have to do a lot of manual scrolling and filtering.

## Features
* **Tailored recommendations:** Finds local spots based on specific user preferences instead of generic star ratings.
* **Melbourne directory:** Focuses on restaurants, bars, cafes, and local activities around the city.
* **Dynamic responses:** Uses the Claude API to generate recommendations on the fly.

## Tech Stack
React (Vite), TypeScript, Node.js, Express, Claude API, Tailwind CSS

## Key Learnings
* **Handling API response times:** LLM APIs can sometimes be slow. I had to focus on optimizing the frontend state and loading states so the user isn't stuck staring at a blank screen.
* **Structured parsing:** Learned how to prompt the API to return clean, predictable data format structures so the frontend could render them reliably.
