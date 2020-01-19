# SpyBoard

## Installation
Pour que l'application fonctionne, elle doit être servie par un serveur Web avec PHP. Pour tester sur un serveur Apache2, créer un lien symbolique ou copier le dossier dans /var/www/html.

## Lancement
Pour que l'application attende une connexion de la part du powershell et pour créer les fichiers nécessaires on lance le script startreverse.sh en super-utilisateur. On peut alors lancer le reverse depuis Powershell (un one-liner est présent dans Idees/reverse_powershell.txt) vers le port 4242.

## Utilisation
Il n'est pas recommandé d'utiliser l'interface web tant que le reverse shell n'est pas connecté. Pour que le transfert de fichiers fonctione, il faut utiliser l'adresse IP de la machine pour accéder à l'interface (plutôt que localhost ou 127.0.0.1 si on test le reverse en local).

