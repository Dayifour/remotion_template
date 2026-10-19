# Yelen Sugu — techniques de fabrication de la vidéo

Ce document décrit tout ce qui a servi à fabriquer la vidéo de démonstration : outils, choix d'écriture, traitement du son, techniques d'animation et contrôle qualité. Il sert aussi de mode d'emploi pour la refaire ou la modifier.

---

## 1. Skills et outils utilisés

**Skills Claude Code : aucun.** Aucun skill (motion-reel, video-cleanup, etc.) n'a été invoqué. Tout a été écrit directement dans le projet Remotion, avec les outils suivants :

| Outil | Rôle |
|---|---|
| **Remotion 4** (React) | Composition, animation et rendu des vidéos (`src/`) |
| **@remotion/google-fonts / Geist** | La police du produit, demandée par le brief |
| **edge-tts** (voix neuronale Microsoft `fr-FR-VivienneMultilingualNeural`) | Voix off féminine, avec l'horodatage de chaque mot |
| **librosa + numpy** | Analyse du beat : tempo, temps forts, structure, énergie |
| **ffmpeg** | Traitement de la voix, mixage, ducking, normalisation (−14 LUFS), version courte |
| **soundfile / numpy** | Placement des phrases au sample près, synthèse des bruitages |
| **Pillow** | Découpe et agrandissement des photos produits tirées des captures |
| **Playwright / WebFetch** | Tentatives de capture de yelen-sugu.com : le site répondait 503 ou réinitialisait la connexion le jour du montage |
| **uv** | Environnement Python isolé (pas de `pip` dans le Python de la machine) |

---

## 2. Principe directeur : un montage piloté par la musique

Toute la vidéo découle d'un seul fichier, `src/audio/timeline.json`, généré par `scripts/build_audio.py`. Il contient :
- les **premiers temps de chaque mesure** du beat ;
- le **début et la fin de chaque phrase** de la voix off ;
- l'**instant exact de chaque mot prononcé**.

Dans le code, deux fonctions suffisent à tout caler (`src/timing.ts`) :
- `bar(n)` donne la frame de la mesure *n* (`bar(4.5)` = 3ᵉ temps de la mesure 4) ;
- `word("cart", "gratuite")` donne la frame où la voix dit « gratuite ».

Si le texte ou le tempo change, il suffit de relancer `npm run audio` : toutes les animations se recalent seules. Aucun temps n'est saisi à la main.

---

## 3. Le beat

### Analyse
- Tempo détecté par `librosa.beat.beat_track`, contraint autour de 136 BPM (`tightness=400` pour un suivi rigide).
- **Repérage des premiers temps de mesure** : pour chacune des 4 phases possibles, on mesure l'énergie sous 150 Hz (grosse caisse et basse). La phase la plus forte donne le « 1 » de chaque mesure.
- **Régression linéaire** sur toutes les mesures du morceau (3 min 43) pour gommer le flottement du détecteur. Résultat : une mesure = **1,793 s** (≈ 133,9 BPM réels), stable sur toute la durée.
- **Carte d'énergie par phrase de 4 mesures** (graves, médiums, aigus) pour repérer la structure : intro de 2 à 16 s, entrée complète à 16,4 s, section plus riche vers 74–88 s.

### Choix du segment
- La vidéo démarre à **9,218 s du morceau**, au milieu de la montée : la tension est déjà là dès la première image.
- Le **drop (16,37 s du morceau) tombe à la mesure 4 de la vidéo** (7,17 s), pile au moment où « Yelen Sugu » apparaît. C'est le moment fort de l'accroche.
- La fin coïncide avec une fin de phrase musicale (mesure 44), suivie d'un fondu de 1,2 s.

---

## 4. La voix off

### Choix de la voix
- **Vivienne (fr-FR, multilingue)** : plus chaude et plus expressive que Denise, la voix de l'ancien projet, jugée trop douce.
- Réglages : débit `+2 %`, hauteur `-3 Hz`. Une voix un peu plus grave sonne plus posée et plus intime.

