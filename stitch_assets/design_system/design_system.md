# Design System: Dojo Code Chamber

A gamified, funny, retro-modern 16-bit martial arts aesthetic. High contrast, clean, and full of character.

## Style Guidelines

### Brand & Style
The brand personality is a high-energy fusion of 16-bit retro arcade nostalgia and modern martial arts discipline. It is "Serious Play"—where the rigor of coding meets the fun of a side-scrolling fighter. The emotional response should be one of focused excitement, achievement, and rhythmic progression.

The design style is a **Retro-Modern Hybrid**. It leverages the high-contrast, bold aesthetics of 90s fighting games—specifically characterized by heavy borders, vibrant accents, and pixel-inspired geometry—but executes them with the clean spacing and refined motion of a modern SaaS application. The result is a tactile, "clicky" interface that feels like an interactive arcade cabinet.

### Layout & Spacing
The layout follows a **Fixed Grid** philosophy to create a sense of structured "rooms" or "chambers." 

- **Grid:** A 12-column grid on desktop with generous 24px gutters.
- **Structure:** Content is housed in distinct containers that utilize consistent 3px borders. 
- **Adaptation:** On mobile, margins tighten to 16px, and complex multi-column layouts reflow into a single-column "scroll of fate."
- **Rhythm:** Spacing is strictly mathematical, built on an 8px base unit to maintain a "pixel-perfect" feel.

### Elevation & Depth
In keeping with the 16-bit aesthetic, this system avoids soft, blurry shadows in favor of **Tonal Layers** and **Hard Offsets**.

- **Surface Tiers:** Background elements use the deepest black, while interactive cards use "Dark Temple Stone" to appear closer to the user.
- **Hard Shadows:** Instead of blurs, use 4px or 8px solid offsets in black or a darker shade of the primary color to give buttons a physical, "extruded" look.
- **Glows:** Selected or focused elements utilize a hard-edged outer glow in Dojo Gold to simulate the lighting of an arcade CRT monitor.

### Components
- **Buttons:** Chunky and "clicky." They feature a 3px solid border and a bottom-heavy hard shadow. On hover, the button should shift 2px down to simulate a physical press.
- **Progress Bars:** Designed as "Health Bars." Use a segmented visual style (split into 10-20 blocks). The color transitions from Jade Green (High) to Dojo Gold (Mid) to Crimson Red (Critical).
- **Cards/Containers:** Use "Dark Temple Stone" backgrounds with 3px solid borders in "Iron Grey." Header sections within cards should be separated by a solid horizontal line.
- **Input Fields:** Deep black backgrounds with 3px borders. On focus, the border changes to "Dojo Gold" with a 4px solid "glowing" offset.
- **Chips/Badges:** Small, high-contrast rectangles with monospaced text. Use Crimson or Jade backgrounds with Parchment text to denote status or rank.
- **Lists:** Items are separated by subtle horizontal rules or contained within their own mini-bordered boxes for a "selection screen" feel.
