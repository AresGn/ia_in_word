
Pour les options 1 et 2, voici comment procéder et oui, vous pouvez utiliser Vercel ou Netlify pour l'option 2:

## Option 1: Partage direct via dossier partagé réseau

1. **Créez un dossier partagé sur un réseau** accessible par vos camarades de classe
2. **Placez-y le fichier manifest.xml** que vous aurez personnalisé
3. **Chaque camarade devra**:
   - Ouvrir Word
   - Aller dans Trust Center (Centre de gestion de la confidentialité)
   - Ajouter votre dossier partagé comme catalogue d'add-ins
   - Redémarrer Word et installer l'add-in depuis le menu "Mes add-ins"

**Inconvénient**: Cette méthode est limitée aux utilisateurs sur le même réseau et peut être difficile à maintenir pour 50-100 personnes.

## Option 2: Auto-hébergement avec Vercel ou Netlify (recommandé)

Oui, vous pouvez absolument utiliser Vercel ou Netlify! C'est une excellente solution pour votre cas:

1. **Construisez votre application**:
   ```
   npm run build
   ```

2. **Déployez sur Vercel ou Netlify**:
   - Créez un compte sur [Vercel](https://vercel.com) ou [Netlify](https://netlify.com)
   - Connectez votre dépôt GitHub/GitLab ou uploadez les fichiers du dossier `dist` généré
   - Votre app sera déployée avec une URL comme `votre-app.vercel.app`

3. **Modifiez le fichier manifest.xml**:
   - Changez toutes les URL `localhost:3000` par votre URL Vercel/Netlify
   - Par exemple: `https://word-gpt-plus.vercel.app`

4. **Partagez le manifest.xml modifié**:
   - Via email, site web, ou plateforme de partage de fichiers
   - Chaque utilisateur devra suivre les instructions d'installation du README

Cette option est **idéale pour 50-100 utilisateurs** car:
- Vercel/Netlify offrent gratuitement beaucoup de bande passante
- L'installation reste simple pour chaque utilisateur (ils n'ont qu'à ajouter le manifest.xml)
- Vous pouvez facilement mettre à jour l'application

Pour des instructions pas à pas sur le déploiement sur Vercel ou Netlify, consultez leurs guides officiels:
- [Guide de déploiement Vercel](https://vercel.com/docs/deployments/overview)
- [Guide de déploiement Netlify](https://docs.netlify.com/site-deploys/overview/)



Pour déployer l'application sur Vercel et la partager avec vos amis, vous devez modifier le fichier manifest.xml du dossier **self-hosted**.

Le dossier "release" contient deux options de manifest:
- **self-hosted**: C'est celui-ci que vous devez utiliser car il est spécifiquement conçu pour un déploiement sur un serveur externe comme Vercel
- **instant-use**: Ce manifest est plutôt destiné à une utilisation locale ou directe

## Voici les étapes à suivre:

1. **Déployez votre application sur Vercel** en suivant les instructions du README_deploie.md:
   ```
   npm run build
   ```
   Puis déployez le dossier `dist` généré sur Vercel

2. **Modifiez le fichier `manifest.xml` du dossier `self-hosted`**:
   - Remplacez toutes les occurrences de `localhost:3000` par votre URL Vercel
   - Par exemple: `https://word-gpt-plus.vercel.app`

3. **Partagez ce fichier manifest.xml modifié avec vos amis**

Vos amis n'auront qu'à ajouter ce manifest.xml dans Word pour installer l'add-in qui pointera vers votre déploiement Vercel. Ainsi, ils utiliseront tous votre instance de l'application hébergée sur Vercel plutôt que de devoir l'héberger eux-mêmes ou se connecter à une version locale.

Cette approche est idéale pour partager avec un groupe d'amis car Vercel offre gratuitement une bonne bande passante pour les projets personnels.
