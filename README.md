# 🗺️ Raahi — Professional Travel Planner

Raahi is an elegant, full-featured travel planning and route-tracking platform designed to help you curate, organize, and monitor your journeys with absolute precision. Centered around a sophisticated, high-contrast Cosmic Slate aesthetic, Raahi provides a seamless experience for managing travel schedules, milestones, and stats.

---

## ✨ Features

- **🎯 Interactive Journey Planner**: Set up multi-stop paths complete with custom checkpoints, statuses, and companion types (Solo, Couple, Family, Friends).
- **🛤️ Smart Checkpoint Tracking**: Add, reorder, and complete checkpoints. Ongoing routes automatically adapt to your progress, with instant visual indicators for completed stops.
- **📊 Real-time Stats & Travel Insights**: Access visual analytical charts of your total trips, transport mode breakdowns, companion frequencies, and completed vs. planned schedules.
- **🍂 Cosmic Slate & Glassmorphism Design**: Experience a gorgeous off-white-on-charcoal visual theme built with glassmorphic cards, custom typography pairing, subtle glowing backdrops, and active canvas particle effects.
- **✨ Fluid Animated Transitions**: Navigating across views is exceptionally smooth, featuring tailored screen entrances, fade-ins, and realistic skeleton loaders to eliminate sudden layout shifting.
- **🗳️ Archive & Migration Mechanics**: Journeys automatically move from the Active Feed to the Completed Archive once all associated travel milestones are ticked off.

---

## 🛠️ Tech Stack

- **Frontend Core**: React 18+ & TypeScript
- **Build System**: Vite (configured for ultra-fast, modern module bundling)
- **Styling & Layout**: Tailwind CSS (with glassmorphism and custom theme properties)
- **Motion & Micro-interactions**: `motion` (imported from `motion/react` for buttery-smooth performance)
- **Database Backend**: Supabase (via PostgREST client integrations for persistent real-time storage)
- **Icons**: Lucide React

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18 or higher) and `npm` installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MayukhX-ux/raahi.git
   cd raahi
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file using the provided example:
   ```bash
   cp .env.example .env
   ```

4. Configure your Supabase credentials in `.env`:
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anonymous-key
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

---

## 🗄️ Database Integration

Raahi interfaces with Supabase for persistent, multi-device syncing of travel profiles and journeys. 

### Data Structure

- **`profiles`**: Manages user details (Display Name, Bio, Home Location, Avatar URL).
- **`journeys`**: Tracks main trip information, with checkpoints structured as sequential list structures to accommodate dynamic route adjustments gracefully.
- **`status` adapter**: Built with self-healing defaults ('planned', 'ongoing', 'completed') to provide structural integrity even during network latencies.

---

## 🎨 Visual Identity & Typography

Raahi adheres to premium visual standards designed to stand out:
- **Display Headings**: Standard Inter sans-serif font paired with high-contrast semi-bold formatting and tight tracking (`tracking-tight`).
- **Technical Elements**: Styled with monospaced accents (`font-mono`) to highlight metadata.
- **Colors**: Rich dark backdrops (`#07090e`), layered with custom glow effects, translucent glass panels, and selective warm accents.

---

## 📄 License

This project is licensed under the MIT License.