### Prononciation
Le texte affiché et le texte prononcé sont séparés (`text` / `tts` dans `script.json`) :
- « Yelen Sugu » est prononcé « Yélèn Sougou » ;
- « yelen-sugu.com » est prononcé « yélèn-sougou point com » ;
- « Wave » est prononcé « Ouève ».

Les sous-titres gardent la bonne graphie : un alignement relie chaque mot affiché à son équivalent prononcé.

### Calage rythmique
- **Chaque phrase démarre sur une mesure ou un demi-temps** (`"bar": 6.25`, etc.).
- Le **silence d'attaque** que le TTS ajoute en début de fichier est coupé : la première syllabe tombe exactement sur le temps.
- Si une phrase déborde sur la suivante, elle est **accélérée** (`atempo`, au maximum ×1,14). Dans la version actuelle, aucune n'a eu besoin de l'être.
- **Les 5 étapes du suivi sont générées séparément** (« En attente. », « Confirmée. »…) et posées **une par mesure** (mesures 28 à 32). La voix scande en rythme avec le beat ; c'est le passage le plus « musical » du film.

### Traitement de la voix (chaîne ffmpeg)
1. `highpass 85 Hz` : supprime les grondements.
2. `+1,5 dB à 220 Hz` : chaleur et corps.
3. `−2,5 dB à 450 Hz` : retire l'effet « carton ».
4. `+3 dB à 3,2 kHz` : présence et intelligibilité.
5. `−1,5 dB à 6,5 kHz` : adoucit les sifflantes.
6. `treble +2,5 dB à 11 kHz` : de l'« air », une voix plus brillante.
7. **Compresseur** 3,5:1, attaque 4 ms, relâchement 90 ms : une voix égale et « devant ».
8. **Écho très court** (42 et 71 ms, faible niveau) : une petite pièce qui évite le son « sec de synthèse ».
9. **Loudnorm** à −15 LUFS.

---

## 5. Mixage voix + beat

- **Ducking multibande par sidechain** : la voix pilote un compresseur sur la musique.
  - Au-dessus de 140 Hz (mélodie, nappes, aigus), la musique baisse fortement quand la voix parle (ratio 6:1, relâchement de 420 ms pour une remontée naturelle).
  - En dessous de 140 Hz, la grosse caisse et la basse restent en place, légèrement abaissées : **le groove ne s'arrête jamais**, mais la voix a toute la place dans les médiums.
- **Limiteur** final à −1 dBFS.
- **Mastering en deux passes** (`scripts/finish.mjs master`) : mesure puis normalisation linéaire à **−14 LUFS, crête à −1,5 dBTP**, le standard de TikTok, Instagram, Facebook et YouTube. L'image est copiée sans réencodage.

---

## 6. Bruitages (sound design)

Synthétisés en Python (`scripts/generate_sfx_extra.py`), donc sans aucune question de droits :

| Son | Fabrication | Utilisation |
|---|---|---|
| `notif.wav` | Deux notes de « cloche » (mi6 puis si5) avec partiels inharmoniques | Notification « Commande confirmée ». Le brief demande de garder ce son |
| `tap.wav` | Bruit très court + clic à 2,4 kHz | Chaque appui de doigt et le clic sur « Confirmer » |
| `impact.wav` | Sous-grave glissant de 128 à 38 Hz + souffle | Le drop, le tampon « GRATUITE », le colis qui se pose |
| `riser.wav` | Bruit blanc filtré qui s'ouvre progressivement (1,8 s) | La montée juste avant le drop |
| `check.wav` | Note ronde ascendante | Chaque étape qui passe au vert |
| `pop`, `tick`, `whoosh`, `success` | Repris du projet précédent | Bulles de messages, raccords entre scènes, logo final |

Chaque bruitage est calé sur le geste à l'image (`src/sfx.ts`) : le même événement déclenche le son et l'animation.

---

## 7. Écriture et techniques d'accroche

