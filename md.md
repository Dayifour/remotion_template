# Brief vidéo de présentation — DouminiDouman

## 1. Concept

DouminiDouman est une plateforme web (PWA) qui réunit les restaurants de Bamako : chaque restaurant y publie sa page, sa carte et ses prix en FCFA, et reçoit des commandes ; le client trouve un restaurant ouvert et commande sans créer de compte.

**Signature (site) :** Les restaurants de Bamako, de la découverte à la commande.

**Deux parcours résument le produit (cahier des charges, §3) :**

- Découverte : je recherche → je découvre → je consulte.
- Sur place : je scanne → je choisis → je commande.

La puissance de la plateforme est du côté des restaurateurs ; le parcours client reste rapide et intuitif.

## 2. Narrateur : Doumi

Doumi est la mascotte, et littéralement le logo : le cœur jaune, l'arc orange et la toque de `frontend/public/icon.svg`, auxquels on ajoute un visage, des bras et des pieds. Il parle à la première personne, salue d'un coup de toque, et accompagne chaque séquence.

## 3. Sources utilisées

- Captures réelles de l'application : `../scrennshots/` (préparées par `scripts/prepare_screens.py` : interface du navigateur retirée, ancien logo « Douma » remplacé par le logo officiel).
- Logo officiel : `frontend/public/icon.svg` et `brand-logo.png`.
- Identité : `frontend/app/globals.css` (orange `#ff4b00` / `#ff3d00`, jaune `#ffcf00`, crème `#fff7ef`, encre `#292622`, thème sombre `.dark`), polices Bricolage Grotesque (titres) et Karla (interface).
- Fonctionnel : `frontend/docs/IDEA.md` (cahier des charges) et les docs front/back.
- Photos d'ambiance : `frontend/public/ambiance/` (licence Unsplash, voir `public/photos/CREDITS.md`).

## 4. Scénario — environ 80 secondes, 16:9

| # | Séquence | Image | Texte écran |
|---|---|---|---|
| 1 | Accroche | Manchette orange de l'accueil, Doumi se présente, photos de plats | On mange où ce soir ? |
| 2 | Découvrir | Accueil réel + carte de Bamako : restaurants ouverts, carte et prix | Je recherche. Je découvre. Je consulte. |
| 3 | La page du restaurant | Pages réelles Djoliba Grill / Saveurs de Ségou, fiche plat, avis | Une vitrine, une carte, des avis. |
| 4 | Sur place | Chevalet de table avec QR, téléphone : scan, carte, panier 3 750 FCFA, envoi | Je scanne. Je choisis. Je commande. |
| 5 | Suivi | Nouvelle → Acceptée → En préparation → Prête → Servie, page de suivi réelle | En direct, jusqu'à l'assiette. |
| 6 | Côté restaurant | Tableau des commandes réel, notification push, la commande avance | Les commandes arrivent en temps réel. |
| 7 | Gestion | Apparence (Atelier, Tablée, Comptoir), QR codes par table, équipe | Votre page, vos QR codes, votre équipe. |
| 8 | Pilotage | Vue d'ensemble réelle, indicateurs, plusieurs établissements, quota 2 / 3 | Vos ventes, vos plats, votre visibilité. |
| 9 | Résultat | Trois cartes : plus visibles, service plus rapide, clients qui reviennent | Ce qui change, au quotidien. |
| 10 | Final | Le logo se reconstitue (cœur, arc, virgule, toque, lettrage) | Les restaurants de Bamako, de la découverte à la commande. — douminidouman.cloud |

## 5. Voix off (source : `src/audio/script.json`)

> Bonjour ! Moi, c'est Doumi, de DouminiDouman.
> Ce soir, on mange où ? Quel restaurant est ouvert, et à quel prix ?
>
> DouminiDouman vous montre les restaurants ouverts autour de vous, à Bamako, avec leur carte et leurs prix en francs CFA.
>
> Chaque restaurant a sa propre page : ses photos, ses plats, ses horaires, et les avis de ses clients.
>
> À table, on scanne le QR code, on choisit ses plats… et on commande.
> Sans compte, sans application à installer. Et on paie en espèces, au restaurant.
>
> Le suivi de la commande se met à jour en direct, jusqu'à l'assiette.
>
> Côté restaurant, chaque commande arrive en temps réel, avec une notification. L'équipe la fait avancer en un geste.
>
> Le propriétaire choisit l'apparence de sa page, imprime ses QR codes par table, et invite ses managers.
>
> Il suit ses ventes, ses meilleurs plats et sa visibilité… et gère plusieurs établissements depuis un seul compte.
>
> Résultat : des restaurants plus visibles, un service plus rapide, et des clients qui reviennent.
>
> DouminiDouman : les restaurants de Bamako, de la découverte à la commande. Rendez-vous sur douminidouman.cloud !

## 6. Ton et direction artistique

- chaleureux, gourmand et simple ; moderne mais accessible ;
- ancré à Bamako (quartiers, FCFA, plats maliens réels de la plateforme) ;
- la palette et les polices du site, rien d'inventé : orange, jaune, crème, encre ;
- de vraies captures de l'application, animées (panoramiques, raccords, éléments recréés à l'identique par-dessus) ;
- transitions par masques et raccords (iris depuis Doumi, écran du téléphone qui s'ouvre sur le suivi…), pas de fondus enchaînés ;
- musique : boucle façon balafon, pentatonique, avec atténuation automatique sous la voix.

## 7. Ce qu'il ne faut pas laisser entendre

- le paiement en ligne : il n'existe pas, le paiement se fait en espèces au restaurant ;
- un suivi du livreur : la plateforme indique que le restaurant livre, elle n'organise pas la livraison ;
- qu'un client doive créer un compte ou installer une application ;
- des chiffres inventés : les valeurs affichées sont celles des captures montrées.

## 8. Livrables

- `out/douminidouman-presentation.mp4` — 1920 × 1080, 30 i/s, design clair (`npm run render`) ;
- `out/douminidouman-presentation-nuit.mp4` — même film, thème sombre du site (`npm run render:nuit`) ;
- sous-titres intégrés (désactivables : propriété `subtitles`).

## 9. Régénérer les sources

```bash
npm install
npm run screens   # captures (Pillow)
npm run logo      # tracés du logo (+ lettrage avec cairosvg)
npm run voice     # voix off (pip install edge-tts mutagen) — le montage suit le manifeste
npm run sfx       # bruitages et musique
npm run studio    # prévisualisation
npm run stills    # images de contrôle dans out/stills
```
