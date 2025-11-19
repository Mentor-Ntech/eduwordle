🎨 EDUWORDLE — DESIGN SYSTEM VISUALIZATION
A unified design system for a mobile-first PWA, optimized for MiniPay users, fast gameplay, and smooth interaction.

1. Brand Foundations
1.1 Color Palette
Designed to feel modern, educational, and mobile-friendly.
Role
Color
Hex
Primary
Emerald
#2ECC71
Primary Dark
Deep Emerald
#1F8E4B
Secondary
Celo Gold
#FBCC5C
Accent
Soft Blue
#3498DB
Error
Red
#E74C3C
Success
Green
#27AE60
Text Primary
Charcoal
#222222
Text Secondary
Cool Grey
#6C6C6C
Background
White
#FFFFFF
Surface
Light Grey
#F5F5F5


2. Typography System
Primary Font: Inter (Web-safe, crisp for mobile)
Usage
Style
Size
H1
Bold
28–32px
H2
Semi-Bold
22–24px
H3
Semi-Bold
18–20px
Body 1
Regular
16px
Body 2
Regular
14px
Caption
Medium
12px


3. Spacing & Layout Grid
Spacing Scale
4 — 8 — 12 — 16 — 20 — 24 — 32 — 40 — 48

Grid
4-column grid on mobile


12-column grid on desktop


16px gutters


Touch-friendly tap targets: 44px minimum



4. Component Library (Atomic Structure)
4.1 Atoms
Buttons
Primary Button
Background: Primary


Text: White


Radius: 12px


Shadow: subtle elevation


Secondary Button
Border: Primary


Text: Primary


Background: White


Disabled State
Greyed out


No shadow


Low opacity



Inputs
Rounded 12px


16px padding


Border: #E0E0E0


Focus: Highlighted emerald border



Icons
Use simple line icons:
Wallet


Reward / Trophy


Checkmark


Leaderboard


Play / Replay


Info



4.2 Molecules
Puzzle Tile
State 1: Neutral (Light Grey)
State 2: Correct (Primary)
State 3: Almost (Secondary)
State 4: Wrong (Dark Grey)

Reward Badge
Circular stamp


Gold highlight


“+ Reward Earned” in small caption


MiniPay Connection Banner
Compact UI at top:
MiniPay logo


“Connected as 0x123…ab”


Status dot (Green = Connected)



4.3 Organisms
Daily Challenge Card
Word count indicator


Countdown timer


Start button


Small description text


Leaderboard
Avatar


Username


Score


Rank badge


Reward Claim Screen
Animated trophy icon


Amount of cUSD earned


“Claim via MiniPay” button



5. Interaction Design
Micro-Animations
Tile flip animation (Wordle-style)


Button tap ripple


Reward coin drop effect


Slide-in transitions for modal screens



6. User Flow Visualization
1. Home Screen
→ Start Daily Game
 → View Leaderboard
 → Connect Wallet via MiniPay

2. Game Screen
View puzzle grid


Enter letters


Get instant feedback


Submit answer



3. Reward Engine
If correct:
 → Smart contract validates
 → User earns cUSD
 → Claim popup appears



4. Claim via MiniPay
Tap “Claim Reward”


MiniPay opens bottom sheet


cUSD sent to user wallet



5. Post-Game
Social share option


“Play Tomorrow’s Puzzle”


“Join Community”



7. Smart Contract Interaction Diagram (Conceptual)
[Frontend PWA] 
     ↓
[PuzzleVerifier.sol] 
     ↓ Validate answer → True/False
     ↓
[RewardManager.sol]  
     ↓
Send cUSD → User via MiniPay


8. Design Tokens Reference (Exportable)
{
  "colors": {
    "primary": "#2ECC71",
    "primaryDark": "#1F8E4B",
    "secondary": "#FBCC5C",
    "accent": "#3498DB",
    "error": "#E74C3C",
    "textPrimary": "#222222",
    "textSecondary": "#6C6C6C",
    "background": "#FFFFFF",
    "surface": "#F5F5F5"
  },
  "radii": {
    "small": "8px",
    "medium": "12px",
    "large": "20px"
  },
  "spacing": [4, 8, 12, 16, 20, 24, 32, 40, 48]
}


9. Screen Mock-up Structure (For Figma)
Screen 1 — Onboarding
Logo


“Welcome to EduWordle”


Connect MiniPay button



Screen 2 — Daily Challenge
Word puzzle grid


Input keyboard


Timer


Submit



Screen 3 — Reward Claim
Trophy animation


Earned cUSD


Claim button



Screen 4 — Leaderboard
List view


Badges


XP indicators



Screen 5 — Settings
Language selection


Profile


MiniPay connection status



