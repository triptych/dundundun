# Pocket Dungeon - Game Design Document

## Game Overview

**Genre**: Dungeon Crawler RPG
**Platform**: Mobile Web Browser
**Target Audience**: Casual RPG players, ages 13+
**Play Session Length**: 5-15 minutes
**Core Loop**: Explore → Fight → Loot → Upgrade → Repeat

### High Concept

A streamlined dungeon crawler designed for mobile play, where players navigate procedurally generated dungeons room by room, collecting loot and gaining experience to tackle deeper, more challenging floors.

## Core Gameplay

### Movement & Exploration

- **Grid-based movement**: Dungeons consist of connected rooms on a simple grid
- **Tap to move**: Players tap adjacent rooms to move their character
- **Room types**:
  - Empty rooms (safe rest spots)
  - Monster rooms (combat encounters)
  - Treasure rooms (guaranteed loot)
  - Boss rooms (floor completion)
  - Stairs (progress to next floor)

### Combat System

- **Turn-based combat**: Simple, tactical encounters
- **Attack types**:
  - Basic Attack (always available)
  - Heavy Attack (higher damage, longer cooldown)
  - Block (reduce incoming damage for one turn)
  - Use Item (healing potions, buff items)
- **Enemy variety**: Different monsters with unique abilities and weaknesses
- **Combat resolution**: Damage calculations based on character stats vs enemy stats

### Character Progression

- **Experience Points**: Gained from defeating monsters and completing floors
- **Level Up**: Increases base health, attack, and defense
- **Attribute Points**: Distribute points among Strength, Agility, and Vitality
- **Equipment Slots**: Weapon, Armor, Accessory
- **Skill Tree**: Unlock passive abilities and combat techniques

## Game Features

### Procedural Generation

- **Floor Layouts**: Randomly generated room connections (5-10 rooms per floor)
- **Monster Spawns**: Random enemy placement with difficulty scaling
- **Loot Tables**: Equipment and items with rarity tiers (Common, Rare, Epic, Legendary)
- **Dungeon Themes**: Visual variety every 5 floors (Crypt, Cave, Forest, etc.)

### Equipment System

- **Weapon Types**: Swords, Axes, Bows, Staves (different damage patterns)
- **Armor Types**: Light, Medium, Heavy (defense vs mobility trade-offs)
- **Accessories**: Rings and amulets providing special bonuses
- **Equipment Stats**: Attack Power, Defense, Health Bonus, Special Effects
- **Upgrade System**: Use materials found in dungeons to enhance equipment

### Inventory Management

- **Limited Slots**: 20 inventory spaces to encourage strategic decisions
- **Item Categories**: Equipment, Consumables, Materials, Quest Items
- **Auto-sort**: Organize inventory by type or value
- **Sell System**: Convert unwanted items to gold at town merchant

## User Interface

### Mobile-Optimized Design

- **Large Touch Targets**: All buttons and interactive elements sized for finger taps
- **Portrait Orientation**: Designed for one-handed play
- **Swipe Gestures**: Swipe to navigate menus quickly
- **Minimal Text**: Icons and visual indicators over text when possible

### Screen Layout

- **Dungeon View**: Top 60% shows current room and adjacent connections
- **Character Panel**: Bottom left shows health, experience, level
- **Action Buttons**: Bottom right for movement and combat actions
- **Quick Access**: Inventory and character sheet accessible via bottom tabs

### Visual Style

- **Pixel Art**: 16-bit inspired sprites for nostalgia and clarity
- **Dark Theme**: Easy on battery and eyes during extended play
- **Color Coding**: Consistent colors for item rarities and UI elements
- **Smooth Animations**: Subtle transitions for actions and movement

## Progression Systems

### Short-Term Goals (Per Session)

- Clear current dungeon floor
- Find better equipment
- Reach next character level
- Collect enough gold for upgrades

### Medium-Term Goals (Multiple Sessions)

- Unlock new dungeon areas
- Complete equipment sets
- Master different combat builds
- Reach milestone levels (10, 20, 30, etc.)

### Long-Term Goals (Weeks/Months)

- Reach maximum character level
- Collect all legendary equipment
- Complete achievement challenges
- Explore all dungeon themes

## Monetization (Optional)

### Free-to-Play Model

- **Base Game**: Completely free with full content access
- **Cosmetic Items**: Character skins, weapon effects, UI themes
- **Convenience Features**: Extra inventory slots, auto-battle option
- **No Pay-to-Win**: All gameplay advantages obtainable through play

## Technical Requirements

### Performance Targets

- **Load Time**: Under 3 seconds for initial game load
- **Battery Usage**: Minimal drain during gameplay
- **Data Usage**: Under 1MB for complete game download
- **Compatibility**: Works on devices 3+ years old

### Storage & Saves

- **Local Storage**: Save game data in browser localStorage
- **Save States**: Automatic saving after each room completion
- **Character Backup**: Optional cloud save through simple account system

## Key Design Principles

1. **Accessibility First**: Simple controls, clear visual hierarchy
2. **Respect Player Time**: Meaningful progress in short sessions
3. **Strategic Depth**: Easy to learn, challenging to master
4. **Fair Progression**: No artificial barriers or grinding requirements
5. **Mobile Native**: Designed specifically for touch interfaces

## Success Metrics

- **Retention**: 40% of players return after first session
- **Session Length**: Average 8-10 minutes per play session
- **Progression**: Players reach floor 10 within first week
- **Engagement**: 70% completion rate for tutorial sequence

## Development Timeline

**Phase 1 (4 weeks)**: Core gameplay loop, basic combat, simple dungeon generation
**Phase 2 (3 weeks)**: Equipment system, character progression, UI polish
**Phase 3 (2 weeks)**: Multiple dungeon themes, balance testing, bug fixes
**Phase 4 (1 week)**: Final optimization, deployment preparation

## Risk Assessment

**Technical Risks**: Browser compatibility, save data reliability
**Design Risks**: Balancing difficulty curve, maintaining engagement
**Market Risks**: Standing out in crowded mobile RPG space

**Mitigation Strategies**: Extensive testing across devices, iterative balance updates, focus on unique mobile-first design choices
