# CivicGuide: The Interactive Election Assistant 🗳️

**Built by Vivek Sharma** | Submission for Prompt Wars

## 📌 Project Overview
CivicGuide is an interactive, animated web application designed to demystify the election process. It combines an immersive visual timeline with a dynamic AI assistant to educate users on voter registration, election timelines, and voting procedures. 

**Chosen Vertical:** Election Process Education

## 🧠 Approach and Logic
The application is built on a modular architecture focusing on three core pillars:
1. **Interactive Education:** Transforming static text into an animated, step-by-step timeline that keeps users engaged.
2. **Contextual AI:** Using a scoped AI assistant that provides dynamic answers strictly related to civic duties and elections.
3. **Inclusive Design:** Ensuring that every user, regardless of ability, can navigate the election process via strict WCAG accessibility compliance.

## ⚙️ How the Solution Works
* **The Timeline:** Users scroll through the chronological steps of an election. Each node is keyboard-navigable and expands to reveal specific guidelines.
* **The Assistant:** Powered by the Google Gemini API, the chatbot processes user queries (e.g., "What ID do I need to vote?") and returns sanitized, accurate information.
* **Civic Integration:** Leverages Google Services to contextualize the user's local election data based on inputted zip codes.

## 🚀 Evaluation Criteria Met
* **Code Quality:** Fully modular structure separating logic, presentation, and data fetching.
* **Security:** Implemented strict input sanitization to prevent XSS in the chat interface. API keys are safely managed.
* **Efficiency:** Event listeners are debounced, and API calls are cached to prevent redundant network requests.
* **Testing:** Core functional logic is covered by unit tests validating state changes and API response formatting.
* **Accessibility:** 100% keyboard navigability, semantic HTML5 tags, ARIA roles for the dynamic chat live-regions, and high-contrast UI.
* **Google Services:** Deep integration of Google Gemini API for the assistant and Google Civic Information API for local data.

## 📝 Assumptions Made
* The user has a stable internet connection to communicate with the Google APIs.
* The Google Civic Information API data is currently contextualized for supported regions; fallback mock data is provided for unsupported regions to demonstrate functionality.
