# My Next Spot

An AI-powered recommendation platform that helps users discover restaurants, bars, cafes, and activities around Melbourne based on their preferences and interests.

👉 **[Live Demo](https://melbourne-picks-03.vercel.app/)**

## Why I built this
I wanted to see how AI could create a more personalized alternative to traditional review and directory sites (like Google Maps, Broadsheet, or TimeOut) where you usually have to do a lot of manual scrolling and filtering.

## Features
* **Tailored recommendations:** Finds local spots based on specific user preferences instead of generic star ratings.
* **Melbourne directory:** Focuses on restaurants, bars, cafes, and local activities around the city.
* **Dynamic responses:** Uses the Claude API to generate recommendations.

## Tech Stack
React (Vite), TypeScript, Node.js, Express, Claude API, Google Places API, Tailwind CSS

## Key Learnings
* **The limits of standalone LLMs:** I realized that LLMs alone aren't reliable for real-world recommendations because they lack a structured, up-to-date data source. 
* **Grounding AI with live data:** To fix this, I integrated the Google Places API. This grounded the AI's outputs in real, existing venue data and drastically improved accuracy.
* **Data curation:** I learned firsthand how much the quality of a recommendation relies on smart data filtering and structuring behind the scenes.
