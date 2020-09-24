release: python phoebe/manage.py migrate
web: gunicorn --chdir phoebe phoebe.wsgi --log-file -
