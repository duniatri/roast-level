# Coffee Roast Analyzer - Design Guidelines

## Brand Identity

**Purpose**: A practical tool for coffee enthusiasts to determine optimal Aeropress brewing temperatures based on roast level analysis.

**Aesthetic Direction**: Warm & Editorial
- Think coffee table book meets utility app
- Earthy, tactile, inviting
- Information-first design with breathing room
- Refined but approachable (for coffee lovers, not intimidating)

**Memorable Element**: The app feels like a knowledgeable coffee companion, not a sterile analysis tool. Warm color palette and thoughtful typography make technical information feel approachable.

## Navigation Architecture

**Root Navigation**: Stack with Drawer
- Main flow: Single-screen camera/analysis interface
- Drawer contains: History, Settings, About

**Screen List**:
1. **Analysis Screen** (main) - Capture/upload photo, initiate analysis
2. **Results Screen** (modal) - Display roast level and brewing recommendations
3. **History Screen** (drawer) - View past analyses
4. **Settings Screen** (drawer) - App preferences

## Screen Specifications

### Analysis Screen
**Purpose**: Capture or select coffee bean photo for analysis

**Layout**:
- Header: Transparent with drawer menu button (left), title "Roast Analyzer"
- Main content: Scrollable view
  - Large viewfinder/preview area (takes 60% of screen height)
  - Two prominent action buttons below: "Take Photo" and "Choose from Gallery"
  - Info card at bottom explaining the analysis
- Safe area: top inset = headerHeight + Spacing.xl, bottom inset = insets.bottom + Spacing.xl

**Components**:
- Image preview box with dashed border when empty
- Two full-width Material buttons with icons (camera, image)
- Info card with muted background explaining roast levels

**Empty State**: Show coffee bean illustration placeholder in preview area with text "Capture or select a photo to begin"

### Results Screen
**Purpose**: Display analysis results and brewing recommendations

**Layout**:
- Header: Standard with close button (left), title "Analysis Results"
- Main content: Scrollable view
  - Analyzed photo at top (rounded corners, medium size)
  - Roast level chip/badge (Light/Medium-Light/Medium/Medium-Dark/Dark)
  - Large temperature display (e.g., "85-90°C")
  - Detailed brewing notes in card
  - "Save to History" and "Analyze Another" buttons at bottom
- Safe area: top inset = Spacing.xl, bottom inset = insets.bottom + Spacing.xl

**Components**:
- Material elevated card for results
- Large numerical display for temperature
- Chip component for roast level
- Action buttons in Material style

### History Screen
**Purpose**: View previously analyzed coffee beans

**Layout**:
- Header: Standard with menu button (left), title "History"
- Main content: Scrollable list
- Safe area: top inset = Spacing.xl, bottom inset = insets.bottom + Spacing.xl

**Components**:
- List items with thumbnail, roast level, date, temperature
- Swipe-to-delete functionality

**Empty State**: Illustration with text "No analyses yet. Start by capturing a photo of coffee beans."

### Settings Screen
**Purpose**: Configure app preferences

**Layout**:
- Header: Standard with back button (left), title "Settings"
- Main content: Scrollable form
  - Temperature unit toggle (Celsius/Fahrenheit)
  - Clear history button
  - About/Privacy links
- Safe area: top inset = Spacing.xl, bottom inset = insets.bottom + Spacing.xl

## Color Palette

**Primary**: #6B4423 (Rich Coffee Brown) - main actions, headers
**Secondary**: #A67C52 (Warm Tan) - accents, active states
**Background**: #F8F5F0 (Cream) - main background
**Surface**: #FFFFFF (White) - cards, elevated surfaces
**Surface Variant**: #EDE6DD (Light Beige) - info cards, secondary surfaces
**Text Primary**: #2C1810 (Dark Espresso)
**Text Secondary**: #6B5D54 (Medium Brown)
**Success**: #4A7C59 (Earthy Green) - for positive confirmations
**Error**: #C1440E (Rust) - for errors/warnings

## Typography

**Primary Font**: Merriweather (Google Font) - for headlines, roast levels
**Secondary Font**: Roboto (system) - for body text, UI elements

**Type Scale**:
- Display: Merriweather Bold, 32sp
- Headline: Merriweather Bold, 24sp
- Title: Roboto Medium, 20sp
- Body: Roboto Regular, 16sp
- Label: Roboto Medium, 14sp
- Caption: Roboto Regular, 12sp

## Visual Design

- Icons: Material Design system icons
- Button style: Material elevated buttons with 8dp corner radius
- Cards: 12dp corner radius, subtle elevation
- Floating action buttons: Use specified shadow (offset 0,2 / opacity 0.10 / radius 2)
- All touchable elements have ripple effect feedback (Material standard)
- Image containers: 8dp corner radius

## Assets to Generate

1. **icon.png** - App icon featuring a stylized coffee bean in warm brown tones
2. **splash-icon.png** - Same coffee bean icon for launch screen
3. **empty-history.png** - Illustration of a minimalist coffee cup with steam, warm earthy colors - USED: History screen empty state
4. **placeholder-photo.png** - Outlined coffee bean illustration with dashed border - USED: Analysis screen when no photo selected
5. **avatar-default.png** - Simple user avatar with coffee cup icon - USED: Settings/profile area

All illustrations should use the warm, earthy color palette and have a hand-drawn, organic quality that feels approachable and refined.