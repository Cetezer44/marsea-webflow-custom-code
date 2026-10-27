# Marsea — code custom Webflow

CSS et JS du site [centremarsea.com](https://www.centremarsea.com), servis via **jsDelivr**.

```
src/   sources lisibles (à modifier)
dist/  fichiers minifiés (générés, appelés par Webflow)
```

| Fichier | Où | Contenu |
|---|---|---|
| `global.min.css` | Head du site | Accordéon, autofill des formulaires |
| `global.min.js` | Footer du site | Lenis (+ GSAP ticker / ScrollTrigger), parallax `[data-parallax]`, mega menu, couleurs du header, accordéon |
| `equipe.min.css` | Head de la page L'équipe | Slider médecins, grille employés, modal |
| `equipe.min.js` | Footer de la page L'équipe | Swiper, modal médecin, fondus d'apparition |

## Dépendances

- **GSAP + ScrollTrigger** : fournis par Webflow (interactions GSAP activées) — ne pas les recharger.
- **Lenis** et **Swiper** : chargés en `defer` dans le footer du site, avant `global.min.js`.
- **simpleParallax** : chargé à la demande par `global.min.js`, uniquement si la page contient un `[data-parallax]`.
- `window.lenis` est exposé pour les scripts de page (ex. `lenis.stop()` / `lenis.start()`).

Les embeds `<style>` des composants **Global Styles** et **Main Header** restent dans Webflow :
le Designer en a besoin pour afficher correctement le canvas (mega menu masqué, etc.).
Le `<script>` de l'embed du Header a été déplacé dans `global.js`.

## Modifier le code

```bash
npm install
# éditer src/...
npm run build
git commit -am "..." && git push
```

Puis, dans Webflow, remplacer le hash après `@` dans les URLs par le nouveau hash de commit
(ou par un tag `vX.Y.Z` créé sur GitHub) et republier.
Les URLs pointent sur un **commit précis** : chaque version est figée et mise en cache durablement par jsDelivr.
Éviter `@main` en production : jsDelivr le met en cache jusqu'à 12 h, les changements n'apparaîtraient pas tout de suite.

## Code à coller dans Webflow

### Site Settings → Custom code → Head

```html
<script>history.scrollRestoration='manual';window.scrollTo(0,0);</script>
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Cetezer44/marsea-webflow-custom-code@c71bd9dfc280f503c6d3d4f5db85615fe9777e26/dist/global.min.css">
<!-- Google tag (gtag.js) : inchangé -->
```

### Site Settings → Custom code → Footer

```html
<script defer src="https://cdn.jsdelivr.net/npm/lenis@1.3.19/dist/lenis.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/gh/Cetezer44/marsea-webflow-custom-code@c71bd9dfc280f503c6d3d4f5db85615fe9777e26/dist/global.min.js"></script>
```

### Page L'équipe → Head

```html
<script>document.documentElement.classList.add('team-js');</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Cetezer44/marsea-webflow-custom-code@c71bd9dfc280f503c6d3d4f5db85615fe9777e26/dist/equipe.min.css">
```

### Page L'équipe → Footer

```html
<script defer src="https://cdn.jsdelivr.net/gh/Cetezer44/marsea-webflow-custom-code@c71bd9dfc280f503c6d3d4f5db85615fe9777e26/dist/equipe.min.js"></script>
```
