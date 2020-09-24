cd phoebe

wget https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js -P static/js/

python manage.py migrate