### Structure : problème → tension → solution → preuve → appel à l'action
1. **Accroche, 0 à 7 s** : on montre la douleur du public (« Vous commandez sur WhatsApp… et puis, plus rien. Elle en est où, votre commande ? »). Des messages sans réponse s'empilent, une horloge tourne, « pas de réponse » puis « toujours rien ».
2. **Interruption visuelle au drop** : on passe brusquement du sombre à l'orange, avec un flash et un impact.
3. **Promesse en 4 mots** : « Avec Yelen Sugu, vous savez. »
4. **Démonstration du parcours** (site, appli, panier, WhatsApp, confirmation, suivi, paiement).
5. **Appel à l'action** : le site, l'application Android, le téléphone de la boutique.

### Rétention
- **Le premier plan contient déjà du mouvement et du texte**, pour éviter le décrochage dès la première seconde.
- La **tension monte pendant 7 s** : la caméra pousse, puis le cadre tremble et se floute, aspiré vers le drop.
- **Un changement visuel à chaque mesure** (≈ 1,8 s) : nouveau mot, appui, zoom ou coche. L'œil ne s'ennuie jamais.
- **Surtitres numérotés** (01 La boutique en ligne, 02 L'application…) : le spectateur sait où il en est et a envie de voir la suite.
- **Le plan le plus important** (clic sur « Confirmer » → notification) est **mis en scène dans un seul plan, en deux temps** : le back-office en haut, le téléphone en bas, puis le téléphone prend tout l'écran.

### Fidélité au brief
- **Les 3 messages clés** sont portés à l'écran, dans l'ordre d'importance : livraison gratuite à Bamako sans minimum, suivi de la commande, commande comme d'habitude sur WhatsApp.
- **Ton direct, sans superlatifs ni anglicismes**, comme demandé.
- **Affirmations interdites évitées** : pas de « gratuit partout au Mali », pas de paiement en ligne ni par carte, pas de suivi GPS, pas de « milliers de produits », pas d'App Store.
- **Le délai réel** entre le clic et la notification (environ 1,5 s) n'est pas accéléré : le brief le juge plus crédible ainsi.

---

## 8. Direction artistique

- **Palette du brief uniquement** : orange `#ff5000`, dégradé `#f03e00 → #c72e00`, vert `#10a37f` pour les étapes franchies et la mention « Gratuite », vert WhatsApp `#25D366` réservé à WhatsApp, encre `#0f172a`, gris `#64748b`, fond `#f8fafc`.
- **Aucun jaune** : il est banni par le brief.
- **Geist** pour tout, graisse 800–900 pour les titres.
- **Trois ambiances lumineuses** qui racontent l'histoire :
  - **sombre** pour le problème (accroche) ;
  - **orange** pour la marque (drop et fin) ;
  - **clair « studio »** pour la démonstration, où le téléphone sombre ressort.
- **L'application est montrée dans son thème sombre**, comme sur les vraies captures Android.

---

## 9. Les écrans : recréés en composants plutôt que filmés

Les écrans de l'application (`src/components/App.tsx`) et du site (`src/components/Web.tsx`) sont **redessinés en React**, au pixel près d'après les captures fournies :
- en-têtes, bandeau orange, recherche, filtres, grille, onglets ;
- barre de navigation Android, conversation WhatsApp, suivi en 5 étapes, écran verrouillé ;
- accueil du site, back-office des commandes.

Pourquoi :
1. **Netteté parfaite** à toutes les échelles : on peut zoomer à ×1,75 sans pixelliser, ce qui serait impossible avec des captures de 576 px de large.
2. **Chaque élément est animable** : le bouton s'enfonce, le badge du panier grossit, la ligne « Livraison » s'illumine, les coches se dessinent, le curseur clique…
3. **Confidentialité** : les captures contenaient un vrai nom et un vrai numéro de client, que le brief interdit d'afficher. Les écrans utilisent un compte de démonstration (« Aminata Diarra », « ACI 2000, rue 240 », numéro masqué).
4. **Cohérence des prix** d'un plan à l'autre (exigence du brief) : une seule source, `DEMO` dans `src/theme.ts`.

Les **photos produits** sont découpées dans la capture de la Boutique, agrandies ×3 (Lanczos), puis légèrement renforcées en netteté et en contraste (`scripts/prepare_assets.py`).

---

## 10. Techniques d'animation

### Caméra et 3D
- **Perspective CSS** (`perspective` + `rotateX/Y/Z`, `translateZ`) : les téléphones et navigateurs flottent en 3D et tournent légèrement pendant les plans, comme filmés par une caméra qui bouge.
- **Travellings avant** (push-in) lents et continus : l'image n'est jamais figée.
- **Zooms caméra ciblés** : sur le prix, sur la ligne « Livraison — Gratuite », sur le numéro de commande, sur le bouton « Confirmer » (zoom ×1,75 centré sur la fiche commande, puis recul quand le bandeau de confirmation arrive).
- **Tremblement de caméra** (shake aléatoire mais déterministe, `random(seed)`) dans les 22 dernières frames avant le drop.

### Rendu « réaliste »
- **Téléphone vectoriel** : cadre métallique dégradé, double liseré, boutons latéraux, poinçon caméra, et **reflet du verre** qui glisse selon l'angle de caméra.
- **Ombres portées à deux couches** (une large et douce, une courte et dense) pour l'impression de poids, plus une ombre de sol sous le navigateur et le colis.
- **Colis en vraie 3D CSS** (trois faces éclairées différemment, ruban orange, étiquette #YL-2908) qui tombe, rebondit et tourne.
- **Grain de film animé** (`feTurbulence` régénéré toutes les 2 frames, en mode overlay) et **vignettage** : une matière « caméra » qui casse l'aspect trop numérique.
- **Particules de poussière lumineuse** dans les scènes sombres et orange, pour la profondeur.
- **Halos de couleur** qui dérivent lentement en arrière-plan, teintés selon la scène (orange, vert pour la livraison et le suivi, vert WhatsApp).

### Mouvement
- **Courbes d'accélération** sur-mesure (`bezier(0.16, 1, 0.3, 1)` en sortie, `bezier(0.65, 0, 0.35, 1)` pour les transitions) : rien n'est linéaire.
- **Ressorts physiques** (`spring`) avec dépassement pour les apparitions : badges, étiquettes, tampon, logo.
- **Pulsation sur le beat** (`beatPulse`) : les anneaux du fond orange, les coches et les cartes de paiement respirent à chaque temps.

### Typographie cinétique
- Chaque mot **monte derrière un masque** avec une légère rotation, **à l'instant où la voix le prononce**.
- Les mots-clés passent en couleur : « WhatsApp » en vert, « rien », « payé » et « livraison » en orange, « prévenu » et « datée » en vert.
- Le logo s'écrit **lettre par lettre**.
- Le **tampon « GRATUITE »** arrive à ×2,2 avec une rotation, puis s'écrase à sa place, accompagné d'une coche verte.
- Les **noms des étapes** s'affichent en très grand, un par mesure, en même temps que la voix.

### Micro-interactions
- **Doigt virtuel** : une pastille translucide qui s'approche, appuie (le bouton s'enfonce et s'assombrit) et laisse une onde.
- **Vignette du produit qui s'envole** en arc vers l'onglet Panier, puis le **badge grossit en brillant** (1, puis 2).
- **Curseur** qui glisse en courbe vers « Confirmer », survol (le bouton grossit), clic, le bouton passe au vert « Confirmée », puis le **bandeau « Statut mis à jour — Notification envoyée… »** descend.
- **Vibration du téléphone** à l'arrivée de la notification, avec un halo orange.
- **Transition d'écran Android** (glissement latéral avec ombre) entre « Finaliser ma commande » et WhatsApp.
- **Frise de progression** qui se remplit d'une étape par mesure, avec un flash vert sur l'étape en cours.

### Raccords entre scènes
- **« Zoom-through »** : la scène sortante accélère vers la caméra en se floutant, l'entrante arrive de loin et fait le point. Toujours **sur un premier temps de mesure**, avec un **whoosh** et un **flash blanc léger**.
- **Iris** (cercle qui s'ouvre) pour le passage du problème (sombre) à la marque (orange), avec un flash fort et un impact.
- **Fondu au noir** de la fin, calé sur le fondu de la musique.

---

## 11. Sous-titres et formats

- **Sous-titres karaoké incrustés** (9:16) : groupes de 2 à 4 mots coupés à la ponctuation, sur une pastille sombre lisible sur tous les fonds. Le **mot prononcé s'allume en orange**, les mots à venir restent en transparence. De nombreuses personnes regardent sans le son (brief).
- **Zones de sécurité** : les sous-titres sont à 330 px du bas, au-dessus des boutons de TikTok, Facebook et du Statut WhatsApp. Les titres restent dans le tiers haut.
- **16:9** : même film, mise en page adaptée (`useVertical()`). Le téléphone passe sur le côté et le texte de l'autre, avec un **fichier .srt séparé** comme demandé par le brief.
- **Version courte de 20 s** (`scripts/finish.mjs short`) : extraits **coupés sur des premiers temps de mesure** (panier, confirmation et notification, logo), avec micro-fondus de 30–50 ms. La musique ne « saute » pas aux coupes.

---

## 12. Contrôle qualité

- **Images de contrôle** (`npm run stills`) rendues à des instants clés, assemblées en **planches-contact** avec ffmpeg et inspectées visuellement à chaque itération.
- Corrections faites grâce à ces planches :
  - axe flex inversé : ajout de `flexDirection: "row"` pour que les téléphones se placent bien en 16:9 ;
  - titres masqués par le téléphone zoomé dans les scènes Boutique et Panier : téléphone abaissé, zoom réduit ;
  - bouton « Confirmer » caché derrière le téléphone : back-office remonté, zoom caméra ajouté sur le clic ;
  - espace vide sous la grille du site : ajout de la bande des trois engagements ;
  - étiquette « pas de réponse » sur le téléphone et police de secours : repositionnée, passée en Geist ;
  - carte « Wave » couverte par les sous-titres : cartes remontées.
- **Mesures audio** : intensité intégrée (EBU R128) avant et après mastering, soit −15,2 LUFS ramenés à −14 LUFS.
- **Vérification TypeScript** (`tsc --noEmit`) avant chaque rendu.
- **Limite** : je ne peux pas écouter le son. L'équilibre voix/beat a été réglé à la mesure, pas à l'oreille ; une écoute humaine reste nécessaire.

---

## 13. Ce qui reste provisoire

| Élément | État | Ce qu'il faut |
|---|---|---|
| Logo | Pastille au chariot + nom en Geist (`src/components/Logo.tsx`) | Le PNG officiel « YELEN SERVICE » au chariot orange |
| Pages du site | Reconstruites d'après le brief (site inaccessible le 19/10/2026) | Des captures réelles, ou un accès au site |
| Clavier et souris | Noms et prix inventés | Les vrais noms et prix du catalogue |
| Voix en bambara | Non faite (pas de voix de synthèse bambara de qualité) | Un enregistrement humain, à recaler sur le beat |

---

## 14. Commandes

```bash
npm install
# environnement Python : edge-tts mutagen numpy librosa soundfile pillow scipy
npm run assets        # photos produits + bruitages synthétisés
npm run audio         # analyse du beat, voix off, mixage -> public/audio/mix.wav + src/audio/timeline.json
npm run studio        # aperçu interactif
npm run stills -- YelenSugu 255 1257 1618   # images de contrôle
npm run render        # 9:16 + 16:9 (+ .srt) + version 20 s, son normalisé à -14 LUFS
```

Pour modifier la voix : éditer `src/audio/script.json` (texte, prononciation `tts`, mesure `bar`), puis `npm run audio && npm run render`.
