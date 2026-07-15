# Stitch Prompts & Design Specification for Oji-San

This document contains the design system rules and specific prompts for generating the **Oji-San** Chrome Extension's UI using **Stitch**.

---

## 1. Design System Configuration (`design.md`)

Use this specification to configure the design system in Stitch. It defines a retro-modern "Chamber of Code" dojo aesthetic.

```markdown
# Design System: Dojo Code Chamber

A gamified, funny, retro-modern 16-bit martial arts aesthetic. High contrast, clean, and full of character.

## Color Tokens

*   **Background (Canvas)**: `#121214` (Deep Charcoal Black)
*   **Surface (Card/Box)**: `#1E1E24` (Dark Temple Stone)
*   **Primary Accent**: `#E63946` (Crimson Red / Alarm Alert)
*   **Secondary Accent**: `#FFB703` (Dojo Gold / Achievement)
*   **Muted Text / Border**: `#8D99AE` (Iron Grey)
*   **Base Text**: `#F1FAEE` (Parchment White)
*   **Success Green**: `#2A9D8F` (Jade Green)

## Typography

*   **Headers**: "Press Start 2P" or a bold, blocky serif (retro arcade style)
*   **Body**: "Inter" or "Outfit" (highly readable modern sans-serif)

## Component Guidelines

*   **Borders**: Retro double-borders or blocky solid borders (3px width) in Dojo Gold (`#FFB703`) or Crimson (`#E63946`).
*   **Buttons**: Chunky, bevel-shaded buttons with a slight shadow offset. They should feel clicky, like an old arcade cabinet button.
*   **Progress Bars**: Styled like a classic 8-bit fighting game health bar (segmented, color-coded from Green/Jade to Red/Crimson).
*   **Input Fields**: Dark textured fields with a glowing gold focus border.
```

---

## 2. Prompt for Screen 1: The Dojo Dashboard (Popup UI)

Use this prompt in `generate_screen_from_text` or Stitch UI to generate the Popup Dashboard.

### Prompt:
> Create a dark-themed, compact Chrome Extension popup UI named "The Dojo Dashboard" (width: 360px, height: 500px). 
> The design must use a retro-modern "Dojo Chamber of Code" theme.
> 
> **Layout & Components:**
> 1. **Dojo Header**:
>    - A retro title "OJI-SAN'S DOJO" in blocky gold font (`#FFB703`).
>    - A tiny status indicator badge: "DISCIPLINE LEVEL: SLACKER" (Muted Crimson background) or "DISCIPLINE LEVEL: ZEN MASTER" (Jade Green).
> 2. **Dojo Toggle (Active Switch)**:
>    - A large, prominent toggle switch to activate/deactivate "Focus Mode". Label it "Dojo Gate: [OPEN / CLOSED]".
>    - When active, show a glowing green border; when closed, show a warning red border.
> 3. **Focus Goal Input**:
>    - A labeled text input: "Set your Training Goal (e.g., 'Learn React')" inside a styled wooden card-like frame.
>    - Include a warning subtext: "Oji-San is watching. Do not test his patience."
> 4. **Discipline Stats (The Health Bars)**:
>    - A section titled "Today's Sparring Stats" displaying:
>      - "Focus Stamina" represented by a retro-style green-to-red horizontal health bar (representing productive vs distracting page visits).
>      - "Pages Evaluated: 20" (with a tiny parchment scroll icon).
>      - "Distractions Slashed: 4" (with a tiny sword icon).
> 5. **Oji-San's Daily Wisdom (Footer)**:
>    - A small text block containing a funny, random quote in italics: *"To compile code without errors, one must first compile a focused mind." - Master Oji-San*
> 
> Ensure the design feels polished, premium, and gamified with clear visual hierarchy, satisfyingly chunk border styles, and modern subtle gradients.

---

## 3. Prompt for Screen 2: Oji-San Intervention Overlay (Content Script)

Use this prompt in `generate_screen_from_text` or Stitch UI to generate the full-screen distraction blocker page.

### Prompt:
> Create a full-screen overlay UI (designed to block a distracting website) named "Oji-San Intervention".
> 
> **Layout & Components:**
> 1. **Backdrop**:
>    - A heavy dark glassmorphic backdrop-blur (`backdrop-blur-md` or `rgba(18, 18, 20, 0.9)`) that obscures the distracting page behind it.
> 2. **Central Dojo Card**:
>    - A vertical card centered on the screen resembling a traditional Japanese scroll or wooden dojo board, with a crimson shadow glow.
> 3. **Master Oji-San Sprite Panel**:
>    - A dedicated frame displaying a 2D pixel-art cartoon sprite of an angry, disappointed bald sensei with a white mustache (Oji-San) waving a training stick.
> 4. **Speech Bubble**:
>    - A comic-style speech bubble pointing from Oji-San's sprite.
>    - Inside the bubble, display a large, angry header: "FOOLISH DISCIPLE!"
>    - Below it, display the dynamic scolding text: *"You claim you wish to learn React, yet I catch you watching 'Top 10 Anime Betrayals' on YouTube! Your discipline is weaker than a wet noodle! Back to training!"*
> 5. **Action Buttons**:
>    - A primary, high-contrast blocky crimson button: "Forgive me, Oji-San (Close Tab)". Clicking this should visually feel like conceding defeat in a game.
>    - A secondary muted, small link/button: "I am actually working (Request Bypass)" with an icon of a bowing disciple.
> 
> The UI should feel dramatic, funny, and visually imposing to create an engaging and lighthearted way to keep users focused.
