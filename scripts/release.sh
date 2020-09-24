cd phoebe

wget https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js -P phoebe/charts/static/js/

python manage.py migrate
