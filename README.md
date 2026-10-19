# Yelen Sugu — vidéo de démonstration

Film Remotion de 82 s, avec voix off féminine (fr-FR Vivienne) posée mesure par mesure sur le beat fourni (136 BPM).

| Livrable | Fichier |
|---|---|
| Vertical 9:16, sous-titres incrustés | `out/yelen-sugu-9x16.mp4` |
| Remontage 16:9 + sous-titres séparés | `out/yelen-sugu-16x9.mp4`, `out/yelen-sugu-16x9.srt` |
| Version courte 20 s (panier + notification + logo) | `out/yelen-sugu-20s.mp4` |

## Chaîne de fabrication

1. `src/audio/script.json` : le texte de la voix off et la mesure où tombe chaque phrase.
2. `npm run audio` (Python avec `edge-tts librosa numpy soundfile mutagen`) : analyse du beat, synthèse, calage, traitement de la voix et ducking. Produit `public/audio/mix.wav` et `src/audio/timeline.json`.
3. Le montage (`src/timing.ts`) lit `timeline.json` : chaque animation est calée sur une mesure ou sur un mot prononcé.
4. `npm run render` : rend les trois versions, normalise le son à −14 LUFS et génère le `.srt`.

Les écrans de l'application et du site sont redessinés en composants (`src/components/App.tsx`, `Web.tsx`) d'après les captures. Ils utilisent les données du compte de démonstration (`DEMO` dans `src/theme.ts`).
