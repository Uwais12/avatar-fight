# Avatar Fight

A chibi-anime fantasy RPG for iOS. Closed beta — testers welcome.

> Pick a class, level a pet, gear up, and duel in landscape battles that take 30 seconds and feel like Saturday morning anime.

**[Sign up to test →](https://avatar-fight-web.vercel.app)**

## Status

Closed beta on TestFlight. Built solo by [@Uwais12](https://github.com/Uwais12). Ships every few days.

## Tech

- React Native + Expo SDK 54
- Expo Router
- Zustand + AsyncStorage for state
- expo-image, react-native-svg
- Landscape-locked iOS app
- All character / pet / weapon / armor art is AI-generated (gpt-image-1)

## Filing feedback

The whole point of this repo being public is to get bug reports + feature requests from testers.

- 🐞 **Found a bug?** [Open a bug report](https://github.com/Uwais12/avatar-fight/issues/new?template=bug.yml)
- 💡 **Have an idea?** [Open a feature request](https://github.com/Uwais12/avatar-fight/issues/new?template=feature.yml)
- 💬 **Just want to chat?** [Open a discussion](https://github.com/Uwais12/avatar-fight/discussions)

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for details.

## Running it locally (devs only)

```bash
git clone https://github.com/Uwais12/avatar-fight
cd avatar-fight
npm install
npx expo start --lan
```

You'll need Expo Go on your iPhone and to be on the same wifi as your laptop.

## License

MIT — see [`LICENSE`](./LICENSE).
