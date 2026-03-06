# Emedia — Site de formation au développement web

Ce projet est une base de site statique conçue pour l'enseignement du développement web (HTML, CSS, JavaScript).

## Structure du projet

- `index.html` — page d'accueil avec navigation vers les leçons.
- `lessons/` — pages de formation interactives pour HTML, CSS et JavaScript.
- `assets/css/` — styles partagés pour le site.
- `assets/js/` — scripts communs pour l'éditeur et les exemples interactifs.
- `legacy/` — anciens exemples et fichiers de démonstration (gardés pour référence).

## Déploiement sur Netlify

1. Créez un nouveau site sur Netlify et connectez-le à ce dépôt.
2. Netlify détecte automatiquement un site statique. Aucun build n'est nécessaire.
3. Assurez-vous que la **page d'accueil** est `index.html`.

## Ajouter des leçons

Pour ajouter une nouvelle leçon :
1. Créez un nouveau fichier dans `lessons/` (par exemple `lessons/avancé.html`).
2. Ajoutez un lien dans la barre de navigation (`index.html` et les autres pages).

## Tester localement

Pour tester localement, vous pouvez simplement ouvrir `index.html` dans un navigateur.

Pour un serveur local (recommandé) :

```sh
python3 -m http.server 8000
```

Ensuite ouvrez : http://localhost:8000
