# Marsea — code custom Webflow

CSS et JS du site [centremarsea.com](https://www.centremarsea.com), servis via **jsDelivr**.

```
src/   sources lisibles (à modifier)
dist/  fichiers minifiés (générés, appelés par Webflow)
```

| Fichier | Où | Contenu |
|---|---|---|
| `global.min.css` | Head du site | Styles globaux, accordéon, autofill, header (mega menu, hover) |
| `global.min.js` | Footer du site | Lenis (+ GSAP ticker / ScrollTrigger), parallax `[data-parallax]`, mega menu, couleurs du header, accordéon |
| `equipe.min.css` | Head de la page L'équipe | Slider médecins, grille employés, modal |
| `equipe.min.js` | Footer de la page L'équipe | Swiper, modal médecin, fondus d'apparition |

## Dépendances

- **GSAP + ScrollTrigger** : fournis par Webflow (interactions GSAP activées) — ne pas les recharger.
- **Lenis** et **Swiper** : chargés en `defer` dans le footer du site, avant `global.min.js`.
- **simpleParallax** : chargé à la demande par `global.min.js`, uniquement si la page contient un `[data-parallax]`.
- `window.lenis` est exposé pour les scripts de page (ex. `lenis.stop()` / `lenis.start()`).

## Modifier le code

```bash
npm install
# éditer src/...
npm run build
git commit -am "..." && git tag vX.Y.Z && git push && git push --tags
```

Puis, dans Webflow, remplacer `@vX.Y.Z` dans les URLs par le nouveau tag et republier.
Les URLs pointent sur un **tag** : chaque version est figée et mise en cache durablement par jsDelivr.

## Code à coller dans Webflow

### Site Settings → Custom code → Head

```html
<script>history.scrollRestoration='manual';window.scrollTo(0,0);</script>
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Cetezer44/marsea-webflow-custom-code@v1.0.0/dist/global.min.css">
<!-- Google tag (gtag.js) : inchangé -->
```

### Site Settings → Custom code → Footer

```html
<script defer src="https://cdn.jsdelivr.net/npm/lenis@1.3.19/dist/lenis.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/gh/Cetezer44/marsea-webflow-custom-code@v1.0.0/dist/global.min.js"></script>
```

### Page L'équipe → Head

```html
<script>document.documentElement.classList.add('team-js');</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Cetezer44/marsea-webflow-custom-code@v1.0.0/dist/equipe.min.css">
```

### Page L'équipe → Footer

```html
<script defer src="https://cdn.jsdelivr.net/gh/Cetezer44/marsea-webflow-custom-code@v1.0.0/dist/equipe.min.js"></script>
```
