from django.urls import path
from . import views

urlpatterns = [
    path('', views.chart_list, name='chart_list'),
]
