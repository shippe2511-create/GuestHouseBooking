# GuestOS - Maldives Guesthouse Management

## Stack
- **Frontend**: React Native (Expo SDK 57) + Expo Router
- **Styling**: NativeWind (TailwindCSS for React Native)
- **Backend**: Supabase (Postgres + Auth + Realtime)
- **Icons**: Lucide React Native
- **Fonts**: Plus Jakarta Sans (headings), Inter (body)

## Project Structure
```
app/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Auth screens (login)
│   ├── (dashboard)/       # Main app screens (tabs)
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable UI components
│   ├── constants/         # Theme, colors, spacing
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Supabase client, utilities
│   └── types/             # TypeScript types
```

## Commands
```bash
npm start          # Start Expo dev server
npm run web        # Start web version
npm run ios        # Start iOS simulator
npm run android    # Start Android emulator
```

## Environment Variables
Copy `.env.example` to `.env` and fill in:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Design Reference
See `/README.md` in parent directory for complete design specs including:
- Color tokens (light/dark/colorblind themes)
- Typography scale
- Component specifications
- Screen layouts

## Multi-tenant Model
- Platform admins see admin console + all guesthouses
- Guesthouse owners/staff see only their guesthouse(s)
- Row-level security via `guesthouse_id` in Postgres
