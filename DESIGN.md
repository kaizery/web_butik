---
name: Ethereal Editorial
colors:
  surface: '#fff8f6'
  surface-dim: '#e1d8d5'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf2ef'
  surface-container: '#f5ece9'
  surface-container-high: '#efe6e3'
  surface-container-highest: '#e9e1de'
  on-surface: '#1e1b19'
  on-surface-variant: '#4f4442'
  inverse-surface: '#342f2e'
  inverse-on-surface: '#f8efec'
  outline: '#817472'
  outline-variant: '#d3c3c0'
  surface-tint: '#6f5955'
  primary: '#6f5955'
  on-primary: '#ffffff'
  primary-container: '#f2d5cf'
  on-primary-container: '#715b56'
  inverse-primary: '#dcc0bb'
  secondary: '#5e5e5c'
  on-secondary: '#ffffff'
  secondary-container: '#e1dfdc'
  on-secondary-container: '#636360'
  tertiary: '#775a19'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffd68a'
  on-tertiary-container: '#795b1b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#f9dcd6'
  primary-fixed-dim: '#dcc0bb'
  on-primary-fixed: '#271814'
  on-primary-fixed-variant: '#56423e'
  secondary-fixed: '#e4e2de'
  secondary-fixed-dim: '#c8c6c3'
  on-secondary-fixed: '#1b1c1a'
  on-secondary-fixed-variant: '#474744'
  tertiary-fixed: '#ffdea5'
  tertiary-fixed-dim: '#e9c176'
  on-tertiary-fixed: '#261900'
  on-tertiary-fixed-variant: '#5d4201'
  background: '#fff8f6'
  on-background: '#1e1b19'
  surface-variant: '#e9e1de'
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 64px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 40px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
  headline-md:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.4'
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The design system is centered on a "Soft Luxury" aesthetic, blending modern minimalism with classical editorial grace. It targets a discerning audience seeking an elevated, calm, and curated shopping experience. The visual language emphasizes breathability, using expansive whitespace to allow high-fashion photography to serve as the primary visual anchor.

The style utilizes elements of **Minimalism** and **Glassmorphism**. Surfaces are light and airy, employing subtle transparency to maintain a sense of depth without clutter. The emotional response should be one of tranquility, sophistication, and effortless beauty.

## Colors

The palette is rooted in a "Warm Alabaster" foundation. 

- **Primary (Blush):** Used for soft backgrounds, subtle highlights, and secondary call-to-actions. It provides the "skin-tone" warmth of the interface.
- **Secondary (Cream):** The primary canvas color. It is softer than pure white, reducing eye strain and feeling more "organic" and premium.
- **Tertiary (Muted Gold):** Reserved for high-value accents: icons, price points, or "Limited Edition" badges. It should be used sparingly to maintain its impact.
- **Neutral (Charcoal-Warm):** Used for typography and iconography. It is a deep, warm grey rather than black to ensure the contrast remains sophisticated rather than harsh.

## Typography

This design system employs a classic serif/sans-serif pairing to evoke a high-end magazine feel.

- **Headlines:** Uses a graceful, classical serif. Large display sizes should use tighter letter spacing to emphasize the elegant ligatures. 
- **Body:** Uses a clean, low-contrast geometric sans-serif. This ensures that long product descriptions remain highly legible across all devices.
- **Labels:** Small labels, such as "New In" or category tags, should be rendered in uppercase with increased letter spacing to provide a modern, structural contrast to the flowing serif headings.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for desktop to maintain the "Editorial Spread" feel, while transitioning to a fluid model for mobile.

- **Desktop:** 12-column grid with wide 64px outer margins. Use "unbalanced" layouts where images span 7 columns and text spans 4 to create visual interest.
- **Mobile:** 4-column grid with 16px margins. 
- **Rhythm:** Use an 8px base unit. Vertical rhythm should be generous; double the standard spacing between sections (e.g., 80px or 120px) to reinforce the premium, "airy" brand promise.

## Elevation & Depth

Hierarchy is achieved through **Tonal Layers** and **Ambient Shadows**.

- **Shadows:** Avoid harsh, dark shadows. Use long, highly diffused shadows with a slight warm tint (`rgba(74, 69, 67, 0.08)`).
- **Glassmorphism:** Navigation bars and "Quick Add" overlays should use a background blur (12px to 20px) with a semi-transparent cream fill. This keeps the user connected to the high-quality product imagery underneath.
- **Outlines:** Use very thin (1px) borders in a shade slightly darker than the background (e.g., a muted blush-tan) for input fields and dividers.

## Shapes

The shape language is **Soft**. 

Edges are gently rounded to remove the clinical feel of sharp corners, but not so rounded as to appear "bubbly" or casual. This "Soft" setting (0.25rem - 0.75rem) maintains a structural, architectural integrity suitable for luxury fashion while feeling approachable and feminine.

## Components

- **Buttons:** Primary buttons are solid Charcoal-Warm with Cream text. Secondary buttons use a Muted Gold outline. Interaction should involve a subtle scale-up (1.02x) rather than a dramatic color shift.
- **Product Cards:** Minimalist. No borders. Imagery should have a slight "Soft" corner radius. Titles appear in Serif below the image, with prices in Sans-serif.
- **Input Fields:** Bottom-border only (Editorial style) or a very light-toned Blush fill. The focus state should transition the border to Muted Gold.
- **Chips/Filters:** Pill-shaped with a Cream background and a thin Blush border. Selected states use a solid Blush fill.
- **Navigation:** Centered logo with serif navigation links. Use a "Hover Underline" animation that is 1px thick and Muted Gold.
- **Lists:** Use generous padding (24px+) between list items. Use Muted Gold for bullet points or numerical indicators to add a touch of luxury.