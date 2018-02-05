# cd /mnt/c/Users/arama/Documents/My\ Web\ Sites/WordPress/wp-content/plugins/CFF
# ./build.sh 1.1.0
zip -r "$1.zip" . -x *.zip *.git* node_modules/**\* 
#git archive --format=zip HEAD -o $0.zip
# apex deploy --env prod --alias PROD